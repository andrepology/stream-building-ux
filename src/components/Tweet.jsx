import { useState, useRef, useCallback } from 'react';
import { usePopper } from 'react-popper';
import { TimeAgo } from './TimeAgo'
import cn from 'classnames';

import { num } from '../utils'

import Profile from './Profile';

import LikeIcon from '../icons/like.jsx'
import ReplyIcon from '../icons/reply.jsx'
import RetweetIcon from '../icons/retweet.jsx'
import ShareIcon from '../icons/share.jsx'
import VerifiedIcon from '../icons/verified.jsx'
import { useEffect } from 'react';


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
            className={cn('grow shrink basis-0 mr-5 h-8', className)}
            href={href}
            rel='noopener noreferrer'
            target='_blank'
        >
            {iconWrapperComponent}
            {!!n && num(n)}
        </a>
    );
}


const EntityPopup = ({ isFocused, setOpenOverview, openOverview }) => {

    const entityRef = useRef();
    const previewRef = useRef();
    const [isHovered, setHovered] = useState(false);

    const { styles, attributes } = usePopper(entityRef.current, previewRef.current, {
        placement: 'right-start',
        position: 'fixed',
        modifiers: [
            {
                name: 'offset',
                options: {
                    offset: [0, 10],
                },
            },
        ],
    });



    const inspectEntity = () => {
        setHovered(true);
        setOpenOverview(true);
    }

    return (
        <div>
            <button
                ref={entityRef}
                className='relative'
                onMouseEnter={() => setHovered(true)}
                onClick = {() => setOpenOverview(true)}
            >
                <div 
                    id = "ENTITY"
                    className={cn(
                        'bg-purple-200 px-4 rounded-full max-content',
                        {'border border-purple-400': openOverview} )}
                >
                    Entity
                </div>
                
            </button>

            <div ref={previewRef} style={styles.popper} {...attributes.popper}>
                {isFocused && isHovered && !openOverview && (
                    <div className={"tweet"}>
                        Entity Description
                        <button
                            id = "INSPECT"
                            className="w-full rounded-full border"
                            onClick={() => setOpenOverview(true)}
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



function Tweet({ tweet, isFocused, setFocusedTweet, zoom }) {

    const tweetRef = useRef();
    const contextRef = useRef();

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
            return
        }, time);
    };
    const longPressedEvent = useLongPress(easeSetFocus, easeSetFocus);

    const [openOverview, setOpenOverview] = useState(false);

    const { styles, attributes } = usePopper(tweetRef.current, contextRef.current, {
        placement: 'right-start',
        position: 'fixed',
        modifiers: [
            {
                name: 'offset',
                options: {
                    offset: [0, 10],
                },
            },
        ],
    });


    const zoomLevel = {
        '1': { opacity: 1, zIndex: 7 },
        '0': { opacity: 1, zIndex: 6 },
        '-1': { opacity: 0.8, zIndex: 5 },
        '-2': { opacity: 0.7, zIndex: 4 },
        '-3': { opacity: 0.5, zIndex: 3 },
        '-4': { opacity: 0, zIndex: 2 }
    }
    const zoomStyle = zoomLevel[zoom];

    return (
        <div className='relative'>
            <div
                className={cn(
                    'tweet flex w-full relative',
                    { 'active': isFocused },
                    { 'border border-purple-400': openOverview }
                )}
                style={zoomStyle}
                onClick={e => easeSetFocus(e)}
                ref={tweetRef}
            // {...longPressedEvent}
            >
                {/* Profile Icon */}
                {false &&
                    <a
                        className={cn(
                            'block flex-none mr-3 w-12 h-12 rounded-full bg-gray-200/50 dark:bg-gray-700/50 overflow-hidden',
                            { 'animate-pulse': !tweet }
                        )}
                        href={
                            tweet?.author ? `https://twitter.com/${tweet.author.username}` : ''
                        }
                        rel='noopener noreferrer'
                        target='_blank'
                    >
                        {tweet?.author?.profile_image_url && (
                            <img
                                width={48}
                                height={48}
                                src={tweet.author.profile_image_url}
                                alt=''
                            />
                        )}
                    </a>
                }

                <article className='flex-1 min-w-0'>
                    {/* Tweet Header (Author, @handle, timestamp) */}
                    <header className='mb-0.5 flex items-end'>
                        <a
                            href={
                                tweet?.author
                                    ? `https://twitter.com/${tweet.author.username}`
                                    : ''
                            }
                            target='_blank'
                            rel='noopener noreferrer'
                            className={cn(
                                'peer hover:underline block font-semibold min-w-0 shrink truncate',
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
                        <span className='block peer pl-1 h-5' />
                        <a
                            data-cy='author'
                            className={cn('peer text-gray-500 block flex-none', {
                                'h-2.5 w-32 mb-1.5 ml-1.5 bg-gray-200/50 dark:bg-gray-700/50 animate-pulse rounded':
                                    !tweet,
                            })}
                            href={
                                tweet?.author
                                    ? `https://twitter.com/${tweet.author.username}`
                                    : ''
                            }
                            target='_blank'
                            rel='noopener noreferrer'
                        >
                            {tweet?.author ? `@${tweet.author.username}` : ''}
                        </a>

                        <p
                            data-cy='date'
                            className='relative text-gray-500 block flex-none'
                        >
                            {tweet && <TimeAgo datetime={tweet.created_at} locale='en_short' />}
                        </p>

                        {tweet?.author && <Profile {...tweet.author} />}
                    </header>
                    {/* Actual Tweet Content */}
                    <p
                        data-cy='text'
                        className={cn('mb-3 text-xs', {
                            'h-12 w-full bg-gray-200/50 dark:bg-gray-700/50 animate-pulse rounded':
                                !tweet,
                        })}
                    // dangerouslySetInnerHTML={{ __html: tweet?.html ?? '' }}
                    >
                        focused?: {String(isFocused)} | ID: {tweet.id} | Zoom: {zoom}
                    </p>
                    {/* Entity Buttons :: only on focus */}

                    <div>
                        {isFocused && <EntityPopup isFocused={isFocused} openOverview={openOverview} setOpenOverview={setOpenOverview} />}
                    </div>


                    {/* InterInteractions (RT, Reply etc) */}
                    {
                        false &&
                        <div className='interactions-block flex -m-1.5 items-stretch min-w-0 justify-between text-gray-500'>
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
                </article>
            </div>
            <div
                ref={contextRef}
                style={{...styles.popper, zIndex: 5}}
                {...attributes.popper}

            >
                {isFocused && openOverview && (
                    <div
                        className={"tweet"}
                        onClick={() => setOpenOverview(false)}
                    >
                        Entity Overview
                        <br/>
                        <button className='rounded-full bg-gray-200 p-2 '>
                            Add to Stream
                        </button>
                    </div>
                )}
            </div>
            <div>
                {isFocused && (
                 <div className='absolute w-10 h-10 text-lg rounded-full bg-white border justify-center align-middle text-center top-16 -left-12'>
                    {"+"}
                </div>   
                )}
            </div>

        </div>
    );


}

export default Tweet