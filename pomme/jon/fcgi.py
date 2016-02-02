# $Id: fcgi.py,v 5efd11fe0588 2010/03/20 18:27:40 jribbens $

import struct, socket, sys, errno, os, select
import cgi, fakefile

log_level = 0
log_name = "/tmp/fcgi.log"
log_file = None
log_lock = None

FCGI_LISTENSOCK_FILENO = 0
FCGI_VERSION_1 = 1

FCGI_BEGIN_REQUEST = 1
FCGI_ABORT_REQUEST = 2
FCGI_END_REQUEST = 3
FCGI_PARAMS = 4
FCGI_STDIN = 5
FCGI_STDOUT = 6
FCGI_STDERR = 7
FCGI_DATA = 8
FCGI_GET_VALUES = 9
FCGI_GET_VALUES_RESULT = 10
FCGI_UNKNOWN_TYPE = 11

FCGI_KEEP_CONN = 1

FCGI_RESPONDER = 1
FCGI_AUTHORIZER = 2
FCGI_FILTER = 3

FCGI_REQUEST_COMPLETE = 0
FCGI_CANT_MPX_CONN = 1
FCGI_OVERLOADED = 2
FCGI_UNKNOWN_ROLE = 3

_log_printable = "." * 32 + "".join(chr(c) for c in range(32, 127)) + "." * 129


def _log(level, message, data=None):
  global log_file

  if log_level >= level:
    import time
    if data:
      if not isinstance(data, str):
        data = str(data)
      data = data.translate(_log_printable)
      pos = 0
      while pos < len(data):
        message += "\n  " + data[pos:pos+70]
        pos += 70
    if log_lock:
      log_lock.acquire()
    try:
      if not log_file:
        log_file = open(log_name, "a", 1)
      log_file.write("%s %s\n" % (time.strftime("%b %d %H:%M:%S"), message))
    finally:
      if log_lock:
        log_lock.release()


def set_logging(level, filename=None):
  global log_level, log_name

  if filename and filename != log_name:
    if log_file:
      raise Exception("Cannot change the log filename after it's been opened")
    log_name = filename
  log_level = level


# We shouldn't need this function, we should be able to just use socket.makefile
# instead, but Solaris 2.7 appears to be so broken that stdio doesn't work when
# you set the buffer size of a stream to zero.

def _sockread(sock, length):
  data = []
  while length > 0:
    newdata = sock.recv(length)
    if not newdata:
      raise EOFError("End-of-file reading socket")
    data.append(newdata)
    length -= len(newdata)
  return "".join(data)


class Record(object):
  def __init__(self, insock=None):
    if insock:
      data = _sockread(insock, 8)
      (self.version, self.type, self.request_id, content_length,
        padding_length) = struct.unpack("!BBHHBx", data)
      self.content_data = _sockread(insock, content_length)
      _sockread(insock, padding_length)
    else:
      self.version = FCGI_VERSION_1

  def encode(self):
    padding_length = -len(self.content_data) & 7
    return struct.pack("!BBHHBB", self.version, self.type, self.request_id,
      len(self.content_data), padding_length, 0) + self.content_data + \
      "\x00" * padding_length


class NameValueData(object):
  def __init__(self, data=""):
    self.values = []
    pos = 0
    while pos < len(data):
      if ord(data[pos]) & 128:
        name_length = struct.unpack("!I", data[pos:pos+4])[0] & 0x7fffffff
        pos += 4
      else:
        name_length = ord(data[pos])
        pos += 1
      if ord(data[pos]) & 128:
        value_length = struct.unpack("!I", data[pos:pos+4])[0] & 0x7fffffff
        pos += 4
      else:
        value_length = ord(data[pos])
        pos += 1
      if pos + name_length + value_length > len(data):
        raise ValueError("Unexpected end-of-data in NameValueRecord")
      self.values.append((data[pos:pos+name_length],
        data[pos+name_length:pos+name_length+value_length]))
      pos += name_length + value_length

  def encode_one(self, name, value):
    if len(name) > 127:
      namelen = struct.pack("!I", len(name) | (-0x7fffffff-1))
    else:
      namelen = chr(len(name))
    if len(value) > 127:
      valuelen = struct.pack("!I", len(value) | (-0x7fffffff-1))
    else:
      valuelen = chr(len(value))
    return namelen + valuelen + name + value

  def encode(self):
    return "".join([self.encode_one(name, value)
      for name, value in self.values])


