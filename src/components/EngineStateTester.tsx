// src/components/EngineStateTester
import React, { useState } from "react";
import { View, Button, Text } from "react-native";

const ENGINE_STATES = ["preflop", "flop", "turn", "river", "showdown", "reveal"] as const;
export type EngineState = (typeof ENGINE_STATES)[number];

interface Props {
  /** Called when advancing the engine to the next state */
  onAdvanceEngine?: (nextState: EngineState) => void;
}

export default function EngineStateTester({ onAdvanceEngine }: Props) {
  const [engineState, setEngineState] = useState<EngineState>("preflop");

  // Compute the next state
  const currentIndex = ENGINE_STATES.indexOf(engineState);
  const nextIndex = (currentIndex + 1) % ENGINE_STATES.length;
  const nextEngineState = ENGINE_STATES[nextIndex];

  const nextState = () => {
    setEngineState(nextEngineState);        // update local display
    onAdvanceEngine?.(nextEngineState);       // call external engine function
  };

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>
        {capitalize(engineState)}
      </Text>

      <Button title={`Advance to ${capitalize(nextEngineState)}`}
       onPress={nextState} />
    </View>
  );
}
