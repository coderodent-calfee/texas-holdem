import React, { useRef, useEffect, useState } from 'react';
import { View, Animated, StyleSheet, ColorValue, StyleProp, ViewStyle, LayoutChangeEvent } from 'react-native';

/**
 * Interface for the props of the VerticalProgressBar component.
 */
interface ProgressBarProps {
  /**
   * The current numerical value of the progress.
   */
  value: number;
  /**
   * The maximum possible value the progress can reach.
   */
  maxValue: number;
  barColor: string;
  style?: StyleProp<ViewStyle>;
  vertical?: boolean;
}

// Update the component signature to use the defined interface
const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  maxValue,
  barColor,
  vertical = false,
  style = {},
}) => {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const percentage = Math.min(Math.max(value / maxValue, 0), 1);
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: percentage,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [value, percentage, animatedValue]);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ width, height });
  };

  const fillHeight = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });


  return (
    <View
      onLayout={onLayout}
      style={[styles.container, style, { justifyContent: vertical ? "flex-end" : "flex-start" }]}
    >
      <Animated.View
        style={[
          styles.fillBar,
          {
            height: vertical ? fillHeight : '100%',
            width: !vertical ? fillHeight : '100%',
            backgroundColor: barColor,
          },
        ]}
      />
    </View>
  );
};

// ... (styles remain the same as before) ...

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  fillBar: {
  },
});

export default ProgressBar;
