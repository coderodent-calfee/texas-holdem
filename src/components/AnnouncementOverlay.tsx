import React, { useEffect, useState } from "react";

interface AnnouncementOverlayProps {
  messages: string[];
  color?: string;
  scaleDurationMs?: number;
  maxScale?: number;
}

const AnnouncementOverlay: React.FC<AnnouncementOverlayProps> = ({
  messages,
  color = "gold",
  scaleDurationMs = 1200,
  maxScale = 6,
}) => {
  const [index, setIndex] = useState(0);

 useEffect(() => {
  if (index >= messages.length) return; // stop after last message

  const timer = setTimeout(() => {
    setIndex(i => i + 1);
  }, scaleDurationMs);

  return () => clearTimeout(timer);
}, [index, messages.length, scaleDurationMs]);

  if (!messages[index]) return null;

  return (
    <>
      <style>
        {`
          .announce {
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%) scale(1);
            font-size: 64px;
            font-weight: bold;
            color: ${color};
            text-shadow:
              0 0 20px ${color},
              0 0 40px ${color};
            animation: announceScale ${scaleDurationMs}ms ease-out forwards;
            pointer-events: none;
            white-space: nowrap;
            z-index: 9999;
          }

          @keyframes announceScale {
            0% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(0.5);
            }
            100% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(${maxScale});
            }
          }
        `}
      </style>

      <div 
      key={`announce-${index}`}
      className="announce">
        {messages[index]}
      </div>
    </>
  );
};

export default AnnouncementOverlay;
