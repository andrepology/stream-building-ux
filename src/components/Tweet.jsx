import { useState, useEffect, useRef, useCallback, cloneElement, memo, useLayoutEffect, forwardRef } from 'react';
import { usePopper } from 'react-popper';
import TimeAgo from 'timeago-react';
import cn from 'classnames';
import { animated, useSpring, Transition } from '@react-spring/web'
import { useScrollPosition } from '@n8tb1t/use-scroll-position';
import useMeasure from 'react-use-measure';

import { areEqual } from 'react-window';


import { GrFormClose } from 'react-icons/gr';
import VerifiedIcon from '../icons/verified.jsx'
import { IoAdd } from 'react-icons/io5'

import ContentTag from './ContentTag';
import { ContentThumbnail } from './ContentTag';



import LikeIcon from '../icons/like.jsx'
import ReplyIcon from '../icons/reply.jsx'
import RetweetIcon from '../icons/retweet.jsx'
import OverlapIcon from '../icons/overlap.jsx'



const Metric = ({ icon, count, title = null, iconSize = 14 }) => {

    return (
        <div className="flex items-center select-none gap-1 p-1 ">
            {cloneElement(icon, { className: 'text-gray-400', size: { iconSize } })}
            <span className='text-gray-200/80 font-light text-xs'>{count}</span>
        </div>
    )
}

const Account = ({ entity, currentStream, addEntityToStream }) => {

    const metadata = {
        "Tweets/Week": "~11",
        "Followers": 5386,
        "Following": 1663,
    }

    const interactions = ["Roote", "Housing Strategy", "woki", "supermodular.xyz"]

    return (
        <div className='tweet rounded-xl w-full flex flex-col gap-6'>
            <div className='flex items-center justify-between p-1 rounded-lg'>
                <div className='flex gap-2 items-baseline'>
                    <h1
                        style={{ fontFamily: "GT Pressura", fontWeight: "normal" }}
                        className='text-lg font-medium tracking-tight text-gray-800'
                    >
                        {entity.name}
                    </h1>


                    <p className="text-gray-400 text-sm leading-6 tracking-tight">
                        @{entity.username}
                    </p>

                </div>

                <ContentTag kind={entity.entity_group ?? "ACCOUNT"} />
            </div>

            {entity.description && (
                <div className='flex gap-6'>

                    <img className='h-24 basis-1/4 bg-gray-100 rounded-lg' src="" />

                    <div className='basis-3/4 text-md leading-5 tracking-tight text-gray-600'>
                        {entity.description}
                    </div>
                </div>
            )}


            <div className='pt-3 border-t border-gray-100 flex gap-6'>
                <div className='basis-1/4 text-xs tracking-tight leading-4 text-gray-400'>
                    Followed By These Accounts in <span className="text-gray-600"> {currentStream.name} </span>
                </div>
                <div className='basis-3/4 inline-flex text-center items-center gap-2 flex-wrap'>
                    {interactions.map((e, i) => {
                        return (
                            <div key={i} className='bg-gray-100 rounded-lg px-2 py-1 text-xs tracking-tight leading-4 text-gray-500'>
                                {e}
                            </div>
                        )
                    })
                    }
                </div>

            </div>

            <div className='flex justify-between tracking-tight items-center  border-gray-100 pt-3 text-xs text-gray-400/70'>

                <div>
                    <p className='text-xs text-gray-500'> <span className='text-sm pr-1'>5</span> Stream Followers </p>
                </div>

                <div className='flex gap-3'>
                    {Object.entries(metadata).map(([mt, ct]) => {
                        return (
                            <p> <span className='text-sm text-gray-500 pr-1'>{ct}</span>{mt}</p>
                        )
                    }
                    )}
                </div>
            </div>


            {currentStream?.length && (
                <button
                    onClick={(e) => addEntityToStream(e, "Rhys Lindmark")}
                    className='rounded-full bg-gray-200 p-2 '
                >
                    <p>Add to {currentStream} </p>
                </button>
            )}
        </div>

    )


}

