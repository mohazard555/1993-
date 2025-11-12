import React, { useEffect, useState, useRef } from 'react';

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

const AdModal: React.FC<AdModalProps> = ({ isOpen, adUrl, onAdFinished, duration }) => {
  const [countdown, setCountdown] = useState(duration);
  const playerRef = useRef<any>(null); // YT.Player is not easily typed without @types/youtube
  const intervalRef = useRef<number | null>(null);
  const PLAYER_ID = 'youtube-ad-player';

  const stopCountdown = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startCountdown = () => {
    stopCountdown(); // Prevent multiple intervals
    intervalRef.current = window.setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          stopCountdown();
          onAdFinished(); // This will trigger the modal to close
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (isOpen) {
      setCountdown(duration);
      
      loadYouTubeAPI().then(() => {
        // Ensure this runs only when the modal is open and the player doesn't exist yet
        if (isOpen && !playerRef.current) {
          const videoIdMatch = adUrl.match(/embed\/([^?]+)/);
          const videoId = videoIdMatch ? videoIdMatch[1] : null;

          if (!videoId) {
            console.error('Could not parse video ID from URL:', adUrl);
            // Fallback to old timer behavior if ID parsing fails
            const fallbackTimer = setTimeout(() => onAdFinished(), duration * 1000);
            return () => clearTimeout(fallbackTimer);
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
              onStateChange: (event: any) => {
                // When video starts playing, start the countdown
                if (event.data === window.YT.PlayerState.PLAYING) {
                  startCountdown();
                } else {
                  // If video is paused, ended, or buffering, stop the countdown
                  stopCountdown();
                }
              },
            },
          });
        }
      });
    }

    // Cleanup function for when component unmounts or isOpen becomes false
    return () => {
      stopCountdown();
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
      }
      playerRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

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