class InputStream(fakefile.FakeInput):
  def __init__(self, connection, streamname, threaded):
    fakefile.FakeInput.__init__(self)
    self.data = []
    self.eof = 0
    self.connection = connection
    self.streamname = streamname
    self.threaded = threaded
    if self.threaded:
      import threading
      self.sema = threading.Semaphore(0)

  def add_data(self, s):
    if s:
      self.data.append(s)
    else:
      self.eof = 1
    if self.threaded:
      self.sema.release()

  def _read(self, nbytes=-1):
    while not self.eof and not self.data:
      if self.threaded:
        self.sema.acquire()
      else:
        self.connection.process_input(self.streamname)
    if self.eof and not self.data:
      return ""
    return self.data.pop(0)


class Connection(object):
  def __init__(self, socket, handler_types, request_type, params,
    threading_level):
    self.socket = socket
    self.handler_types = handler_types
    self.request_type = request_type
    self.fileno = self.socket.fileno()
    self.params = params
    self.threading_level = threading_level
    if self.threading_level > 1:
      import thread
      self.socketlock = thread.allocate_lock()
    else:
      self.socketlock = None

  def log(self, level, request_id, message, data=None):
    if log_level >= level:
      if request_id:
        _log(level, "%3d/%3d %s" % (self.fileno, request_id, message), data)
      else:
        _log(level, "%3d     %s" % (self.fileno, message), data)

  def close(self):
    if self.socketlock is not None:
      self.socketlock.acquire()
      try:
        self.socket.close()
      finally:
        self.socketlock.release()
    else:
      self.socket.close()

  def write(self, rec):
    try:
      if self.socketlock is not None:
        self.socketlock.acquire()
        try:
          self.socket.sendall(rec.encode())
        finally:
          self.socketlock.release()
      else:
        self.socket.sendall(rec.encode())
    except socket.error, x:
      if x[0] == errno.EPIPE:
        for req in self.requests.values():
          req.aborted = 2
      else:
        raise

  def run(self):
    self.log(2, 0, "New connection running")
    self.requests = {}
    self.process_input(None)

  def process_input(self, waitstream):
    while 1:
      try:
        # this select *should* be pointless, however it works around a bug
        # in OpenBSD whereby the read() does not get interrupted when
        # another thread closes the socket (and it does no harm on other
        # OSes)
        select.select([self.socket], [], [])
        rec = Record(self.socket)
      except:
        x = sys.exc_info()[1]
        if isinstance(x, (EOFError, ValueError)) or \
          (isinstance(x, socket.error) and x[0] == errno.EBADF):
          self.log(2, 0, "EOF received on connection")
          for req in self.requests.values():
            req.aborted = 2
          break
        else:
          raise
      if rec.type == FCGI_GET_VALUES:
        data = NameValueData(rec.content_data)
        self.log(3, 0, "< FCGI_GET_VALUES", data.values)
        reply = Record()
        reply.type = FCGI_GET_VALUES_RESULT
        reply.request_id = 0
        reply_data = NameValueData()
        for nameval in data.values:
          if self.params and nameval[0] in self.params:
            reply_data.values.append(nameval[0], str(self.params[nameval[0]]))
          elif nameval[0] == "FCGI_MAX_CONNS":
            if self.threading_level < 1:
              reply_data.values.append(("FCGI_MAX_CONNS", "1"))
            else:
              reply_data.values.append(("FCGI_MAX_CONNS", "10"))
          elif nameval[0] == "FCGI_MAX_REQS":
            if self.threading_level < 1:
              reply_data.values.append(("FCGI_MAX_REQS", "1"))
            else:
              reply_data.values.append(("FCGI_MAX_REQS", "10"))
          elif nameval[0] == "FCGI_MPXS_CONNS":
            if self.threading_level < 2:
              reply_data.values.append(("FCGI_MPXS_CONNS", "0"))
            else:
              reply_data.values.append(("FCGI_MPXS_CONNS", "1"))
        self.log(3, 0, "> FCGI_GET_VALUES_RESULT", reply_data.values)
        reply.content_data = reply_data.encode()
        self.write(reply)
      elif rec.type == FCGI_BEGIN_REQUEST:
        (role, flags) = struct.unpack("!HB", rec.content_data[:3])
        handler_type = self.handler_types.get(role)
        self.log(2, rec.request_id,
          "< FCGI_BEGIN_REQUEST: role = %d, flags = %d" % (role, flags))
        if not handler_type:
          self.log(2, rec.request_id, "no handler for this role, rejecting")
          reply = Record()
          reply.type = FCGI_END_REQUEST
          reply.request_id = rec.request_id
          reply.content_data = struct.pack("!IBBBB",
            0, FCGI_UNKNOWN_ROLE, 0, 0, 0)
          self.log(3, rec.request_id, "> FCGI_END_REQUEST: FCGI_UNKNOWN_ROLE")
          self.write(reply)
        elif waitstream is not None:
          self.log(2, rec.request_id, "already handling a request, rejecting")
          reply = Record()
          reply.type = FCGI_END_REQUEST
          reply.request_id = rec.request_id
          reply.content_data = struct.pack("!IBBBB",
            0, FCGI_CANT_MPX_CONN, 0, 0, 0)
          self.log(3, rec.request_id, "> FCGI_END_REQUEST: FCGI_CANT_MPX_CONN")
          self.write(reply)
        else:
          req = self.request_type(handler_type, self, rec.request_id, flags,
            self.threading_level)
          self.requests[rec.request_id] = req
      elif rec.type == FCGI_PARAMS:
        req = self.requests.get(rec.request_id)
        if req:
          if rec.content_data:
            data = NameValueData(rec.content_data)
            self.log(3, rec.request_id, "< FCGI_PARAMS", data.values)
            for nameval in data.values:
              req.environ[nameval[0]] = nameval[1]
          else:
            self.log(3, rec.request_id, "< FCGI_PARAMS: <empty>")
            if self.threading_level > 1:
              self.log(2, rec.request_id, "starting request thread")
              import thread
              thread.start_new_thread(req.run, ())
            else:
              self.log(2, rec.request_id, "executing request")
              req.run()
        else:
          self.log(2, rec.request_id, "< FCGI_PARAMS: unknown request_id",
            rec.content_data)
      elif rec.type == FCGI_ABORT_REQUEST:
        req = self.requests.get(rec.request_id)
        if req:
          self.log(2, rec.request_id, "< FCGI_ABORT_REQUEST")
          req.aborted = 1
        else:
          self.log(2, rec.request_id,
            "< FCGI_ABORT_REQUEST: unknown request_id")
      elif rec.type == FCGI_STDIN:
        req = self.requests.get(rec.request_id)
        if req:
          if log_level >= 4:
            self.log(4, rec.request_id, "< FCGI_STDIN", rec.content_data)
          req.stdin.add_data(rec.content_data)
          if waitstream == "stdin":
            return
        else:
          self.log(2, rec.request_id, "< FCGI_STDIN: unknown request_id",
            rec.content_data)
      elif rec.type == FCGI_DATA:
        req = self.requests.get(rec.request_id)
        if req:
          if log_level >= 4:
            self.log(4, rec.request_id, "< FCGI_DATA", rec.content_data)
          req.fcgi_data.add_data(rec.content_data)
          if waitstream == "fcgi_data":
            return
        else:
          self.log(2, rec.request_id, "< FCGI_DATA: unknown request_id",
            rec.content_data)
      else:
        self.log(2, rec.request_id, "< unknown type %d" % rec.type)
        reply = Record()
        reply.type = FCGI_UNKNOWN_TYPE
        reply.request_id = 0
        reply.content_data = chr(rec.type) + "\x00" * 7
        self.log(3, "> FCGI_UNKNOWN_TYPE")
        self.write(reply)
      