const ContentPreview = ({ update, setOpenOverview, openOverview, entity, setEntity }) => {

    const { entity_group, word } = entity

    const entityRef = useRef();
    const previewRef = useRef();
    const [isHovered, setHovered] = useState(false);

    const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
    // measure distance from mouse and entity
    const onMouseMove = (e) => {
        const { x, y } = e.nativeEvent;
        const { left, top } = entityRef.current?.getBoundingClientRect();
        setMouseOffset({ x: (x - left) / 10, y: (y - top) / 10 });
    }

    const { styles, attributes } = usePopper(entityRef?.current, previewRef?.current, {
        placement: 'right-start',
        position: 'fixed',
        modifiers: [
            {
                name: 'offset',
                options: {
                    offset: [10 + mouseOffset.y, mouseOffset.x + 10],
                },
            },
        ],
    });


    const handleClick = () => {

        try {
            update()
        } catch (e) {
            console.log(e)
        }

        setEntity()
        setOpenOverview(true)
    }

    return (
        <div>

            <div
                ref={entityRef}
                id="ENTITY"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onMouseMove={e => isHovered && onMouseMove(e)}
                onClick={() => handleClick()}
            >

                <ContentThumbnail
                    name={word}
                />
            </div>

            <div ref={previewRef} style={{ ...styles.popper }} {...attributes.popper}>
                {isHovered && !openOverview && (

                    <div className={" card px-3 py-3.5 bg-white relative shadow-subdue flex flex-col gap-4 w-64 max-w-80"}>
                        <div className="inline-flex items-center justify-between">
                            <h3 className='text-gray-100 font-semibold leading-6'>{word}</h3>
                            <ContentTag kind={entity_group} />
                        </div>

                        <p className='text text-gray-100'>
                            {"lorem ipsum for a description"}
                        </p>

                    </div>
                )}
            </div>
        </div>
    )
}


const useLongPress = (
    onLongPress,
    onClick,
    { shouldPreventDefault = true, delay = 1000 } = {}
) => {
    const [longPressTriggered, setLongPressTriggered] = useState(false);
    const timeout = useRef();
    const target = useRef();

    const start = useCallback(
        event => {
            if (shouldPreventDefault && event.target) {
                event.target.addEventListener("touchend", event.preventDefault(), {
                    passive: false
                });
                target.current = event.target;
            }
            timeout.current = setTimeout(() => {
                onLongPress(event);
                setLongPressTriggered(true);
            }, delay);
        },
        [onLongPress, delay, shouldPreventDefault]
    );

    const clear = useCallback(
        (event, shouldTriggerClick = true) => {
            timeout.current && clearTimeout(timeout.current);
            shouldTriggerClick && !longPressTriggered && onClick();
            setLongPressTriggered(false);
            if (shouldPreventDefault && target.current) {
                target.current.removeEventListener("touchend", event.preventDefault(),);
            }
        },
        [shouldPreventDefault, onClick, longPressTriggered]
    );

    return {
        onMouseEnter: e => start(e),
        onTouchStart: e => start(e),
        onMouseUp: e => clear(e),
        onMouseLeave: e => clear(e, false),
        onTouchEnd: e => clear(e)
    };
};


const ContextBuilder = ({ openOverview, currentStream, addEntityToStream, entity }) => {

    // a spring that pushes the context builder up when the overview is open
    const { x } = useSpring({
        x: openOverview ? 550 : 0,
    })

    const metadata = {
        "Tweets/Week": "~11",
        "Followers": 5386,
        "Following": 1663,
    }

    const interactions = ["Roote", "Housing Strategy", "woki", "supermodular.xyz"]

    return (
        <animated.div
            style={{ x }}
            className='flex flex-col gap-2 rounded-xl w-128'
        >
            <div className='tweet flex flex-col gap-7'>
                <div className='flex items-center justify-between p-1 rounded-lg'>
                    <div className='flex gap-2 items-center'>
                        <h1 className='text-xl tracking-tight text-gray-800'>
                            {entity.word !== undefined ? entity.word : entity.name}
                        </h1>

                        {entity.entity_group === "ACCOUNT" && (
                            <p className="text-gray-400 text-sm leading-6 tracking-tight">
                                @{entity.word !== undefined ? entity.word : entity.username}
                            </p>
                        )}
                    </div>

                    <ContentTag kind={entity.entity_group ?? "ACCOUNT"} />
                </div>

                {entity.description && (
                    <div className='flex gap-4'>
                        <div className='h-28 basis-1/4 bg-gray-100 rounded-lg' />
                        <div className='basis-3/4 text-lg tracking-tight text-gray-600 rounded-lg ml-2'>
                            {entity.description}
                        </div>
                    </div>
                )}


                <div className='pt-6 border-t border-gray-100 flex'>
                    <div className='basis-1/4 text-xs tracking-tight leading-4 text-gray-500'>
                        Recent Interactions and Topics
                    </div>
                    <div className='basis-2/4  inline-flex text-center items-center gap-2 flex-wrap'>
                        {interactions.map((e, i) => {
                            return (
                                <div key={i} className='bg-gray-100 rounded-lg px-2 py-1 text-xs tracking-tight leading-4 text-gray-500'>
                                    {e}
                                </div>
                            )
                        })
                        }
                    </div>

                </div>

                <div className='flex justify-between tracking-tight items-center  border-gray-100 pt-6 text-xs text-gray-400/70'>

                    <div>
                        <p className='text-xs text-gray-500'> <span className='text-sm pr-1'>5</span> Stream Followers </p>
                    </div>

                    <div className='flex gap-3'>
                        {Object.entries(metadata).map(([mt, ct]) => {
                            return (
                                <p> <span className='text-sm text-gray-500 pr-1'>{ct}</span>{mt}</p>
                            )
                        }
                        )}
                    </div>
                </div>


                {currentStream?.length && (
                    <button
                        onClick={(e) => addEntityToStream(e, "Rhys Lindmark")}
                        className='rounded-full bg-gray-200 p-2 '
                    >
                        <p>Add to {currentStream} </p>
                    </button>
                )}
            </div>


            <div className='flex flex-col gap-1'>
                <div className='mx-auto flex hover:bg-gray-300/30 px-1.5 py-1 rounded-md items-center gap-1 text-center text-xs text-gray-600/80'>
                    {/* <span className='text-base font-semibold inline-block'>5</span> Tweets */}
                </div>
                <div className='transition-all duration-500 flex flex-col gap-6'>
                    {""}
                </div>
            </div>

        </animated.div>
    )
}

