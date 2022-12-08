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


const EntityPopup = ({ isFocused, update, setOpenOverview, openOverview, entity }) => {

    const { name, description } = entity

    const entityRef = useRef();
    const previewRef = useRef();
    const [isHovered, setHovered] = useState(false);

    const inspectEntity = () => {
        setHovered(true);
        setOpenOverview(true);
    }

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
        update()
        setOpenOverview(true)
    }

    return (
        <div>
            <button
                ref={entityRef}
                id="ENTITY"
                className={cn(
                    'bg-white border border-gray-200 px-1 py-0.5 text-gray-500 text-sm tracking-tight rounded-md max-content',
                    { 'border border-gray-400': openOverview })}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onMouseMove={e => isHovered && onMouseMove(e)}
                onClick={() => handleClick()}
            >
                {name}
            </button>

            <div ref={previewRef} style={{ ...styles.popper }} {...attributes.popper}>
                {isHovered && !openOverview && (
                    // TODO 
                    <div className={"tweet relative shadow-2xl flex flex-col gap-7 w-80 max-w-80"}>
                        <div className="inline-flex w-full items-center justify-between">
                            <p className='text-xl leading-7'>{name}</p>
                            <EntityTag kind="concept" />
                        </div>

                        <p className='text-lg leading-5 text-gray-600 tracking-tight'>
                            {description}
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


const ContextBuilder = ({ setOpenOverview, currentStream, relatedTweets, addEntityToStream, entity }) => {

    // a spring that pushes the context builder up when the overview is open
    const { x } = useSpring({
        x: setOpenOverview ? 112 : 0,
    })

    const metadata = {
        "Tweets/Week": "~11",
        "Followers": 5386,
        "Following": 1663,
    }

    const interactions = ["Roote", "Housing Strategy", "woki", "supermodular.xyz"]

    return (
        <animated.div
            style={{x: 112}} 
            className='flex flex-col gap-2 w-128'
        >
            <div className='tweet flex flex-col gap-7'>
                <div className='flex items-center justify-between p-1 rounded-lg'>
                    <div className='flex gap-2 items-center'>
                        <h1 className='text-xl tracking-tight text-gray-800'>
                            {entity.name}
                        </h1>
                        <p className="text-gray-400 text-sm leading-6 tracking-tight">
                            @{entity.name}
                        </p>
                    </div>

                    <EntityTag kind="person" />
                </div>

                <div className='flex gap-4'>
                    <div className='h-28 basis-1/4 bg-gray-100 rounded-lg' />
                    <div className='basis-3/4 text-lg tracking-tight text-gray-600 rounded-lg ml-2'>
                        {entity.description}
                    </div>
                </div>

                <div className='pt-6 border-t flex'>
                    <div className='basis-1/4 text-xs tracking-tight leading-4 text-gray-500'>
                        Recent Interactions and Topics
                    </div>
                    <div className='basis-2/4  inline-flex text-center items-center gap-2 flex-wrap'>
                        {interactions.map((e,i) => {
                            return (
                                <div key={i} className='bg-gray-100 rounded-lg px-2 py-1 text-xs tracking-tight leading-4 text-gray-500'>
                                    {e}
                                </div>
                            )
                        })
                        }
                    </div>

                </div>

                <div className='flex justify-between tracking-tight items-center border-t pt-6 text-xs text-gray-400/70'>

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
                    <span className='text-base font-semibold inline-block'>5</span> Tweets
                </div>
                <div className='transition-all duration-500 flex flex-col gap-6'>
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
        position: 'fixed',
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
        "Retweets": tweet.public_metrics.retweet_count,
        "Likes": tweet.public_metrics.like_count,
        "Replies": tweet.public_metrics.reply_count,
    }

    
    const [tweetContent, setContent] = useState(null);
    useEffect(() => {

        console.log("Editing Tweet")
        // convert \\n to <br>
        const content = tweet.html.replace(/\\n/g, '<br/>');
        setContent(content);

    }, [tweet.html])


    const rhysEntity = {
        name: "Rhys Lindmark",
        description: "Co-building the Wisdom Age @roote_. Hiring http://roote.co/careers. Prev @mitDCI @medialab. @EthereumDenver co-founder."
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
                    'rounded-xl tweet flex flex-col w-full relative transition-all duration-300 ease-in-out',
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
                        'flex flex-1 items-start min-w-0 relative rounded-xl',
                    )}

                >
                    {/* Tweet Header (Author, @handle, timestamp) and Content */}
                    <header 
                        className={cn(
                            'flex flex-col w-full',
                            { 'gap-3' : !isFocused},
                            { 'gap-6' : isFocused},
                        )}
                    >
                        <div className = "flex justify-between items-baseline">

                            <div className='flex items-baseline gap-1'>
                                <a
                                    href={
                                        tweet?.author
                                            ? `https://twitter.com/${tweet.author.username}`
                                            : ''
                                    }
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    style = {{fontFamily: "GT Pressura", fontWeight: "normal"}}
                                    className={cn(
                                        'hover:underline block text-gray-800 tracking-tight text-lg leading-5 min-w-0 shrink truncate',
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
                                    className={cn('text-gray-400 text-sm block flex-none')}
                                >
                                    {tweet?.author ? `@${tweet.author.username}` : ''}
                                </p>
                            </div>



                            <p
                                data-cy='date'
                                className={cn(
                                    'text-gray-400 text-xs block pr-2',
                                    'transition-opacity duration-300 ease-in-out',
                                    { "opacity-100": isFocused },
                                    { "opacity-0": !isFocused },
                                )}
                            >
                                <TimeAgo datetime={tweet.created_at} locale='en' />
                            </p>

                        </div>
                        
                        
                        {/* Tweet Content */}
                        <p
                            data-cy='text'
                            dangerouslySetInnerHTML={{ __html: tweetContent ?? '' }}
                            className={cn(
                                'text-md tracking-tight leading-5 text-gray-600',
                                { 'h-12 w-full': !tweet },
                            )}
                        />
                    </header>

                    <EntityTag className = "relative top-2" kind={"tweet"} />
                </article>

                {/* Tagged Entity Buttons :: only on focus */}
                {isFocused && (
                        
                    <div className='flex pt-6 items-baseline text-xs text-gray-500'>

                            <div className = "pr-4">
                                <p className='text-gray-300'> Interactions <span className='text-gray-500 pr-1'>5</span> </p>
                            </div>


                            <div className='flex gap-3 text-gray-300'>
                                {Object.entries(interactions).map(([interaction, ct]) => {
                                    return (
                                        <p>{interaction}<span className='text-gray-500 pl-1'>{ct}</span></p>
                                    )
                                }
                            )}
                        </div>
                    </div>
                
                    )}


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
                        entity={rhysEntity}
                    />
                ) : () => null}
            </div>

        </animated.div>
    );


}

export default Tweet