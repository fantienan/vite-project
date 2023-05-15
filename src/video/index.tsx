import React from 'react';
import videojs, { VideoJsPlayer, VideoJsPlayerOptions } from 'video.js'
import VideoJS from './videojs'

export default () => {
  const playerRef = React.useRef<VideoJsPlayer | null>(null);

  const videoJsOptions: VideoJsPlayerOptions = {
    autoplay: true,
    controls: true,
    responsive: true,
    fluid: true,
    sources: [
    {
      src: '/mp4.mp4', 
    },
    // {
    //   src: 'https://media.w3.org/2010/05/sintel/trailer.mp4', 
    //   type: 'video/mp4'
    // },
    // {
    //   src: 'http://devimages.apple.com/iphone/samples/bipbop/bipbopall.m3u8', 
    //   type: 'application/x-mpehURL'
    // },
    // {
    //   src: 'http://devimages.apple.com/iphone/samples/bipbop/bipbopall.m3u8', 
    //   type: 'application/vnd.apple.mpegurl'
    // },
    // {
    //   src: 'rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov', 
    //   type: 'video/mov'
    // }
]
  };

  const handlePlayerReady = (player: VideoJsPlayer) => {
    playerRef.current = player;

    // You can handle player events here, for example:
    player.on('waiting', () => {
      videojs.log('player is waiting');
    });

    player.on('dispose', () => {
      videojs.log('player will dispose');
    });
  };

  return (
    <>
      <div>Rest of app here</div>
      <VideoJS options={videoJsOptions} onReady={handlePlayerReady} />
      <div>Rest of app here</div>
    </>
  );
}