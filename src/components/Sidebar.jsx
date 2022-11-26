import { useState, useEffect, useRef } from "react";
import cn from 'classnames'
import { MdKeyboardArrowRight } from 'react-icons/md'
import { useSpring, animated, useTransition } from '@react-spring/web'

import EntityTag from "./EntityTag";

const AccordionSummary = ({ streamName, isOpen, setStream, seeds, refHeight }) => {

    const handleClick = () => {
        isOpen ? setStream(null) : setStream(streamName);
    };

    const spin = useSpring({
        config: { friction: 5 },
        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)"
    })

    return (
        <div className="flex flex-col pt-6 px-6 pb-3 rounded bg-white/70 gap-0 font-medium text-sm text-gray-500 ">
            <div
                className={
                    cn(
                        "bg-transparent text-xl leading-6 tracking-tight pb-6 flex justify-between items-center cursor-pointer",
                        { "sticky top-0 z-10 border-b border-gray-100": isOpen },
                        { "hover:bg-white/30": !isOpen }

                    )
                }
                onClick={() => handleClick()}
                style={isOpen ? { color: '#1D1D1D' } : { color: '#949DA7' }}
            >
                {streamName}
                <animated.div style={spin}>
                    <MdKeyboardArrowRight
                        size={12}
                        style={isOpen ? { color: '#847c7c' } : { color: '#b3bfcb' }}
                    />
                </animated.div>
            </div >

            {isOpen && (
                <div>
                    <div className="py-3 border-b border-gray-100 text-sm flex justify-between items-center">
                        <p>
                            Seeds
                        </p>
                        <div className="rounded-lg bg-gray-200 text-gray-500/70 text-sm px-1.5 py-0.5">
                            5
                        </div>
                    </div>
                    <AccordionDetails isOpen={isOpen} refHeight={refHeight - 400} streamName={streamName} seeds={seeds} />
                    <div className="py-3 text-sm flex justify-between items-center">
                        <p>
                            Content
                        </p>
                        <div className="rounded-lg bg-gray-200 text-gray-500/70 text-sm px-1.5 py-0.5">
                            5
                        </div>
                    </div>
                </div>
    )
}

        </div >
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


const AccordionDetails = ({ refHeight, seeds, isOpen }) => {

    const targetHeight = refHeight - (2 * (32 + 4) + 2)
    const { minHeight, height, visibility } = useSpring({
        from: { minHeight: 0, height: 0, visibility: 0, y: 0 },
        to: {
            minHeight: isOpen ? targetHeight : 0,
            height: isOpen ? targetHeight : 0,
            visibility: isOpen ? 1 : 0,
        },
        config: { friction: 16 },
    })

    return (
        <animated.div
            className={"overflow-y-scroll w-full flex flex-col items-center"}
            style={{ minHeight }}
        >
            {isOpen && (
                <animated.div className="w-full " style={{ visibility, height }}>
                    {/* <div className="sticky top-2 rounded-lg  bg-slate-300/20 h-8 w-full" /> */}
                    <div className='my-2 mx-2 flex flex-col gap-1'>
                        {seeds.map(e => <InlineEntity name={e} kind={"person"} />)}
                    </div>
                </animated.div>
            )}



        </animated.div>
    )
}

const Accordion = ({ height, streamName, currentStream, setStream, lists, seeds }) => {

    // TODO: either Seeds or Content is open.

    const isOpen = currentStream === streamName;

    return (
        <div>
            <AccordionSummary streamName={streamName} isOpen={isOpen} refHeight={height} setStream={setStream} seeds={seeds} />
            <AccordionDetails isOpen={isOpen} refHeight={height} streamName={streamName} seeds={seeds} />
        </div>

    )
}

/*

<StreamSidebar>

    <StreamHeader streamName = {streamName} />

    <Accordion expanded = {true}/>
        <AccordionSummary>
            <div>
                Seeds
                {SeedCount}
            </div>
        </AccordionSummary>

        <AccordionDetails>
            <div>
                {seeds.map(e => <InlineEntity name={e} kind={"person"} />)}
            </div>

        </AccordionDetails>
    </Accordion>
    <Accordion expanded = {!true}/>
        <AccordionSummary>
            <div>
                Content
                {ContentCount}
            </div>
        </AccordionSummary>

        <AccordionDetails>
            <div>
                {content.map(e => <InlineEntity name={e} kind={"person"} />)}
            </div>

        </AccordionDetails>
    </Accordion>

</StreamSidebar>

*/

const StreamAccordion = ({ streams, lists, inFocus, currentStream, setStream }) => {

    const accordionRef = useRef();
    const [height, setHeight] = useState(Number);

    // set height to a fraction of viewport height
    useEffect(() => {
        // TODO: set accordiong to my-10 in tailwind. 
        setHeight(3 / 4 * window.innerHeight);
    }, [currentStream, height])



    return (
        <div className="h-full" ref={accordionRef}>
            <div
                className={
                    cn(
                        "w-full flex flex-col gap-0.5 p-0.5 z-0 rounded border border-gray-200 border-opacity-0 ",
                        "transition-shadow duration-400 ease-in-out",
                        { "backdrop-blur-sm bg-radial overflow-y-scroll overflow-x-hidden": currentStream },
                        { "backdrop-blur-sm border-opacity-100 accordion-container ": inFocus },
                    )}
            >
                {streams.map((stream, index) => (
                    <Accordion
                        key={index}
                        height={height}
                        streamName={stream.name}
                        currentStream={currentStream}
                        setStream={setStream}
                        lists={lists}
                        seeds={stream.seeds}
                    />
                ))}
            </div>
        </div>
    )
}


const StreamSidebar = ({ streams, lists, inFocus, currentStream, setStream }) => {
    // Renders a list of streams and View Controller

    const accordionRef = useRef();
    const [height, setHeight] = useState(Number);

    // set height to a fraction of viewport height
    useEffect(() => {
        // TODO: set accordiong to my-10 in tailwind. 
        setHeight(3 / 4 * window.innerHeight);
    }, [currentStream, height])



    return (
        <div className="h-full" ref={accordionRef}>
            {/* <div className = "text-xs pl-1 text-gray-400/80 font-light"> 
                Private Streams
            </div>
            */}
            <div
                className={
                    cn(
                        "w-full flex flex-col gap-0.5 p-0.5 z-0 rounded border border-gray-200 border-opacity-0 ",
                        "transition-shadow duration-400 ease-in-out",
                        { "backdrop-blur-sm bg-radial overflow-y-scroll overflow-x-hidden": currentStream },
                        { "backdrop-blur-sm border-opacity-100 accordion-container ": inFocus },
                    )}
            >
                {streams.map((stream, index) => (
                    <Accordion
                        key={index}
                        height={height}
                        streamName={stream.name}
                        currentStream={currentStream}
                        setStream={setStream}
                        lists={lists}
                        seeds={stream.seeds}
                    />
                ))}
            </div>
        </div>
    )
}

export { Accordion, AccordionSummary, AccordionDetails, InlineEntity, StreamAccordion, StreamSidebar }
