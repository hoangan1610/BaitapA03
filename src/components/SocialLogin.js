// components/SocialLogin.js
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, Image, View } from 'react-native';
import { Colors } from '../constants';

const SocialLogin = ({ onFacebookPress, onGooglePress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.orText}>Hoặc đăng nhập bằng</Text>

      {/* Các nút social media */}
      <View style={styles.socialButtonsContainer}>
        <TouchableOpacity style={styles.socialButton} onPress={onFacebookPress}>
          <Image
            source={require('../assets/images/facebook.png')} // Đường dẫn ảnh Facebook
            style={styles.socialIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton} onPress={onGooglePress}>
          <Image
            source={require('../assets/images/google.png')} // Đường dẫn ảnh Google
            style={styles.socialIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 30,
  },
  orText: {
    fontSize: 14,
    color: '#999',
    marginVertical: 20,
    fontFamily: 'OpenSans-Regular',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '60%',
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  socialIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
});

export default SocialLogin;
