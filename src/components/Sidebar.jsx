import { useState, useEffect, useLayoutEffect, useRef, Children, cloneElement } from "react";
import cn from 'classnames'
import { useSpring, animated, useTransition } from '@react-spring/web'
import useMeasure from "react-use-measure";

import ContentTag from "./ContentTag";

import { MdKeyboardArrowRight } from 'react-icons/md'
import { BiDotsVertical, BiCaretRight } from 'react-icons/bi'
import {IoIosCheckmark} from 'react-icons/io'

import Slider from "react-input-slider"

import { ReactComponent as Content} from "../assets/Icon/Content/Content.svg"
import { ReactComponent as Aggregation} from "../assets/Icon/Aggregation/Aggregation.svg"
import { ReactComponent as Far} from "../assets/Icon/Far/Far.svg"
import { ReactComponent as Near} from "../assets/Icon/Near/Near.svg"


import { useCallback } from "react";
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi'

// import bg image from public folder
import bg from '../assets/bg.png'



const StreamCover = ({ className, imageOpacity }) => {

    const bgImage = {
        backgroundImage: `url(${bg})`,
        zIndex: -1,
        backgroundSize: "cover",
        opacity: imageOpacity,
    }

    return (
        <div className={className} style={bgImage} />
    )
}



const InlineContent = ({ name, kind }) => {

    // A width-constrained entity tag
    // Useful for rendering seeds

    return (
        <div className={
            cn(
                "pl-3 pr-2.5 py-2 max-w-96 items-baseline inline-flex justify-between bg-white/55 rounded-md")
        }>
            <p className="whitespace-nowrap truncate text-gray-200">
                {name}
            </p>

            <ContentTag kind={kind} />

        </div>
    )
}


const AccordionSummary = ({ children, toggle, expanded }) => {

    return (
        <div
            onClick={() => toggle()}
        >
            {Children.map(children, child => cloneElement(child, { expanded: expanded }))}
        </div>
    )

}

const AccordionDetails = ({ refHeight, expanded, children }) => {

    const [ref, bounds] = useMeasure()
    const heightToFill = useRef()

    useEffect(() => {

        heightToFill.current = window.innerHeight - bounds.bottom + 156

    }, [refHeight, children, bounds.bottom, bounds])

    const { minHeight, height, visibility } = useSpring({
        from: { minHeight: 0, height: 0, visibility: 0, y: 0 },
        to: {
            minHeight: expanded ? heightToFill.current : 0,
            height: expanded ? heightToFill.current : 0,
            visibility: expanded ? 1 : 0,
        },
        config: { friction: 24 },
    })

    if (expanded) {
        return (
            <animated.div
                className={"overflow-y-scroll w-full flex flex-col items-center"}
                style={refHeight ? { minHeight, height } : {}}
                ref={ref}
            >
                <animated.div className="w-full " style={refHeight ? { visibility, height } : {}}>
                    {children}
                </animated.div>
            </animated.div>
        )
    } else { return null }
}

const Accordion = ({  height, summary, details, toggle, tabs = null, _expanded = false }) => {
    // renders a controlled accordion with animated expand/collapse

    // Fallback if not controlled by parent
    const [expanded, setExpanded] = useState(_expanded)

    const detailsToggle = toggle ? () => toggle() : () => setExpanded(!expanded)
    const istabs = tabs ?? expanded

    

    return (
        <div>
            <AccordionSummary toggle={detailsToggle} expanded={istabs}>
                {cloneElement(summary, { expanded: istabs })}
            </AccordionSummary>
            <AccordionDetails refHeight={height ?? null} expanded={istabs} >
                {details}
            </AccordionDetails>
        </div>
    )

}


const useWidth = () => {
    const [width, setWidth] = useState(0)
    const ref = useRef(null)
    const measure = useCallback(() => {
        setWidth(ref.current.getBoundingClientRect().width)
    }, [])
    useEffect(() => {
        measure()
        window.addEventListener('resize', measure)
        return () => {
            window.removeEventListener('resize', measure)
        }
    }, [measure])
    return [ref, width]
}


