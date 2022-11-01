import { useState, useRef, useCallback } from 'react';
import { usePopper } from 'react-popper';
import { TimeAgo } from './TimeAgo'
import cn from 'classnames';

import { num } from '../utils'

import Profile from './Profile';

import { GrFormClose } from 'react-icons/gr';

import LikeIcon from '../icons/like.jsx'
import ReplyIcon from '../icons/reply.jsx'
import RetweetIcon from '../icons/retweet.jsx'
import ShareIcon from '../icons/share.jsx'
import VerifiedIcon from '../icons/verified.jsx'


function Interaction({
    active,
    count,
    color,
    icon,
    href,
    Interaction,
    activeIcon,
    id,
}) {

    const isActive = false;
    const iconWrapperComponent = (
        <div
            className={cn('p-1.5 mr-0.5 rounded-full transition duration-[0.2s]', {
                'group-hover:bg-red-50 group-active:bg-red-50': color === 'red',
                'group-hover:bg-blue-50 group-active:bg-blue-50': color === 'blue',
                'group-hover:bg-green-50 group-active:bg-green-50': color === 'green',
            })}
        >
            {isActive ? activeIcon : icon}
        </div>
    );
    const className = cn(
        'disabled:cursor-wait inline-flex justify-start items-center transition duration-[0.2s] group',
        {
            'hover:text-red-550 active:text-red-550': color === 'red',
            'hover:text-blue-550 active:text-blue-550': color === 'blue',
            'hover:text-green-550 active:text-green-550': color === 'green',
            'text-red-550': color === 'red' && isActive,
            'text-blue-550': color === 'blue' && isActive,
            'text-green-550': color === 'green' && isActive,
        }
    );
    const n = count !== undefined && count + (isActive ? 1 : 0);
    if (Interaction && id)
        return (
            <div
                className='grow shrink basis-0 mr-5 h-8'
                method={isActive ? 'delete' : 'post'}
            >
                <button type='submit' className={cn('w-full', className)}>
                    {iconWrapperComponent}
                    {!!n && num(n)}
                </button>
                <input
                    type='hidden'
                    name='Interaction'
                    value={isActive ? 'delete' : 'post'}
                />
            </div>
        );
    return (
        <a
            className={cn('grow shrink basis-0 h-8', className)}
            href={href}
            rel='noopener noreferrer'
            target='_blank'
        >
            {iconWrapperComponent}
            {!!n && num(n)}
        </a>
    );
}

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


