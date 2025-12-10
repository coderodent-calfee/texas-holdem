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
            animation: flash 1s ease-in-out;
          }

          @keyframes flash {
            0% { background-color: rgba(255, 255, 0, 0.3); }
            50% { background-color: rgba(255, 255, 0, 0); }
            100% { background-color: rgba(255, 255, 0, 0.3); }
          }
        `}
      </style>

      <div
        className={`${className ?? ""} ${isFlashing ? "flash-highlight" : ""}`}
        style={{ display: "inline-block" }}
      >
        {children}
      </div>
    </>
  );
};

export default FlashingWrapper;