const StreamHeader = ({ streamName, streamDescription, isResizing, isOpen }) => {

    // Simply renders the Heading and Stream metadata
    // Can register onClick events for backwards nav
    // TODO: share, export functionality

    const spin = useSpring({
        config: { friction: 5 },
        transform: true ? "rotate(180deg)" : "rotate(0deg)"
    })

    const [hover, setHover] = useState(false)
    const [ref, width] = useWidth()


    const font = { fontFamily: "GT Pressura" }

    const hoverStyle = {
        transform: !isOpen && (hover || isResizing) ? "translateX(-4px) translateY(-4px)" : "translateX(0px)",
        transition: "transform 0.2s ease-in-out",
    }

    return (
        <div
            ref={ref}
            style={hoverStyle}
            // onClick={() => onClick()}
            className={
                cn(
                    "relative select-none bg-white/35 hover:bg-white/35 rounded-md px-4.5 pt-3 pb-2.5",
                    "flex flex-col justify-between",
                    // { "text-xl text-gray-100 leading-8 m-0.5 rounded-xl bg-white/35 hover:bg-white/35": isFocused },
                    { "text-md font-medium text-gray-100 leading-6 border border-white/10": true }
                )
            }
            >
            <div className="flex relative justify-between items-baseline tracking-tight">
                <div
                    className="z-10 w-4/5 text-base"
                    // style={isFocused ? font : {}}
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                >
                    {streamName}
                </div>

                <animated.div style={spin}>
                    <BiDotsVertical
                        size={12}
                        className={"text-gray-300"}
                    />
                </animated.div>
            </div>

            <div className="text-gray-200 tracking-normal leading-4 font-normal text-sm">
                {false && streamDescription}
            </div>

            <StreamCover
                className={cn(
                    "absolute rounded-md z-0 w-full transition-all duration-300 h-full top-0 left-0",
                    { "opacity-100": false },
                    { "opacity-0": true }
                )}
            />

            

        </div >

    )
}





const ContentIndicator = ({ contentType }) => {
    // simply renders a small circle icon with the color of the contentType

    const colorType = {
        "accounts": "bg-author-base",
        "tweets": "bg-tweet-base",
        "media": "bg-media-base",
        "collections": "bg-collection-base",
        "communities": "bg-community-base",
        "entities": "bg-entity-base",
        "default": "bg-gray-400"
    }

    return (
        <div className={cn(
            "w-1.5 h-1.5 rounded-full",
            colorType[contentType.toLowerCase()] ?? colorType["default"]
        )} />
    )
}


const StreamSummary = ({ quantity = "Seeds", count = 5, noBorder = false, expanded }) => {

    return (
        <div
            className={cn(
                "py-3 text-sm text-gray-500/80 flex justify-between items-center",
                { "border-b border-gray-100": !noBorder }
            )}
        >
            <div className="flex gap-0.5 items-center">
                <BiCaretRight
                    size={10}
                    // rotate if expanded
                    style={expanded ? { transform: "rotate(90deg)" } : {}}
                />
                <p>
                    {quantity}
                </p>
            </div>
            <div className="rounded-full px-2 h-4 flex items-center justify-center bg-gray-100 text-gray-500/40 text-xs">
                {count}
            </div>
        </div>
    )
}


