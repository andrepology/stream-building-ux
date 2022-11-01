import { useState, useEffect, useRef } from "react";
import cn from 'classnames'
import { MdKeyboardArrowRight } from 'react-icons/md'
import { useSpring, animated } from '@react-spring/web'


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



const AccordionDetails = ({ height, seeds, isOpen }) => {

    const targetHeight = height - (2 * (32 + 4) + 2)
    const reveal = useSpring({
        minHeight: isOpen? targetHeight: 0,
        config: { friction: 20 },
    })

    return (
        <animated.div
            className={"overflow-y-scroll w-full flex flex-col items-center"}
            style={reveal}
        >
            {false && (
                <>
                    <div className="sticky top-2 rounded-lg  bg-slate-300/20 h-8 w-full" />
                    <div className='mx-2 my-2'>
                        {seeds}
                    </div>
                </>
            )}


        </animated.div>
    )
}

const Accordion = ({ height, streamName, currentStream, setStream, lists }) => {

    const isOpen = currentStream === streamName;

    return (
        <div>
            <AccordionSummary streamName={streamName} isOpen={isOpen} setStream={setStream} />
            <AccordionDetails isOpen={isOpen} height={height} streamName={streamName} />
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
        console.log('height', height)

    }, [currentStream])


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
                    />
                ))}
            </div>
        </div>
    )
}
