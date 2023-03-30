import classNames from "classnames"
import { useState, useRef, useEffect } from "react"
import cn from "classnames"

const tagColor = {
    "tweet": "bg-tweet-accent hover:text-tweet-base text-tweet-base",
    "collection": "bg-collection-base hover:text-collection-accent text-collection-accent",
    "author": "bg-author-base hover:text-author-emph text-author-emph",
    "community": "bg-community-base hover:text-community-emph text-community-emph",
    "entity": "bg-entity-base hover:text-entity-emph text-entity-emph",
    "media": "bg-media-base hover:text-media-emph text-media-emph",
    "default": "bg-gray-500 text-gray-300"
}

const ContentTag = ({ kind, className = null }) => {

    // hover state
    const [hover, setHover] = useState(false)

    const color = tagColor[kind.toLowerCase()] ? tagColor[kind] : tagColor["default"]

    return (
        <div
            className={className + ' caption inline-block h-4 cursor-default text-center  truncate leading-3 rounded-full px-1.5 py-0.5  ' + color}
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

    const dummyContent = useRef()
    useEffect(() => {
        dummyContent.current = Object.keys(tagColor)[Math.floor(Math.random() * Object.keys(tagColor).length)]
    }, [])
    
    

    const contentColor = tagColor[dummyContent.current]

    const baseClass = "bg-white/55 border border-white/55 uppercase tracking-wide_more font-semibold cursor-pointer leading-3 rounded-full px-2 py-1" 

    const subduedClass = 'text-gray-300/70 hover:text-gray-300'


    return (
        <div
            className={hover? cn(contentColor, baseClass ) : cn(baseClass, subduedClass)}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <p className="text-sxy font-semibold">{name}</p>
        </div>
    )

}


export { ContentThumbnail }
export default ContentTag