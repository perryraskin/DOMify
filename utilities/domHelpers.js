const { v4: uuidv4 } = require("uuid")

export const getGeneratedPageURL = ({ html, css, js }) => {
  const getBlobURL = (code, type) => {
    const blob = new Blob([code], { type })
    return URL.createObjectURL(blob)
  }

  const cssURL = getBlobURL(css, "text/css")
  const jsURL = getBlobURL(js, "text/javascript")

  const source = `
    <html>
      <head>
        ${css && `<link rel="stylesheet" type="text/css" href="${cssURL}" />`}
        ${js && `<script src="${jsURL}"></script>`}
      </head>
      <body>
        ${html || ""}
      </body>
    </html>
  `

  return getBlobURL(source, "text/html")
}

export const getGeneratedPageTemplate = ({ html, css, js }) => {
  const getBlobURL = (code, type) => {
    const blob = new Blob([code], { type })
    return URL.createObjectURL(blob)
  }

  var doc = new DOMParser().parseFromString(html, "text/xml")
  //console.log("DOC:", doc.querySelector("body"))
  var body = doc.querySelector("body")
  addUniqueIdToNodes(body)
  html = body.outerHTML

  const cssURL = getBlobURL(css, "text/css")
  const jsURL = getBlobURL(js, "text/javascript")

  const source = `
    <html>
      <head>
        ${css && `<link rel="stylesheet" type="text/css" href="${cssURL}" />`}
        ${js && `<script src="${jsURL}"></script>`}
      </head>
      <body>
        ${html || ""}
      </body>
    </html>
  `

  return source
}

function walkTheDOM(node, func) {
  func(node)
  node = node.firstChild
  while (node) {
    walkTheDOM(node, func)
    node = node.nextSibling
  }
}

function addUniqueIdToNodes(node) {
  if (typeof node === "string") {
    node = document.getElementById(node)
  }

  function addUniqueId(currentNode) {
    // console.log("currentNode", currentNode)
    if (currentNode.nodeType === 1) {
      currentNode.setAttribute("data-domifyid", uuidv4())
    }
  }

  walkTheDOM(node, addUniqueId)

  return
}

// Mapping between tag names and css default values lookup tables. This allows to exclude default values in the result.
var defaultStylesByTagName = {}

// Styles inherited from style sheets will not be rendered for elements with these tag names
export var noStyleTags = {
  BASE: true,
  HEAD: true,
  HTML: true,
  META: true,
  NOFRAME: true,
  NOSCRIPT: true,
  PARAM: true,
  SCRIPT: true,
  STYLE: true,
  TITLE: true,
}

// This list determines which css default values lookup tables are precomputed at load time
// Lookup tables for other tag names will be automatically built at runtime if needed
var tagNames = [
  "A",
  "ABBR",
  "ADDRESS",
  "AREA",
  "ARTICLE",
  "ASIDE",
  "AUDIO",
  "B",
  "BASE",
  "BDI",
  "BDO",
  "BLOCKQUOTE",
  "BODY",
  "BR",
  "BUTTON",
  "CANVAS",
  "CAPTION",
  "CENTER",
  "CITE",
  "CODE",
  "COL",
  "COLGROUP",
  "COMMAND",
  "DATALIST",
  "DD",
  "DEL",
  "DETAILS",
  "DFN",
  "DIV",
  "DL",
  "DT",
  "EM",
  "EMBED",
  "FIELDSET",
  "FIGCAPTION",
  "FIGURE",
  "FONT",
  "FOOTER",
  "FORM",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "HEAD",
  "HEADER",
  "HGROUP",
  "HR",
  "HTML",
  "I",
  "IFRAME",
  "IMG",
  "INPUT",
  "INS",
  "KBD",
  "KEYGEN",
  "LABEL",
  "LEGEND",
  "LI",
  "LINK",
  "MAP",
  "MARK",
  "MATH",
  "MENU",
  "META",
  "METER",
  "NAV",
  "NOBR",
  "NOSCRIPT",
  "OBJECT",
  "OL",
  "OPTION",
  "OPTGROUP",
  "OUTPUT",
  "P",
  "PARAM",
  "PRE",
  "PROGRESS",
  "Q",
  "RP",
  "RT",
  "RUBY",
  "S",
  "SAMP",
  "SCRIPT",
  "SECTION",
  "SELECT",
  "SMALL",
  "SOURCE",
  "SPAN",
  "STRONG",
  "STYLE",
  "SUB",
  "SUMMARY",
  "SUP",
  "SVG",
  "TABLE",
  "TBODY",
  "TD",
  "TEXTAREA",
  "TFOOT",
  "TH",
  "THEAD",
  "TIME",
  "TITLE",
  "TR",
  "TRACK",
  "U",
  "UL",
  "VAR",
  "VIDEO",
  "WBR",
]

// Precompute the lookup tables.
for (var i = 0; i < tagNames.length; i++) {
  if (!noStyleTags[tagNames[i]]) {
    defaultStylesByTagName[tagNames[i]] = computeDefaultStyleByTagName(
      tagNames[i]
    )
  }
}

export function computeDefaultStyleByTagName(tagName) {
  var defaultStyle = {}
  if (typeof document != "undefined") {
    var element = document.body.appendChild(document.createElement(tagName))
    var computedStyle = getComputedStyle(element)
    for (var i = 0; i < computedStyle.length; i++) {
      defaultStyle[computedStyle[i]] = computedStyle[computedStyle[i]]
    }
    document.body.removeChild(element)
  }

  return defaultStyle
}

export function getDefaultStyleByTagName(tagName) {
  tagName = tagName.toUpperCase()
  if (!defaultStylesByTagName[tagName]) {
    defaultStylesByTagName[tagName] = computeDefaultStyleByTagName(tagName)
  }
  return defaultStylesByTagName[tagName]
}

export function serializeWithStyles(node) {
  if (node.nodeType !== Node.ELEMENT_NODE) {
    throw new TypeError()
  }
  var cssTexts = []
  var elements = node.querySelectorAll("*")
  for (var i = 0; i < elements.length; i++) {
    var e = elements[i]
    if (!noStyleTags[e.tagName]) {
      var computedStyle = getComputedStyle(e)
      var defaultStyle = getDefaultStyleByTagName(e.tagName)
      cssTexts[i] = e.style.cssText
      for (var ii = 0; ii < computedStyle.length; ii++) {
        var cssPropName = computedStyle[ii]
        if (computedStyle[cssPropName] !== defaultStyle[cssPropName]) {
          e.style[cssPropName] = computedStyle[cssPropName]
        }
      }
    }
  }
  var result = node.outerHTML
  for (var i = 0; i < elements.length; i++) {
    elements[i].style.cssText = cssTexts[i]
  }
  return result
}
