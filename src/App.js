import { useState, useEffect, useCallback, cloneElement, memo, useMemo, forwardRef, useRef, useLayoutEffect } from 'react';
import cn from 'classnames';
import { useSpring, animated } from '@react-spring/web'

import { queryDB } from './api/vectorRetrieval';
import { sendChat } from './api/chat';

import { Rnd } from 'react-rnd';

import debounce from 'lodash.debounce';

import { ImSpinner2 } from 'react-icons/im';
import { AiOutlineSend } from 'react-icons/ai';

import Masks from './assets/Masks.png';

import { StreamSidebar } from './components/Sidebar';
import Tweet, { Account, Card, ContentSwitch } from './components/Tweet';

import { VariableSizeGrid } from 'react-window';

import './App.css';

import tftTweets from './static/sample.json'
import { left } from '@popperjs/core';
import useMeasure from 'react-use-measure';



const Grab = ({ isResizing} ) => {

  const [isHovered, setHovered] = useState(false)

  return (
    <div
      className="bg-gray-400/20 hover:bg-gray-300/20 absolute top-6 right-4 w-6 h-6 rounded-full cursor-grab"
    >
      <div className={cn(
        "w-3 h-3 transition-all duration-200 hover:w-5 hover:h-5 rounded-full bg-white/55 hover:bg-white/95 m-auto hover:mt-0.5 mt-1.5",
          
        )}/>
    </div>
  )

}




const Feed = memo(({ content, offsetLeft, sidebarTop, isResizing }) => {

  // accepts content and renders a grid of content in a chosen order
  // manages their focus

  const [GUTTER, setGUTTER] = useState(22)
  

  const innerElementType = forwardRef(({ style, ...rest }, ref) => (
    <div
      ref={ref}
      style={{
        ...style,
        paddingTop: GUTTER,
        paddingRight: GUTTER,
      }}
      {...rest}
    />
  ));

  // add an empty object to beginnign and end of content 
  // to allow for padding
  content = [{}, ...content, {}]
  
  // Dynamically sizing rows
  const gridRef = useRef()
  const rowSizes = useRef({})



  // scrollToTop on rerender
  useEffect(() => {
    gridRef?.current?.scrollToItem({rowIndex: 0, columnIndex: 0})
  }, [content])

  
  const setRowSize =(index, size) => {

    rowSizes.current = {...rowSizes.current, [index]: size}
    gridRef?.current?.resetAfterRowIndex(index, false)
  }


  
  const getRowSize = index => rowSizes.current[index] + GUTTER || 200
  
  const nCols = 1
  const remainingWidth = window.innerWidth - offsetLeft
  const colWidth = Math.min(480, remainingWidth/nCols)

  const nRows = Math.ceil(content?.length / nCols)


  // only render if there is content to render
  if (!content) return null



  return (
    <div 
      className='z-10 pl-6'
      style={{position: 'relative', overflow: 'visible', left: offsetLeft, top: 0}}
    >

      <VariableSizeGrid

        ref = {gridRef}

        width = {remainingWidth}
        height = {window.innerHeight}
        style={{overflowX: 'visible', overflowY: 'scroll' }}

        columnCount = {nCols}
        columnWidth = {() => colWidth}

        rowCount = {nRows}
        rowHeight = {getRowSize}

        useIsScrolling


        innerElementType = {innerElementType}

        overscanRowCount = {1}

        itemData = {content}
        
      >
        {({ data, columnIndex, rowIndex, style, isScrolling }) => {

          
          const index = rowIndex * nCols + columnIndex
          const content = nCols > 1 ? data[index] : data[rowIndex]

          if (index === 0 || index === data.length - 1) {
            return (
              <div 
                style={{...style, width: colWidth, height: sidebarTop}}
              />
            )
          }

          return (
            <Card 

              content = {content} 
              
              isScrolling = {isScrolling}
              
              style = {style} 
              
              isResizing={isResizing}
              setRowSize = {setRowSize}
              getRowSize = {getRowSize}
              

              ref = {gridRef}

              index = {rowIndex}
              sidebarTop = {sidebarTop}
            />
          )}
        }    
      </VariableSizeGrid>
    </div>
  )
})


