// TableLayout.tsx
import React from "react";
import { View, StyleSheet } from "react-native";

interface TableLayoutProps {
  top?: React.ReactNode;
  bottom?: React.ReactNode;
  left?: React.ReactNode;
  right?: React.ReactNode;
  center?: React.ReactNode;
}

const TableLayout: React.FC<TableLayoutProps> = ({
  top,
  bottom,
  left,
  right,
  center
}) => {
  return (

    <View style={styles.container}>


      <View style={styles.oval} />


      <View style={styles.content}>
        {/* --- Left column: left players top-to-bottom --- */}
        <View testID="LeftColumn" style={styles.left} >{React.Children.toArray(left)}</View>

        {/* --- Middle column: top row, center (pot + community), bottom row --- */}
        <View testID="MiddleColumn" style={styles.middle} >

          {/* Top row */}
          <View testID="TopPlayers" style={styles.top} >{React.Children.toArray(top)}</View>

          {/* Center: pot & community cards */}
          <View testID="Center" style={styles.center} >{React.Children.toArray(center)}</View>

          {/* Bottom row */}
          <View style={styles.bottom} >{React.Children.toArray(bottom)}</View>

        </View>

        {/* --- Right column: right players top-to-bottom --- */}
        <View testID="RightColumn" style={styles.right} >{React.Children.toArray(right)}</View>
      </View>
    </View>    
  );
};

export default TableLayout;

const styles = StyleSheet.create({
  top:    { flexDirection: "row", justifyContent: "center", width: "100%", gap: 2 },
  bottom: { flexDirection: "row", justifyContent: "center", width: "100%", paddingHorizontal: 10 },
  middle: { flex: 1, flexDirection: "column", justifyContent: "space-between", alignItems: "center" },
  left:   { flexDirection: "column", justifyContent: "center", gap: 10},
  right:  { flexDirection: "column", justifyContent: "center", gap: 10},
  center: { flexDirection: "row", justifyContent: "center", width: "100%", paddingHorizontal: 10 },
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#267032",
    padding: 20,
    flexDirection: "row", // outermost row
    justifyContent: "space-between",
    alignItems: "stretch",
  },

  oval: {
    position: "absolute",
    top: "20%",
    left: "10%",
    width: "80%",
    height: "60%",
    borderWidth: 6,
    borderColor: "#D8E0D8",
    borderRadius: 9999,
    zIndex: -1,          // works *only* inside same parent
  },

  content: {
    flexDirection: "row", // outermost row
    justifyContent: "space-between",
    alignItems: "stretch", flex: 1,
    zIndex: 1,
  },

  chipContainer: {
    flexDirection: 'row',       // stacks horizontally
    alignItems: 'flex-end',     // bottom-align all stacks
    justifyContent: 'center',   // center horizontally
    paddingHorizontal: 10,
    // remove fixed height: container grows automatically with tallest stack
  },
});

