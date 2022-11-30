import { useState, useEffect, memo } from 'react';
import cn from 'classnames';
import { useSpring, animated } from '@react-spring/web'

import {StreamSidebar} from './components/Sidebar';
import Tweet from './components/Tweet';

import './App.css';

import tftTweets from './components/sample';


const Stream = ({ children, openOverview }) => {

  // TODO: push based on amount of space on screen
  const { x, scale } = useSpring({
    x: openOverview ? -598 : 0,
    scale: openOverview ? 0.90 : 1,
    config: { friction: 20 }
  });

  return (
    <div className='h-screen w-screen overflow-y-scroll pl-24 flex justify-center z-10'>
      <animated.div 
        style={{ x }} 
        className='flex flex-col pl-6 gap-6 max-w-lg'
      >
        {/* Empty Space. To Replace with Dashboard */}
        <div className='h-12'/>
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
  { name: 'Tools For Thought', seeds: [{name: 'Alex Xu', kind: 'person'}, {name: 'Tana Inc.', kind : 'Organization'}] },
  { name: 'Human In The Loop', seeds: ['Andy Matuschak', 'CMU_HCI'] },
  { name: 'Biochemistry Geeks', seeds: [''] }
];

function App() {
  const [currentStream, setStream] = useState("Tools For Thought");
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
  
  const tweetElements = tftTweets.map((tweet) => {

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

    <div className="app-bg h-screen w-screen flex justify-center">
      <div className='w-56 fixed top-12 left-12 z-20'>
        <StreamSidebar
          zoomLevel={setSidebarZoomLevel(focusedTweet)}
          inFocus={focusedTweet !== null}
          setStream={setStream}
          currentStream={currentStream}
          stream={streams[0]}
          streamContent = {tweetElements.length}
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



