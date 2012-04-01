# $Id: printenv.html.py,v 2e7239f5b2e0 2010/03/20 18:29:22 jribbens $


class main(wt.TemplateCode):
  class request(wt.TemplateCode):
    def main(self, template):
      for (self.key, self.val) in self.req.params.items():
        self.process(template)

  class cookies(wt.TemplateCode):
    def main(self, template):
      for (self.key, self.val) in self.req.cookies.items():
        self.process(template)

  class environ(wt.TemplateCode):
    def main(self, template):
      for (self.key, self.val) in self.req.environ.items():
        self.process(template)
