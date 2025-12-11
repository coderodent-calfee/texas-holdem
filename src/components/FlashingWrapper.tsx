import React from "react";
import { useFlashContext } from "../components/FlashContext";

interface FlashingWrapperProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

const FlashingWrapper: React.FC<FlashingWrapperProps> = ({ id, children, className }) => {
  const { flashingIds } = useFlashContext();
  const isFlashing = flashingIds.has(id);

  return (
    <>
      {/* Inline style block for flash animation */}
      <style>
      {`
        .flash-highlight {
          animation: flash 0.6s ease-out;
        }

        @keyframes flash {
          0% {
            background-color: rgba(255, 255, 0, 0.75);
            transform: scale(1.25);
            box-shadow: 0 0 25px rgba(255, 255, 0, 0.9);
          }
          50% {
            background-color: rgba(255, 255, 0, 0);
            transform: scale(1.0);
            box-shadow: 0 0 0 rgba(255, 255, 0, 0);
          }
          100% {
            background-color: rgba(255, 255, 0, 0.75);
            transform: scale(1.15);
            box-shadow: 0 0 20px rgba(255, 255, 0, 0.7);
          }
        }
      `}
      </style>
      <div
        key={isFlashing ? id + "-flash" : id}
        className={`${className ?? ""} ${isFlashing ? "flash-highlight" : ""}`}
        style={{ display: "inline-block" }}
      >
        {children}
      </div>
    </>
  );
};

export default FlashingWrapper;
