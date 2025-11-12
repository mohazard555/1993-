import React, { useEffect, useState, useRef, useCallback } from 'react';

interface AdModalProps {
  isOpen: boolean;
  adUrl: string;
  onAdFinished: () => void;
  duration: number; // in seconds
}

// FIX: Added type declarations for the YouTube Iframe API to resolve TypeScript errors
// related to properties not existing on the `window` object.
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

// A module-level promise to ensure the YouTube API script is loaded only once.
let youtubeApiPromise: Promise<void> | null = null;
const loadYouTubeAPI = () => {
    if (!youtubeApiPromise) {
        youtubeApiPromise = new Promise((resolve) => {
            // Check if API is already there
            if (window.YT && window.YT.Player) {
                resolve();
                return;
            }
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            // This function is called by the YouTube script once it's loaded
            window.onYouTubeIframeAPIReady = () => {
                resolve();
            };
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode!.insertBefore(tag, firstScriptTag);
        });
    }
    return youtubeApiPromise;
};

const getYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;
    let videoId = null;

    try {
        // More robust parsing for standard URLs
        const urlObj = new URL(url);
        const hostname = urlObj.hostname;

        if (hostname.includes('youtube.com')) {
            videoId = urlObj.searchParams.get('v');
        } else if (hostname.includes('youtu.be')) {
            videoId = urlObj.pathname.slice(1);
        }
    } catch (e) {
        // Fallback for non-standard formats or malformed URLs
    }
    
    // If standard parsing fails, try regex patterns as a fallback
    if (!videoId) {
        const patterns = [
            /(?:v=|\/v\/|youtu\.be\/|embed\/|\/)([\w-]{11})/,
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                videoId = match[1];
                break;
            }
        }
    }

    return videoId;
};


const AdModal: React.FC<AdModalProps> = ({ isOpen, adUrl, onAdFinished, duration }) => {
  const [countdown, setCountdown] = useState(duration);
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<number | null>(null);
  const PLAYER_ID = 'youtube-ad-player';

  const stopCountdown = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startCountdown = useCallback(() => {
    stopCountdown(); // Prevent multiple intervals
    intervalRef.current = window.setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          stopCountdown();
          onAdFinished();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [stopCountdown, onAdFinished]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    
    setCountdown(duration);
    startCountdown(); // Start the countdown as soon as the modal opens for reliability

    // Safety net in case YouTube API fails or video doesn't play
    const safetyTimeout = setTimeout(() => {
      onAdFinished();
    }, (duration + 5) * 1000);

    loadYouTubeAPI().then(() => {
      // If modal closed while API was loading, do nothing.
      if (!document.getElementById(PLAYER_ID)) return;
      
      const videoId = getYouTubeVideoId(adUrl);

      if (!videoId) {
        console.error('Could not parse video ID from URL:', adUrl);
        // Countdown is already running, so no need for a fallback here
        return;
      }
      
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
      }

      playerRef.current = new window.YT.Player(PLAYER_ID, {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          rel: 0,
          playsinline: 1,
        },
        events: {
          onReady: (event: any) => {
            // Autoplay might be blocked, explicitly play.
            event.target.playVideo();
          },
          // onStateChange is no longer needed to trigger the countdown
        },
      });
    });

    // Cleanup function
    return () => {
      clearTimeout(safetyTimeout);
      stopCountdown();
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [isOpen, adUrl, duration, onAdFinished, startCountdown, stopCountdown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-6 max-w-2xl w-full text-center shadow-2xl">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">إعلان قصير</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          ستظهر نتيجتك بعد انتهاء الإعلان في غضون {countdown} ثانية...
        </p>
        <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
          {/* This div will be replaced by the YouTube iframe via the API */}
          <div id={PLAYER_ID}></div>
        </div>
      </div>
    </div>
  );
};

export default AdModal;
