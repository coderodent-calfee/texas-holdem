import React from "react";

interface AnnouncementBurstProps {
  messages: string[];
  color?: string;
  durationMs?: number;      // total animation duration per message
  maxScale?: number;        // how big it gets
  staggerMs?: number;       // delay between messages
}

const AnnouncementBurst: React.FC<AnnouncementBurstProps> = ({
  messages,
  color = "#ffd700",
  durationMs = 1200,
  maxScale = 2.5,
  staggerMs = 400,
}) => {
  return (
    <>
      <style>
        {`
          .announcement-container {
            position: fixed;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: none;
            z-index: 9999;
          }

          .announcement {
            position: absolute;
            font-size: 48px;
            font-weight: bold;
            color: ${color};
            opacity: 0;
            transform: scale(0.2);
            animation: announce ${durationMs}ms ease-out forwards;
            text-shadow:
              0 0 12px ${color},
              0 0 24px ${color};
          }

          @keyframes announce {
            0% {
              opacity: 0;
              transform: scale(0.2);
            }
            20% {
              opacity: 1;
            }
            60% {
              opacity: 1;
              transform: scale(${maxScale});
            }
            100% {
              opacity: 0;
              transform: scale(${maxScale * 1.2});
            }
          }
        `}
      </style>

      <div className="announcement-container">
        {messages.map((msg, i) => (
          <div
            key={`${msg}-${i}`}
            className="announcement"
            style={{ animationDelay: `${i * staggerMs}ms` }}
          >
            {msg}
          </div>
        ))}
      </div>
    </>
  );
};

export default AnnouncementBurst;
