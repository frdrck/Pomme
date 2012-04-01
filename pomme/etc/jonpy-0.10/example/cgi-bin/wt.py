#!/usr/local/bin/python

# $Id: wt.py,v 12cd26f9cc8c 2002/05/02 00:11:56 jribbens $

import jon.wt as wt
import jon.fcgi as fcgi


fcgi.Server({fcgi.FCGI_RESPONDER: wt.Handler}).run()
