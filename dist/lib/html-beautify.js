'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

exports.default = function (html) {
  try {
    return beautify(html);
  } catch (error) {
    console.error(error);
  }
};

var SPACE = '   ';

var NEW_LINE = '\n';

var SINGLETON_TAGS = ['meta', 'link', 'area', 'base', 'col', 'command', 'embeded', 'source', 'link'];

var INLINE_TAGS = ['b', 'big', 'i', 'small', 'tt', 'abbr', 'acronym', 'cite', 'dfn', 'em', 'kbd', 'strong', 'samp', 'time', 'var', 'a', 'bdo', 'br', 'br', 'img', 'map', 'object', 'q', 'script', 'span', 'sub', 'sup', 'button', 'label', 'input', 'select', 'textarea', 'param', 'hr'];

var isNotEmptyString = function isNotEmptyString(string) {
  return (/\S/.test(string)
  );
};

var trimFirstSpaces = function trimFirstSpaces(string) {
  return string.replace(/^\s+/g, '');
};

var addLevelTag = function addLevelTag(levelTags, tagName) {
  return [].concat(_toConsumableArray(levelTags), [tagName]);
};

var deleteLevelTag = function deleteLevelTag(levelTags, tagName) {
  return levelTags.filter(function (levelTag) {
    return levelTag != tagName;
  });
};

var getNodeType = function getNodeType(str) {
  if (str.slice(0, 4) == '<!--') return 'comment';
  return str[0] == '<' && str[str.length - 1] == '>' ? 'tag' : 'text';
};

var getTagType = function getTagType(str) {
  if (str[1] == '/') return 'closed';
  if (str.slice(-2) == '/>') return 'single';
  return 'opened';
};

var getFormattedNode = function getFormattedNode(_ref) {
  var node = _ref.node,
      spaceCount = _ref.spaceCount,
      newLine = _ref.newLine;

  if (spaceCount < 0) spaceCount = 0;
  return NEW_LINE.repeat(newLine + 0) + SPACE.repeat(spaceCount) + node;
};

var getTagName = function getTagName(str, type) {
  var tag = false;
  switch (type) {
    case 'closed':
      tag = str.slice(2, -1);
      break;
    case 'opened':
      tag = str.slice(1, -1);
      break;
    case 'single':
      tag = str.slice(1, -2);
      break;
  }
  return tag.split(' ')[0];
};

var getTagInfo = function getTagInfo(_ref2) {
  var node = _ref2.node,
      nodeType = _ref2.nodeType,
      _ref2$inlineTags = _ref2.inlineTags,
      inlineTags = _ref2$inlineTags === undefined ? INLINE_TAGS : _ref2$inlineTags;

  if (nodeType != 'tag') return {};
  var tagType = getTagType(node);
  var tagName = getTagName(node, tagType);
  var tagIsInline = INLINE_TAGS.indexOf(tagName) > -1 ? true : false;
  return { tagType: tagType, tagName: tagName, tagIsInline: tagIsInline };
};

var isNewLineNode = function isNewLineNode(_ref3) {
  var nodeType = _ref3.nodeType,
      previousNodeType = _ref3.previousNodeType,
      previousTagIsInline = _ref3.previousTagIsInline,
      previousTagType = _ref3.previousTagType,
      tagInfo = _ref3.tagInfo;
  var tagIsInline = tagInfo.tagIsInline,
      tagType = tagInfo.tagType;

  if (nodeType == 'comment') {
    return true;
  }

  if (tagType == 'opened' && !tagIsInline && previousNodeType != false) return true;

  if (tagType == 'closed' && !tagIsInline && (previousTagIsInline || previousNodeType != 'tag' || previousTagType == 'closed' && !previousTagIsInline)) return true;

  if (tagIsInline && nodeType == 'tag' && (previousNodeType == 'tag' && !previousTagIsInline || previousNodeType == 'comment')) return true;

  if (nodeType == 'text' && ['tag', 'comment'].indexOf(previousNodeType) > -1 && !previousTagIsInline) return true;

  return false;
};