// obj of streams: seeds
const sampleStreams = [
  { name: 'Trails For Thought', seeds: [{ name: 'Alex Xu', kind: 'person' }, { name: 'Tana Inc.', kind: 'Organization' }] },
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

const Dialog = ({chatMessage, className}) => {
  // render a dialog bubble
  const { content, time, role } = chatMessage

  const isAssistant = role === 'assistant'

  return (
    <div 
      className={"flex items-baseline gap-4 " + className}

    >
      <div
        className="bg-gray-400/20 flex items-center hover:bg-gray-300/20 w-6 h-6 rounded-full cursor-grab"
      > 
        <div className='text-center text-gray-300 text-sm leading-5 mx-auto w-4 h-4 rounded-full bg-white/55'>
          {role[0]}
        </div>
      </div>

      <p 
        // wrap text to not overflow
        className={
          cn("py-2 px-1.5 w-4/5 break-all text-gray-100/80 hover:text-gray-100",
          {"": isAssistant},
          )}
      >{content}</p>
    </div>
  )
}

const MessageStream = ({chatHistory}) => {


  // measure height of message stream
  const [messageRef, bounds] = useMeasure()

  // force rerender when bounds changes
  const [_, setRerender] = useState(0)

  useLayoutEffect(() => {
    setRerender(_ => _ + 1)
  }, [bounds])

  const remainingSpace = window.innerHeight - bounds?.bottom
  
  const sessionHeader = <Dialog className = {"sticky top-0 pb-2 border-b border-gray-400 "} chatMessage = {chatHistory[1] || chatHistory[0]} key = {1} />

  // render a stream of messages
  return (
    <div 
      ref = {messageRef}
      style = {{top: -bounds?.height - 12, maxHeight: 400}}
      className="absolute overflow-scroll w-full -left-7 flex flex-col gap-2"
    >
      {sessionHeader}
      {chatHistory.slice(2, chatHistory.length).map((message, i) => <Dialog chatMessage={message} key={i + 1}/>)}
    </div>
  )

}


const ChatInput = ({ input, setInput, isLoading }) => {

  // if loading return disabled input

  let Icon = isLoading ?
    <ImSpinner2 className='w-4 h-4 mx-auto text-gray-400 hover:text-gray-300 animate-spin' />
    :
    input.length > 0 ?
      <AiOutlineSend className='w-4 h-4 mx-auto text-gray-400 hover:text-gray-300' /> :
      <div />


  return (
    <>
      <input
        placeholder='Type a message...'
        value={input}
        onChange={e => setInput(e.target.value)}
        className="w-4/5 bg-white/0 text-md text-gray-900 placeholder-gray-900/50 focus:outline-none focus:ring-0 text-md font-medium text-gray-100 leading-6 "
      />
        <button
        className="shrink rounded-sm w-8 h-8 "
      >
        {Icon}
      </button>
    </>
  )

}


const Chat = memo(({ chatHistory, isLoading, updateHistory }) => {

  const [input, setInput] = useState('')


  const submitRequest = (e) => {

    // prevent submit if input is empty
    e.preventDefault()
    
    if (input.length > 0) {
  
      updateHistory({
        time: new Date(),
        content: input,
        role: "user",
      })
  
      setInput('')
    }
    
    

  }

  // render chat history based on agent input
  return (
    <div 
      className="flex flex-col gap-4"
      style={{ width: 238 }}
    >
      <MessageStream chatHistory={chatHistory}/>
      <form 
        onSubmit={(e) => submitRequest(e)}
        className={cn(
          "flex h-12 transition-shadow duration-200 justify-between border border-white/55 bg-white/35 rounded-md pl-3 pr-2 py-2 resize-none w-full",
          { "bg-white/55 shadow-focus": input.length > 0}
        )
        }
      >
        <ChatInput isLoading={isLoading} setInput={setInput} input={input} />
      </form>
    </div>
  )
})

const tweets = tftTweets.map(tweet => {
  return {
    id: parseFloat(tweet.id),
    content: tweet,
    type: 'tweet'
  }
})

function App() {
  const [streams, setStreams] = useState(sampleStreams)
  const [currentStream, setStream] = useState({ name: "Trails For Thought", description: "A stream about the tools we shape and the tools that shape us" });

  const [focusedContent, setFocusedContent] = useState(null);
  // TODO: sorting and randomising order of Feed
  const [sampleContent, setSampleContent] = useState([])
  const [isLoading, setLoading] = useState(false)


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
    width: 256,
    height: 224,
    x: 0,
    y: 0
  })


  // Tally Feed statistics on a change of sampleContent
  useEffect(() => {

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

      sampleContent.forEach(content => {

        const tweet = content.content

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
    }

    transform()

    // const end = performance.now();
    // console.log(`Transforming took ${performance.now() - end} ms`, filterState);


  }, [sampleContent])


  const loadMemory = async (query = "what are some interface possibilites for spatial thinking?", k = 300) => {
    // setsSampleContent based on query

    setLoading(true)

    // load tweets according to a query to support a response
    const similarTweets = await queryDB(query, k)
    const tweetIDs = similarTweets.map(tweet => parseFloat(tweet.id))

    // filter all by tweetIDs retrieved
    const filteredTweets = tweets.filter(tweet => tweetIDs.includes(tweet.id))
    
    setSampleContent(filteredTweets)


    setLoading(false)


    return
  }


  const filteredContent = useMemo(() => {

    console.log("filtering content")

    return sampleContent.filter(content => {

      let tweet = content.content
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
  }, [streamFilters, sampleContent])


  const [isResizing, setIsResizing] = useState(false)

  const [chatHistory, setHistory] = useState([
    {
      time: new Date(),
      content: "This is where you can create trails of thinking to think about things that might not fit in your head",
      role: "system",
      contentIds: sampleContent.map(c => c.id)
    }])

  useEffect(() => {

    loadMemory()

  }, [])


  const createContextPrompt = useCallback(() => {

    // extract html from sampleContent
    const html = sampleContent.map(tweet => tweet.content.html)
    // remove html tags
    const text = html.map(text => text.replace(/(<([^>]+)>)/gi, ""))
    // remove urls
    const rawText = text.map(text => text.replace(/(https?:\/\/[^\s]+)/g, ""))

    // newline join rawText
    const textString = rawText.join("\n")

    const contextPrompt = "Respond with as few words as possible. You are an assistant to make sense of online discourse. Reference and optionally use as context the following tweets \n " + textString

    return contextPrompt

  }, [sampleContent])

  const updateHistory = useCallback((message) => {

    // contentIDs
    const contentIds = sampleContent.map(c => c.id)
    const newMessage = { ...message, contentIds: contentIds }

    setHistory([...chatHistory, newMessage])

  }, [sampleContent, chatHistory])


  const submitChat = async () => {

    // change chatHistory to correct schema {role: , content: }
    const typedChatHistory = chatHistory.map(chat => {
      return {
        role: chat.role,
        content: chat.content
      }
    })

    // replace first message content with context prompt
    const context = createContextPrompt()

    typedChatHistory[0].content = context
    
    setLoading(true)

    let message = await sendChat( typedChatHistory)
  

    setHistory([...chatHistory, {...message, now: new Date()}])

    setLoading(false)


    return

  }


  // Makes requests again to VDB
  useEffect(() => {
    if (chatHistory.length > 1) {

      const lastMessage = chatHistory[chatHistory.length - 1]
      const lastAgent = lastMessage.role
      const lastMessageText = lastMessage.content

      // if message is from user, make a query
      if (lastAgent === "user") {

        if (chatHistory.length === 2) {
          // TODO: a better system for processing sessions
          // load question into memory
          loadMemory(lastMessageText, 100)
          
        } 

        if (chatHistory.length > 2) {

          submitChat()

        }


      }
    }
  }, [chatHistory])

  return (
    <div className="app-bg h-screen w-screen">
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
            bottomRight: <Grab isResizing={isResizing} />
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

        onResizeStart={() => setIsResizing(true)}

        onResizeStop = {() => setIsResizing(false)}

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
          isResizing = {isResizing}

          header = {<Chat isLoading={isLoading} chatHistory={chatHistory} updateHistory={updateHistory} />}

          setStream={setStream}
          currentStream={currentStream}
          stream={streams[0]}
          streamContent={filteredContent.length}

          streamFilters={streamFilters}
          toggleFilters={toggleFilters}

          viewConfig={viewConfig}
        />
      </div>

      <Feed 
        content={filteredContent}
        filters = {streamFilters}
        offsetLeft = {size.width + 236}
        sidebarTop = {size.height}
        isResizing = {isResizing}
      />
      

      <StreamBackdrop currentStream={currentStream.name} sidebarLeft = {size.width} sidebarTop = {size.height} />

    </div>


  );
}

const StreamBackdrop = ({ currentStream, sidebarTop, sidebarLeft }) => {
  
  const bgImage = {
    backgroundImage: `url(${Masks})`,
    zIndex: 0,
    backgroundSize: "cover",
  } 

  return (
    <>
      <div
        className='absolute tracking-tighter text-gray-500/60 font-semibold z-0'
        style = {{
          top: sidebarTop - 64,
          left: sidebarLeft + 156,
          fontSize: '5rem',
          userSelect: 'none',
          zIndex: '1'
        }}
      >
        {'trails.social'}
      </div>
      <div
        style={bgImage}
        className = {"fixed top-0 left-0 w-screen h-screen z-10"}
      /> 
    </>
  )
}


export default App;