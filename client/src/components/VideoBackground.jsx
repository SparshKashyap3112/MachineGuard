import React, { useState, useEffect, useRef } from 'react';
import { Video, Film, Eye, EyeOff } from 'lucide-react';

export const VideoBackground = ({ overlayVariant = 'default', activeVideoIndex, onVideoChange }) => {
  // 0 -> machine-bg-1.mp4, 1 -> machine-bg-2.mp4
  const [currentVideo, setCurrentVideo] = useState(activeVideoIndex !== undefined ? activeVideoIndex : 0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showControls, setShowControls] = useState(false);

  const video1Ref = useRef(null);
  const video2Ref = useRef(null);

  const videoSources = [
    '/videos/machine-bg-1.mp4',
    '/videos/machine-bg-2.mp4'
  ];

  // Auto crossfade cycle every 24 seconds if not explicitly controlled
  useEffect(() => {
    if (activeVideoIndex !== undefined) {
      setCurrentVideo(activeVideoIndex);
      return;
    }

    const interval = setInterval(() => {
      setCurrentVideo((prev) => (prev === 0 ? 1 : 0));
    }, 24000);

    return () => clearInterval(interval);
  }, [activeVideoIndex]);

  // Sync play states
  useEffect(() => {
    const v1 = video1Ref.current;
    const v2 = video2Ref.current;

    if (v1 && v2) {
      if (isPlaying) {
        v1.play().catch(() => {});
        v2.play().catch(() => {});
      } else {
        v1.pause();
        v2.pause();
      }
    }
  }, [isPlaying]);

  const switchVideo = (index) => {
    setCurrentVideo(index);
    if (onVideoChange) onVideoChange(index);
  };

  // Overlay styles according to page density
  const getOverlayClass = () => {
    switch (overlayVariant) {
      case 'hero':
        // Hero section: allows more video texture through with subtle vignette
        return 'bg-gradient-to-b from-[#0B0F14]/75 via-[#0B0F14]/65 to-[#0B0F14]/90';
      case 'dense':
        // Dense dashboard / analytics pages: high readability
        return 'bg-[#0B0F14]/88';
      case 'default':
      default:
        // Balanced industrial SaaS overlay
        return 'bg-gradient-to-br from-[#0B0F14]/80 via-[#101A27]/75 to-[#0B0F14]/90';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        backgroundColor: '#0B0F14'
      }}
      aria-hidden="true"
    >
      {/* Video 1 Layer */}
      <video
        ref={video1Ref}
        src={videoSources[0]}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onError={() => setHasError(true)}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: currentVideo === 0 && !hasError ? 1 : 0,
          transition: 'opacity 2.2s cubic-bezier(0.4, 0, 0.2, 1)',
          filter: 'contrast(1.08) brightness(0.85) saturate(1.15)',
          transform: 'scale(1.02)'
        }}
      />

      {/* Video 2 Layer */}
      <video
        ref={video2Ref}
        src={videoSources[1]}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onError={() => setHasError(true)}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: currentVideo === 1 && !hasError ? 1 : 0,
          transition: 'opacity 2.2s cubic-bezier(0.4, 0, 0.2, 1)',
          filter: 'contrast(1.08) brightness(0.85) saturate(1.15)',
          transform: 'scale(1.02)'
        }}
      />

      {/* Primary Industrial Dark Translucent Overlay (60-80% opacity) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: overlayVariant === 'dense'
            ? 'linear-gradient(180deg, rgba(11, 15, 20, 0.92) 0%, rgba(16, 26, 39, 0.88) 100%)'
            : overlayVariant === 'hero'
            ? 'linear-gradient(180deg, rgba(11, 15, 20, 0.72) 0%, rgba(16, 26, 39, 0.65) 50%, rgba(11, 15, 20, 0.92) 100%)'
            : 'linear-gradient(135deg, rgba(11, 15, 20, 0.85) 0%, rgba(16, 26, 39, 0.78) 50%, rgba(11, 15, 20, 0.9) 100%)'
        }}
      />

      {/* Radial Cyan Glow & Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 85% 20%, rgba(56, 217, 245, 0.12) 0%, transparent 60%), radial-gradient(ellipse at 15% 85%, rgba(92, 225, 185, 0.08) 0%, transparent 65%)',
          pointerEvents: 'none'
        }}
      />

      {/* Cinematic Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          boxShadow: 'inset 0 0 120px rgba(0, 0, 0, 0.85)',
          pointerEvents: 'none'
        }}
      />

      {/* Subtle Floating Ambient Video Controls (Bottom-Right, pointer-events enabled on buttons only) */}
      <div
        style={{
          position: 'fixed',
          bottom: '18px',
          right: '18px',
          zIndex: 40,
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(18, 27, 38, 0.65)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          padding: '6px 12px',
          borderRadius: '9999px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
        }}
        title="Background Industrial Video Switcher"
      >
        <span style={{ fontSize: '0.72rem', color: '#A7B2C0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Film size={12} color="#38D9F5" />
          Camera Feed:
        </span>

        <button
          onClick={() => switchVideo(0)}
          style={{
            background: currentVideo === 0 ? 'rgba(56, 217, 245, 0.25)' : 'transparent',
            border: currentVideo === 0 ? '1px solid #38D9F5' : '1px solid rgba(255, 255, 255, 0.1)',
            color: currentVideo === 0 ? '#38D9F5' : '#A7B2C0',
            borderRadius: '9999px',
            padding: '2px 8px',
            fontSize: '0.7rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Cam 1
        </button>

        <button
          onClick={() => switchVideo(1)}
          style={{
            background: currentVideo === 1 ? 'rgba(56, 217, 245, 0.25)' : 'transparent',
            border: currentVideo === 1 ? '1px solid #38D9F5' : '1px solid rgba(255, 255, 255, 0.1)',
            color: currentVideo === 1 ? '#38D9F5' : '#A7B2C0',
            borderRadius: '9999px',
            padding: '2px 8px',
            fontSize: '0.7rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Cam 2
        </button>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          style={{
            background: 'transparent',
            border: 'none',
            color: isPlaying ? '#5CE1B9' : '#A7B2C0',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center'
          }}
          title={isPlaying ? 'Pause Background Video' : 'Resume Background Video'}
        >
          {isPlaying ? <Eye size={13} /> : <EyeOff size={13} />}
        </button>
      </div>
    </div>
  );
};

export default VideoBackground;
