import { useState } from "react"


const ContentTag = ({ kind }) => {

    // hover state
    const [hover, setHover] = useState(false)

    const tagColor = {
        "tweet": "bg-tweet-accent text-tweet-accent",
        "collection": "bg-collection-base text-collection-accent",
        "author": "bg-author-base text-author-emph",
        "community": "bg-community-base text-community-emph",
        "entity": "bg-entity-base text-entity-emph",
        "media": "bg-media-base text-media-emph",
        "default": "bg-gray-500 text-gray-300"
    }

    const color = tagColor[kind.toLowerCase()] ? tagColor[kind] : tagColor["default"]

    return (
        <div
            className={'caption cursor-default truncate leading-3 rounded-full px-1.5 py-0.5  ' + color}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            {
                hover ? kind : kind.slice(0, 3)
            }
        </div>
    )
}



export default ContentTag