import { useState, useEffect, useRef, useCallback } from 'react';
import { usePopper } from 'react-popper';
import TimeAgo from 'timeago-react';
import cn from 'classnames';
import { animated, useSpring, Transition } from '@react-spring/web'

import { num } from '../utils'

import { GrFormClose } from 'react-icons/gr';
import VerifiedIcon from '../icons/verified.jsx'

import EntityTag from './EntityTag';


const Tooltip = ({ title, children, className }) => {
    // a tooltip positioned with popper

    const [isHovered, setHovered] = useState(false);

    return (
        <div
            className={className + " absolute z-10"}
            onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>

            {children}
            {isHovered && (
                <div className="bg-black text-white rounded-full px-2 py-1 text-xs">
                    {title}
                </div>
            )}
        </div>

    )
}


const EntityPopup = ({ isFocused, update, setOpenOverview, openOverview }) => {

    const entityRef = useRef();
    const previewRef = useRef();
    const [isHovered, setHovered] = useState(false);

    const { styles, attributes } = usePopper(entityRef?.current, previewRef?.current, {
        placement: 'right-start',
        position: 'fixed',
        modifiers: [
            {
                name: 'offset',
                options: {
                    offset: [-10, 10],
                },
            },
        ],
    });

    const inspectEntity = () => {
        setHovered(true);
        setOpenOverview(true);
    }

    const handleClick = () => {
        update()
        setOpenOverview(true)
    }

    return (
        <div>
            <button
                ref={entityRef}
                className='relative'
                onMouseEnter={() => setHovered(true)}
                // onMouseLeave={() => setHovered(false)}
                onClick={() => handleClick()}
            >
                <div
                    id="ENTITY"
                    className={cn(
                        'bg-purple-100 px-2 py-0.5 text-purple-500 text-sm rounded-full max-content',
                        { 'border border-purple-200': openOverview })}
                >
                    German Shepherd
                </div>

            </button>

            <div ref={previewRef} style={styles.popper} {...attributes.popper}>
                {isHovered && !openOverview && (
                    <div className={"card shadow-context"}>
                        German Shepherd Description
                        <button
                            id="INSPECT"
                            className="w-full rounded-full border"
                            onClick={() => handleClick()}
                        >
                            See More
                        </button>

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


const ContextBuilder = ({ openOverview, setOpenOverview, currentStream, relatedTweets, addEntityToStream }) => {

    // a spring that pushes the context builder up when the overview is open
    const { x } = useSpring({
        x: setOpenOverview ? 40 : 0,
    })




    return (
        <animated.div
            style={{x}} 
            className='flex flex-col gap-2 w-96'
        >
            <div
                className={"card p-2 flex flex-col"}
            >
                <div className='flex justify-between'>
                    <h1 className='w-3/5'>
                        German Shepherd
                    </h1>
                    <GrFormClose
                        className="w-6 h-6 cursor-pointer opacity-20 bg-gray-300 rounded-full"
                        onClick={() => setOpenOverview(false)}
                    />
                </div>

                <br />

                <button
                    onClick={(e) => addEntityToStream(e, "German Shepherd")}
                    className='rounded-full bg-gray-200 p-2 '
                >
                    <p>Add to </p>
                    <p>{currentStream}</p>
                </button>
            </div>
            <div className='flex flex-col gap-1'>
                <div className='mx-auto flex hover:bg-gray-300/30 px-1.5 py-1 rounded-md items-center gap-1 text-center text-xs text-gray-600/80'>
                    <span className='text-base font-semibold inline-block'>5</span> Tweets
                </div>
                <div className='transition-all duration-500'>
                    {relatedTweets}
                </div>
            </div>

        </animated.div>
    )
}


function Tweet({ tweet, isFocused, setFocusedTweet, openOverview, setOpenOverview, zoom, currentStream, setStreams }) {

    const tweetRef = useRef();
    const contextRef = useRef();

    const [isHovered, setHovered] = useState(false);



    const { styles, attributes, update } = usePopper(tweetRef?.current, contextRef?.current, {
        placement: 'right-start',
        position: 'absolute',
        modifiers: [
            {
                name: 'offset',
                options: {
                    offset: [0, 0],
                },
            },
        ],
    });


    const easeSetFocus = (e, time = 0) => {
        // use State to manage focus
        e.preventDefault();
        e.stopPropagation();

        

        if (e.target.id === 'ENTITY') return;
        if (e.target.id === 'INSPECT') return;



        // add delay
        setTimeout(async () => {
            if (isFocused) {
                setFocusedTweet(null);
                if (openOverview) setOpenOverview(false);
                return
            }
            setFocusedTweet(tweet.id);
            if (openOverview) setOpenOverview(false);
            setTimeout(() => {
                update();
            }, 300)
            return
        }, time);
    };

    const easeSetHover = (hover, time = 500) => {

        if (!hover) {
            setTimeout(async () => {
                setHovered(false);
                return
            }, time)
        }
        setHovered(true)
    };

    const longPressedEvent = useLongPress(easeSetFocus, easeSetFocus);


    const addEntityToStream = (evt, entity) => {
        evt.preventDefault();
        evt.stopPropagation();

        setStreams(prevState => {

            const newState = prevState.map((e,i) =>{
                if (currentStream === e.name) {
                    // push seed to current stream
                    return {...e, seeds: e.seeds.concat([entity])}
                }
                return e
            })

            return newState
        })

    }


    const zoomLevel = {
        '1': { opacity: 1, zIndex: 7 },
        '0': { opacity: 1, zIndex: 6 },
        '-1': { opacity: 0.8, zIndex: 5 },
        '-2': { opacity: 0.7, zIndex: 4 },
        '-3': { opacity: 0.5, zIndex: 3 },
        '-4': { opacity: 0, zIndex: 2 }
    }
    const zoomStyle = zoomLevel[zoom];

    const relatedTweets = Array(5).fill(0).map(e => {
        return (
            <div className='card text-sm'>
                Related Tweet
            </div>
        )
    })


    const interactions = {
        "Retweets": 22,
        "Likes": 54,
        "Replies": 2,
    }

    return (
        <animated.div
            className={cn(
                'relative transition-all duration-500 ease-in-out',
                { 'active-pad': isFocused },
            )}
            onMouseEnter={(e) => easeSetHover(true)}
            onMouseLeave={(e) => easeSetHover(false)}
            
        >

            <div
                className={cn(
                    'rounded-2xl flex w-full relative transition-all duration-500 ease-in-out',
                    { 'active backdrop-blur-sm': isFocused },
                    { 'border border-purple-100': openOverview },
                    { 'shadow-content': isFocused && !openOverview },
                    { 'shadow-context': isFocused && openOverview },
                )}
                style={zoomStyle}
                onClick={e => easeSetFocus(e)}
                ref={tweetRef}
            // {...longPressedEvent}
            >
                <article
                    className={cn(
                        'flex-1 min-w-0 relative flex flex-col gap-8',
                        { 'tweet-focus': isFocused },
                        { 'tweet': !isFocused },
                    )}

                >
                    {/* Tweet Header (Author, @handle, timestamp) */}
                    <header className='flex w-full justify-between items-center'>
                        <p
                            data-cy='date'
                            className={cn(
                                'absolute -left-20 text-gray-400 text-xs block',
                                'transition-opacity duration-300 ease-in-out',
                                { "opacity-100": isHovered },
                                { "opacity-0": !isHovered },
                            )}
                        >
                        <TimeAgo datetime={tweet.created_at} locale='en' />
                        </p>
                        {/* TODO: Abstract to <Entity id = {} /> */}
                        <div className='flex items-center gap-1'>
                            <a
                                href={
                                    tweet?.author
                                        ? `https://twitter.com/${tweet.author.username}`
                                        : ''
                                }
                                target='_blank'
                                rel='noopener noreferrer'
                                className={cn(
                                    'hover:underline block text-gray-800 tracking-tight text-xl leading-5 min-w-0 shrink truncate',
                                    {
                                        'h-4 w-40 mt-1 mb-1.5 bg-gray-200/50 dark:bg-gray-700/50 animate-pulse rounded':
                                            !tweet,
                                    }
                                )}
                            >
                                {tweet?.author?.name}
                            </a>
                            {tweet?.author?.verified && (
                                <span className='block peer pl-0.5 h-5'>
                                    <VerifiedIcon className='h-5 w-5 fill-sky-500 dark:fill-current' />
                                </span>
                            )}

                            <p
                                data-cy='author'
                                className={cn(' text-gray-400 text-xs block flex-none', {
                                        'my-1.5 mx-0':
                                        tweet,
                                })}

                            >
                                {tweet?.author ? `@${tweet.author.username}` : ''}
                            </p>
                        </div>
                        
                        <EntityTag kind={"tweet"} />

                    </header>

                    {/* Tweet Content */}
                    <p
                        data-cy='text'
                        // dangerouslySetInnerHTML={{ __html: tweet?.html ?? '' }}
                        className={cn(
                            'text-lg tracking-tight leading-6 text-gray-600',
                            { 'h-12 w-full': !tweet },
                            { 'accordion-container card cursor-grab': isFocused }
                        )}

                    >
                        {/* returnfocused?: {String(isFocused)} | ID: {tweet.id} | Zoom: {zoom} */}
                        {tweet.html}

                    </p>

                    {/* Interaction Metadata (RT, Reply etc) */}
                    <div className="">
                        <div className='flex justify-between tracking-tight items-center border-t pt-6 text-xs text-gray-400/70'>

                            <div>
                                <p className='text-xs text-gray-500'> <span className='text-sm pr-1'>5</span> Stream Interactions </p>
                            </div>


                            <div className='flex gap-3'>
                                {Object.entries(interactions).map(([interaction, ct]) => {
                                    return (
                                        <p> <span className='text-sm text-gray-500 pr-1'>{ct}</span>{interaction}</p>
                                    )
                                }
                                )}
                            </div>
                        </div>
                    </div>


                    {/* Entity Buttons :: only on focus */}
                    {isFocused && (
                        <EntityPopup
                            isFocused={isFocused}
                            update={update}
                            openOverview={openOverview}
                            setOpenOverview={setOpenOverview}
                        />

                    )}

                </article>
            </div>

            {/* Context Building */}
            <div
                ref={contextRef}
                style={{ ...styles.popper, zIndex: 100 }}
                {...attributes.popper}

            >
                {isFocused && openOverview ? (
                    <ContextBuilder
                        setOpenOverview={setOpenOverview}
                        currentStream={currentStream}
                        relatedTweets={relatedTweets}
                        addEntityToStream={addEntityToStream}
                    />
                ) : () => null}
            </div>

            <div>
                {false && (
                    <Tooltip title={"Add to Stream"} className="absolute top-18 -left-8 z-10">
                    <div 
                            className=' w-8 h-8 rounded-full bg-white border'
                            onClick={(e) => addEntityToStream(e, "tweet")}
                    >
                        {""}
                    </div>
                    </Tooltip>
                )}
            </div>

        </animated.div>
    );


}

export default Tweet