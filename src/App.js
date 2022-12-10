import { useState, useEffect, memo, useMemo, useCallback } from 'react';
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
      className='fixed top-4 left-36 tracking-tighter text-gray-200/40 font-bold text-8xl z-0'
      style={props}
    >
      {currentStream || 'Tweetscape'}
    </animated.div>
  )
}

const streamIsSame = (prevStream, nextStream) => {
  return prevStream == nextStream
}

const BackdropMemo = memo(StreamBackdrop)

// obj of streams: seeds
const sampleStreams = [
  { name: 'Tools For Thought', seeds: [{name: 'Alex Xu', kind: 'person'}, {name: 'Tana Inc.', kind : 'Organization'}] },
  { name: 'Human In The Loop', seeds: ['Andy Matuschak', 'CMU_HCI'] },
  { name: 'Biochemistry Geeks', seeds: [''] }
];

const useFilters = () => {
  const [streamFilters, setFilters ] = useState([]);
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

    // Ensure parent counts are sum of children
    const updateCounts = (filter) => {
      if (filter.children?.length > 1) {
        filter.count = filter.children?.filter(child => child.isVisible).reduce((acc, child) => acc + child.count, 0)
        filter.children.forEach(child => updateCounts(child))
      }
    }

    nextFilters.forEach(filter => updateCounts(filter))

    console.log(nextFilters)

    setFilters(nextFilters)

  } 

  return [streamFilters, setFilters, toggleFilters]
}

function App() {
  const [streams, setStreams] = useState(sampleStreams)
  const [currentStream, setStream] = useState({name: "Tools For Thought", description: "A stream about the tools we shape and the tools that shape us"});

  
  const [accounts, setAccounts] = useState([]);
  const [tweets, setTweets] = useState([]);
  const [entities, setEntities] = useState([]);

  const [focusedTweet, setFocusedTweet] = useState(null);
  const [openOverview, setOpenOverview] = useState(false);

  const [viewConfig, setViewConfig] = useState({
    zoom: {
      topic: true,
      tweet: false
    },
    limit: {
      day: true,
      week: false,
      month: false,
    },
    sort: {
      new: true,
      relevant: false
    },
    recommendations: true
  });

  const [streamFilters, setFilters, toggleFilters] = useFilters();

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
    // console.log('Tallying Feed Statistics');

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
    const nextAccounts = []

    tftTweets.forEach(tweet => {

      accounts.add(tweet.author.username)
      nextAccounts.push(tweet.author)

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

    setAccounts(nextAccounts.filter(acc => acc.username in accounts))

    tally.Tweets.Count = tally.Tweets.Standalone + tally.Tweets.Replies + tally.Tweets.Retweets + tally.Tweets.Quotes;
    tally.Accounts.Count = accounts.size
    tally.Media.Count = tally.Media.Images + tally.Media.Videos
    
    const end = performance.now();
    
    // console.log(`Tallying took ${end - start} ms`);

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

    // console.log(`Transforming took ${performance.now() - end} ms`, filterState);

    setFilters(filterState)



  }, [currentStream])


  const createTweetElements = (tweets) => {

    console.log("rendering tweets")
    
    const elems = tweets.map((tweet) => {

      const inFocus = focusedTweet === tweet.id;

      return (
        <Tweet
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
    })

    return elems
  }

  useEffect(() => {
    // console.log("Computing Tweets to Render based on Filters")

    const start = performance.now();


    console.log("Filtering Tweets with Stream Filters", streamFilters)

    const nextTweets = tftTweets.filter(tweet => {

      // check if tweet meets filter criteria
      
      return streamFilters.some(filter => {
        if (filter.name === "Tweets") {

          if (!filter.isVisible) {
            return false
          }

          return filter.children.filter(child => child.isVisible).some(child => {
            if (child.name === "Standalone") {
              return tweet.standalone
            } else if (child.name === "Replies") {
              return tweet.reply
            } else if (child.name === "Retweets") {
              return tweet.rt
            } else if (child.name === "Quotes") {
              return tweet.quote
            }
          })
        }
      
      })
    })

    setTweets(nextTweets)

    const end = performance.now();

    console.log(`Filtering took ${end - start} ms`);


  }, [streamFilters])

  

  return (

    <div className="app-bg h-screen w-screen flex justify-center">
      <div className='w-56 fixed top-20 left-20 z-20'>
        <StreamSidebar
          zoomLevel={setSidebarZoomLevel(focusedTweet)}
          inFocus={focusedTweet !== null}

          setStream={setStream}
          currentStream={currentStream}
          stream={streams[0]}
          streamContent={tweets.length}

          streamFilters = {streamFilters}
          toggleFilters = {toggleFilters}

          viewConfig = {viewConfig}

        />
      </div>

      <Feed 
        openOverview={openOverview}
        filters = {streamFilters}
      >
        {createTweetElements(tweets)}
      </Feed>

      <BackdropMemo currentStream={currentStream.name} />

    </div>


  );
}

export default App;