import React from "react"
import { NextPage } from "next"
import Router from "next/router"
import beautify from "js-beautify"
const beautifyJS = beautify.js
const beautifyCSS = beautify.css
const beautifyHTML = beautify.html
import Prism from "prismjs"
import CodeEditor from "react-simple-code-editor"
import Highlight, { defaultProps } from "prism-react-renderer"
import theme from "prism-react-renderer/themes/nightOwl"
import {
  noStyleTags,
  computeDefaultStyleByTagName,
  getDefaultStyleByTagName,
  serializeWithStyles,
} from "../../utilities/domHelpers"

import withLayout from "../../hocs/withLayout"

import Button from "../Elements/Button"
import InspectedElement from "../InspectedElement"
import { fromJSON } from "postcss"

interface Props {}

const Home: NextPage<Props> = ({}) => {
  const [url, setUrl] = React.useState("")
  const [sourceCode, setSourceCode] = React.useState("")
  const [sourceStyles, setSourceStyles] = React.useState("")
  const [treeArray, setTreeArray] = React.useState([])
  const [sourceTree, setSourceTree] = React.useState(null)

  async function scrape(url) {
    const req = await fetch("/api/scrape?url=" + url)
    const res = await req.json()
    setSourceCode(beautifyHTML(res.body))
    setSourceStyles(beautifyCSS(res.css))
    Prism.highlightAll()

    let tempTree = []
    const tree = document.getElementById("test-root")
    // const treeList = document.getElementById("tree-here")
    // treeList.innerHTML = ""
    tree.childNodes.forEach((child) => {
      tempTree.push(child)
      if (child.nodeType == 1) {
        var outerHtml = child.outerHTML
        var endIndex = outerHtml.indexOf(">")
        var openTag = outerHtml.substring(0, endIndex + 1)
        // const tagName = openTag ? openTag.substring(1, openTag.indexOf(" ")) : ""
        // const html =
        //   '<div class="border-2 rounded-lg bg-gray-100 m-2" style="text-align: "left">' +
        //   openTag +
        //   "</div>"
        const html = "<p>" + encodeURI(openTag) + "</p>"
        //treeList.innerHTML = treeList.innerHTML + html
      }
    })
    const siteHtml = serializeWithStyles(tree)

    var tempArray = []
    traverseToArray(tree, tempArray)
    console.log("treeArray:", treeArray)
    setTreeArray(tempArray)
    // prettyPrintDOMArray(tempArray)
  }

  function prettyPrintDOMArray(node: Array<any>) {
    console.log("-->")
    if (node) {
      const openTag = node[0]
      // const tagName = openTag ? openTag.substring(1, openTag.indexOf(" ")) : ""
      const hasChildren = node.length > 1

      if (!hasChildren) console.log("-->", openTag)
      // console.log("nodeArray:", node)
      node.forEach((child, index) => {
        const openTagInner = node[0]
        console.log("-->", openTagInner)
        if (index > 0) prettyPrintDOMArray(child)
      })
    }
  }

  function traverseToArray(node, array) {
    if (!node.hasChildNodes()) return

    // get child nodes of a node
    const children = node.childNodes
    // children node list has a length property, similarly to the arrays
    const len = children.length
    // loop through the node list and log the names of nodes
    // we are using the same syntax as for the arrays
    for (let i = 0; i < len; i++) {
      var child = children[i]

      if (child.nodeType == 1) {
        var outerHtml = child.outerHTML
        var endIndex = outerHtml.indexOf(">")
        var openTag = outerHtml.substring(0, endIndex + 1)
        var subArray = [openTag]
        if (
          !openTag.includes("<link") &&
          !openTag.includes("<meta") &&
          !openTag.includes("<script")
        )
          array.push(subArray)
        traverseToArray(child, subArray)
      } else if (child.nodeType == 2) {
        // console.log("node:", node, "text:", node.text)
        // array.push(node.text)
      } else if (child.nodeType == 3) {
        // console.log("node:", child, "text:", child.text)
        if (/\S/.test(child.textContent) && !child.textContent.includes("↵"))
          array.push(child)
        // console.log("textContent:", node.textContent.trim())
        // if (typeof child.text != "undefined") array.push(child.text)
        // else if (
        //   typeof child.innerHTML != "undefined" &&
        //   typeof child.textContent != "undefined" &&
        //   !array.includes(child.innerHTML) &&
        //   !(child.innerHTML.includes("<") && child.innerHTML.includes(">"))
        // )
        //   array.push(child.innerHTML)
      }
    }
  }

  const styles = {
    root: {
      boxSizing: "border-box",
      fontSize: "14px",
      fontFamily: '"Dank Mono", "Fira Code", monospace',
      ...theme.plain,
    },
  }

  const highlight = (code) => (
    <Highlight {...defaultProps} theme={theme} code={code} language="jsx">
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <React.Fragment>
          {tokens.map((line, i) => (
            <div {...getLineProps({ line, key: i })}>
              {line.map((token, key) => (
                <span {...getTokenProps({ token, key })} />
              ))}
            </div>
          ))}
        </React.Fragment>
      )}
    </Highlight>
  )

  // React.useEffect(() => {
  //   if (document) {

  //   }
  // }, [])

  function printTree(root) {
    if (!root) return null

    const openTag = root[0]
    // const tagName = openTag ? openTag.substring(1, openTag.indexOf(" ")) : ""
    const childNode = root[1]
    if (childNode && !Array.isArray(childNode)) {
      console.log(childNode)
      return <p>{childNode}</p>
    }
    console.log(openTag)
    return (
      <div
        className="border-2 rounded-lg bg-gray-100 m-2"
        style={{ textAlign: "left" }}
      >
        <p>{openTag}</p>
        {printTree(childNode)}
        <p>{`</end>`}</p>
        {/* <p>{`</${tagName}>`}</p> */}
      </div>
    )
  }

  function traverseAndPrint(root) {
    const nodes = root.childNodes
    // if (nodes.length > 0) traverseAndPrint(nodes)

    nodes.forEach((child) => {
      console.log(child)
      if (child.nodeType == 1) {
        var outerHtml = child.outerHTML
        var endIndex = outerHtml.indexOf(">")
        var openTag = outerHtml.substring(0, endIndex + 1)
        // const tagName = openTag ? openTag.substring(1, openTag.indexOf(" ")) : ""
        return (
          <div
            className="border-2 rounded-lg bg-gray-100 m-2"
            style={{ textAlign: "left" }}
          >
            <p>{openTag}</p>
            {traverseAndPrint(child)}
            <p>{`</end>`}</p>
            {/* <p>{`</${tagName}>`}</p> */}
          </div>
        )
      } else if (child.nodeType == 2) {
        // console.log("node:", node, "text:", node.text)
        // array.push(node.text)
      }
      // else if (child.nodeType == 3) {
      //   //console.log("node:", node, "text:", node.textContent.trim())
      //   if (typeof child.text != "undefined") return <p>{child.text}</p>
      //   else if (
      //     typeof child.textContent != "undefined" &&
      //     !(child.innerHTML.includes("<") && child.innerHTML.includes(">"))
      //   )
      //     return <p>{child.innerHTML}</p>
      // }
      else return <p>Test</p>
    })
  }

  function generateElements2(node) {
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
      console.log("e =", e)
    }
    var result = node.outerHTML
    for (var i = 0; i < elements.length; i++) {
      elements[i].style.cssText = cssTexts[i]
    }
    return (
      <div
        className="border-2 rounded-lg bg-gray-100 m-2"
        style={{ textAlign: "left" }}
      >
        {/* <p>{openTag}</p> */}
        {result}
        {/* <p>{`</end>`}</p> */}
        {/* <p>{`</${tagName}>`}</p> */}
      </div>
    )
  }

  function generateElements(node) {
    console.log("node:", node)
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return (
        <div
          className="border-2 rounded-lg bg-gray-100 m-2"
          style={{ textAlign: "left" }}
        >
          {/* <p>{openTag}</p> */}
          {node.outerHTML}
          {/* <p>{`</end>`}</p> */}
          {/* <p>{`</${tagName}>`}</p> */}
        </div>
      )
    }

    var elements = node.querySelectorAll("*")
    for (var i = 0; i < elements.length; i++) {
      var e = elements[i]
      generateElements(e)
    }

    return null
  }

  function generateElements1(node) {
    // do some thing with the node here
    var nodes = node.childNodes
    for (var i = 0; i < nodes.length; i++) {
      if (!nodes[i]) {
        continue
      }

      if (nodes[i].childNodes.length > 0) {
        generateElements(nodes[i])
      }
    }

    return (
      <div
        className="border-2 rounded-lg bg-gray-100 m-2"
        style={{ textAlign: "left" }}
      >
        {/* <p>{openTag}</p> */}
        {encodeURI(node)}
        {/* <p>{`</end>`}</p> */}
        {/* <p>{`</${tagName}>`}</p> */}
      </div>
    )
  }

  function safe_tags(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
  }
  return (
    <div className="text-center">
      <div id="test" className="hidden">
        <div
          id="test-root"
          dangerouslySetInnerHTML={{ __html: sourceCode }}
        ></div>
      </div>
      <input
        defaultValue="https://"
        className="border"
        onChange={(e) => setUrl(e.target.value)}
      ></input>
      <br />
      <Button
        text="Preview"
        extend="bg-blue-600 hover:bg-blue-500 text-white"
        onClick={() => scrape(url)}
      />
      <br />
      <br />
      <textarea
        className="w-full border-2"
        defaultValue={sourceCode}
      ></textarea>
      <textarea
        className="w-full border-2"
        defaultValue={sourceStyles}
      ></textarea>
      {/* {treeArray
        ? treeArray.map((node) => {
            return printTree(node)
          })
        : null} */}

      {/* <div id="tree-here">
        {sourceTree ? generateElements(sourceTree) : null}
      </div> */}
      <div className="grid grid-cols-2 gap-4">
        <div className="overflow-auto" style={{ height: "800px" }}>
          {/* <div>
            <textarea></textarea>
          </div>
          <CodeEditor
            value={sourceCode}
            onValueChange={(code) => setSourceCode(code)}
            highlight={highlight}
            padding={10}
            style={styles.root as React.CSSProperties}
          /> */}
          {/* <pre className="language-html h-100" contentEditable>
            <code className="language-html">{sourceCode}</code>
          </pre> */}
          <div className="border-2 border-gray-400 rounded-lg bg-gray-100">
            {treeArray
              ? treeArray.map((node, index) => (
                  <InspectedElement key={index} node={node} />
                ))
              : null}
          </div>
        </div>
        <div>
          <iframe
            id="webpage"
            src={url}
            style={{ border: "none", width: "100%", height: "800px" }}
          ></iframe>
        </div>
      </div>
      <pre
        className="language-html h-100"
        contentEditable
        suppressContentEditableWarning={true}
      >
        <code className="language-html">{sourceCode}</code>
      </pre>
      {/* <div id="viewer" dangerouslySetInnerHTML={{ __html: sourceCode }}></div> */}
    </div>
  )
}

export default withLayout(Home)
