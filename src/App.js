import { useState, useEffect, memo, useMemo, useCallback, Children, useRef } from 'react';
import cn from 'classnames';
import { useSpring, animated } from '@react-spring/web'
import axios from 'axios';


import {StreamSidebar} from './components/Sidebar';
import Tweet, {Account} from './components/Tweet';

import './App.css';

import tftTweets from './components/sample';
import entities from './components/entities'
import { MdOutlineTonality } from 'react-icons/md';


import { IoAdd } from 'react-icons/io5';
import EntityTag from './components/EntityTag';


const Feed = ({ children, openOverview }) => {

  // TODO: push based on amount of space on screen
  const { x, scale } = useSpring({
    x: openOverview ? -500 : 0,
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
        {
          children
        }
      </animated.div>
    </div>
  )
}


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


const BackdropMemo = memo(StreamBackdrop, (prevProps, nextProps) => prevProps.currentStream === nextProps.currentStream)

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

    // Ensure parent counts are sum of active children
    const updateCounts = (filter) => {
      if (filter.children?.length > 1) {
        filter.count = filter.children?.filter(child => child.isVisible).reduce((acc, child) => acc + child.count, 0)
        filter.children.forEach(child => updateCounts(child))
      }
    }

    nextFilters.forEach(filter => updateCounts(filter))

    setFilters(nextFilters)

  } 

  return [streamFilters, setFilters, toggleFilters]
}



