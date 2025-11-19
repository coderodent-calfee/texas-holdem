// src/components/EngineStateTester
import React from "react";
import { View, Button, Text } from "react-native";
import { ENGINE_STATES, EngineState } from "../engine/TexasHoldemEngine";

interface Props {
  /** The current engine state from the engine/store */
  engineState: EngineState;

  /* Called when requesting to advance the engine */
  onAdvanceEngine?: (nextState: EngineState) => void;
}

export default function EngineStateTester({ engineState, onAdvanceEngine }: Props) {
  
  // Compute next state from the prop value
  const currentIndex = ENGINE_STATES.indexOf(engineState);
  const nextIndex = (currentIndex + 1) % ENGINE_STATES.length;
  const nextEngineState = ENGINE_STATES[nextIndex];

  const nextState = () => {
    onAdvanceEngine?.(nextEngineState);
  };

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>
        {capitalize(engineState)}
      </Text>

      <Button
        title={`Advance to ${capitalize(nextEngineState)}`}
        onPress={nextState}
      />
    </View>
  );
}
