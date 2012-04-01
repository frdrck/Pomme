# $Id: cgi.py,v 49de96592142 2011/03/22 23:25:06 jon $

import sys, re, os, Cookie, errno
try:
  import cStringIO as StringIO
except ImportError:
  import StringIO

"""Object-oriented CGI interface."""


class Error(Exception):
  """The base class for all exceptions thrown by this module."""
  pass

class SequencingError(Error):
  """The exception thrown when functions are called out of order."""
  """
  For example, if you try to call a function altering the headers of your
  output when the headers have already been sent.
  """
  pass


_url_encre = re.compile(r"[^A-Za-z0-9_.!~*()-]") # RFC 2396 section 2.3
_url_decre = re.compile(r"%([0-9A-Fa-f]{2})")
_html_encre = re.compile("[&<>\"'+]")
# '+' is encoded because it is special in UTF-7, which the browser may select
# automatically if the content-type header does not specify the character
# encoding. This is paranoia and is not bulletproof, but it does no harm. See
# section 4 of www.microsoft.com/technet/security/news/csoverv.mspx
_html_encodes = { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;",
                  "'": "&#39;", "+": "&#43;" }

def html_encode(raw):
  """Return the string parameter HTML-encoded."""
  """
  Specifically, the following characters are encoded as entities:
    & < > " ' +
  """
  if not isinstance(raw, (str, unicode)):
    raw = str(raw)
  return re.sub(_html_encre, lambda m: _html_encodes[m.group(0)], raw)

def url_encode(raw):
  """Return the string parameter URL-encoded."""
  if not isinstance(raw, (str, unicode)):
    raw = str(raw)
  return re.sub(_url_encre, lambda m: "%%%02X" % ord(m.group(0)), raw)

def url_decode(enc):
  """Return the string parameter URL-decoded (including '+' -> ' ')."""
  s = enc.replace("+", " ")
  return re.sub(_url_decre, lambda m: chr(int(m.group(1), 16)), s)


__UNDEF__ = []


def traceback(req, html=0):
  exc = sys.exc_info()
  import cgitb
  if html:
    try:
      req.clear_headers()
      req.clear_output()
      req.set_header("Content-Type", "text/html; charset=iso-8859-1")
    except SequencingError:
      pass
    cgitb.Hook(file=req)(*exc)
  s = StringIO.StringIO()
  cgitb.Hook(file=s, format="text")(*exc)
  req.error(s.getvalue())


