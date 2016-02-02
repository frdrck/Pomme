# $Id: rowaccess.py,v dc8cd0cc4d9b 2010/03/17 18:50:06 jribbens $

import jon.wt as wt

class RowAccess(wt.TemplateCode):
  rowaccess_attrib = "row"

  def __getattr__(self, name):
    try:
      return getattr(self, self.rowaccess_attrib)[name]
    except KeyError:
      raise AttributeError(name)