class Request(cgi.Request):
  _fcgi_fallback_type = cgi.CGIRequest

  def __init__(self, handler_type, connection, request_id, flags,
    threading_level):
    cgi.Request.__init__(self, handler_type)
    self.__connection = connection
    self.__request_id = request_id
    self.__flags = flags
    self.__threading_level = threading_level
    self.fcgi_data = InputStream(connection, "fcgi_data", threading_level > 1)
    self.stdin = InputStream(connection, "stdin", threading_level > 1)
    self.environ = {}
    self._stderr_used = 0
  
  def log(self, level, message, data=None):
    global log_file

    if log_level >= level:
      _log(level, "%3d/%3d %s" % (self.__connection.fileno,
        self.__request_id, message), data)

  def run(self):
    try:
      self.log(2, "New request running")
      self._init()
      self.log(2, "Calling handler")
      try:
        handler = self._handler_type()
      except:
        self.traceback()
      else:
        try:
          handler.process(self)
        except:
          handler.traceback(self)
      self.log(2, "Handler finished")
      self.flush()
      if self.aborted < 2:
        try:
          rec = Record()
          rec.type = FCGI_STDOUT
          rec.request_id = self.__request_id
          rec.content_data = ""
          self.log(2, "> FCGI_STDOUT: <close>")
          self.__connection.write(rec)
          if self._stderr_used:
            rec.type = FCGI_STDERR
            self.log(2, "> FCGI_STDERR: <close>")
            self.__connection.write(rec)
          rec.type = FCGI_END_REQUEST
          rec.content_data = struct.pack("!IBBBB", 0, FCGI_REQUEST_COMPLETE,
            0, 0, 0)
          self.log(2, "> FCGI_END_REQUEST")
          self.__connection.write(rec)
        except IOError, x:
          if x[0] == errno.EPIPE:
            self.log(2, "EPIPE during request finalisation")
          else:
            raise
    finally:
      if not self.__flags & FCGI_KEEP_CONN:
        self.__connection.close()
        self.log(2, "Closed connection")
      del self.__connection.requests[self.__request_id]
      self.log(2, "Request complete")

  def _write(self, s):
    if log_level >= 4:
      self.log(4, "> FCGI_STDOUT", s)
    self._recwrite(FCGI_STDOUT, s)

  def error(self, s):
    if log_level >= 4:
      self.log(4, "> FCGI_STDERR", s)
    self._recwrite(FCGI_STDERR, s)
    self._stderr_used = 1

  def _recwrite(self, type, s):
    if s:
      pos = 0
      while pos < len(s):
        if self.aborted:
          return
        rec = Record()
        rec.type = type
        rec.request_id = self.__request_id
        if pos == 0 and len(s) <= 65535:
          # (avoid copying in the common case of s <= 65535 bytes)
          rec.content_data = s
        else:
          rec.content_data = s[pos:pos+65535]
        pos += len(rec.content_data)
        try:
          self.__connection.write(rec)
        except IOError, x:
          if x[0] == errno.EPIPE:
            self.aborted = 2
            self.log(2, "Aborted due to EPIPE")
          else:
            raise


