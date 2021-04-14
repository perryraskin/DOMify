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
import { getGeneratedPageURL } from "../../utilities/domHelpers"

import withLayout from "../../hocs/withLayout"

import Button from "../Elements/Button"
import InspectedElement from "../InspectedElement"

interface Props {}

const Home: NextPage<Props> = ({}) => {
  const [url, setUrl] = React.useState("")
  const [previewUrl, setPreviewUrl] = React.useState("")
  const [sourceCode, setSourceCode] = React.useState("")
  const [sourceStyles, setSourceStyles] = React.useState("")
  const [treeArray, setTreeArray] = React.useState([])

  async function scrape(url, useBlob) {
    setTreeArray([])
    const req = await fetch("/api/scrape?url=" + url)
    const res = await req.json()
    const resHTML = beautifyHTML(res.body)
    const resCSS = beautifyCSS(res.css).replace(/\\:/g, ":")

    const blobUrl = getGeneratedPageURL({
      html: resHTML,
      css: resCSS,
      js: "",
    })
    if (useBlob) setPreviewUrl(blobUrl)
    else setPreviewUrl(url)
    setSourceCode(resHTML)
    setSourceStyles(resCSS)

    Prism.highlightAll()

    let tempTree = []
    const tree = document.getElementById("test-root")
    tree.childNodes.forEach((child) => {
      tempTree.push(child)
    })

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
        text="Preview URL"
        extend="bg-blue-600 hover:bg-blue-500 text-white"
        onClick={() => scrape(url, false)}
      />
      <Button
        text="Preview BLOB URL"
        extend="bg-blue-600 hover:bg-blue-500 text-white"
        onClick={() => scrape(url, true)}
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
            src={previewUrl}
            style={{ border: "none", width: "100%", height: "800px" }}
            // srcDoc={sourceCode.replace(
            //   "<body>",
            //   `<body><script>${sourceStyles}</script>`
            // )}
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