const Topic = ({ topic, addEntityToStream }) => {

  // remove quotation marks from title
  const title = topic.title.replace(/['"]+/g, '')

  return (
    <div className='px-6 py-6 tweet-bg rounded-xl relative flex justify-between items-center'>

      <div className='flex flex-col gap-6'>
        <div
          className='text-xl leading-6 font-medium text-gray-600'
          style={{ fontFamily: "GT Pressura" }}
        >
          {title}
        </div>
        <div className='text-sm text-gray-600/80'>{topic.summary}</div>
        <div className='flex gap-1 flex-wrap w-3/5'>
          {
            topic.keywords.split(",").map((e, i) => {

              return (
                <div className='text-xs text-gray-400 bg-gray-50 rounded-md px-1.5 py-0.5 cursor-pointer' onClick={() => addEntityToStream(e)}>{e}</div>
              )

            })
          }

        </div>
      </div>

      <div className='flex flex-col justify-between items-center h-full'>
        <EntityTag className="relative top-2" kind={"Topic"} />

        {true && (
            <div 
                // center icon below
                onClick={(e) => addEntityToStream(e, {name: title, kind: "Topic"})}
                className='h-8 w-8 flex cursor-pointer items-center justify-center rounded-lg bg-gray-200/40 hover:bg-gray-200'
            > 
                <IoAdd
                    className='h-5 w-5 text-gray-500 hover:text-gray-800 '
                /> 
            </div>
        )}
      </div>




    </div>
  )

}


function App() {
  const [streams, setStreams] = useState(sampleStreams)
  const [currentStream, setStream] = useState({name: "Tools For Thought", description: "A stream about the tools we shape and the tools that shape us"});
  
  
  const [streamTopics, setTopics] = useState([]);
  useEffect(() => {
    axios.get('./json/clusters.json')
      .then(res => {
        setTopics(res.data)
      })
  }, [])


  const [accounts, setAccounts] = useState([]);
  const [tweets, setTweets] = useState([]);
  const [entities, setEntities] = useState([]);

  const [focusedTweet, setFocusedTweet] = useState(null);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [openOverview, setOpenOverview] = useState(false);

  // TODO: move to useFilters
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

  // Tally Feed statistics on a change of currentStream or streamFilters 
  useEffect(() => {
    console.log('Tallying Feed Statistics');

    // time performance of tallying
    // const start = performance.now();

    const tallyContent = async () => {

      const tally = {
        Topics: {
          Count: 0
        },
        Tweets: {
          Count: 0,
          Standalone: 0,
          Replies: 0,
          Retweets: 0,
          Quotes: 0
        },
        Accounts: {
          Count: 0,
        },
        Media: {
          Count: 0,
          Images: 0,
          Videos: 0,
        },
        Entities: {
          Count: 0
        },
        
      }

      const accounts = new Set()
      var nextAccounts = []

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

        const nEntities = tweet['entities'].length
        if (nEntities > 0) {
          tally.Entities.Count += tweet['entities'].length
        }
      })

      // fetch, tally and save topics
      const getClusterCount = async () => {
        const data = await fetch('./json/clusters.json').then(res => res.json())
        const numClusters = Object.keys(data).length

        return numClusters

      }

      // set topics count
      tally.Topics.Count = await getClusterCount()
      tally.Tweets.Count = tally.Tweets.Standalone + tally.Tweets.Replies + tally.Tweets.Retweets + tally.Tweets.Quotes;
      tally.Accounts.Count = accounts.size
      tally.Media.Count = tally.Media.Images + tally.Media.Videos

      return { tally: tally, accounts: nextAccounts.filter(acc => accounts.has(acc.username)) }

    }

    const transformTally = async (tally) => {
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
      return filterState
    }

    const transform = async () => {
      const { tally, accounts } = await tallyContent()
      const filterState = await transformTally(tally)
      setFilters(filterState)
      setAccounts(accounts)
    }


    transform()

    // const end = performance.now();
    // console.log(`Transforming took ${performance.now() - end} ms`, filterState);


  }, [currentStream])



  const addEntityToStream = (evt, entity) => {
    
    // This is essentially a form submission to an action
    evt.preventDefault();
    evt.stopPropagation();


    const entityObject = {
      id: entity.id,
      name: entity.html || entity.name,
      kind: entity.kind? entity.kind : entity.html ? "Tweet" : "Account"
    }


    // For now, just update client state
    setStreams(prevState => {
        
        const newState = prevState.map((e,i) =>{


            if (currentStream.name === e.name) {
                
                // push seed to current stream
                return {...e, seeds: e.seeds.concat([entityObject])}
            }
            return e
        })

        return newState
    })

    

}

  const createTweetElements = (tweets) => {
    
    const elems = tweets.map((tweet) => {

      const inFocus = focusedTweet === tweet.id;

      return (
        <Tweet
          key={tweet.id}
          tweet={tweet}


          isFocused={inFocus}
          setFocusedTweet={setFocusedTweet}
          zoom={setTweetZoomLevel(focusedTweet, tweet.id)}
          
          addEntityToStream = {addEntityToStream}
          currentStream={currentStream}
          
          openOverview={openOverview}
          setOpenOverview={setOpenOverview}
        />
      )
    })

    return elems
  }

  const createAccountElements = (accounts) => {

      const elems = accounts.map((account, i) => {
        return (
          <Account
            key={i}
            entity={account}
            currentStream={currentStream}
            addEntityToStream = {addEntityToStream}
          />
        )
      })
  
      return elems
  }



  const createTopicElements = (topics) => {

    const topicObj = Object.values(topics)

    const elems = topicObj.map((topic, i) => {
      return (
        <Topic
          key={i}
          topic={topic}
          addEntityToStream={addEntityToStream}
        />
      )
    })

    return elems
  }


  const memoTopics = useMemo(() => createTopicElements(streamTopics), [streamTopics, openOverview, focusedTweet])
  const memoAccounts = useMemo(() => createAccountElements(accounts), [accounts, openOverview, focusedTweet])
  const memoTweets = useMemo(() => createTweetElements(tweets), [tweets, openOverview, focusedTweet])


  // can probably not use useEffect and have a single memoized function that returns the filtered tweets
  useEffect(() => {

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
        {memoTweets}
        {streamFilters[2]?.isVisible? memoAccounts : null}
        {streamFilters[0]?.isVisible? memoTopics : null}
      </Feed>

      <BackdropMemo currentStream={currentStream.name} />

    </div>


  );
}

export default App;