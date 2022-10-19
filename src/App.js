import { useState, useEffect, createElement } from 'react';
import cn from 'classnames';
import Tweet from './components/Tweet';
import './App.css';

const tweets = Array(50).fill(0).map((_, i) => ({
  id: i,
  author: {
    name: 'John Doe',
    username: 'johndoe',
  },
  created_at: '2021-01-01',
  html: 'This is a tweet',
}));

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
      className={'bg-white flex flex-col gap-2 overflow-scroll sticky top-32 w-40 h-96 p-2 mr-12 ml-28 border'}
      style={setZoomStyle(zoom)}
      onClick={(e) => { (inFocus && e.target.tagName !== "PARAGRAPH") ? setZoom("0") : +zoom < -1 ? setZoom("1") : setZoom("-2") }}
    >
      {streams.map((e, i) => {
        return (
          <>
            <p
              key={i}
              className={cn(
                'bg-slate-100 px-1',
                { 'hover:bg-slate-300': zoom === "1" },
                { 'bg-slate-600 grow': currentStream === e },
                { 'shrink': currentStream !== e }
              )}
              onClick={(evt) => setStream(evt.target.innerText)}
            >
              {e.name}
            </p>

            <div>
              {
                e.seeds.map(seed => {
                  if (seed.length) {
                    return (<p>{seed}</p>)
                  }
                }
                )
              }
            </div>
          </>

        )
      }
      )}

      Zoom Level {zoom}
    </div>
  )
}

const Feed = ({ children }) => {
  return (
    <div className='flex flex-col gap-8 w-2/5'>
      {/* Empty Space. To Replace with Dashboard */}
      <div className='h-24'></div>
      {children}
    </div>
  )
}

const Inspect = ({ children, zoomLevel }) => {

  // possibly use for sizing?

  return (
    <div
      className='flex-1 m-5 bg-white invisible'
      style={zoomLevel}
    >
      {children}
    </div>
  )
}

function App() {
  const [focusedTweet, setFocusedTweet] = useState(1);
  const [currentStream, setStream] = useState("thing building")

  // obj of streams: seeds
  const sampleStreams = [
    {name: 'crypto economics thing', seeds: ['acc1', 'acc2']},
    {name: 'thing building', seeds: ['acc3', 'acc4']},
    {name: 'test building', seeds: ['acc3', 'acc4']},
    {name: 'foo building', seeds: ['acc3', 'acc4']}
  ];

  const [streams, setStreams] = useState(sampleStreams)

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

  const setInspectZoomLevel = (focusedTweet) => {
    const zoomLevel = focusedTweet === null ? "-4" : "-1";

    const zoomToZoomStyle = {
      '0': { opacity: 1 },
      '-1': { opacity: 0.6 },
      '-2': { opacity: 0.4 },
      '-3': { opacity: 0.2 },
      '-4': { opacity: 0 }
    }
    const zoomStyle = zoomToZoomStyle[zoomLevel];

    return zoomStyle
  }

  const tweetElements = tweets.map((tweet) => {

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
      />
    )
  });



  return (
    <div className='app-bg'>
      <div className="relative min-h-screen w-screen flex">
        <StreamSidebar
          zoomLevel={setSidebarZoomLevel(focusedTweet)}
          inFocus={focusedTweet !== null}
          setStream={setStream}
          currentStream={currentStream}
          streams={streams}
          setStreams={setStreams}
        />

        <Feed className="relative">
          {tweetElements}
        </Feed>


        <Inspect

          zoomLevel={setInspectZoomLevel(focusedTweet)}>
          {"Position contextal Popout here"}
        </Inspect>
      </div>
      {/* Current Stream Backdrop */}
      <div
        className='fixed top-8 left-24 text-gray-200 font-semibold text-6xl z-0'
      >
        {currentStream || 'Stream Building UX'}
      </div>
    </div>

  );
}

export default App;