class Request(object):
  """All the information about a CGI-style request, including how to respond."""
  """Headers are buffered in a list before being sent. They are either sent
  on request, or when the first part of the body is sent. If requested, the
  body output can be buffered as well."""

  def __init__(self, handler_type):
    """Create a Request object which uses handler_type as its handler."""
    """An object of type handler_type, which should be a subclass of
    Handler, will be used to handle requests."""
    self._handler_type = handler_type

  def _init(self):
    self._doneHeaders = 0
    self._headers = []
    self._bufferOutput = 1
    self._output = StringIO.StringIO()
    self._pos = 0
    self.closed = 0
    self._encoding = self._inputencoding = None
    try:
      del self.params
    except AttributeError:
      pass
    self.cookies = Cookie.SimpleCookie()
    if "HTTP_COOKIE" in self.environ:
      self.cookies.load(self.environ["HTTP_COOKIE"])
    self.aborted = 0
    self.set_header("Content-Type", "text/html; charset=iso-8859-1")

  def __getattr__(self, name):
    if name == "params":
      self.params = {}
      self._read_cgi_data(self.environ, self.stdin)
      return self.__dict__["params"]
    raise AttributeError("%s instance has no attribute %s" %
      (self.__class__.__name__, repr(name)))

  def close(self):
    """Closes the output stream."""
    if not self.closed:
      self.flush()
      self._close()
      self.closed = 1

  def _check_open(self):
    if self.closed:
      raise ValueError("I/O operation on closed file")

  def output_headers(self):
    """Output the list of headers."""
    self._check_open()
    if self._doneHeaders:
      raise SequencingError("output_headers() called twice")
    self._write("".join(["%s: %s\r\n" % pair for pair in self._headers])
      + "\r\n")
    self._doneHeaders = 1

  def clear_headers(self):
    """Clear the list of headers."""
    self._check_open()
    if self._doneHeaders:
      raise SequencingError("cannot clear_headers() after output_headers()")
    self._headers = []

  def add_header(self, hdr, val):
    """Add a header to the list of headers."""
    self._check_open()
    if self._doneHeaders:
      raise SequencingError(
        "cannot add_header(%s) after output_headers()" % repr(hdr))
    self._headers.append((hdr, val))

  def set_header(self, hdr, val):
    """Add a header to the list of headers, replacing any existing values."""
    self._check_open()
    if self._doneHeaders:
      raise SequencingError(
        "cannot set_header(%s) after output_headers()" % repr(hdr))
    self.del_header(hdr)
    self._headers.append((hdr, val))

  def get_header(self, hdr, index=0):
    """Retrieve a header from the list of headers."""
    i = 0
    hdr = hdr.lower()
    for pair in self._headers:
      if pair[0].lower() == hdr:
        if i == index:
          return pair[1]
        i += 1
    return None

  def del_header(self, hdr):
    """Removes all values for a header from the list of headers."""
    self._check_open()
    if self._doneHeaders:
      raise SequencingError(
        "cannot del_header(%s) after output_headers()" % repr(hdr))
    hdr = hdr.lower()
    while 1:
      for s in self._headers:
        if s[0].lower() == hdr:
          self._headers.remove(s)
          break
      else:
        break

  def append_header_value(self, hdr, val):
    """Adds a value to a header that contains a comma-separated list of values.
    If the value is already in the list, it is not added again. If the header
    does not exist, it is created containing the single value specified."""
    current = self.get_header(hdr)
    if not current:
      self.set_header(hdr, val)
      return val
    if val.lower() in [x.strip().lower() for x in current.split(",")]:
      return current
    val = current + "," + val
    self.set_header(hdr, val)
    return val

  def set_buffering(self, f):
    """Specifies whether or not body output is buffered."""
    self._check_open()
    if self._output.tell() > 0 and not f:
      self.flush()
    self._bufferOutput = f

  def set_encoding(self, encoding, inputencoding=__UNDEF__):
    self._encoding = encoding
    if inputencoding is not __UNDEF__:
      self._inputencoding = inputencoding

  def get_encoding(self):
    return self._encoding

  def flush(self):
    """Flushes the body output."""
    self._check_open()
    if not self._doneHeaders:
      self.output_headers()
    self._write(self._output.getvalue())
    self._pos += self._output.tell()
    self._output.seek(0, 0)
    self._output.truncate()
    self._flush()

  def clear_output(self):
    """Discards the contents of the body output buffer."""
    self._check_open()
    if not self._bufferOutput:
      raise SequencingError("cannot clear output when not buffering")
    self._output.seek(0, 0)
    self._output.truncate()

  def error(self, s):
    """Records an error message from the program."""
    """The output is logged or otherwise stored on the server. It does not
    go to the client.
    
    Must be overridden by the sub-class."""
    raise NotImplementedError("error must be overridden")

  def _write(self, s):
    """Sends some data to the client."""
    """Must be overridden by the sub-class."""
    raise NotImplementedError("_write must be overridden")

  def _flush(self):
    """Flushes data to the client."""
    """May be overridden by the sub-class."""
    pass

  def _close(self):
    """Closes the output stream."""
    """May be overridden by the sub-class."""
    pass

  def write(self, s):
    """Sends some data to the client."""
    self._check_open()
    if self._encoding:
      if not isinstance(s, unicode):
        if self._inputencoding:
          s = unicode(s, self._inputencoding)
        else:
          s = unicode(s)
      s = s.encode(self._encoding)
    else:
      s = str(s)
    if self._bufferOutput:
      self._output.write(s)
    else:
      if not self._doneHeaders:
        self.output_headers()
      self._pos += len(s)
      self._write(s)
  
  def tell(self):
    return self._pos + self._output.tell()
  
  def seek(self, offset, whence=0):
    self._check_open()
    currentpos = self._pos + self._output.tell()
    currentlen = self._pos + len(self._output.getvalue())
    if whence == 0:
      newpos = offset
    elif whence == 1:
      newpos = currentpos + offset
    elif whence == 2:
      newpos = currentlen + offset
    else:
      raise ValueError("Bad 'whence' argument to seek()")
    if newpos == currentpos:
      return
    elif newpos < self._pos:
      raise ValueError("Cannot seek backwards into already-sent data")
    elif newpos <= currentlen:
      self._output.seek(newpos - self._pos)
    else:
      if self._bufferOutput:
        self._output.seek(newpos - self._pos)
      else:
        self._write("\0" * (newpos - self._pos))

  def _mergevars(self, encoded):
    """Parse variable-value pairs from a URL-encoded string."""
    """Extract the variable-value pairs from the URL-encoded input string and
    merge them into the output dictionary. Variable-value pairs are separated
    from each other by the '&' character. Missing values are allowed.

    If the variable name ends with a '*' character, then the value that is
    placed in the dictionary will be a list. This is useful for multiple-value
    fields."""
    for pair in encoded.split("&"):
      if pair == "":
        continue
      nameval = pair.split("=", 1)
      name = url_decode(nameval[0])
      if len(nameval) > 1:
        val = url_decode(nameval[1])
      else:
        val = None
      if name.endswith("!") or name.endswith("!*"):
        continue
      if name.endswith("*"):
        if name in self.params:
          self.params[name].append(val)
        else:
          self.params[name] = [val]
      else:
        self.params[name] = val

  def _mergemime(self, contenttype, encoded):
    """Parses variable-value pairs from a MIME-encoded input stream."""
    """Extract the variable-value pairs from the MIME-encoded input file and
    merge them into the output dictionary.

    If the variable name ends with a '*' character, then the value that is
    placed in the dictionary will be a list. This is useful for multiple-value
    fields. If the variable name ends with a '!' character (before the '*' if
    present) then the value will be a mime.Entity object."""
    import mime
    headers = "Content-Type: %s\n" % contenttype
    for entity in mime.Entity(encoded.read(), mime=1, headers=headers).entities:
      if not entity.content_disposition:
        continue
      if entity.content_disposition[0] != 'form-data':
        continue
      name = entity.content_disposition[1].get("name")
      if name[-1:] == "*":
        if name in self.params:
          if name[-2:-1] == "!":
            self.params[name].append(entity)
          else:
            self.params[name].append(entity.body)
        else:
          if name[-2:-1] == "!":
            self.params[name] = [entity]
          else:
            self.params[name] = [entity.body]
      elif name[-1:] == "!":
        self.params[name] = entity
      else:
        self.params[name] = entity.body

  def _read_cgi_data(self, environ, inf):
    """Read input data from the client and set up the object attributes."""
    if "QUERY_STRING" in environ:
      self._mergevars(environ["QUERY_STRING"])
    if environ.get("REQUEST_METHOD") == "POST":
      if environ.get("CONTENT_TYPE", "").startswith("multipart/form-data"):
        self._mergemime(environ["CONTENT_TYPE"], inf)
      else:
        self._mergevars(inf.read(int(environ.get("CONTENT_LENGTH", "-1"))))

  def traceback(self):
    traceback(self)
    try:
      self.clear_headers()
      self.clear_output()
      self.set_header("Content-Type", "text/html; charset=iso-8859-1")
    except SequencingError:
      pass
    self.write("""\
<html><head><title>Error</title></head>
<body><h1>Error</h1>
<p>Sorry, an error occurred. Please try again later.</p>
</body></html>""")


