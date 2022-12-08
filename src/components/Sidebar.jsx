import { useState, useEffect, useRef, Children, cloneElement } from "react";
import cn from 'classnames'
import { useSpring, animated, useTransition } from '@react-spring/web'

import EntityTag from "./EntityTag";

import { MdKeyboardArrowRight } from 'react-icons/md'
import { BiDotsVertical, BiCaretRight } from 'react-icons/bi'
import { useCallback } from "react";
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi'

// import bg image from public folder
import bg from '../assets/bg.png'



const StreamCover = ({className}) => {


    const bgImage = {
        backgroundImage: `url(${bg})`,
        zIndex: -1,
        backgroundSize: "cover",
        
    }

    return(
        <div className={className} style={bgImage}/>
    )
}



const InlineEntity = ({ name, kind }) => {

    return (
        <div className={
            cn(
                "w-full pl-2 pr-1 py-1.5 max-w-96 items-center inline-flex justify-between bg-white/0 hover:bg-white/80 rounded-lg  border-opacity-0 hover:border-opacity-0")
        }>
            <div className="text-sm text-gray-500">
                {name}
            </div>

            <EntityTag kind={kind} />

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

    // TODO: smarter targetHeight
    // TODO: height transition
    

    const { minHeight, height, visibility } = useSpring({
        from: { minHeight: 0, height: 0, visibility: 0, y: 0 },
        to: {
            minHeight: expanded ? refHeight : 0,
            height: expanded ? refHeight : 0,
            visibility: expanded ? 1 : 0,
        },
        config: { friction: 16 },
    })

    if (expanded) {
        return (
            <animated.div
                className={"overflow-y-scroll w-full flex flex-col items-center"}
                style={refHeight ? { minHeight } : {}}
            >
                <animated.div className="w-full " style={refHeight ? { visibility, height } : {}}> 
                    {children}
                </animated.div>
            </animated.div>
        )
    } else { return null }
}

const Accordion = ({ height, summary, details, toggle, open = null }) => {
    // renders a controlled accordion with animated expand/collapse

    // fallback if not controlled by parent
    const [expanded, setExpanded] = useState(false)
    
    const detailsToggle = toggle? () => toggle() : () => setExpanded(!expanded)
    const isOpen = open !== null ? open : expanded

    return (
        <div>
            <AccordionSummary toggle={detailsToggle} expanded={isOpen}>
                {summary}
            </AccordionSummary>
            <AccordionDetails refHeight={height ?? null} expanded={isOpen} >
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



const StreamHeader = ({ streamName, streamDescription, onClick = () => console.log("Clicked") }) => {
    // Simply renders the heading/Stream metadata
    // Can register onClick events for backwards nav
    // TODO: share, export functionality

    // onFocus make square

    
    const spin = useSpring({
        config: { friction: 5 },
        transform: true ? "rotate(180deg)" : "rotate(0deg)"
    })
    
    const [hover, setHover] = useState(false)
    const [isFocused, setFocus] = useState(false)

    const [ref, width] = useWidth()

    const focusStyle = {
        boxShadow: "0px 28px 32px -28px #d2d1d1",
        height: width,
    }

    const position = isFocused? "absolute left-1 top-7" : "absolute left-1 top-6"

    return (
        <div
            onClick={() => setFocus(!isFocused)}
            style = { isFocused ? focusStyle: {}}
            
            ref={ref}
            
            className={
                cn(
                    "relative transition-all duration-300 pl-4 pr-4 py-4",
                    "hover:bg-gray-100/10 flex flex-col justify-between",
                    {"text-2xl text-gray-800/70 leading-9 m-0.5 rounded-xl px-5 py-5": isFocused},
                    {"text-md font-semibold text-gray-800/90 leading-6 px-5 py-2": !isFocused}
                )
            }
        >
            <div className = "flex justify-between pl-0.5 items-baseline cursor-pointer  tracking-tight">
                <div
                    className="flex z-10 items-baseline gap-0.5 w-4/5"
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                >
                    {hover && (
                        <MdKeyboardArrowRight
                            size={12}
                            onClick={onClick}
                            className = {"transition-all duration-300 " + position}
                            style={{ transform: "rotate(180deg)" }}
                        />
                    )}
                    {streamName}
                </div>

                <animated.div style={spin}>
                    <BiDotsVertical
                        size={12}
                        style={true ? { color: '#8e8a8a80' } : { color: '#b3bfcb' }}
                    />
                </animated.div>
            </div>
            <div className = "text-gray-800/40 tracking-tight leading-4 font-normal text-sm">
                {isFocused && streamDescription}
            </div>
            <StreamCover 
                className = {cn(
                    "absolute z-0 w-full transition-all duration-300 h-full top-0 left-0",
                    {"rounded-xl opacity-70": isFocused},
                    {"opacity-10": !isFocused}
                )}
            />
        </div >

    )
}


const StreamSummary = ({ quantity = "Seeds", count = 5, noBorder = false, expanded }) => {



    return (
        <div 
            className={cn(
                "py-3 text-sm text-gray-500/80 flex justify-between items-center",
                {"border-b border-gray-100": !noBorder}
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


const Filter = ({ quantity = "Seeds", count = 5, toggleFilters, isVisible, hasChildren, level }) => {

    const [isHovered, setHover] = useState(false)


    const eyeCon = isVisible ?
        <HiOutlineEye size={12} style={{ color: '#b3bfcb' }} />
        :
        <HiOutlineEyeOff size={12} style={{ color: '#b3bfcb' }} />

    const opacity = {opacity: 1 - (level - 1)*0.55}

    return (
        <div 
            className={cn(
                "px-5",
                { "hover:bg-white/40 pointer": hasChildren }
            )}
        >
            <div
                className="flex  items-center gap-0 border-b border-gray-300/30"
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
            >
                <div
                    className={cn(
                        "grow py-2.5 text-sm flex justify-between items-baseline",
                        { "text-gray-300": !isVisible },
                        { "pl-1": level === 1 },
                        { "pl-3": level === 2 },

                    )}
                >
                    <div
                        className={cn(
                            "flex gap-0.5 items-center",
                            { "font-light": !hasChildren },
                            { "cursor-pointer text-gray-700/90": hasChildren && isVisible },
                        )}
                    >
                        <p>
                            {quantity}
                        </p>
                    </div>
                    {isVisible &&
                        <div 
                            style = {opacity}
                            className="rounded-full px-2 h-4 flex items-center justify-center text-gray-600 text-xs"
                        >
                            {count}
                        </div>
                    }
                </div>

                {isVisible ?
                    isHovered && (
                        <div onClick={() => toggleFilters(quantity)}>
                            {eyeCon}
                        </div>
                    )
                    :
                    <div className="px-2" onClick={() => toggleFilters(quantity)}>
                        {eyeCon}
                    </div>
                }
            </div>
        </div>

    )

}


const SeedDrawer = ({ seeds }) => {
    // Renders a column of inline seeds

    return (
        <div className="w-full h-full flex flex-col gap-2 px-5 pt-4 pb-20">
            {seeds.map((seed, i) => (
                <InlineEntity key={i} name={seed.name} kind={seed.kind} />
            ))}
        </div>
    )
}

const ContentFilters = ({ streamFilters, toggleFilters, viewConfig }) => {
    // TODO: recursively renders feed toggles



    const renderFilters = (streamFilters, level) => {
        if (typeof (streamFilters) == "object" && streamFilters.length > 0) {

            return (            
                <div className="w-full font-normal">
                    {streamFilters.map((filter, i) => {

                        return (
                            <Accordion
                                key={i}
                                summary={<Filter isVisible={filter.isVisible} quantity={filter.name} count={filter.count} toggleFilters={toggleFilters} hasChildren={filter.children?.length > 0} level = {level} />}
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
        <div className="w-full h-full flex flex-col pt-4 pb-20">
            {/* <ViewController
                viewConfig={viewConfig}
            /> */}
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
            setHeight( window.innerHeight - ref.current?.clientHeight - 2*26)
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

const Control = ({ controlName, value, form }) => {

    return (
        <div className="flex flex-col gap-0 pt-3 pb-2 pl-6 pr-2 ">
            <label className="text-xxs uppercase tracking-wider text-gray-400/80">{controlName}</label>
            <div className="flex justify-between">
                <div className="text-gray-500">
                    {value}
                </div>
                <div className="text-gray-500">
                    {form}
                </div>
            </div>
        </div>
    )
}

const ViewController = ({ viewConfig }) => {
    // Renders form controls for a ViewConfig object

    return (
        <div className="flex flex-col">
            <Control controlName={"Limit"} value={"Day"} form={"T"} />
            <Control controlName={"Recommend"} value={"On"} form={"T"} />
            <Control controlName={"Zoom"} value={"Tweet"} form={"T"} />
        </div>
    )

}

const Tabs = ({ open, toggleOpen }) => {
    // Renders tabs for Seeds and View Controller

    // inline style for animating font size
    const fontAnim = (isActive) => (
        isActive ?
        { fontSize: "1.125rem" }
        :
        { fontSize: "1rem" }
    )

    const activeStyle = (isActive) => (
        isActive ?
            "text-gray-800/80 font-normal tracking-tighter text-2xl leading-8"
            :
            "text-gray-400/60 font-light text-xl tracking-tighter leading-8 hover:text-gray-400"
    )

    const tabStyle = (isActive) => (
        isActive ?
            { backgroundColor: "#faf9fac6" }
            :
            { backgroundColor: "none" }
    )

    return (

        <div 
            style={tabStyle(open.seeds || open.view)}
            className={cn(
                "pl-5 pt-3 pb-0  flex gap-4 items-baseline",
            )}
        >
            <div className="flex flex-col  gap-0 cursor-pointer">
                <h1
                    // style= {fontAnim(open.seeds)}
                    className={activeStyle(open.seeds) + " transition-all duration-200"}
                    onClick={() => toggleOpen("seeds")}
                >
                    Seeds
                </h1>
                <div className={cn("h-1", { "border-b border-gray-400/50": open.seeds })} />
            </div>
            <div className="flex flex-col gap-0 cursor-pointer">
                <h1
                    // style= {fontAnim(open.view)}
                    className={activeStyle(open.view) + " transition-all duration-300"}
                    onClick={() => toggleOpen("view")}
                >
                    View
                </h1>
                <div
                    className={cn("h-1", { "border-b border-gray-400/50": open.view })}
                />
            </div>
        </div>

    )
}

const StreamSidebar = ({ stream, inFocus, currentStream, streamFilters, toggleFilters, viewConfig }) => {
    // Renders a Stream object, its metadata, View Controller and Seeds
    // TODO: handles two states. Seeds, and View Controller

    const [open, setOpen] = useState({ seeds: false, view: false })
    const toggleOpen = (key) => {
        // ensure only one is open at a time
        const nextOpen = {...open}

        // set rest to false
        for (let [k, v] of Object.entries(nextOpen)) {
            if (k !== key) {
                nextOpen[k] = false
            } else if (k === key) {
                nextOpen[k] = !v
            }
        }
        setOpen(nextOpen)
    }

    // track remaining height for AccordionDetails
    const sidebarRef = useRef()
    const remainingHeight = useRemainingHeight(sidebarRef)


    const visibleContentCount = streamFilters?.filter(filter => filter.isVisible).reduce((acc, filter) => acc + filter.count, 0)

    const [row, setRow] = useState(true)

    return (
        <div
            ref={sidebarRef}
            style = {open.view || open.seeds ? { backgroundColor: "#F4F1F4", boxShadow: "0px 0px 32px #E4DEDE"} : {backgroundColor: "#F4F1F4"}}
            className={
                cn(
                    "w-full flex flex-col gap-0 p-0 z-0 rounded-xl ",
                    "transition-shadow duration-400 ease-in-out",
                    { "backdrop-blur-sm overflow-y-scroll overflow-x-hidden": currentStream },
                    { "accordion-shadow ": inFocus },
                )}
        >
            <div
                className={
                    cn(
                        "flex flex-col rounded-xl gap-0 font-medium text-sm text-gray-500"
                    )
                }
            >

                <StreamHeader streamName={stream.name} streamDescription = {currentStream.description} />

                <div
                    className={cn("transition-all duration-500", { "flex flex-row": false }, { "flex flex-col": true })}
                    onMouseEnter={() => setRow(!row)}
                    onMouseLeave={() => setRow(!row)}
                >
                    <Tabs open={open} toggleOpen={toggleOpen} />

                    <Accordion
                        // height={remainingHeight}
                        summary={<div></div>}
                        details={<SeedDrawer seeds={stream.seeds} />}
                        toggle={() => toggleOpen("seeds")}
                        open={open["seeds"]}
                    />


                    <Accordion
                        // height={remainingHeight}
                        summary={<div></div>}
                        details={<ContentFilters streamFilters={streamFilters} toggleFilters={toggleFilters} viewConfig={viewConfig} />}
                        toggle={() => toggleOpen("view")}
                        open={open["view"]}

                    />
                </div>


            </div>
        </div>
    )
}

export { Accordion, AccordionSummary, AccordionDetails, InlineEntity, StreamSidebar }
