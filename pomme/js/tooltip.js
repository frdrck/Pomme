$(function($){
    
  var tooltip = document.createElement("div");
  tooltip.id = "tooltip";
  tooltip.style.display = "none";
  tooltip.style.zIndex = 6969;

  var tooltip_arrow = document.createElement("div");
  tooltip_arrow.id = "tooltip_arrow";
  tooltip_arrow.style.display = "none";
  tooltip_arrow.style.zIndex = 6969;
  document.body.appendChild(tooltip);
  document.body.appendChild(tooltip_arrow);

  $.tooltip = function(el, options){
    var base = this;
    base.$el = $(el);
    base.el = el;        
    base.$el.data("tooltip", base);
    
    base.init = function(){            
      // base.options = $.extend({}, $.tooltip.options, options);
      base.el.onmouseover = base.mouseover;
      base.el.onmouseout = base.mouseout;
    };

    base.mouseover = function(){
      tooltip.style.top = "0";
      tooltip.style.left = "-999px";
      tooltip.style.display = "block";
      tooltip_arrow.style.display = "block";
      tooltip.innerHTML = base.el.innerHTML;
      var offset = base.$el.offset();
      var el_width = base.$el.width();
      var width = $(tooltip).width();
      tooltip.style.top = offset.top + 32 + "px";
      tooltip.style.left = offset.left + el_width/2 - width / 2 + "px";
      tooltip_arrow.style.top = offset.top + 28 + "px";
      tooltip_arrow.style.left = offset.left + 6 + "px";
    };

    base.mouseout = function(){
      tooltip.style.display = "none";
      tooltip_arrow.style.display = "none";
    };

    base.init();
  };

  $.fn.tooltip = function(options){
    return this.each(function(){
      (new $.tooltip(this, options));            
    });
  };

  $(".icon").tooltip();
});


