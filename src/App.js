import { useState, useEffect, memo, useMemo } from 'react';
import cn from 'classnames';
import { useSpring, animated } from '@react-spring/web'

import {StreamSidebar} from './components/Sidebar';
import Tweet from './components/Tweet';

import './App.css';

import tftTweets from './components/sample';


const Feed = ({ children, openOverview }) => {

  // TODO: push based on amount of space on screen
  const { x, scale } = useSpring({
    x: openOverview ? -100 : 0,
    scale: openOverview ? 0.6 : 1,
    config: { friction: 20 }
  });

  return (
    <div className='h-screen w-screen overflow-y-scroll pl-24 flex justify-center z-10'>
      <animated.div 
        style={{ x, scale }} 
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
  return prevStream == nextStream
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

  // Tally Feed statistics on a change of currentStream or streamFiltersx 
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
      },
      Media: {
        Count: 0,
        Images: 0,
        Videos: 0,
      },
      Entities: {
        Count: 0
      }
    }

    const accounts = new Set()

    tftTweets.forEach(tweet => {

      accounts.add(tweet.author.username)

      tweet.media.forEach(media => {
        if (media.type === "photo") {
          tally.Media.Images += 1
        } else if (media.type === "video") {
          tally.Media.Videos += 1
        }
      })

      if (tweet.standalone === true) {
        tally.Tweets.Standalone += 1;
      } else if (tweet.reply === true) {
        tally.Tweets.Replies += 1;
      } else if (tweet.rt === true) {
        tally.Tweets.Retweets += 1;
      } else if (tweet.quote === true) {
        tally.Tweets.Quotes += 1;
      }

      const nEntities = tweet['entities.annotations'].length
      if (nEntities > 0) {
        tally.Entities.Count += tweet['entities.annotations'].length
      }
    })

    tally.Tweets.Count = tally.Tweets.Standalone + tally.Tweets.Replies + tally.Tweets.Retweets + tally.Tweets.Quotes;
    tally.Accounts.Count = accounts.size
    tally.Media.Count = tally.Media.Images + tally.Media.Videos
    
    const end = performance.now();
    
    console.log(`Tallying took ${end - start} ms`);

    // TODO: pls refactor this to one schema lol
    var filterState = []
    for (const k in tally) {
      filterState.push({
        name: k,
        count: tally[k].Count,
        isVisible: true,
        children: Object.entries(tally[k]).filter((k, v) => {
          if (k !== "Count") {
            return (k, v)
          }
        }).map(a => {
          return { name: a[0], count: a[1], isVisible: true }
        })
      })
    }

    console.log(`Transforming took ${performance.now() - end} ms`, filterState);

    setFilters(filterState)

  }, [currentStream])
  
  
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

  const toggleFilters = (filterName) => {
    // toggle filter with name = key visibilty
    // all children share same state

    const nextFilters = [...streamFilters]

    const toggle = (filter) => {
        if (filter.name === filterName) {
          let nextState = !filter.isVisible
          filter.isVisible = nextState
          filter.children?.forEach(child => child.isVisible = nextState)
        } else if (filter.children) {
            filter.children.forEach(child => toggle(child))
        }
    }

    nextFilters.forEach(filter => toggle(filter))

    console.log(nextFilters)

    setFilters(nextFilters)

  } 

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
          streamFilters = {streamFilters}
          toggleFilters = {toggleFilters}

        />
      </div>

      <Feed 
        openOverview={openOverview}
        filters = {streamFilters}
      >
          {tweetElements}
      </Feed>

      <BackdropMemo currentStream={currentStream} />

    </div>


  );
}

export default App;



