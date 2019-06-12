"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/**
 * Check if arg is either an array with at least 1 element, or a dict with at least 1 key
 * @return boolean
 */
function isCollapsable(arg) {
  return arg instanceof Object && Object.keys(arg).length > 0;
}
/**
 * Check if a string represents a valid url
 * @return boolean
 */


function isUrl(string) {
  var regexp = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/;
  return regexp.test(string);
}
/**
 * Transform a json object into html representation
 * @return string
 */


function json2html(json, options) {
  var html = '';

  if (typeof json === 'string') {
    // Escape tags
    var tmp = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    if (isUrl(tmp)) {
      html += "<a href=\"".concat(tmp, "\" class=\"json-string\">").concat(tmp, "</a>");
    } else {
      html += "<span class=\"json-string\">\"".concat(tmp, "\"</span>");
    }
  } else if (typeof json === 'number') {
    html += "<span class=\"json-literal\">".concat(json, "</span>");
  } else if (typeof json === 'boolean') {
    html += "<span class=\"json-literal\">".concat(json, "</span>");
  } else if (json === null) {
    html += '<span class="json-literal">null</span>';
  } else if (json instanceof Array) {
    if (json.length > 0) {
      html += '[<ol class="json-array">';

      for (var i = 0; i < json.length; i += 1) {
        html += "<li data-key-type=\"array\" data-key=\"".concat(i, "\">"); // Add toggle button if item is collapsable

        if (isCollapsable(json[i])) {
          html += '<a href class="json-toggle"></a>';
        }

        html += json2html(json[i], options); // Add comma if item is not last

        if (i < json.length - 1) {
          html += ',';
        }

        html += '</li>';
      }

      html += '</ol>]';
    } else {
      html += '[]';
    }
  } else if (_typeof(json) === 'object') {
    var keyCount = Object.keys(json).length;

    if (keyCount > 0) {
      html += '{<ul class="json-dict">';

      for (var key in json) {
        if (json.hasOwnProperty(key)) {
          html += "<li data-key-type=\"object\" data-key=\"".concat(key, "\">");
          var keyRepr = options.outputWithQuotes ? "<span class=\"json-string\">\"".concat(key, "\"</span>") : key; // Add toggle button if item is collapsable

          if (isCollapsable(json[key])) {
            html += "<a href class=\"json-toggle\">".concat(keyRepr, "</a>");
          } else {
            html += keyRepr;
          }

          html += '<span class="pick-path" title="Pick path">&#x1f4cb;</span>';
          html += ": ".concat(json2html(json[key], options)); // Add comma if item is not last

          keyCount -= 1;

          if (keyCount > 0) {
            html += ',';
          }

          html += '</li>';
        }
      }

      html += '</ul>}';
    } else {
      html += '{}';
    }
  }

  return html;
}
/**
 * Remove an event listener
 * @param  {String}   event    The event type
 * @param  {Node}     elem     The element to remove the event to (optional, defaults to window)
 * @param  {Function} callback The callback that ran on the event
 * @param  {Boolean}  capture  If true, forces bubbling on non-bubbling events
 */


function off(event, elem, callback, capture) {
  var captureIntern = capture;
  var callbackIntern = callback;
  var elemIntern = elem;

  if (typeof elem === 'function') {
    captureIntern = callback;
    callbackIntern = elem;
    elemIntern = window;
  }

  captureIntern = !!captureIntern;
  elemIntern = typeof elemIntern === 'string' ? document.querySelector(elemIntern) : elemIntern;
  if (!elemIntern) return;
  elemIntern.removeEventListener(event, callbackIntern, captureIntern);
}
/**
 * Equivalent of JQuery $().siblings(sel) with callback features
 *
 * Retrieve all siblings/neighbors of a node
 * Usage:
 * - siblings(node, '.collapse', (sib) => { });
 * - const sibs = siblings(node);
 * - const sibs = siblings(node, '.collapse');
 *
 * @param {HTMLNode} el Element to apply siblings methods
 * @param {String} sel CSS Selector
 * @param {Function} callback (sib) => {}
 */


