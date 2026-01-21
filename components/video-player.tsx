"use client"

import React from 'react';

// The user has indicated they want to use the 'react-player' library.
// Please ensure it is installed in your project (e.g., `pnpm add react-player`).
import ReactPlayer from 'react-player/lazy';

interface VideoPlayerProps {
  url: string;
}

/**
 * A client component to render a video using react-player.
 * It's set to be responsive and includes standard controls.
 * @param url The URL of the video to play (e.g., a YouTube, Vimeo, or direct file link).
 */
const VideoPlayer: React.FC<VideoPlayerProps> = ({ url }) => {
  return (
    <div className="player-wrapper" style={{ position: 'relative', paddingTop: '56.25%' /* 16:9 aspect ratio */ }}>
      <ReactPlayer
        className="react-player"
        url={url}
        width="100%"
        height="100%"
        style={{ position: 'absolute', top: 0, left: 0 }}
        controls={true}
        // light is a performance optimization that shows a preview image
        // and only loads the full player on click.
        light={true} 
        playing={false} // Ensure video doesn't autoplay
      />
    </div>
  );
};

export default VideoPlayer;
