import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function StudentManage() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Student Management Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
  },
});
