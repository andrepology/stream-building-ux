import { useState, useEffect, memo, useMemo, useCallback, Children, useRef } from 'react';
import cn from 'classnames';
import { useSpring, animated } from '@react-spring/web'
import axios from 'axios';

import { Rnd } from 'react-rnd';

import Masks from './assets/Masks.png';

import { StreamSidebar } from './components/Sidebar';
import Tweet, { Account, Card } from './components/Tweet';

import './App.css';

import tftTweets from './components/sample';



const Feed = ({ children, openOverview }) => {

  // accepts children and returns a list of content in a chosen order
   
  return (
    <div className='h-screen w-screen overflow-y-scroll flex justify-center z-10'>
      <div
        className='flex flex-col pl-6 gap-6 max-w-lg'
      >
        {/* Empty Space. To Replace with Dashboard */}
        <div className='h-12' />
        {
          children
        }
      </div>
    </div>
  )
}


// obj of streams: seeds
const sampleStreams = [
  { name: 'Tools For Thought', seeds: [{ name: 'Alex Xu', kind: 'person' }, { name: 'Tana Inc.', kind: 'Organization' }] },
  { name: 'Human In The Loop', seeds: ['Andy Matuschak', 'CMU_HCI'] },
  { name: 'Biochemistry Geeks', seeds: [''] }
];

const useFilters = () => {
  const [streamFilters, setFilters] = useState([]);

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


function App() {
  const [streams, setStreams] = useState(sampleStreams)
  const [currentStream, setStream] = useState({ name: "Tools For Thought", description: "A stream about the tools we shape and the tools that shape us" });


  const [accounts, setAccounts] = useState([]);
  const [tweets, setTweets] = useState([]);
  

  const [focusedContent, setFocusedContent] = useState(null);
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
    scope: {
      crumbs: true,
      near: false,
      far: false
    }
  });

  const [streamFilters, setFilters, toggleFilters] = useFilters();

  const [size, setSize] = useState({
    width: 160,
    height: 224,
    x: 0,
    y: 0
  })


  // Tally Feed statistics on a change of currentStream or streamFilters 
  useEffect(() => {
    console.log('Tallying Feed Statistics');

    // time performance of tallying
    // const start = performance.now();

    const tallyContent = async () => {

      const tally = {
        Tweets: {
          Count: 0,
          Standalone: 0,
          Replies: 0,
          Retweets: 0,
          Quotes: 0
        },
        Topics: {
          Count: 0
        },
        Accounts: {
          Count: 0,
        },
        Communities: {
          Count: 0
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
      kind: entity.kind ? entity.kind : entity.html ? "Tweet" : "Account"
    }


    // For now, just update client state
    setStreams(prevState => {

      const newState = prevState.map((e, i) => {


        if (currentStream.name === e.name) {

          // push seed to current stream
          return { ...e, seeds: e.seeds.concat([entityObject]) }
        }
        return e
      })

      return newState
    })



  }

  const createTweetElements = (tweets) => {

    const elems = tweets.map((tweet) => {

      const inFocus = focusedContent === tweet.id;


      return (
        <Tweet
          key={tweet.id}
          tweet={tweet}

          sidebarTop={size.height}


          isFocused={inFocus}
          setFocusedContent={setFocusedContent}

          addEntityToStream={addEntityToStream}
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
          addEntityToStream={addEntityToStream}
        />
      )
    })

    return elems
  }

  // TODO: sorting and randomising order of Feed

  const memoAccounts = useMemo(() => createAccountElements(accounts), [accounts, openOverview, focusedContent])
  const memoTweets = useMemo(() => createTweetElements(tweets), [tweets, size])

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

      <Rnd
        minWidth={'56px'}
        minHeight={'128px'}
        bounds="window"
        className='z-50'

        dragGrid = {[56, 56]}
        default={{
          x: 0,
          y: 0,
          width: size.width,
          height: size.height,
        }}
        size = {
          {
            width: size.width,
            height: size.height,
          }
        }
        position = {
          {
            x: size.x,
            y: size.y,
          }
        }

        resizeHandleComponent={
          {
            bottomRight: <div className="bg-white/55 hover:bg-white/95 absolute top-4.5 right-4 w-6 h-6 rounded-full cursor-grab" ></div>
          }
        }

        enableResizing={
          {
            top: false,
            bottomRight: true,
            left: false,
          }
        }

        disableDragging
        
        onResize={
          (e, dir, ref, delta, pos) => {
            setSize(
              {
                width: parseInt(ref.style.width),
                height: parseInt(ref.style.height),
                x: parseInt(ref.style.x),
                y: parseInt(ref.style.y)
              }
            )
          }
        }
      />

      <div className="fixed z-40" style={{ top: size.height, left: size.width }}>
        <StreamSidebar
          inFocus={focusedContent !== null}

          setStream={setStream}
          currentStream={currentStream}
          stream={streams[0]}
          streamContent={tweets.length}

          streamFilters={streamFilters}
          toggleFilters={toggleFilters}

          viewConfig={viewConfig}
        />
      </div>

      <Feed 
        openOverview={openOverview}
        filters = {streamFilters}
      >
        {memoTweets}
        {streamFilters[2]?.isVisible? memoAccounts : null}
      </Feed>

      <BackdropMemo currentStream={currentStream.name} sidebarTop = {size.height - 64} />

    </div>


  );
}

const StreamBackdrop = ({ currentStream, sidebarTop }) => {
  
  const bgImage = {
    backgroundImage: `url(${Masks})`,
    zIndex: 0,
    backgroundSize: "cover",
  } 

  return (
    <>
      <div
        className='absolute tracking-tighter text-gray-500/40 font-semibold z-0'
        style = {{
          top: sidebarTop,
          fontSize: '5rem',
          // disable cursor selection
          userSelect: 'none',
          z: '-1'
        }}
      >
        {currentStream || 'trails.social'}
      </div>
      <div
        style={bgImage}
        className = {"fixed top-0 left-0 w-screen h-screen z-10"}
      /> 
    </>
  )
}

const BackdropMemo = memo(StreamBackdrop, (prevProps, nextProps) => prevProps.currentStream == nextProps.currentStream)

export default App;