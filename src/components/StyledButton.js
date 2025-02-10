// components/StyledButton.js
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

const StyledButton = ({ title, onPress, style }) => {
  return (
    <TouchableOpacity
      style={[styles.button, style]} // Kết hợp kiểu chung và kiểu tùy chỉnh
      onPress={onPress}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

export default StyledButton;

const styles = StyleSheet.create({
  button: {
    width: '90%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 20,
  },
  text: {
    fontSize: 15,
    letterSpacing: 1.5,
    fontFamily: 'OpenSans-SemiBold',
    color: '#fff', // Màu chữ mặc định
  },
});