const ContentHeader = ({ content, contentType, isFocused }) => {


    return (
        <div className='max-w-full min-w-full flex gap-4 justify-between items-baseline'>
            <div className="w-2/5 grow flex items-baseline gap-4">

                <h3
                    className={cn(
                        'hover:underline font-display cursor-pointer text-base truncate shrink text-gray-100 ',
                        'shrink max-w-3/5 items-baseline gap-2'
                    )}
                >
                    {content?.author?.name}
                </h3>

                <p
                    data-cy='date'
                    className={cn(
                        'text-gray-300/55 grow  text-xs inline-block pr-2',
                        'transition-opacity duration-100 ease-in-out',
                        { "opacity-100": isFocused },
                        { "opacity-0": !isFocused },
                    )}
                >
                    <TimeAgo datetime={content?.created_at} locale='en' />
                </p>

            </div>
            <ContentTag className="shrink inline-block" kind={"tweet"} />
        </div>
    )


}





const ContentSwitch = ({ content, focusedContent }) => {

    const isFocused = content?.id === focusedContent

    return (
        <Tweet
            tweet={content.content}
            isFocused={isFocused}
        />
    )
}


const MetricsFooter = ({ tweet, isFocused }) => {

    const dummyInteractions = useRef()
    useEffect(() => {
        dummyInteractions.current = Math.floor(Math.random() * 10)
    }, [])

    const interactions = {
        "Retweets": tweet.public_metrics.retweet_count,
        "Likes": tweet.public_metrics.like_count,
        "Replies": tweet.public_metrics.reply_count,
    }



    return (

        <div className={cn(
            'flex justify-between transition-all duration-500 opacity-0 items-center',
            { 'opacity-100': isFocused }
        )}>
            <div
                className='flex gap-3 pt-5 items-center mb-1.5 text-xs text-gray-500'
            >

                <Metric
                    icon={<OverlapIcon />}
                    count={dummyInteractions.current}
                />

                <Metric
                    icon={<LikeIcon />}
                    count={interactions.Likes}
                />

                <Metric
                    icon={<ReplyIcon />}
                    count={interactions.Replies}
                />

                <Metric
                    icon={<RetweetIcon />}
                    count={interactions.Retweets}
                />
            </div>
            <div
                // center icon below
                className={cn(
                    'h-9 w-9 flex cursor-pointer opacity-0 items-center justify-center rounded-md bg-white/55 border border-gray-500 text-gray-400 hover:bg-gray-500 hover:text-gray-300',
                    
                )}
            >
                <IoAdd
                    size={22}

                />
            </div>
        </div>
    )
}



const Tweet = forwardRef(({ tweet, isFocused }, ref) => {

    const parsedContent = tweet.html.replace(/\\n/g, '<br/>');


    return (
        <div
            ref={ref}
        >

            {/* ContentHeader (Author, @handle, timestamp)  */}
            <ContentHeader content={tweet} contentType={tweet} isFocused={isFocused} />


            {/* ContentBody (either text or text + image if any) */}
            <p
                data-cy='text'
                dangerouslySetInnerHTML={{ __html: parsedContent }}
                className={cn("text-gray-100 font-normal leading-5 pr-12",
                )}
            />

            {/* Interaction Metrics */}
            <MetricsFooter isFocused={isFocused} tweet={tweet} />
        </div>
    )


    
})