function siblings(el, sel, callback) {
  var sibs = [];

  for (var i = 0; i < el.parentNode.children.length; i += 1) {
    var child = el.parentNode.children[i];

    if (child !== el && (!sel || child.matches(sel))) {
      sibs.push(child);
    }
  } // If a callback is passed, call it on each sibs


  if (callback && typeof callback === 'function') {
    for (var _i = 0; _i < sibs.length; _i += 1) {
      callback(sibs[_i]);
    }
  }

  return sibs;
}
/**
 * Fire a click handler to the specified node.
 * Event handlers can detect that the event was fired programatically
 * by testing for a 'synthetic=true' property on the event object
 * @param {HTMLNode} node The node to fire the event handler on.
 */


function fireClick(node) {
  // Make sure we use the ownerDocument from the provided node to avoid cross-window problems
  var doc;

  if (node.ownerDocument) {
    doc = node.ownerDocument;
  } else if (node.nodeType === 9) {
    // the node may be the document itself, nodeType 9 = DOCUMENT_NODE
    doc = node;
  } else {
    throw new Error("Invalid node passed to fireEvent: ".concat(node.id));
  }

  if (node.dispatchEvent) {
    var eventClass = 'MouseEvents';
    var event = doc.createEvent(eventClass);
    event.initEvent('click', true, true); // All events created as bubbling and cancelable.

    event.synthetic = true;
    node.dispatchEvent(event, true);
  } else if (node.fireEvent) {
    // IE-old school style, you can drop this if you don't need to support IE8 and lower
    var _event = doc.createEventObject();

    _event.synthetic = true; // allow detection of synthetic events

    node.fireEvent('onclick', _event);
  }
}
/**
 * Check if an element is visible or not
 * @param {HTMLNode} elem Element to check
 * @returns {Boolean}
 */


function isHidden(elem) {
  var width = elem.offsetWidth;
  var height = elem.offsetHeight;
  return width === 0 && height === 0 || window.getComputedStyle(elem).display === 'none';
}
/**
 * Method use to retrieve parents of given element
 * @param {HTMLNode} elem Element which we want parents
 * @param {Strign} sel selector to filter parents (CSS selectors)
 * @returns {Array<HTMLNode>}
 */


function getParents(elem, sel) {
  var result = [];

  for (var p = elem && elem.parentElement; p; p = p.parentElement) {
    if (!sel || p.matches(sel)) {
      result.push(p);
    }
  }

  return result;
}
/**
 * Plugin method
 * @param source: Element
 * @param json: a javascript object
 * @param target: NodeListOf<Element> | Element | { value: String }[] | { value: String }
 * @param opt: an optional options hash
 */


