var LOADING_ATTR = "lazy-loading";

var lazyProcessors = [];
function lazyLoadByAttr(el) {
    for(var i=0; i < lazyProcessors.length; ++i) {
        var processor = lazyProcessors[i];
        if(el.getAttribute(processor[0]) && isVisible(el, window.innerHeight*0.5, window.innerHeight*0.5)) {
            processor[2](el, processor[0], processor[1]);
        }
    };
}

lazyProcessors.push(['lazy-src'   , 'src'   , replaceAttrAndRemoveFrom]);
lazyProcessors.push(['lazy-img'   , 'src'   , processImage]);
lazyProcessors.push(['lazy-srcset', 'srcset', replaceAttrAndRemoveFrom]);
lazyProcessors.push(['lazy-size'  , 'sizes' , processParentSize]);

var checkLazyElements = throttle(function() {
  var nodes = document.getElementsByTagName('*');
  for(var i=0; i < nodes.length; ++ i) {
    lazyLoadByAttr(nodes[i]);
  }
}, 100);


// process post images with background img
function processImage(el, attrFrom, attrTo) {
    el.setAttribute(LOADING_ATTR, true);
    var img = document.createElement('img');
    img.onload = function() {
        el.removeAttribute(attrFrom);
        el.removeAttribute(LOADING_ATTR);
        el.setAttribute(attrTo, img.src);
    };
    img.src = el.getAttribute(attrFrom);
}

function replaceAttrAndRemoveFrom(el, attrFrom, attrTo) {
    el.setAttribute(attrTo, el.getAttribute(attrFrom));
    el.removeAttribute(attrFrom);
}

// process post images with background img
function processParentSize(el, attrFrom, attrTo) {
    el.setAttribute(attrTo, el.parentNode.clientWidth + "px");
    el.removeAttribute(attrFrom);
}

function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

function throttle (callback, limit) {
  var wait = false;
  return function () {
    if (!wait) {
      callback.apply(null, arguments);
      wait = true;
      setTimeout(function () {
        wait = false;
      }, limit);
    }
  }
}

function isVisible(el, extraOffsetTop, extraOffsetBottom) {
  var extraOffsetTop = extraOffsetTop || 0;
  var extraOffsetBottom = extraOffsetBottom || 0;
  var top = el.offsetTop;
  var height = el.offsetHeight;
  while(el.offsetParent) {
    el = el.offsetParent;
    top += el.offsetTop;
  }
  var topEdge = top - extraOffsetTop;
  var bottomEdge = top + height + extraOffsetBottom;
  var topScreenEdge = window.pageYOffset;
  var bottomScreenEdge = window.pageYOffset + window.innerHeight;

  return (topEdge < bottomScreenEdge && topEdge > topScreenEdge) ||  // top edge in screen
    (bottomEdge < bottomScreenEdge && bottomEdge > topScreenEdge) || // bottom edge in screen
    (topEdge < topScreenEdge && bottomEdge > bottomScreenEdge); // belly in screen
}

if(!!window.addEventListener){
  window.addEventListener('scroll', checkLazyElements);
} else {
  window.onscroll = checkLazyElements();
}