var getNewLineSpacesCount = function getNewLineSpacesCount(_ref4) {
  var nodeType = _ref4.nodeType,
      tagInfo = _ref4.tagInfo,
      tagIsInline = _ref4.tagIsInline,
      previousNodeType = _ref4.previousNodeType,
      previousTagIsInline = _ref4.previousTagIsInline,
      previousTagType = _ref4.previousTagType,
      level = _ref4.level;

  if (nodeType == 'tag') {
    var _tagIsInline = tagInfo.tagIsInline,
        tagType = tagInfo.tagType;


    if (_tagIsInline && (previousNodeType == 'tag' && previousTagIsInline == false || previousNodeType == 'comment')) return level + 1;

    if (_tagIsInline && previousNodeType == 'text' || _tagIsInline && previousNodeType == 'tag' && previousTagIsInline) return 0;

    if (tagType == 'closed' && previousNodeType == 'tag' && !previousTagIsInline) return 0;

    return level;
  }
  if (nodeType == 'text') {
    if (['tag', 'comment'].indexOf(previousNodeType) > -1 && !previousTagIsInline && previousTagType == 'opened') {
      return level + 1;
    } else {
      return 0;
    }
  }
  if (nodeType == 'comment') {
    if (previousNodeType == false) {
      return level;
    } else {
      return level + 1;
    }
  }
};

var beautify = function beautify(html) {

  var beautified = '';

  var node = '';
  var level = 0;
  var lines = [];
  var levelTags = [];
  var previousNodeType = '';
  var previousTagIsInline = false;
  var previousTagType = false;

  var symbols = html.split('');
  var index = 0;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = symbols[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var symbol = _step.value;

      node += symbol;

      var previousSymbol = index > 0 ? symbols[index - 1] : false;

      var nextSymbol = symbols.length - 1 != index ? symbols[index + 1] : false;

      if (html.length == index + 1 || nextSymbol == '<' || symbol == '>') {
        node = node.replace(/\n/g, '');

        var nodeType = getNodeType(node);

        var tagInfo = getTagInfo({ node: node, nodeType: nodeType });

        if (nodeType == 'tag' && SINGLETON_TAGS.indexOf(tagInfo.tagName) == -1) {
          var tagIsInline = tagInfo.tagIsInline,
              tagType = tagInfo.tagType,
              tagName = tagInfo.tagName;

          if (!tagIsInline && tagType == 'opened') levelTags = addLevelTag(levelTags, tagName);
          level = levelTags.length - 1;
          if (!tagIsInline && tagType == 'closed') levelTags = deleteLevelTag(levelTags, tagName);
        }

        if (previousNodeType == 'tag' && !previousTagIsInline) if (tagInfo.tagIsInline || nodeType == 'text') node = trimFirstSpaces(node);

        var newLine = isNewLineNode({
          nodeType: nodeType,
          tagInfo: tagInfo,
          previousNodeType: previousNodeType,
          previousTagIsInline: previousTagIsInline,
          previousTagType: previousTagType
        });

        var spaceCount = getNewLineSpacesCount({
          level: level,
          nodeType: nodeType,
          tagInfo: tagInfo,
          previousNodeType: previousNodeType,
          previousTagIsInline: previousTagIsInline,
          previousTagType: previousTagType
        });

        var nodeInfo = _extends({
          level: level,
          node: node,
          nodeType: nodeType,
          newLine: newLine,
          spaceCount: spaceCount,
          previousTagType: previousTagType,
          previousTagIsInline: previousTagIsInline,
          previousNodeType: previousNodeType
        }, tagInfo);

        if (isNotEmptyString(node)) {
          beautified += getFormattedNode({
            node: node,
            spaceCount: nodeInfo.spaceCount,
            newLine: nodeInfo.newLine
          });
        }

        if (isNotEmptyString(node)) {
          previousNodeType = nodeType;
          if (nodeType == 'tag') {
            previousTagType = nodeInfo.tagType;
            previousTagIsInline = nodeInfo.tagIsInline;
          }
        }
        node = '';
      }
      index++;
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return beautified;
};
module.exports = exports['default'];