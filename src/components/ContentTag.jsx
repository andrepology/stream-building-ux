import classNames from "classnames"
import { useState } from "react"
import cn from "classnames"

const tagColor = {
    "tweet": "bg-tweet-accent text-tweet-base",
    "collection": "bg-collection-base text-collection-accent",
    "author": "bg-author-base text-author-emph",
    "community": "bg-community-base text-community-emph",
    "entity": "bg-entity-base text-entity-emph",
    "media": "bg-media-base text-media-emph",
    "default": "bg-gray-500 text-gray-300"
}

const ContentTag = ({ kind, className = null }) => {

    // hover state
    const [hover, setHover] = useState(false)

    const color = tagColor[kind.toLowerCase()] ? tagColor[kind] : tagColor["default"]

    return (
        <div
            className={className + ' caption cursor-default truncate leading-3 rounded-full px-1.5 py-0.5  ' + color}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            {
                hover ? kind : kind.slice(0, 3)
            }
        </div>
    )
}

const ContentThumbnail = ({ name, kind = "entity", className = null }) => {

    const [hover, setHover] = useState(false)
    const contentColor = tagColor[kind.toLowerCase()] ? tagColor[kind] : tagColor["default"]

    return (
        <div
            className={cn(
                className + ' bg-white/55 border border-white/95 text-gray-300/70 hover:text-gray-300 uppercase tracking-wide_more font-bold cursor-pointer leading-6 rounded-md px-2 py-1.5',
            )}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <p className="text-sxy font-semibold">{name}</p>
        </div>
    )

}


export { ContentThumbnail }
export default ContentTag