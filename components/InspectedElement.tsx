import { NextPage } from "next"
import React from "react"
import { v4 as uuidv4 } from "uuid"

interface Props {
  node: any
}

const InspectedElement: NextPage<Props> = ({ node }) => {
  //   console.log("node value in component:", node, "array?", Array.isArray(node))
  const [isExpanded, setIsExpanded] = React.useState(false)

  const openTag = node[0]
  let tagName = openTag ? openTag.substring(1, openTag.indexOf(">")) : ""
  if (openTag && openTag.indexOf(" ") > -1)
    tagName = openTag.substring(1, openTag.indexOf(" "))
  const hasChildren = Array.isArray(node) && node.length > 1

  try {
    return (
      <div
        id={uuidv4()}
        className="language-html border-2 border-gray-400 rounded-lg bg-gray-100 m-2 text-sm"
        style={{
          textAlign: "left",
          fontFamily:
            "Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace",
        }}
        // contentEditable={isExpanded}
      >
        {hasChildren ? (
          <>
            <p
              className={`cursor-pointer ${isExpanded ? "" : "font-semibold"}`}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? openTag : `<${tagName}>`}
            </p>
            <div className={`${isExpanded ? "" : "hidden"}`}>
              &nbsp;&nbsp;
              {node.map((child, index) => {
                if (index > 0) {
                  if (child.nodeType == 3) {
                    //   console.log("NODE:", child, child.textContent)
                    return <span>{child.textContent}</span>
                  } else return <InspectedElement node={child} />
                }
              })}
            </div>
            <p>{`</${tagName}>`}</p>
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
