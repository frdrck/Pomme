# $Id: wsgi.py,v a9ebd961ae72 2010/03/23 01:01:42 jon $

import cgi, fakefile


# classes involving calling jonpy-style handlers from WSGI server connectors

class Request(cgi.Request):
  def _init(self, environ, start_response):
    self.environ = environ
    self.stdin = environ["wsgi.input"]
    self._wsgi_start_response = start_response
    self._wsgi_write = None
    super(Request, self)._init()

  def output_headers(self):
    if self._doneHeaders:
      raise cgi.SequencingError("output_headers() called twice")
    self._wsgi_write = self._wsgi_start_response(
      self.get_header("Status") or "200 OK",
      [header for header in self._headers if header[0].lower() != "status"])
    self._doneHeaders = 1

  def process(self, environ, start_response):
    self._init(environ, start_response)
    try:
      handler = self._handler_type()
    except:
      self.traceback()
    else:
      try:
        handler.process(self)
      except:
        handler.traceback(self)
    self.flush()
    return []
  
  def error(self, s):
    self.environ["wsgi.stderr"].write(s)

  def _write(self, s):
    if not self.aborted:
      if not self._doneHeaders:
        self.output_headers()
      self._wsgi_write(s)


class GZipRequest(cgi.GZipMixIn, Request):
  pass


class Application(object):
  def __init__(self, handler_type, request_type=Request):
    self._handler_type = handler_type
    self._request_type = request_type

  def __call__(self, environ, start_response):
    return self._request_type(self._handler_type).process(
      environ, start_response)



# classes involving calling WSGI applications from jonpy-style server connectors

class Handler(cgi.Handler):
  def process(self, req):
    environ = dict(req.environ.items())
    environ["wsgi.version"] = (1, 0)
    environ["wsgi.input"] = req
    environ["wsgi.errors"] = fakefile.FakeOutput(req.error)
    environ["wsgi.multithread"] = 1
    environ["wsgi.multiprocess"] = 1
    environ["wsgi.run_once"] = isinstance(req, cgi.CGIRequest)
    # is this right? PEP-333 seems to assume it is
    if environ.get("HTTPS") in ("on", "1"):
      environ["wsgi.url_scheme"] = "https"
    else:
      environ["wsgi.url_scheme"] = "http"

    def start_response(status, response_headers, exc_info=None):
      if exc_info:
        try:
          if req.get_header("Status") is not None:
            raise exc_info[0], exc_info[1], exc_info[2]
        finally:
          exc_info = None
      elif req.get_header("Status") is not None:
        raise AssertionError("start_response() called twice")
      req.set_header("Status", status)
      for header, value in response_headers:
        req.add_header(header, value)
      return req.write

    appiter = self.application[0](environ, start_response)
    try:
      for s in appiter:
        if s:
          req.write(s)
      req.flush()
    finally:
      if hasattr(appiter, "close"):
        appiter.close()


class DebugHandler(cgi.DebugHandlerMixIn, Handler):
  pass


def create_handler(application, handler_type=Handler):
  class BoundHandler(handler_type):
    pass
  BoundHandler.application = (application,)
  return BoundHandler