const Reaction = () => {
    return (
        <div className='rounded-full bg-white w-5 h-5' />
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
                {isFocused && isHovered && !openOverview && (
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



function Tweet({ tweet, isFocused, setFocusedTweet, zoom, currentStream, setStreams }) {

    const tweetRef = useRef();
    const contextRef = useRef();

    const [openOverview, setOpenOverview] = useState(false);
    const [isHovered, setHovered] = useState(false);


    const { styles, attributes, update } = usePopper(tweetRef?.current, contextRef?.current, {
        placement: 'right-start',
        position: 'absolute',
        modifiers: [
            {
                name: 'offset',
                options: {
                    offset: [0, 10],
                },
            },
        ],
    });

    const easeSetFocus = (e, time = 0) => {
        // use State to manage focus
        e.preventDefault();
        e.stopPropagation();

        // do nothing if a entity
        console.log(e.target)

        if (e.target.id === 'ENTITY') return;
        if (e.target.id === 'INSPECT') return;


        // add delay
        setTimeout(async () => {
            if (isFocused) {
                setFocusedTweet(null);
                return
            }
            setFocusedTweet(tweet.id);
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



    return (
        <div
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
                    { 'active bg-gray-50 bg-opacity-5 backdrop-blur-sm': isFocused },
                    { 'border border-purple-100': openOverview },
                    { 'shadow-content': isFocused && !openOverview },
                    { 'shadow-context': isFocused && openOverview },
                )}
                style={zoomStyle}
                onClick={e => easeSetFocus(e)}
                ref={tweetRef}
            // {...longPressedEvent}
            >
                <article className='flex-1 m-4 min-w-0 relative '>
                    {/* Tweet Content */}
                    <p
                        data-cy='text'
                            // dangerouslySetInnerHTML={{ __html: tweet?.html ?? '' }}
                        className={cn(
                            'text-md tweet tracking-tight mb-2 text-gray-500',
                            { 'h-12 w-full': !tweet },
                            { 'accordion-container cursor-grab': isFocused }
                        )}

                    >
                        {/* returnfocused?: {String(isFocused)} | ID: {tweet.id} | Zoom: {zoom} */}
                        {tweet.html}
                        
                    </p>

                    {/* Tweet Header (Author, @handle, timestamp) */}
                    <header className='flex w-full justify-between items-center px-2'>

                        <div className='flex items-center gap-1'>
                            <div className='rounded-full bg-gray-200 w-5 h-5' />
                        <a
                            href={
                                tweet?.author
                                    ? `https://twitter.com/${tweet.author.username}`
                                    : ''
                            }
                            target='_blank'
                            rel='noopener noreferrer'
                            className={cn(
                                'hover:underline block text-gray-500 text-sm min-w-0 shrink truncate',
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

                            <span className='block pl-0.5 h-5' />
                            {false && (
                            <p
                                data-cy='author'
                                    className={cn(' text-gray-400 text-sm block flex-none', {
                                        'my-1.5 mx-0':
                                        tweet,
                                })}

                            >
                                {tweet?.author ? `@${tweet.author.username}` : ''}
                            </p>
                        )}


                        <p
                            data-cy='date'
                                className='relative text-gray-400 text-sm block flex-none'
                        >
                                {true && <TimeAgo datetime={tweet.created_at} locale='en_short' />}
                        </p>

                        </div>

                        <div
                            className={cn(
                                'flex gap-0.5',
                                { 'visible': isHovered },
                                { 'invisible': !isHovered }
                            )}
                        >
                            <Reaction intent = {"Like"} />
                            <Reaction intent = {"Comment"} />
                            <Reaction intent = {"Retweet/Quote Tweet"}/>
                            

                        </div>


                        {tweet?.author && <Profile {...tweet.author} />}
                    </header>

                    <div className=''>

                    {/* Entity Buttons :: only on focus */}
                        {isFocused && (
                            <EntityPopup
                                isFocused={isFocused}
                                update={update}
                                openOverview={openOverview}
                                setOpenOverview={setOpenOverview}
                            />

                        )}

                    {/* InterInteractions (RT, Reply etc) */}
                    {
                            isFocused &&
                            <div className='flex items-stretch min-w-0 justify-between text-gray-400'>
                            <Interaction
                                color='blue'
                                icon={<ReplyIcon />}
                                count={tweet?.reply_count}
                            />
                            <Interaction
                                color='green'
                                icon={<RetweetIcon />}
                                Interaction='retweet'
                                id={tweet?.id}
                                count={tweet ? tweet.retweet_count + tweet.quote_count : undefined}
                            />
                            <Interaction
                                color='red'
                                icon={<LikeIcon />}
                                Interaction='like'
                                id={tweet?.id.toString()}
                                count={tweet?.like_count}
                            />
                            <Interaction
                                color='blue'
                                icon={<ShareIcon />}
                            />
                        </div>
                    }
                    </div>
                </article>

            </div>

            <div
                ref={contextRef}
                style={{ ...styles.popper, zIndex: 100 }}
                {...attributes.popper}

            >
                {isFocused && openOverview && (
                    <div className='flex flex-col gap-2'>
                    <div
                            className={"card p-2 flex flex-col"}
                        >
                            <div className='flex justify-between'>
                                <h1 className='w-3/5'>
                                    German Shepherd Overview
                                </h1>
                                <GrFormClose
                                    className="w-6 h-6 cursor-pointer opacity-20 bg-gray-300 rounded-full"
                                    onClick={() => setOpenOverview(false)}
                                />
                            </div>

                        <br />
                            <button
                                onClick={(e) => addEntityToStream(e, "German Shepher")}
                                className='rounded-full bg-gray-200 p-2 '>

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

                    </div>
                )}
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

        </div>
    );


}

export default Tweet