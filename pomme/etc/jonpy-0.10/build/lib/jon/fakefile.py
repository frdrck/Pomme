# $Id: fakefile.py,v 517591d1628a 2010/03/23 01:01:23 jon $


class FakeFile(object):
  def __init__(self):
    self.closed = 0
    self.softspace = 0
    self._buf = ""
    self.chunksize = 4096
    self.newlines = None

  def close(self):
    self.closed = 1

  def _check_open(self):
    if self.closed:
      raise IOError("File is closed")

  def flush(self):
    self._check_open()

  def read(self, size=-1):
    raise IOError("cannot read()")

  def readline(self, size=-1):
    raise IOError("cannot readline()")

  def readlines(self, size=-1):
    raise IOError("cannot readlines()")

  def xreadlines(self):
    return iter(self)

  def __iter__(self):
    while 1:
      line = self.readline()
      if line == "":
        break
      yield line

  def seek(self, offset, whence=0):
    raise IOError("cannot seek()")

  def tell(self):
    raise IOError("cannot tell()")

  def truncate(self):
    raise IOError("cannot truncate()")
  
  def write(self, s):
    raise IOError("cannot write()")

  def writelines(self, seq):
    raise IOError("cannot writelines()")


class FakeInput(FakeFile):
  name = "<fake input stream>"
  mode = "rb"

  def _read(self, size):
    return ""

  def _read_more(self, size=-1):
    d = self._read(size)
    self._buf += d
    return len(d)

  def read(self, size=-1):
    self._check_open()
    if size < 0:
      while self._read_more():
        pass
      r = self._buf
      self._buf = ""
      return r
    while len(self._buf) < size and self._read_more(self.chunksize):
      pass
    if len(self._buf) == size:
      r = self._buf
      self._buf = ""
      return r
    r = self._buf[:size]
    self._buf = self._buf[size:]
    return r

  def readline(self, size=-1):
    self._check_open()
    start = 0
    while 1:
      if size < 0:
        pos = self._buf.find("\n", start)
      else:
        pos = self._buf.find("\n", start, size)
      start = len(self._buf)
      if pos >= 0:
        return self.read(pos + 1)
      if size >= 0 and len(self._buf) >= size:
        return self.read(size)
      if not self._read_more(self.chunksize):
        return self.read()

  def readlines(self, size=-1):
    self._check_open()
    lines = []
    while 1:
      line = self.readline()
      if line == "":
        return lines
      lines.append(line)
      if size >= 0:
        size -= len(line)
        if size <= 0:
          return lines


class FakeOutput(FakeFile):
  name = "<fake output stream>"
  mode = "wb"

  def __init__(self, write):
    FakeFile.__init__(self)
    self._write = write

  def write(self, s):
    self._write(s)

  def writelines(self, seq):
    for line in seq:
      self._write(line)
