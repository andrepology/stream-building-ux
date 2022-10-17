import { useState, useEffect, createElement } from 'react';
import cn from 'classnames';
import Tweet from './components/Tweet';
import './App.css';

const tweets = Array(50).fill(0).map((_, i) => ({
  id: i,
  name: 'John Doe',
  username: 'johndoe',
  created_at: '2021-01-01',
  html: 'This is a tweet',
}));

const StreamSidebar = ({ zoomLevel, inFocus, stream, setStream }) => {

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

  const streams = ['crypto', 'politics', 'sports', 'tech', 'world'];

  return (
    <div
      className={'bg-white flex flex-col gap-2 overflow-y sticky top-32 w-40 h-40 p-4 mx-14 border'}
      style={setZoomStyle(zoom)}
      onClick={() => { inFocus ? setZoom("0") : +zoom < -1 ? setZoom("1") : setZoom("-2") }}
    >
      {streams.map(e => {
        return (
          <p
            className={cn(
                          'bg-slate-100',
                          {'hover:bg-slate-300': zoom === "1"},
                          {'bg-slate-600': stream === e},
                        )}
            onClick={(evt) => setStream(evt.target.innerText)}
          >
            {e}
          </p>
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

  const [focusedTweet, setFocusedTweet] = useState(null);
  const [stream, setStream] = useState("Stream Building")


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
      />
    )
  });

  const streamElements = ['crypto', 'desci', 'politics', 'sports', 'tech', 'world'].map((stream) => (<p>{stream}</p>))


  return (
    <div className='app-bg'>
      <div className="relative min-h-screen w-screen flex">
        <StreamSidebar
          zoomLevel={setSidebarZoomLevel(focusedTweet)}
          inFocus={focusedTweet !== null}
          setStream={setStream}
          stream={stream}
        >
          {streamElements}
        </StreamSidebar>

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
        {stream || 'Stream Building'}
      </div>
    </div>

  );
}

export default App;

