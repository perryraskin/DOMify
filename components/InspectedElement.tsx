import { NextPage } from "next"
import React from "react"
import { v4 as uuidv4 } from "uuid"

interface Props {
  node: any
}

const InspectedElement: NextPage<Props> = ({ node }) => {
  //   console.log("node value in component:", node, "array?", Array.isArray(node))

  const openTagTemp = node[0]
  const domifyIdStartIndex = openTagTemp.indexOf('data-domifyid="') + 15
  const domifyId = openTagTemp.substring(
    domifyIdStartIndex,
    domifyIdStartIndex + 36
  )
  const openTag = openTagTemp.replace(' data-domifyid="' + domifyId + '"', "")
  let tagName = openTag ? openTag.substring(1, openTag.indexOf(">")) : ""
  if (openTag && openTag.indexOf(" ") > -1)
    tagName = openTag.substring(1, openTag.indexOf(" "))
  const hasChildren = Array.isArray(node) && node.length > 1

  const [isExpanded, setIsExpanded] = React.useState(false)
  const [openTagText, setOpenTagText] = React.useState(openTag)
  const [openTagInnerText, setOpenTagInnerText] = React.useState("")
  // var iframe = document
  //   ? (document.getElementById("webpage") as HTMLIFrameElement)
  //   : null

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      setIsExpanded(false)
      //update corresponding element on webpage preview

      try {
        var currentElement = document.querySelector(
          `[data-domifyid="${domifyId}"]`
        )
        var outerHtml = currentElement.outerHTML
        var endIndex = outerHtml.indexOf(">")
        var currentOpenTag = outerHtml.substring(0, endIndex + 1)
        var openTagTextWithId = openTagText.replace(
          ">",
          ` data-domifyid="${domifyId}">`
        )
        var newOuterHtml = outerHtml.replace(currentOpenTag, openTagTextWithId)

        currentElement.outerHTML = newOuterHtml
      } catch (error) {
        console.log(
          "Error:",
          error.message,
          "currentElement:",
          currentElement,
          "domifyId:",
          domifyId
        )
      }
    }
  }

  function handleInnerKeyDown(e) {
    if (e.key === "Enter") {
      //update site somehow
    }
  }

  try {
    return (
      <div
        data-mapid={domifyId}
        className="language-html border-2 border-gray-300 hover:border-blue-200
        rounded-lg bg-gray-100 m-2 text-sm"
        style={{
          textAlign: "left",
          fontFamily:
            "Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace",
        }}
        // contentEditable={isExpanded}
      >
        {hasChildren ? (
          <>
            {isExpanded ? (
              <textarea
                style={{ resize: "none" }}
                className="outline-none hover:outline-none bg-gray-100 w-full"
                value={openTagText}
                onChange={(e) => setOpenTagText(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e)}
              ></textarea>
            ) : (
              <p
                className={`text-sm ${
                  isExpanded ? "" : "cursor-pointer font-semibold"
                }`}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {/* {isExpanded ? openTag : `<${tagName}>`} */}
                {openTagText}
              </p>
            )}
            <div className={`${isExpanded ? "" : "hidden"}`}>
              &nbsp;&nbsp;
              {node.map((child, index) => {
                if (index > 0) {
                  if (child.nodeType == 3) {
                    //   console.log("NODE:", child, child.textContent)
                    // setOpenTagInnerText(child.textContent)
                    return (
                      <textarea
                        style={{ resize: "none" }}
                        className="outline-none hover:outline-none bg-gray-100 w-full"
                        defaultValue={child.textContent}
                        onChange={(e) => setOpenTagInnerText(e.target.value)}
                        onKeyDown={(e) => handleInnerKeyDown(e)}
                      ></textarea>
                    )
                    // return <span>{openTagInnerText}</span>
                  } else {
                    return <InspectedElement node={child} />
                  }
                }
              })}
            </div>
            <p
              className={`text-sm ${isExpanded ? "" : "font-semibold"}`}
            >{`</${tagName}>`}</p>
          </>
        ) : (
          <span>{openTag}</span>
        )}
      </div>
    )
  } catch (error) {
    console.log("error:", error.message, "node:", node)
    return <p>error!</p>
  }
}

export default InspectedElement
