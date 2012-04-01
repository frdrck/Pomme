#!/usr/bin/perl

$file = $ARGV[0];
if ($file !~ /zip$/)
	{
	print "not a zip: $file\n";
	exit();
	}
print "loading $file\n";
$file =~ /^([^.]+).zip$/;
$dir = $1;

system ("/usr/bin/unzip $file");
system ("/bin/rm -rf __MACOSX/");

preview_dir("main");
preview_dir("player");

system ("./img-report.py");

print "\n";
print "http://pomme.us/report/player2.html\n";
print "http://pomme.us/report/main2.html\n";
print "\n";
print "PASTE URLS TO BE REMOVED, BLANK LINE TO CONTINUE OR ^C\n";

while (my $url = <STDIN>)
	{
	chomp $url;
	if (! length($url))
		{
		last;
		}
	$url =~ s/^http:\/\/pomme.us\///;
	if (-e "docs/".$url)
		{
		system ("/bin/rm docs/".$url);
		print "removing $url\n";
		}
	}

install_dir("main");
install_dir("player");

system ("/usr/bin/curl http://pomme.us:32123/reload");
print "\n";

system ("./img-report.py");
 
sub preview_dir
	{
	my $key = shift;
	opendir D, "$dir/$key images/";
	while (my $f = readdir D)
		{
		next if $f =~ /^\./;
		my $newf = lc($f);
		$newf =~ s/[^-a-z0-9\.]/-/g;
		system ("/bin/chmod", "644", "$dir/$key images/$f");
		system ("/bin/mv", "$dir/$key images/$f", "docs/img/$key"."2/$newf");
		}
	closedir D;
	}
sub install_dir
	{
	my $key = shift;
	opendir D, "docs/img/$key"."2/";
	while (my $f = readdir D)
		{
		next if $f =~ /^\./;
		system ("/bin/mv", "docs/img/$key"."2/$f", "docs/img/$key/$newf");
		}
	closedir D;
	}
