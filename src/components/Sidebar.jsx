import { useState, useLayoutEffect, useEffect, useRef } from "react";
import cn from 'classnames'
import { useSpring, animated, useTransition } from '@react-spring/web'

import EntityTag from "./EntityTag";

import { MdKeyboardArrowRight } from 'react-icons/md'
import { BiDotsVertical } from 'react-icons/bi'
import { useCallback } from "react";


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



const AccordionSummary = ({ children, toggle }) => {

    return (
        <div
            onClick={() => toggle()}
        >
            {children}
        </div>
    )

}


const AccordionDetails = ({ refHeight, expanded, children }) => {

    // TODO: smarter targetHeight
    // TODO: height transition
    const targetHeight = refHeight - (2 * (32 + 4) + 2)

    const { minHeight, height, visibility } = useSpring({
        from: { minHeight: 0, height: 0, visibility: 0, y: 0 },
        to: {
            minHeight: expanded ? targetHeight : 0,
            height: expanded ? targetHeight : 0,
            visibility: expanded ? 1 : 0,
        },
        config: { friction: 16 },
    })

    if (expanded) {
        return (
            <animated.div
                className={"overflow-y-scroll w-full flex flex-col items-center"}
                style={{ minHeight }}
            >
                <animated.div className="w-full " style={{ visibility, height }}> 
                    {children}
                </animated.div>
            </animated.div>
        )
    } else { return null }
}

const Accordion = ({ height, summary, details, toggle, open = null }) => {
    // renders a controlled accordion with animated expand/collapse

   

    const [expanded, setExpanded] = useState(false)
    
    const detailsToggle = toggle? () => toggle() : () => setExpanded(!expanded)
    const isOpen = open !== null ? open : expanded

    return (
        <div>
            <AccordionSummary toggle={detailsToggle}>
                {summary}
            </AccordionSummary>
            <AccordionDetails refHeight={height} expanded={isOpen} >
                {details}
            </AccordionDetails>
        </div>

    )

    
}



const StreamHeader = ({ streamName, onClick = () => console.log("Clicked") }) => {
    // Simply renders the heading/Stream metadata
    // Can register onClick events for backwards nav
    // TODO: share, export functionality


    const spin = useSpring({
        config: { friction: 5 },
        transform: true ? "rotate(180deg)" : "rotate(0deg)"
    })

    const [hover, setHover] = useState(false)


    return (
        <div
            className={
                cn(
                    "bg-transparent text-xl leading-6 tracking-tight pb-6 flex justify-between items-baseline cursor-pointer",
                    { "sticky top-0 z-10 border-b border-gray-100": true },
                    { "hover:bg-white/30": true }

                )
            }
        >
            <div
                className="flex items-baseline gap-0.5"
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
            >
                {hover && (
                    <MdKeyboardArrowRight
                        size={12}
                        onClick={onClick}
                        style={{ transform: "rotate(180deg)" }}
                    />
                )}
                {streamName}
            </div>


            <animated.div className="" style={spin}>
                <BiDotsVertical
                    size={12}
                    style={true ? { color: '#847c7c' } : { color: '#b3bfcb' }}
                />
            </animated.div>
        </div >

    )
}


const StreamSummary = ({ quantity = "Seeds", count = 5, noBorder = false }) => {
    return (
        <div 
            className={cn(
                "py-3 text-sm text-gray-500/80 flex justify-between items-center",
                {"border-b border-gray-100": !noBorder}
            )}
        >
            <p>
                {quantity}
            </p>
            <div className="rounded-full px-2 h-4 flex items-center justify-center bg-gray-100 text-gray-500/40 text-xs">
                {count}
            </div>
        </div>
    )
}

const SeedDrawer = ({ seeds }) => {
    // Renders a column of inline seeds

    return (
        <div className="w-full h-full flex flex-col items-center">
            {seeds.map((seed, i) => (
                <InlineEntity key={i} name={seed.name} kind={seed.kind} />
            ))}
        </div>
    )
}

const ContentFilters = ({ filters, setFilters}) => {
    // TODO: responsible for filtering feed content
}


const useRefHeight = (ref) => {
    // returns the height of the ref
    const [height, setHeight] = useState(0)

    useEffect(() => {
        console.log("Ref Changed")
        setHeight( window.innerHeight - ref.current?.clientHeight - 44)
    }, 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ref.current?.clientHeight])

    return height
}


const StreamSidebar = ({ stream, inFocus, currentStream, streamContent }) => {
    // Renders a Stream object, its metadata, View Controller and Seeds
    // TODO: handles two states. Seeds, and View Controller

    const [open, setOpen] = useState({ seeds: false, view: false })
    const toggleOpen = (key) => {

        console.log(open)
        
        const nextOpen = {...open}

        // set rest to false
        for (let [k, v] of Object.entries(nextOpen)) {
            if (k !== key) {
                nextOpen[k] = false
            } else if (k === key) {
                nextOpen[k] = !v
            }
        }
        console.log(nextOpen)
        setOpen(nextOpen)
    }

    // track remaining height for AccordionDetails
    const sidebarRef = useRef()
    const remainingHeight = useRefHeight(sidebarRef)

    return (
        <div
            ref={sidebarRef}
            className={
                cn(
                    "w-full flex flex-col gap-0 p-0.5 z-0 rounded-xl border border-gray-200 border-opacity-0 ",
                    "transition-shadow duration-400 ease-in-out",
                    { "backdrop-blur-sm bg-radial overflow-y-scroll overflow-x-hidden": currentStream },
                    { "backdrop-blur-sm border-opacity-100 accordion-container ": inFocus },
                )}
        >
            <div
                className="flex flex-col pt-6 px-6 pb-3 rounded bg-white/70 gap-0 font-medium text-sm text-gray-500"
            >

                <StreamHeader streamName={stream.name} />

                <Accordion 
                    height={remainingHeight}
                    summary={<StreamSummary quantity={"Seeds"} count={stream.seeds.length} />}
                    details={<SeedDrawer seeds={stream.seeds} />}
                    toggle = {() => toggleOpen("seeds")}
                    open = {open["seeds"]}
                />
                <Accordion
                    height={remainingHeight}
                    summary={<StreamSummary quantity={"Content"} count={streamContent} noBorder />}
                    details={<SeedDrawer seeds={stream.seeds} />}
                    toggle = {() => toggleOpen("view")}
                    open = {open["view"]}
                />

            </div>
        </div>
    )
}

export { Accordion, AccordionSummary, AccordionDetails, InlineEntity, StreamSidebar }