class GZipMixIn(object):
  def _init(self, *args, **kwargs):
    self._gzip = None
    self._gzip_level = 6
    super(GZipMixIn, self)._init(*args, **kwargs)

  def _close(self):
    parent = super(GZipMixIn, self)
    if self._gzip:
      import struct
      parent._write(self._gzip.flush(self._gzip_zlib.Z_FINISH))
      parent._write(
        struct.pack("<II", self._gzip_crc & 0xffffffff, self._gzip_length))
      parent._flush()
      self._gzip = None
    parent._close()

  def gzip_level(self, level=6):
    """Enable/disable gzip output compression."""
    if self._gzip_level == level:
      return
    if self._doneHeaders:
      raise SequencingError("Cannot adjust compression - headers already sent")
    self._gzip_level = level

  def _write(self, s):
    parent = super(GZipMixIn, self)
    if not self._gzip:
      parent._write(s)
      return
    self._gzip_crc = self._gzip_zlib.crc32(s, self._gzip_crc)
    self._gzip_length += len(s)
    parent._write(self._gzip.compress(s))

  def output_headers(self):
    parent = super(GZipMixIn, self)
    if self._gzip_level == 0:
      parent.output_headers()
      return
    self.append_header_value("Vary", "Accept-Encoding")
    gzip_ok = 0
    if "HTTP_ACCEPT_ENCODING" in self.environ:
      encodings = [[a.strip() for a in x.split(";", 1)]
        for x in self.environ["HTTP_ACCEPT_ENCODING"].split(",")]
      for encoding in encodings:
        if encoding[0].lower() == "gzip":
          if len(encoding) == 1:
            gzip_ok = 1
            break
          else:
            q = [x.strip() for x in encoding[1].split("=")]
            if len(q) == 2 and q[0].lower() == "q" and q[1] != "0":
              gzip_ok = 1
              break
    if gzip_ok:
      try:
        import zlib
        self.append_header_value("Content-Encoding", "gzip")
        self.del_header("Content-Length")
        parent.output_headers()
        self._gzip = zlib.compressobj(self._gzip_level, 8, -15)
        self._gzip_zlib = zlib
        self._gzip_crc = self._gzip_length = 0
        parent._write("\x1f\x8b\x08\x00\x00\x00\x00\x00\x00\x03")
        return
      except ImportError:
        pass
    parent.output_headers()

  def _flush(self):
    parent = super(GZipMixIn, self)
    if self._gzip:
      parent._write(self._gzip.flush(self._gzip_zlib.Z_SYNC_FLUSH))
    parent._flush()


