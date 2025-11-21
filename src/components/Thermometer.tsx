import React, { useRef, useEffect } from 'react';
import { View, Animated, StyleSheet, ColorValue } from 'react-native';

/**
 * Interface for the props of the VerticalProgressBar component.
 */
interface VerticalProgressBarProps {
  /**
   * The current numerical value of the progress.
   */
  value: number;
  /**
   * The maximum possible value the progress can reach.
   */
  maxValue: number;
  barColor: string;
  /**
   * The total height of the container in pixels.
   */
  containerHeight: number;
  /**
   * The width of the container in pixels.
   */
  containerWidth: number;
}

// Update the component signature to use the defined interface
const VerticalProgressBar: React.FC<VerticalProgressBarProps> = ({
  value,
  maxValue,
  barColor,
  containerHeight,
  containerWidth,
}) => {
  // ... (rest of the component logic remains the same as before) ...

  const percentage = Math.min(Math.max(value / maxValue, 0), 1);
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: percentage,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [value, percentage, animatedValue]);
  const fillHeight = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });


  return (
    <View style={[styles.container, { height: containerHeight, width: containerWidth }]}>
      <Animated.View
        style={[
          styles.fillBar,
          {
            height: fillHeight,
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
    justifyContent: 'flex-end',
  },
  fillBar: {
    width: '100%',
  },
});

export default VerticalProgressBar;