const Filter = ({ quantity = "Seeds", count = 5, toggleFilters, isVisible, hasChildren, level, idx = null }) => {

    const [isHovered, setHover] = useState(false)

    const eyeCon = isVisible ?
        <HiOutlineEye size={12} style={{ color: '#b3bfcb' }} />
        :
        <HiOutlineEyeOff size={12} style={{ color: '#b3bfcb' }} />

    const opacity = { opacity: 1 - (level - 1) * 0.55 }
    // if level is odd add bottom margin
    const separation = idx && idx % 2 !== 0 ? { marginBottom: "0.75rem" } : {}

    return (
        <div
            style = {separation}
            className={cn(
                "w-full",
                { "hover:bg-white/55 cursor-pointer": hasChildren }
            )}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <div
                className={cn(
                    "ml-5 pl-1.5 pr-2 mr-4 pt-2.5 pb-3",
                    "flex items-center gap-0 border-b border-gray-400/35"
                )}
            >

                <div
                    className={cn(
                        "grow text-sm flex justify-between items-baseline",
                        { "text-gray-400": !isVisible },
                        { "text-gray-100": level === 1 },
                        { "text-gray-200": level === 2 },
                        { "pl-4.5": level === 2 },

                    )}
                >

                    <p>
                        {quantity}
                    </p>

                    <div
                        style={opacity}
                        className="flex items-center gap-1.5"
                    >
                        {isVisible &&
                            <p className="small">
                                {count}
                            </p>
                        }   
                        {
                            isVisible ?
                                isHovered ? (
                                    <div className={"cursor-pointer"} onClick={() => toggleFilters(quantity)}>
                                        {eyeCon}
                                    </div>
                                ) : level === 1 ? <ContentIndicator contentType={quantity} /> : <div className="w-1.5" />
                                :
                                <div className="px-2" onClick={() => toggleFilters(quantity)}>
                                    {eyeCon}
                                </div>


                        }


                    </div>
                

                </div>


            </div>

        </div>

    )

}


const ViewHeader = ({ expanded }) => {

    // hover state
    const [isHovered, setHover] = useState(false)

    return (
        <div
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            className=" cursor-pointer flex gap-1 items-center pl-4.5 pr-3 pt-3 pb-2"
        >
            <BiCaretRight
                // Rotate if expanded
                style={expanded ? { transform: "rotate(90deg)" } : {}}
                size={8}
                className={cn(
                    "absolute left-2 text-gray-400",
                    { "text-gray-300": isHovered }
                )}
            />
            <p
                className={
                    cn(
                        "small font-normal text-gray-300",
                        { "text-gray-200": isHovered }
                    )}>
                View Controls
            </p>
        </div>

    )
}

const ViewControls = () => {

    


    return (
        <div className="pb-3">
            <Control controlName={"Zoom"} value="Forest" formOptions={["Forest", "Trees"]} />
            <Control controlName={"Scope"} value="Near" formOptions={["Crumbs", "Near", "Far"]} />
            <Control controlName={"Range"} value="Day" formOptions={["Day", "Month", "Year"]} />
        </div>
    )

}


const ViewController = ({ view, setView }) => {

    return (
        <div className="sticky bg-white/35 border-b border-gray-500">
            <Accordion
                summary={<ViewHeader />}
                details={<ViewControls />}
                _expanded = {true}
            />
        </div>
    )

}

const StatusHeader = ({ status, setStatus, expanded }) => {

    const [isHovered, setHover] = useState(false)

    return (
        <div className="flex justify-between cursor-pointer items-baseline pl-4.5 pr-3 pt-3 pb-2">
            <div className="flex gap-1 items-center">
                <BiCaretRight
                    // Rotate if expanded
                    style={expanded ? { transform: "rotate(90deg)" } : {}}
                    size={8}
                    className={cn(
                        "absolute left-2 text-gray-400",
                        { "text-gray-300": isHovered }
                    )}
                />
                <p
                    className={
                        cn(
                            "small font-normal text-gray-300",
                            { "text-gray-200": isHovered }
                        )}>
                    Status
                </p>
            </div>
            <div className="flex gap-1 items-center">

                <p
                    className={
                        cn(
                        "small font-normal text-gray-300/55",
                        { "text-gray-200": isHovered }
                    )}>
                    Indexed
                </p>
                <IoIosCheckmark
                        size={12}
                        className = "text-gray-300/55 bg-gray-500 rounded-full"
                />

            </div>
        </div>
    )
}


const StatusIndicator = () => {
    return (
        <div>
        </div>
    )
}


const StatusViewer = ({ status, setStatus }) => {

    return (
        <div className="bg-white/35 border-b border-gray-500">
            <Accordion
                summary={<StatusHeader />}
                details={<StatusIndicator />}
            />
        </div>

    )
}