function jsonPathPicker(source, json, target, opt) {
  var options = opt || {};

  if (!source instanceof Element) {
    return 1;
  }

  var targetList = [];

  if (target) {
    if (target.length) {
      targetList = target;
    } else if (target.value) {
      targetList = [target];
    } else {
      return 3;
    }
  } else {
    return 3;
  }

  options.pathQuotesType = options.pathQuotesType !== undefined ? options.pathQuotesType : 'single'; // Transform to HTML

  var html = json2html(json, options);
  if (isCollapsable(json)) html = "<a href class=\"json-toggle\"></a>".concat(html); // Insert HTML in target DOM element

  source.innerHTML = html; // Bind click on toggle buttons

  off('click', source);

  function HandlerEventToggle(elm, event) {
    // Change class
    elm.classList.toggle('collapsed'); // Fetch every json-dict and json-array to toggle them

    var subTarget = siblings(elm, 'ul.json-dict, ol.json-array', function (el) {
      el.style.display = el.style.display === '' || el.style.display === 'block' ? 'none' : 'block';
    }); // ForEach subtarget, previous siblings return array so we parse it

    for (var i = 0; i < subTarget.length; i += 1) {
      if (!isHidden(subTarget[i])) {
        // Parse every siblings with '.json-placehoder' and remove them (previous add by else)
        siblings(subTarget[i], '.json-placeholder', function (el) {
          return el.parentNode.removeChild(el);
        });
      } else {
        // count item in object / array
        var childs = subTarget[i].children;
        var count = 0;

        for (var j = 0; j < childs.length; j += 1) {
          if (childs[j].tagName === 'LI') {
            count += 1;
          }
        }

        var placeholder = count + (count > 1 ? ' items' : ' item'); // Append a placeholder

        subTarget[i].insertAdjacentHTML('afterend', "<a href class=\"json-placeholder\">".concat(placeholder, "</a>"));
      }
    } // Prevent propagation


    event.stopPropagation();
    event.preventDefault();
  }

  source.addEventListener('click', function ToggleEventListener(event) {
    var t = event.target;

    while (t && t !== this) {
      if (t.matches('a.json-toggle')) {
        HandlerEventToggle.call(null, t, event);
        event.stopPropagation();
        event.preventDefault();
      }

      t = t.parentNode;
    }
  }); // Simulate click on toggle button when placeholder is clicked

  function SimulateClickHandler(elm, event) {
    siblings(elm, 'a.json-toggle', function (el) {
      return fireClick(el, 'click');
    });
    event.stopPropagation();
    event.preventDefault();
  }

  source.addEventListener('click', function SimulateClickEventListener(event) {
    var t = event.target;

    while (t && t !== this) {
      if (t.matches('a.json-placeholder')) {
        SimulateClickHandler.call(null, t, event);
      }

      t = t.parentNode;
    }
  });

  function PickPathHandler(elm) {
    if (targetList.length === 0) {
      return;
    }

    var $parentsList = getParents(elm, 'li').reverse();
    var pathSegments = [];

    for (var i = 0; i < $parentsList.length; i += 1) {
      var key = $parentsList[i].dataset.key;
      var keyType = $parentsList[i].dataset.keyType;

      if (keyType === 'object' && typeof key !== 'number' && options.processKeys && options.keyReplaceRegexPattern !== undefined) {
        var keyReplaceRegex = new RegExp(options.keyReplaceRegexPattern, options.keyReplaceRegexFlags);
        var keyReplacementText = options.keyReplacementText === undefined ? '' : options.keyReplacementText;
        key = key.replace(keyReplaceRegex, keyReplacementText);
      }

      pathSegments.push({
        key: key,
        keyType: keyType
      });
    }

    var quotes = {
      none: '',
      single: '\'',
      "double": '"'
    };
    var quote = quotes[options.pathQuotesType];
    pathSegments = pathSegments.map(function (segment, idx) {
      var isBracketsNotation = options.pathNotation === 'brackets';
      var isKeyForbiddenInDotNotation = !/^\w+$/.test(segment.key) || typeof segment.key === 'number';

      if (segment.keyType === 'array' || segment.isKeyANumber) {
        return "[".concat(segment.key, "]");
      }

      if (isBracketsNotation || isKeyForbiddenInDotNotation) {
        return "[".concat(quote).concat(segment.key).concat(quote, "]");
      }

      if (idx > 0) {
        return ".".concat(segment.key);
      }

      return segment.key;
    });
    var path = pathSegments.join('');

    for (var _i2 = 0; _i2 < targetList.length; _i2 += 1) {
      if (targetList[_i2].value !== undefined) {
        targetList[_i2].value = path;
      }
    }
  }

  source.addEventListener('click', function PickEventListener(event) {
    var t = event.target;

    while (t && t !== this) {
      if (t.matches('.pick-path')) {
        PickPathHandler.call(null, t, event);
      }

      t = t.parentNode;
    }
  });

  if (options.outputCollapsed === true) {
    // Trigger click to collapse all nodes
    var elms = document.querySelectorAll('a.json-toggle');

    for (var i = 0; i < elms.length; i += 1) {
      fireClick(elms[i], 'click');
    }
  }
}
/**
 * Plugin clear method
 * @param source: Element
 */


function clearJsonPathPicker(source) {
  source.removeEventListener('click');
}

module.exports = {
  jsonPathPicker: jsonPathPicker,
  clearJsonPathPicker: clearJsonPathPicker
};