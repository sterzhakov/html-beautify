const SPACE = '   '

const NEW_LINE = '\n'

const SINGLETON_TAGS = [
  'meta', 'link','area', 'base', 'col', 'command', 'embeded', 'source','link'
]

const INLINE_TAGS = [
  'b', 'big', 'i', 'small', 'tt', 'abbr', 'acronym', 'cite', 'dfn', 'em',
  'kbd', 'strong', 'samp', 'time', 'var', 'a', 'bdo', 'br', 'br', 'img', 'map',
  'object', 'q', 'script', 'span', 'sub', 'sup', 'button', 'label', 'input',
  'select', 'textarea', 'param', 'hr'
]

const isNotEmptyString = (string) => {
  return /\S/.test(string)
}

const trimFirstSpaces = (string) => {
  return string.replace(/^\s+/g, '');
}

const addLevelTag = (levelTags, tagName) => {
  return [...levelTags, tagName]
}

const deleteLevelTag = (levelTags, tagName) => {
  return levelTags.filter(levelTag => levelTag != tagName)
}

const getNodeType = (str) => {
  if (str.slice(0,4) == '<!--') return 'comment'
  return (str[0] == '<' && str[str.length - 1] == '>') ? 'tag' : 'text'
}

const getTagType = (str) => {
  if (str[1] == '/') return 'closed'
  if (str.slice(-2) == '/>') return 'single'
  return 'opened'
}

const getFormattedNode = ({ node, spaceCount, newLine }) => {
  return NEW_LINE.repeat(newLine + 0) + SPACE.repeat(spaceCount) + node
}

const getTagName = (str, type) => {
  let tag = false
  switch (type) {
    case 'closed':
      tag = str.slice(2, -1)
      break
    case 'opened':
      tag = str.slice(1,-1)
      break
    case 'single':
      tag = str.slice(1,-2)
      break
  }
  return tag.split(' ')[0]
}

const getTagInfo = ({ node, nodeType, inlineTags = INLINE_TAGS }) => {
  if (nodeType != 'tag') return {}
  const tagType = getTagType(node)
  const tagName = getTagName(node, tagType)
  const tagIsInline = (INLINE_TAGS.indexOf(tagName) > -1) ? true : false
  return { tagType, tagName, tagIsInline }
}

const isNewLineNode = ({
  nodeType,
  previousNodeType,
  previousTagIsInline,
  tagInfo,
}) => {
  if (nodeType == 'comment') {
    return true
  }
  if (nodeType == 'tag') {
    const { tagIsInline } = tagInfo
    return (
      !tagIsInline ||
      tagIsInline &&
      previousNodeType == 'tag' &&
      !previousTagIsInline
    ) ? true : false
  }
  if (nodeType == 'text') {
    return (
       ['tag','comment'].indexOf(previousNodeType) > -1 && !previousTagIsInline
    ) ? true : false
  }

}

const getNewLineSpacesCount = ({
  nodeType,
  tagInfo,
  tagIsInline,
  previousNodeType,
  previousTagIsInline,
  previousTagType,
  level,
}) => {
  if (nodeType == 'tag') {
    const { tagIsInline } = tagInfo
    if (
      tagIsInline &&
      previousNodeType == 'tag' &&
      previousTagIsInline == false
    ) {
      return level + 1
    } else if (
      tagIsInline &&
      previousNodeType == 'text' ||
      tagIsInline &&
      previousNodeType == 'tag' &&
      previousTagIsInline
    ) {
      return 0
    } else {
      return level
    }
  }
  if (nodeType == 'text') {
    if (
      ['tag','comment'].indexOf(previousNodeType) > -1 &&
      !previousTagIsInline && previousTagType == 'opened'
    ) {
      return level + 1
    } else {
      return 0
    }
  }
  if (nodeType == 'comment') {
    if(previousNodeType == false) {
      return level
    } else {
      return level + 1
    }
  }
}

export default (html) => {

  let beautified = ''

  let node = ''
  let level = 0
  let lines = []
  let levelTags = []
  let previousNodeType = ''
  let previousTagIsInline = false
  let previousTagType = false

  const symbols = html.split('')

  let index = 0
  for (const symbol of symbols) {
    node += symbol
    const nextSymbol = symbols[index + 1]
    const previousSymbol = symbols[index - 1]
    if (html.length == index + 1 || nextSymbol == '<' || symbol == '>') {
      node = node.replace(/\n/g, '')

      const nodeType = getNodeType(node)

      const tagInfo = getTagInfo({ node, nodeType})

      if (
        nodeType == 'tag' &&
        SINGLETON_TAGS.indexOf(tagInfo.tagName) == -1
      ) {
        const { tagIsInline, tagType, tagName } = tagInfo
        if (!tagIsInline && tagType == 'opened')
          levelTags = addLevelTag(levelTags, tagName)
        level = levelTags.length - 1
        if (!tagIsInline && tagType == 'closed')
          levelTags = deleteLevelTag(levelTags, tagName)
      }

      if (previousNodeType == 'tag' && !previousTagIsInline)
        if (tagInfo.tagIsInline || nodeType == 'text')
          node = trimFirstSpaces(node)

      const newLine =
        isNewLineNode({
          nodeType,
          tagInfo,
          previousNodeType,
          previousTagIsInline,
        })

      const spaceCount =
        getNewLineSpacesCount({
          level,
          nodeType,
          tagInfo,
          previousNodeType,
          previousTagIsInline,
          previousTagType,
        })

      const nodeInfo = {
        ...{
          level,
          node,
          nodeType,
          newLine,
          spaceCount,
          previousTagType,
          previousTagIsInline,
          previousNodeType,
        },
        ...tagInfo
      }

      if (isNotEmptyString(node)) {
        beautified +=
          getFormattedNode({
            node,
            spaceCount: nodeInfo.spaceCount,
            newLine: nodeInfo.newLine,
          })
      }

      previousNodeType = nodeInfo.nodeType
      if (nodeInfo.nodeType == 'tag') {
        previousTagType = nodeInfo.tagType
        previousTagIsInline = nodeInfo.tagIsInline
      }
      node = ''
    }
    index++
  }
  return beautified

}
