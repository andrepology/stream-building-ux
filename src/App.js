import { useState, useEffect, memo, useMemo } from 'react';
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
  const [streams, setStreams] = useState(sampleStreams)
  const [currentStream, setStream] = useState("Tools For Thought");
  const [streamFilters, setFilters ] = useState({});
  
  const [focusedTweet, setFocusedTweet] = useState(null);
  const [openOverview, setOpenOverview] = useState(false);

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

  // Tally Feed statistics on a change of currentStream or streamFilters
  useEffect(() => {
    console.log('Tallying Feed Statistics');

    // time performance of tallying
    const start = performance.now();
    
    const tally = {
      Tweets: {
        Count: 0,
        Standalone: 0,
        Replies: 0,
        Retweets: 0,
        Quotes: 0
      },
      Accounts : {
        Count: 0,
      }
    }

    const accounts = new Set()

    tftTweets.forEach(tweet => {

      accounts.add(tweet.author.username)

      if (tweet.standalone === true) {
        tally.Tweets.Standalone += 1;
      } else if (tweet.reply === true) {
        tally.Tweets.Replies += 1;
      } else if (tweet.rt === true) {
        tally.Tweets.Retweets += 1;
      } else if (tweet.quote === true) {
        tally.Tweets.Quotes += 1;
      }
    })

    tally.Tweets.Count = tally.Tweets.Standalone + tally.Tweets.Replies + tally.Tweets.Retweets + tally.Tweets.Quotes;
    tally.Accounts.Count = accounts.size
    
    const end = performance.now();
    
    console.log(tally, `Tallying took ${end - start} ms`);

    const filters = [
      {
          name: "Tweets",
          count: 22,
          children: [
              { name: "Standalone", count: 3 },
              { name: "Replies", count: 2 },
              { name: "Retweets", count: 12 },
              { name: "Quote Tweets", count: 5 },
              { name: "Threads", count: 3 }
          ]
      },
      {
          name: "Accounts",
          count: 5,
          children: []
      },
      {
          name: "Media",
          count: 12,
          children: [
              { name: "Images", count: 3 },
              { name: "Videos", count: 12 },
              { name: "Links", count: 4 },
              { name: "Articles", count: 2 },
          ]
      },
      {
          name: "Entities",
          count: 12,
          children: []
      },
  ]

  }, [currentStream, streamFilters])
  
  // TODO: memo according to filters and focus

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
      <div className='w-56 fixed top-6 left-6 z-20'>
        <StreamSidebar
          zoomLevel={setSidebarZoomLevel(focusedTweet)}
          inFocus={focusedTweet !== null}

          setStream={setStream}
          currentStream={currentStream}
          stream={streams[0]}
          streamContent = {tweetElements.length}

          setFilters={setFilters}
          filters = {streamFilters}

        />
      </div>

      <Stream 
        openOverview={openOverview}
        filters = {streamFilters}
      >
          {tweetElements}
      </Stream>

      <BackdropMemo currentStream={currentStream} />

    </div>


  );
}

export default App;