const SeedDrawer = ({ seeds }) => {
    // Renders a column of inline seeds

    return (
        <>
            <StatusViewer />
            <div className="pl-3 pr-3 pt-4 pb-20">
                <p className="pl-2 pb-2 caption text-gray-300">Added <span className = "text-gray-200">Today</span></p>
                <div className="flex flex-col gap-2.5">
                    {seeds.map((seed, i) => (
                        <InlineContent key={i} name={seed.name} kind={seed.kind} />
                    ))}
                </div>
            </div>
        </>
    )
}

const ContentFilters = ({ streamFilters, toggleFilters }) => {

    // recursively renders Content filters

    const renderFilters = (streamFilters, level) => {
        if (typeof (streamFilters) == "object" && streamFilters.length > 0) {

            return (
                <div className={"w-full font-normal"}>
                    {streamFilters.map((filter, i) => {
                        return (
                            <Accordion
                                key={i}
                                summary={<Filter isVisible={filter.isVisible} quantity={filter.name} count={filter.count} toggleFilters={toggleFilters} hasChildren={filter.children?.length > 0} level={level} idx = {i} />}
                                details={renderFilters(filter.children, level + 1)}
                            />
                        )
                    }
                    )}
                </div>

            )
        } else {
            return null
        }

    }

    return (
        <div className="flex flex-col gap-3 pb-16">
            <ViewController />

            {renderFilters(streamFilters, 1)}
        </div>
    )

}


const useRemainingHeight = (ref, state) => {
    // returns remaining height 
    const [height, setHeight] = useState(0)

    // create useCallback
    const handleResize = useCallback(() => {
        if (ref.current) {
            setHeight(window.innerHeight - ref.current?.clientHeight - 2 * state.top)
        }
    }, [ref])

    useEffect(() => {
        console.log("Measuring remaining height")
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    },
        [ref, state, handleResize])

    return height
}

const Control = ({ controlName, value, formOptions }) => {

    // Renders an input control with a name, a current value of possible values
    // value must be in possibleValues
 
    const [index, setIndex] = useState(formOptions.indexOf(value))
    const _value = formOptions[index]

    const formLength = formOptions.length - 1

    const leftOpacity = 0.3 + (formLength - index)/formLength
    const rightOpacity = 0.3 + (index/formLength)

    const leftTransform = 1 + 0.2*(formLength - index)/formLength
    const rightTransform = 1 + 0.2*index/formLength

    const IconLeft = controlName === "Zoom" ? 
        <Aggregation style={{opacity: leftOpacity, transform: `scale(${leftTransform }`}} />
        : controlName === "Scope" ?
        <Near style={{opacity: leftOpacity, transform: `scale(${leftTransform }`}} />
        : <div className="w-12 h-12"/>

    const IconRight = controlName === "Zoom" ?
        <Content style={{opacity: rightOpacity, transform: `scale(${rightTransform}` }} />
        : controlName === "Scope" ?
        <Far style={{opacity: rightOpacity, transform: `scale(${rightTransform}`}} />
        : <div className="w-12 h-12"/>
    

    const tickStep = ({x}) => {
        // if x is int, setIndex
        if (x % 1 === 0) {
            setIndex(x)
        }
    }

    return (
        <div className="flex flex-col gap-0 pt-2 pb-1 pl-6 pr-4.5 ">
            <p className="caption text-gray-400" >{controlName}</p>
            <div className="flex items-center justify-between py-1">
                <p className="text-gray-100">{_value}</p>

                <div className="flex items-center gap-2">
                    {cloneElement(IconLeft ?? <div/>, {className: "transition-all duration-500 cursor-pointer", onClick: () => setIndex(0)})}

                    <Slider
                        axis = "x"
                        x = {index}
                        onChange={tickStep}
                        xmin={0}
                        xmax={formOptions.length - 1}
                        

                        styles = {{
                            track: {
                                backgroundColor: "#d7d5dd",
                                height: "1px",
                                width: "50px"
                            },
                            active: {
                                backgroundColor: "#D0CED4",
                            }, 
                            thumb: {
                                width: "9px",
                                height: "9px",
                                backgroundColor: "#36353B",
                                boxShadow: "none"
                        }}}
                        
                        //marks={formOptions.map((v, i) => ({ value: i, label: v }))}
                        //track={false}
                        //valueLabelDisplay="auto"
                        // valueLabelFormat={(v) => formOptions[v]}
                    />

                    {cloneElement(IconRight ?? <div/>, {className: "transition-all duration-500 cursor-pointer", onClick: () => setIndex(formOptions.length - 1)  })}

                </div>

            
                
                
            </div>
        </div>
    )
}


