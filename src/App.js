import { useState, useEffect, memo, useMemo } from 'react';
import cn from 'classnames';
import { useSpring, animated } from '@react-spring/web'

import StreamAccordion from './components/StreamAccordion';
import Tweet from './components/Tweet';

import './App.css';

import sampleTweets from './components/sampleTweets';

const tweets = sampleTweets.map(e => {
  return {
    id: e.tweet.properties.id,
    author: {
      name: e.author.properties.username,
      username: e.author.properties.username,
    },
    created_at: e.tweet.properties.created_at,
    html: e.tweet.properties.text
  }
})




const Stream = ({ children, inFocus, openOverview }) => {

  // TODO: push based on amount of space on screen
  const { x } = useSpring({
    x: openOverview ? -598 : 0,
    config: { friction: 20 }
  });

  return (
    <div className='grow overflow-y-scroll flex justify-center pr-28 z-10'>
      <animated.div 
        style={{ x }} 
        className='flex flex-col pl-6 gap-12 max-w-lg'
      >
        {/* Empty Space. To Replace with Dashboard */}
        <div className='h-0'></div>
        {children}
      </animated.div>
    </div>
  )
}

const TweetMemo = memo(Tweet);


const StreamBackdrop = ({ currentStream }) => {
  const props = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { duration: 500 },
    reset: true
  })

  return (
    <animated.div
      className='fixed top-0 left-36 tracking-tighter text-gray-200/40 font-bold text-8xl z-0'
      style={props}
    >
      {currentStream || 'Tweetscape'}
    </animated.div>
  )
}

const streamIsSame = (prevStream, nextStream) => {
  return prevStream === nextStream
}

const BackdropMemo = memo(StreamBackdrop, streamIsSame)

// obj of streams: seeds
const sampleStreams = [
  { name: 'dogs', seeds: ['dogLover1', 'dogTweet1'] },
  { name: 'pottery', seeds: ['potteryMaker1', 'potteryTweet', 'fourFingerTechnique'] },
  { name: 'workout', seeds: ['buffguy1', 'gym4lyf', 'chestPressTechniqueTweet'] }
];

function App() {
  const [currentStream, setStream] = useState("dogs")
  const [openOverview, setOpenOverview] = useState(false);
  const [streams, setStreams] = useState(sampleStreams)
  
  const [focusedTweet, setFocusedTweet] = useState(null);
  const inFocus = focusedTweet !== null;

  const setSidebarZoomLevel = (focusedTweet) => {
    return (focusedTweet === null) ? "-3" : "1";
  }

  const setTweetZoomLevel = (focusedTweet, id) => {
    switch (focusedTweet) {
      case null:
        return "0";
      default:
        if (focusedTweet !== id) {
          return "-3";
        } else {
          return "0";
        }
    }
  }

  const tweetElements = tweets.map((tweet) => {

    const inFocus = focusedTweet === tweet.id;

    return (
      <TweetMemo
        key={tweet.id}
        tweet={tweet}
        isFocused={inFocus}
        setFocusedTweet={setFocusedTweet}
        zoom={setTweetZoomLevel(focusedTweet, tweet.id)}
        streams={streams}
        setStreams={setStreams}
        currentStream={currentStream}
        openOverview={openOverview}
        setOpenOverview={setOpenOverview}
      />
    )
  });

  return (

    <div className="app-bg h-screen w-screen flex gap-4">
      <div className='w-56 h-full my-28 ml-12 z-20 bg-transparent'>
        <StreamAccordion
          zoomLevel={setSidebarZoomLevel(focusedTweet)}
          inFocus={focusedTweet !== null}
          setStream={setStream}
          currentStream={currentStream}
          streams={streams}
        />
      </div>

      <Stream openOverview={openOverview}>
          {tweetElements}
      </Stream>

      <BackdropMemo currentStream={currentStream} />

    </div>


  );
}

export default App;





const StreamSidebar = ({ zoomLevel, inFocus, streams, currentStream, setStream }) => {

  const [zoom, setZoom] = useState("0");

  useEffect(() => {
    inFocus ? setZoom("1") : setZoom(zoomLevel);
  }, [zoomLevel, inFocus]);

  const setZoomStyle = (zoom) => {

    const zoomLevelToZoomStyle = {
      '1': { opacity: 1, zIndex: 6 },
      '0': { opacity: 1, zIndex: 5 },
      '-1': { opacity: 0.8, zIndex: 4 },
      '-2': { opacity: 0.5, zIndex: 3 },
      '-3': { opacity: 0.25, zIndex: 2 },
      '-4': { opacity: 0, zIndex: 1 }
    }

    return zoomLevelToZoomStyle[zoom]
  }

  return (


    <div
      className={'bg-white flex flex-col gap-2 overflow-scroll sticky top-32 w-40 h-fit p-1 mr-12 ml-28 border'}
      style={setZoomStyle(zoom)}
    //onClick={(e) => { (inFocus && e.target.tagName !== "PARAGRAPH") ? setZoom("0") : +zoom < -1 ? setZoom("1") : setZoom("-2") }}
    >
      {streams.map((e, i) => {
        const isSelected = e.name === currentStream;
        return (
          <>
            <p
              key={i}
              className={cn(
                'bg-gray-100 px-1',
                { 'hover:bg-gray-200': zoom === "1" },
                { 'bg-gray-300 grow': isSelected },
                { 'shrink': !isSelected }
              )}
              onClick={(evt) => setStream(evt.target.innerText)}
            >
              {e.name}
            </p>

            {isSelected && (
              <div className='px-2 break-all'>
                {
                  e.seeds.map((seed, i) => {
                    if (seed.length) {
                      return (<p key={i}>{seed}</p>)
                    }
                  }
                  )
                }
              </div>
            )}
          </>

        )
      }
      )}
    </div>

  )
}