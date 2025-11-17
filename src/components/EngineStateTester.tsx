import React, { useState } from "react";
import { View, Button, Text } from "react-native";

const ENGINE_STATES = ["preflop", "flop", "turn", "river", "showdown"] as const;
export type EngineState = (typeof ENGINE_STATES)[number];

interface Props {
  /** Called when advancing the engine to the next state */
  onAdvanceEngine?: (nextState: EngineState) => void;
}

export default function EngineStateTester({ onAdvanceEngine }: Props) {
  const [engineState, setEngineState] = useState<EngineState>("preflop");

  const nextState = () => {
    const currentIndex = ENGINE_STATES.indexOf(engineState);
    const nextIndex = (currentIndex + 1) % ENGINE_STATES.length;
    const nextEngineState = ENGINE_STATES[nextIndex];

    setEngineState(nextEngineState);        // update local display
    onAdvanceEngine?.(nextEngineState);       // call external engine function
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>
        Engine State: {engineState}
      </Text>

      <Button title="Next State" onPress={nextState} />
    </View>
  );
}