class GZipRequest(cgi.GZipMixIn, Request):
  _fcgi_fallback_type = cgi.GZipCGIRequest


class Server(object):
  def __init__(self, handler_types, max_requests=0, params=None,
    request_type=Request, threading_level=1):
    global log_lock
    self.handler_types = handler_types
    self.max_requests = max_requests
    self.params = params
    self.request_type = request_type
    self.log(2, "theading_level = %d" % threading_level)
    if threading_level > 0:
      try:
        import thread
        log_lock = thread.allocate_lock()
      except ImportError, x:
        threading_level = 0
        self.log(2, "cannot import thread (%s), disabling threading" % str(x))
    self.threading_level = threading_level

  def log(self, level, message):
    if log_level >= level:
      _log(level, "        %s" % message)

  def exit(self):
    self._sock.close()

  def run(self):
    self.log(1, "Server.run()")
    if "FCGI_WEB_SERVER_ADDRS" in os.environ:
      web_server_addrs = os.environ["FCGI_WEB_SERVER_ADDRS"].split(",")
    else:
      web_server_addrs = None
    self.log(1, "web_server_addrs = %s" % repr(web_server_addrs))
    self._sock = socket.fromfd(sys.stdin.fileno(), socket.AF_INET,
      socket.SOCK_STREAM)
    try:
      self._sock.getpeername()
    except socket.error, x:
      if x[0] != errno.ENOTSOCK and x[0] != errno.ENOTCONN:
        raise
      if x[0] == errno.ENOTSOCK:
        self.log(1, "stdin not socket - falling back to CGI")
        self.request_type._fcgi_fallback_type(
          self.handler_types[FCGI_RESPONDER]).process()
        return
    self._sock.setblocking(1)
    while 1:
      try:
        # this select *should* be pointless, however it works around a bug
        # in OpenBSD whereby the accept() does not get interrupted when
        # another thread closes the socket (and it does no harm on other
        # OSes)
        select.select([self._sock], [], [])
        (newsock, addr) = self._sock.accept()
      except socket.error, x:
        if x[0] == errno.EBADF:
          break
        raise
      self.log(1, "accepted connection %d from %s" %
        (newsock.fileno(), repr(addr)))
      if web_server_addrs and (len(addr) != 2 or \
        addr[0] not in web_server_addrs):
        self.log(1, "not in web_server_addrs - rejected")
        newsock.close()
        continue
      conn = Connection(newsock, self.handler_types, self.request_type,
        self.params, self.threading_level)
      del newsock
      if self.threading_level > 0:
        import thread
        thread.start_new_thread(conn.run, ())
      else:
        conn.run()
      if self.max_requests > 0:
        self.max_requests -= 1
        if self.max_requests <= 0:
          self.log(1, "reached max_requests, exiting")
          break
    self._sock.close()
