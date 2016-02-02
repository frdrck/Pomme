# $Id: __init__.py,v 2e7239f5b2e0 2010/03/20 18:29:22 jribbens $

"""Web Template system"""

import sys, os, re
import jon.cgi as cgi


_code_cache = {}

_replace_validchunk = re.compile("^[A-Za-z0-9_]+$")

def replace(wt, template, namespace):
  """Substitute variables in template and output with jcgi.write

  Variables are indicated by surrounding them with "$$".
  If the name is suffixed with "()" then it must be a function not a variable.
  The default encoding is to call jcgi.html_encode
    unless the variable is prefixed with "%" in which case it is jcgi.url_encode
    or the variable is prefixed with "=" in which case no encoding is used.
  If the variable is empty (i.e. the template contains "$$$$") then a literal
  "$$" is output.
  """
  html = 0
  for chunk in template.split("$$"):
    html = not html
    if html:
      wt.req.write(chunk)
    else:
      if chunk == "":
        wt.req.write("$$")
      else:
        encode = cgi.html_encode
        if chunk[0] == "=":
          encode = lambda x: x
          chunk = chunk[1:]
        elif chunk[0] == "%":
          encode = cgi.url_encode
          chunk = chunk[1:]
        if not _replace_validchunk.match(chunk):
          raise ValueError("'%s' is not a valid identifier" % chunk)
        if callable(getattr(namespace, chunk)):
          out = getattr(namespace, chunk)()
        else:
          out = getattr(namespace, chunk)
        if not isinstance(out, unicode):
          out = str(out)
        wt.req.write(encode(out))


class TemplateCode(object):
  template_as_file = 0

  def __init__(self, outer, wt=None):
    self.outer = outer
    if wt:
      self.wt = wt
    else:
      self.wt = self.outer.wt
    self.req = self.wt.req

  def process(self, template, selected=None):
    process(self.wt, template, self, selected)

  def main(self, template):
    self.process(template)


class GlobalTemplate(TemplateCode):
  def main(self, template):
    self._pageTemplate = template
    if hasattr(self, "get_template"):
      self.process(self.get_template())
    else:
      if self.template_as_file:
        self.process(open(self.template_name(), "rb"))
      else:
        encoding = self.wt.get_template_encoding()
        if encoding is None:
          self.process(open(self.template_name(), "rb").read())
        else:
          self.process(unicode(open(self.template_name(), "rb").read(),
            encoding))

  def template_name(self):
    return self.wt.etc + "/template.html"

  class page(TemplateCode):
    pass

  class _page(TemplateCode):
    def main(self, template):
      # Contents of the page block are ignored, the original template
      # is substituted instead
      obj = self.outer.page(self.outer)
      if obj.template_as_file:
        import StringIO as cStringIO
        obj.main(StringIO.StringIO(self.outer._pageTemplate))
      else:
        obj.main(self.outer._pageTemplate)


_process_sb = re.compile("<!--wt:([A-Za-z0-9_]+)(/)?-->")

def process(wt, template, namespace, selected=None):
  pos = 0
  while 1:
    start = _process_sb.search(template, pos)
    if not start:
      break
    name = start.group(1)
    if start.lastindex == 2: # shorttag
      end = start.end()
      endmark = ""
    else:
      endmark = "<!--wt:/%s-->" % name
      end = template.find(endmark, start.end())
      if end == -1:
        raise ValueError("No end block for %s" % name)
    replace(wt, template[pos:start.start()], namespace)
    if name != "_null" and (selected == None or selected == name or
      (type(selected) == type([]) and name in selected) or
      (type(selected) == type(()) and name in selected)):
      obj = getattr(namespace, name)(namespace, wt)
      if obj.template_as_file:
        import cStringIO as StringIO
        obj.main(StringIO.StringIO(template[start.end():end]))
      else:
        obj.main(template[start.end():end])
      del obj
    pos = end + len(endmark)
  replace(wt, template[pos:], namespace)


class Handler(cgi.Handler):
  cache_code = 0

  def _get_template(self):
    for i in range(4):
      template = self.req.environ.get("REDIRECT_" * i + "WT_TEMPLATE_FILENAME")
      if template:
        return template
    raise Exception("Couldn't determine template filename")

  def _get_etc(self):
    sp = os.path.split(self.req.environ["DOCUMENT_ROOT"])
    if sp[1] == "":
      sp = os.path.split(sp[0])
    return sp[0] + "/etc"

  def _get_code(self):
    code = self.req.environ.get("PATH_TRANSLATED")
    if code is None:
      code = self.req.environ["SCRIPT_FILENAME"]
    return code

  def get_template_encoding(self):
    return None

  def pre_load(self):
    pass

  def pre_request(self, obj):
    pass

  def post_request(self, obj):
    pass

  def process(self, req):
    self.req = req
    self.etc = self._get_etc()
    self.pre_load()
    self.template = self._get_template()
    codefname = self._get_code()
    try:
      namespace = _code_cache[codefname]
    except KeyError:
      namespace = { "wt": sys.modules[__name__] }
      code = compile(open(codefname, "r").read(), codefname, "exec")
      exec code in namespace
      del code
      if self.cache_code:
        _code_cache[codefname] = namespace
    obj = namespace["main"](None, self)
    self.pre_request(obj)
    if obj.template_as_file:
      obj.main(open(self.template, "rb"))
    else:
      encoding = self.get_template_encoding()
      if encoding is None:
        obj.main(open(self.template, "rb").read())
      else:
        obj.main(unicode(open(self.template, "rb").read(), encoding))
    self.post_request(obj)


class DebugHandler(cgi.DebugHandlerMixIn, Handler):
  pass
