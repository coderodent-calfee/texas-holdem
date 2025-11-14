// components/Logo.tsx
import React from "react";
import { Image, StyleSheet, View } from "react-native";

interface LogoProps {
  size?: number; // optional size in pixels, defaults to 100
}
export default function Logo({ size = 100 }: LogoProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={require("../../assets/images/rwc.png")}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  image: {
    width: "100%",  // fill the container horizontally
    height: "100%", // fill the container vertically
    objectFit: "contain", // preserves aspect ratio
  }
});
