import React from 'react';
import { View, Text } from 'react-native';

type TableProps = {
  children?: React.ReactNode;
};

const Table: React.FC<TableProps> = ({ children }) => {
  return (
    <View
      style={{
        width: 800,
        height: 400,
        backgroundColor: 'green',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text style={{ color: 'white', fontSize: 24, marginBottom: 20 }}>
        Texas Hold’em Table
      </Text>
      <View
      style={{
        display: "flex",        // enable flex
        flexDirection: "row",   // horizontal row
        gap: "12px",            // spacing between cards
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
      }}
    >

      {children}
    </View>
    </View>
  );
};

export default Table;