const Card = forwardRef((props, ref) => {

    const { content, isScrolling, style, index, isResizing, setRowSize, gridRef, sidebarTop = 256 } = props

    const cardRef = useRef()

    // a scalar value [0,1] that represents how focused the Card is
    const [focus, setFocus] = useState(0)

    // set the focus of the Card based on its position in the viewport
    const [focusRef, bounds] = useMeasure({ scroll: true, debounce: { scroll: 10, resize: 10 } });

    const distFromSidebar = bounds.top - sidebarTop + 16

    useLayoutEffect(() => {

        if (cardRef.current) {

            const cardHeight = cardRef.current.getBoundingClientRect().height
            setRowSize(index, cardHeight + 12*isFocused)

            gridRef?.current?.resetAfterRowIndex(index, false)

        }
        

        // if Tweet is below the Sidebar
        if (distFromSidebar > 0) {

            // scale focus[0,1] based on distance from sidebar
            let remainingDistance = window.innerHeight - sidebarTop
            let focus = 1 - (distFromSidebar / remainingDistance)
            setFocus(focus)
            

        } else {
            // above the Sidebar

            let remainingDistance = sidebarTop
            let focus = (bounds.top / remainingDistance)

            setFocus(focus)

        }
    
    }, [bounds, sidebarTop, isResizing])


    // measuring height of Card
    useLayoutEffect(() => {
        
    }, [index, setRowSize, focus, bounds.height, isScrolling])


    const focusThreshold = 0.80
    const focusStyle = {
        opacity: focus > focusThreshold ? 1 : 0.1 + focus * 0.5,
        transform: focus > focusThreshold ? `scale(${1 + 0.05 * focus})` : `scale(1.00)`,
        padding: '12px 12px 16px',
        transition: `all ${0.3 * focus}s ease-in-out`,
        boxShadow: focus > focusThreshold ? `0px ${focus*42}px 42px -4px rgba(77,77,77,0.15)` : 'none',
        
    }

    const yMargin = 22

    const isFocused = distFromSidebar > 0 && focus > 0.75
    const tweet = content.content

    return (
        <div
            key = {content.id}
            // absolutely position by Grid
            style={{
                ...style, 
                top: style.top + yMargin,
                height: style.height - yMargin,
                width: style.width - yMargin,
                left: style.left + 2 * yMargin,
                transition: `top ${0.3}s ease-in-out`
            }}
            ref={focusRef}
        >
            <div
                className={cn("card flex flex-col gap-2 min-w-24",
                    { 'shadow-focus': isFocused },
                )}
                style={isResizing? {opacity: 0.1} : focusStyle}
                ref={cardRef}
            >
                <Tweet tweet={tweet} isFocused={isFocused} />
            </div>

        </div>

    )


})



export { Account, Card, ContentSwitch }
export default Tweet





// {/* TODO: move to Card. Context Building */}
// {isFocused && !openOverview && tweet.entities?.length > 0 && (
//     <div className='absolute flex flex-col gap-3 w-56 ' style={{ top: 32, left: 44 }}>
//         <p className='caption leading-3 text-gray-300/90 pl-2 pb-1.5 border-b border-gray-500'>Related Content</p>
//         <div className='flex flex-col gap-6'>
//             <div className='flex max-w-20 flex-wrap gap-2.5'>
//                 {tweet.entities?.map((entity, i) => {
//                     return (
//                         <ContentPreview
//                             key={i}
//                             isFocused={isFocused}
//                             update={update}
//                             openOverview={openOverview}
//                             setOpenOverview={setOpenOverview}
//                             entity={entity}
//                             setEntity={() => setEntity(entity)}
//                         />
//                     )
//                 })
//                 }
//             </div>
//         </div>
//     </div>
// )}


// {/* Context Building */}
// <div
//     ref={contextRef}
//     style={{ ...styles.popper, zIndex: 100 }}
//     {...attributes.popper}

// >
//     {openOverview && isFocused ? (
//         <ContextBuilder
//             openOverview={openOverview}
//             currentStream={currentStream}
//             addEntityToStream={addEntityToStream}
//             entity={selectedEntity}
//         />
//     ) : null}
// </div>