import { NextPage } from "next"

interface Props {
  node: any
}

const InspectedElement: NextPage<Props> = ({ node }) => {
  //   console.log("node value in component:", node, "array?", Array.isArray(node))

  const openTag = node[0]
  const tagName = openTag ? openTag.substring(1, openTag.indexOf(" ")) : ""
  const hasChildren = Array.isArray(node) && node.length > 1

  //   if (!hasChildren) console.log("-->", openTag)
  // console.log("nodeArray:", node)
  try {
    return (
      <div
        className="language-html border-2 border-gray-400 rounded-lg bg-gray-100 m-2 text-sm"
        style={{
          textAlign: "left",
          fontFamily:
            "Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace",
        }}
      >
        {hasChildren ? (
          <>
            <p>{openTag}</p>
            &nbsp;&nbsp;
            {node.map((child, index) => {
              if (index > 0) {
                if (child.nodeType == 3) {
                  //   console.log("NODE:", child, child.textContent)
                  return <span>{child.textContent}</span>
                } else return <InspectedElement node={child} />
              }
            })}
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

  //   const openTag = node ? node[0] : ""
  //   const tagName = openTag ? openTag.substring(1, openTag.indexOf(" ")) : ""
  //   const children = node && typeof node != "undefined" ? node[1] : []
  //   try {
  //     console.log("children:", typeof children)
  //     return (
  //       <>
  //         {children
  //           ? children.map((child, index) => {
  //               if (index > 0)
  //                 return (
  //                   <div
  //                     className="border-2 rounded-lg bg-gray-100 m-2"
  //                     style={{ textAlign: "left" }}
  //                   >
  //                     <p>{openTag}</p>
  //                     &nbsp;&nbsp;
  //                     {node && child ? <InspectedElement node={child} /> : null}
  //                     <p>{`</${tagName}>`}</p>
  //                   </div>
  //                 )
  //             })
  //           : null}
  //       </>
  //     )
  //   } catch (err) {
  //     console.error(err.message)
  //     console.log("node:", node, "children:", children)
  //     return <p>error!</p>
  //   }
}

export default InspectedElement
