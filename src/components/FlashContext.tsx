// FlashContext.tsx
import React, { createContext, useContext, useState, useCallback } from "react";

type FlashState = {
  flashingIds: Set<string>;
  triggerFlash: (id: string) => void;
};

const FlashContext = createContext<FlashState | null>(null);

export const FlashProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [flashingIds, setFlashingIds] = useState<Set<string>>(new Set());

  const triggerFlash = useCallback((id: string) => {
    setFlashingIds(prev => {
      const updated = new Set(prev);
      updated.add(id);
      return updated;
    });

    // Automatically clear after timeout
    setTimeout(() => {
      setFlashingIds(prev => {
        const updated = new Set(prev);
        updated.delete(id);
        return updated;
      });
    }, 1500);
  }, []);

  return (
    <FlashContext.Provider value={{ flashingIds, triggerFlash }}>
      {children}
    </FlashContext.Provider>
  );
};

export const useFlashContext = () => {
  const ctx = useContext(FlashContext);
  if (!ctx) throw new Error("useFlash must be used inside FlashProvider");
  return ctx;
};