const Tabs = ({ tabs, toggleTabs }) => {
    // Renders tabs for Seeds and View Controller

    const isOpen = Object.values(tabs).includes(true)

    const activeStyle = (isActive) => {
        let baseStyle = "cursor-pointer tracking-tighter leading-5 transition-all duration-200"

        let addition = isActive ?
            "text-gray-100 hover:text-gray-100/70 font-normal "
            :
            "text-gray-300/50 font-normal hover:text-gray-300/90"

        return baseStyle + " " + addition
    }


    return (
        <div
            className={
                cn(
                    "pl-4.5 pt-2.5 pb-3 pr-3.5 flex gap-4 items-baseline",
                    { "bg-white/35": isOpen },
                )
            }
        >

            <h2
                className={activeStyle(tabs.seeds)}
                onClick={() => toggleTabs("seeds")}
            >
                Crumbs
            </h2>
            <h2
                className={activeStyle(tabs.view)}
                onClick={() => toggleTabs("view")}
            >
                View
            </h2>
        </div>

    )
}






const StreamSidebar = ({ stream, header = null,  isResizing, currentStream, streamFilters, toggleFilters, viewConfig }) => {

    // Renders a Stream object, its metadata, View Controller and Seeds

    const [tabs, setTabs] = useState({ seeds: false, view: false })
    const isOpen = tabs.seeds || tabs.view

    const toggleTabs = (key) => {
        // ensure only one is tabs at a time
        const nextTabs = { ...tabs }

        // set rest to false
        for (let [k, v] of Object.entries(nextTabs)) {
            if (k !== key) {
                nextTabs[k] = false
            } else if (k === key) {
                nextTabs[k] = !v
            }
        }
        setTabs(nextTabs)
    }

    const [isFocused, setFocus] = useState(false)

    const [ref, bounds] = useMeasure()
    const [remainingHeight, setRemainingHeight] = useState(null)
    useLayoutEffect(() => {
        // calculate remaining height if bounds change
        if (bounds.height) {
            setRemainingHeight(window.innerHeight - bounds.height - 2 * bounds.top)
        }
    }, [tabs, bounds])


    return (
        <div
            ref={ref}
            style = {{ width: 238 }}
            className={
                cn(
                    "flex flex-col gap-0 rounded-md ",
                    "transition-shadow duration-400 ease-in-out",
                    { "overflow-visible": currentStream },
                    { "shadow-subdue border border-white/55": isOpen }
                )}
        >

            {header}

            <div
                className={"flex flex-col"}
            >
                <Tabs tabs={tabs} toggleTabs={toggleTabs} />

                <Accordion
                    height={remainingHeight}
                    summary={<div></div>}
                    details={<SeedDrawer seeds={stream.seeds} />}
                    toggle={() => toggleTabs("seeds")}
                    tabs={tabs["seeds"]}
                />

                <Accordion
                    height={remainingHeight}
                    summary={<div></div>}
                    details={<ContentFilters streamFilters={streamFilters} toggleFilters={toggleFilters} viewConfig={viewConfig} />}
                    toggle={() => toggleTabs("view")}
                    tabs={tabs["view"]}

                />
            </div>

            <StreamCover
                className={cn(
                    "absolute z-0 w-full h-full top-0 overflow-visible left-0 transition-all duration-300",
                    { "opacity-20 blur-2xl": tabs.view || tabs.seeds },
                    {
                        "opacity-70 blur-xl": !(tabs.view || tabs.seeds || isFocused),
                        "opacity-0 blur-none": isFocused && !(tabs.view || tabs.seeds),
                        "opacity-0": isResizing,
                    },
                )}
                imageOpacity = {isResizing ? 0 : isOpen ? 0.2 : 0.7}
            />
        </div>
    )
}

export { Accordion, AccordionSummary, AccordionDetails, InlineContent, StreamSidebar }
