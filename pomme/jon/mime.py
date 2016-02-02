# $Id: mime.py,v 2e7239f5b2e0 2010/03/20 18:29:22 jribbens $

"""mime - MIME decoding Library"""

import rfc822, re
import cStringIO as StringIO


class Error(Exception):
  pass


class Entity(rfc822.Message):
  def __init__(self, msg, mime=0, eol=r"\r\n", headers=None):
    if headers is not None:
      fp = StringIO.StringIO(headers + "\n" + msg)
    else:
      fp = StringIO.StringIO(msg)
    del msg
    rfc822.Message.__init__(self, fp)
    del self.fp
    self.mime = mime or ("MIME-Version" in self)
    if not self.mime:
      self.body = fp.read()
      return
    if "Content-Type" in self:
      self.content_type = parse_content_type(self["Content-Type"])
    else:
      self.content_type = None
    if "Content-Disposition" in self:
      self.content_disposition = \
        parse_content_disposition(self["Content-Disposition"])
    else:
      self.content_disposition = None
    self.entities = []
    if self.content_type and self.content_type[0][:10] == "multipart/":
      bre = re.compile(r"(" + eol + r")?--" +
        re.escape(self.content_type[1]["boundary"]) + r"(--)?[ \t]*" +
        r"(" + eol + r")?")
      msg = fp.read()
      start = 0
      while 1:
        while 1:
          end = bre.search(msg, start)
          if not end:
            raise Error("End boundary not found in multipart")
          if end.group(1) is not None or end.start() == 0 and start == 0:
            break
        if start == 0:
          self.body = msg[start:end.start()]
        else:
          self.entities.append(Entity(msg[start:end.start()], mime=1, eol=eol))
        start = end.end()
        if end.group(2) == "--":
          break
    else:
      encoding = self.get("Content-Transfer-Encoding", "7bit").lower()
      self.body = decode(encoding, fp.read())


_tspecials = "()<>@,;:\\\"/[]?="
_whitespace = " \t\r\n"
_tokenchars = "!#$%&'*+-.0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ" \
  "^_`abcdefghijklmnopqrstuvwxyz{|}~"


def parse_content_disposition(s):
  i = 0
  # skip whitespace before disposition
  while i < len(s) and s[i] in _whitespace: i+= 1
  if i >= len(s):
    raise Error("Unexpected end of string before disposition")
  # disposition
  disposition = ""
  while i < len(s) and s[i] in _tokenchars:
    disposition += s[i]
    i+= 1
  while i < len(s) and s[i] in _whitespace: i+= 1
  if i >= len(s):
    return (disposition, {})
  if s[i] != ';':
    raise Error("Unexpected character %s in disposition" % repr(s[i]))
  i+= 1
  return (disposition, parse_params(s[i:]))
    

def parse_content_type(s):
  i = 0
  # skip whitespace before type "/" subtype
  while i < len(s) and s[i] in _whitespace: i+= 1
  if i >= len(s):
    raise Error("Unexpected end of string before type")
  # type
  content_type = ""
  while i < len(s) and s[i] in _tokenchars:
    content_type += s[i]
    i+= 1
  if i >= len(s):
    raise Error("Unexpected end of string in type")
  # "/"
  if s[i] != "/":
    raise Error("Unexpected character %s in type" % repr(s[i]))
  content_type += "/"
  i+= 1
  # subtype
  while i < len(s) and s[i] in _tokenchars:
    content_type += s[i]
    i+= 1
  while i < len(s) and s[i] in _whitespace: i+= 1
  if i >= len(s):
    return (content_type, {})
  if s[i] != ';':
    raise Error("Unexpected character %s in subtype" % repr(s[i]))
  i+= 1
  return (content_type, parse_params(s[i:]))


def parse_params(s):
  params = {}
  i = 0
  while 1:
    # skip whitespace before an attribute/value pair
    while i < len(s) and s[i] in _whitespace: i+= 1
    if i >= len(s): break
    # fetch the attribute
    attribute = ""
    while i < len(s) and s[i] in _tokenchars:
      attribute += s[i]
      i+= 1
    if i >= len(s):
      raise Error("Unexpected end of string in attribute")
    # now we should have an equals sign
    if s[i] != "=":
      raise Error("Unexpected character %s in attribute" % repr(s[i]))
    i+= 1
    if i >= len(s):
      raise Error("Unexpected end of string after '='")
    # now we should have the value - either a token or a quoted-string
    value = ""
    if s[i] != '"':
      # token
      while i < len(s) and s[i] in _tokenchars:
        value += s[i]
        i+= 1
    else:
      # quoted-string
      i+= 1
      while 1:
        if i >= len(s):
          raise Error("Unexpected end of string in quoted-string")
        if s[i] == '"':
          break
        if i == "\\":
          i+= 1
          if i >= len(s):
            raise Error("Unexpected end of string in quoted-pair")
        value += s[i]
        i+= 1
      i+= 1
    params[attribute.lower()] = value
    while i < len(s) and s[i] in _whitespace: i+= 1
    if i >= len(s):
      break
    if s[i] != ";":
      raise Error("Unexpected character %s after parameter" % repr(s[i]))
    i+= 1
  return params


def decode(encoding, s):
  if encoding == '7bit' or encoding == '8bit' or encoding == 'binary':
    return s
  elif encoding == 'quoted-printable':
    import quopri
    ifp = StringIO.StringIO(s)
    ofp = StringIO.StringIO()
    quopri.decode(ifp, ofp)
    return ofp.getvalue()
  elif encoding == 'base64':
    import base64
    return base64.decodestring(s)
  else:
    raise Error("Unknown encoding %s" % repr(encoding))
