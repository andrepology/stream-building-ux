import { useState, useEffect, useRef } from "react";
import cn from 'classnames'
import { MdKeyboardArrowRight } from 'react-icons/md'
import { useSpring, animated, useTransition } from '@react-spring/web'

import EntityTag from "./EntityTag";

const AccordionSummary = ({ streamName, isOpen, setStream }) => {

    const handleClick = () => {
        isOpen ? setStream(null) : setStream(streamName);
    };

    const spin = useSpring({
        config: { friction: 5 },
        transform: isOpen ? "rotate(90deg)" : "rotate(0deg)"
    })

    return (
        <div
            className={
                cn(
                    "bg-transparent flex gap-1 rounded align-middle items-center py-1 pl-2  font-medium text-sm text-gray-400 cursor-pointer",
                    { "sticky top-0 z-10 bg-white/90": isOpen },
                    { "hover:bg-white/30": !isOpen }

                )
            }
            onClick={() => handleClick()}
            style={isOpen ? { color: '#1D1D1D' } : { color: '#949DA7' }}
        >
            <animated.div style={spin}>
                <MdKeyboardArrowRight
                    size={12}
                    style={isOpen ? { color: '#212020' } : { color: '#b3bfcb' }}
                />
            </animated.div>
            {streamName}
        </div >
    )

}


const InlineEntity = ({ name, kind }) => {

    return (
        <div className="w-full pl-2 pr-1 py-1.5 max-w-96 items-center inline-flex justify-between bg-white/60 hover:bg-white/80 rounded-lg border">
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
            height: isOpen? targetHeight: 0,
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

    const isOpen = currentStream === streamName;

    return (
        <div>
            <AccordionSummary streamName={streamName} isOpen={isOpen} setStream={setStream} />
            <AccordionDetails isOpen={isOpen} refHeight={height} streamName={streamName} seeds={seeds} />
        </div>

    )
}


export default function StreamAccordion({ streams, lists, inFocus, currentStream, setStream }) {

    const accordionRef = useRef();
    const [height, setHeight] = useState(Number);

    // set height according to viewport height
    useEffect(() => {
        // TODO: set accordiong to my-10 in tailwind. 
        setHeight(2 / 3 * window.innerHeight);
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
