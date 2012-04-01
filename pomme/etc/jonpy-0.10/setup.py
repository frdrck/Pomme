#!/usr/bin/env python

# $Id: setup.py,v 5c59a5bc7f48 2011/05/26 14:59:48 jon $

from distutils.core import setup

setup(name="jonpy",
      version="0.10",
      description="Jon's Python modules",
      author="Jon Ribbens",
      author_email="jon+jonpy@unequivocal.co.uk",
      url="http://jonpy.sourceforge.net/",
      packages=['jon', 'jon.wt']
)