class CGIRequest(Request):
  """An implementation of Request which uses the standard CGI interface."""

  def _init(self):
    self.__out = sys.stdout
    self.__err = sys.stderr
    self.environ = os.environ
    self.stdin = sys.stdin
    super(CGIRequest, self)._init()

  def process(self):
    """Read the CGI input and create and run a handler to handle the request."""
    self._init()
    try:
      handler = self._handler_type()
    except:
      self.traceback()
    else:
      try:
        handler.process(self)
      except:
        handler.traceback(self)
    self.close()

  def error(self, s):
    self.__err.write(s)

  def _close(self):
    self.__out.close()

  def _write(self, s):
    if not self.aborted:
      try:
        self.__out.write(s)
      except IOError, x:
        # Ignore EPIPE, caused by the browser having gone away
        if x[0] != errno.EPIPE:
          raise
        self.aborted = 1

  def _flush(self):
    if not self.aborted:
      try:
        self.__out.flush()
      except IOError, x:
        # Ignore EPIPE, caused by the browser having gone away
        if x[0] != errno.EPIPE:
          raise
        self.aborted = 1


class GZipCGIRequest(GZipMixIn, CGIRequest):
  pass


class Handler(object):
  """Handle a request."""
  def process(self, req):
    """Handle a request. req is a Request object."""
    raise NotImplementedError("handler process function must be overridden")

  def traceback(self, req):
    """Display a traceback, req is a Request object."""
    req.traceback()


class DebugHandlerMixIn(object):
  def traceback(self, req):
    """Display a traceback, req is a Request object."""
    traceback(req, html=1)


class DebugHandler(DebugHandlerMixIn, Handler):
  pass
