import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform, // Import Platform để xử lý URI
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/config';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants';
import { useNavigation } from '@react-navigation/native';

const ProfileEditScreen = () => {
  const navigation = useNavigation();
  
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [firstName, setFirstName] = useState('');  // Họ
  const [lastName, setLastName] = useState('');    // Tên
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  // Biến imageUri sẽ lưu đường dẫn ảnh từ Cloudinary sau khi upload thành công
  const [imageUri, setImageUri] = useState(null);
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  // State lưu dữ liệu gốc (để phục hồi nếu hủy chỉnh sửa)
  const [originalFirstName, setOriginalFirstName] = useState('');
  const [originalLastName, setOriginalLastName] = useState('');
  const [originalEmail, setOriginalEmail] = useState('');
  const [originalPhone, setOriginalPhone] = useState('');

  // State cho chế độ chỉnh sửa từng trường
  const [isEditingFirstName, setIsEditingFirstName] = useState(false);
  const [isEditingLastName, setIsEditingLastName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  // Cấu hình Cloudinary
  const CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/ddvixbiij/image/upload';
  const CLOUDINARY_UPLOAD_PRESET = 'garahqa';

  // Load token và thông tin người dùng khi mount
  useEffect(() => {
    const loadTokenAndUserInfo = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('access_token');
        if (!storedToken) {
          Alert.alert('Lỗi', 'Chưa có token đăng nhập');
          return;
        }
        setToken(storedToken);
        const response = await axios.get(`${BASE_URL}/api/v1/user/get-user-info`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        // Vì BE trả về đối tượng user trực tiếp
        const user = response.data;
        if (user) {
          // Lưu user id để gửi cập nhật sau này
          setUserId(user.id);
          const computedFirstName = user.first_name || '';
          const computedLastName = user.last_name || '';
          setFirstName(computedFirstName);
          setLastName(computedLastName);
          setEmail(user.email);
          setPhone(user.phone);
          setImageUri(user.image_url);

          // Lưu dữ liệu gốc để phục hồi nếu người dùng hủy chỉnh sửa
          setOriginalFirstName(computedFirstName);
          setOriginalLastName(computedLastName);
          setOriginalEmail(user.email);
          setOriginalPhone(user.phone);
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
        Alert.alert('Lỗi', 'Không thể lấy thông tin người dùng');
      }
    };

    loadTokenAndUserInfo();
  }, []);

  // Hàm xử lý chọn ảnh và upload ngay lập tức lên Cloudinary
  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Yêu cầu cấp quyền truy cập ảnh!');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    console.log('Cloudinary response:', result);

    if (!result.cancelled) {
      // Upload ngay sau khi chọn ảnh
      const uploadedUrl = await uploadImageToCloudinary(result.uri);
      if (uploadedUrl) {
        setImageUri(uploadedUrl);
      } else {
        Alert.alert('Lỗi', 'Không thể upload ảnh, vui lòng thử lại.');
      }
    }
  };

  // Hàm upload ảnh lên Cloudinary, nhận uri từ tham số
  const uploadImageToCloudinary = async (uri) => {
    if (!uri) return null;

    // Nếu trên iOS, loại bỏ tiền tố "file://"
    const newUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;

    const data = new FormData();
    data.append('file', {
      uri: newUri,
      type: 'image/jpeg',
      name: 'upload.jpg',
    });
    data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    try {
      const res = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: 'POST',
        body: data,
      });
      const result = await res.json();
      console.log('Cloudinary response:', result); // Log để debug
      if (result.secure_url) {
        return result.secure_url;
      } else {
        console.error('Upload thất bại:', result);
        return null;
      }
    } catch (error) {
      console.error('Lỗi upload ảnh:', error);
      return null;
    }
  };

  // Các hàm liên quan đến OTP và cập nhật profile (không thay đổi)
  const handleSendOTP = async () => {
    if (!token) {
      Alert.alert('Lỗi', 'Chưa có token đăng nhập');
      return;
    }
    try {
      const response = await axios.post(
        `${BASE_URL}/api/send-email-otp`,
        { email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setIsOtpSent(true);
        Alert.alert('Thông báo', 'OTP đã được gửi đến email của bạn');
      } else {
        Alert.alert('Thông báo', 'Gửi OTP không thành công');
      }
    } catch (error) {
      console.error('Lỗi gửi OTP:', error);
      Alert.alert('Lỗi', 'Lỗi gửi OTP');
    }
  };

  const handleVerifyOTP = async () => {
    if (!token) {
      Alert.alert('Lỗi', 'Chưa có token đăng nhập');
      return;
    }
    try {
      const response = await axios.post(
        `${BASE_URL}/api/verify-email-otp`,
        { email, otp },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.verified) {
        setOtpVerified(true);
        Alert.alert('Thông báo', 'Xác nhận OTP thành công');
        setOriginalEmail(email);
        setIsEditingEmail(false);
      } else {
        Alert.alert('Thông báo', 'Xác nhận OTP không thành công');
      }
    } catch (error) {
      console.error('Lỗi xác nhận OTP:', error);
      Alert.alert('Lỗi', 'Lỗi xác nhận OTP');
    }
  };

  const handleSaveProfile = async () => {
    if (!otpVerified && isEditingEmail) {
      Alert.alert('Thông báo', 'Vui lòng xác thực OTP trước khi lưu thông tin');
      return;
    }
    const payload = { 
      id: userId, 
      first_name: firstName, 
      last_name: lastName, 
      email, 
      phone, 
      imageUrl: imageUri 
    };
    console.log('Payload cập nhật profile:', payload);
    try {
      const response = await axios.put(
        `${BASE_URL}/api/v1/user/update-info`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Response từ BE:', response.data);
      if (response.data.success) {
        Alert.alert('Thông báo', 'Cập nhật profile thành công');
        setOriginalFirstName(firstName);
        setOriginalLastName(lastName);
        setOriginalEmail(email);
        setOriginalPhone(phone);
        navigation.navigate('HomePage'); 
      } else {
        Alert.alert('Thông báo', 'Cập nhật profile không thành công');
      }
    } catch (error) {
      console.error('Lỗi cập nhật profile:', error);
      Alert.alert('Lỗi', 'Lỗi cập nhật profile');
    }
  };

  const toggleEditField = (field) => {
    if (field === 'firstName') {
      if (isEditingFirstName) {
        setFirstName(originalFirstName);
        setIsEditingFirstName(false);
      } else {
        setIsEditingFirstName(true);
      }
    } else if (field === 'lastName') {
      if (isEditingLastName) {
        setLastName(originalLastName);
        setIsEditingLastName(false);
      } else {
        setIsEditingLastName(true);
      }
    } else if (field === 'email') {
      if (isEditingEmail) {
        setEmail(originalEmail);
        setIsEditingEmail(false);
        setIsOtpSent(false);
        setOtpVerified(false);
        setOtp('');
      } else {
        setIsEditingEmail(true);
      }
    } else if (field === 'phone') {
      if (isEditingPhone) {
        setPhone(originalPhone);
        setIsEditingPhone(false);
      } else {
        setIsEditingPhone(true);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chỉnh Sửa Profile</Text>

      {/* Trường Họ */}
      <View style={styles.fieldContainer}>
        <Text>Họ:</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, !isEditingFirstName && styles.disabledInput]}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Nhập họ của bạn"
            editable={isEditingFirstName}
          />
          <TouchableOpacity onPress={() => toggleEditField('firstName')}>
            <Ionicons name="pencil" size={20} color={isEditingFirstName ? Colors.primary : 'gray'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Trường Tên */}
      <View style={styles.fieldContainer}>
        <Text>Tên:</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, !isEditingLastName && styles.disabledInput]}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Nhập tên của bạn"
            editable={isEditingLastName}
          />
          <TouchableOpacity onPress={() => toggleEditField('lastName')}>
            <Ionicons name="pencil" size={20} color={isEditingLastName ? Colors.primary : 'gray'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Trường Email */}
      <View style={styles.fieldContainer}>
        <Text>Email:</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, !isEditingEmail && styles.disabledInput]}
            value={email}
            onChangeText={setEmail}
            placeholder="Nhập email của bạn"
            keyboardType="email-address"
            editable={isEditingEmail}
          />
          <TouchableOpacity onPress={() => toggleEditField('email')}>
            <Ionicons name="pencil" size={20} color={isEditingEmail ? Colors.primary : 'gray'} />
          </TouchableOpacity>
        </View>
        {isEditingEmail && (
          <>
            <Button title="Lấy mã OTP" onPress={handleSendOTP} disabled={isOtpSent} />
            {isOtpSent && (
              <>
                <Text>Nhập OTP:</Text>
                <TextInput
                  style={styles.input}
                  value={otp}
                  onChangeText={setOtp}
                  placeholder="Nhập OTP"
                  keyboardType="numeric"
                />
                <Button title="Xác thực OTP" onPress={handleVerifyOTP} />
              </>
            )}
          </>
        )}
      </View>

      {/* Trường Số điện thoại */}
      <View style={styles.fieldContainer}>
        <Text>Số điện thoại:</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, !isEditingPhone && styles.disabledInput]}
            value={phone}
            onChangeText={setPhone}
            placeholder="Nhập số điện thoại của bạn"
            keyboardType="phone-pad"
            editable={isEditingPhone}
          />
          <TouchableOpacity onPress={() => toggleEditField('phone')}>
            <Ionicons name="pencil" size={20} color={isEditingPhone ? Colors.primary : 'gray'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Ảnh đại diện */}
      <Text>Ảnh đại diện:</Text>
      <TouchableOpacity onPress={handlePickImage}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Text>Chọn ảnh đại diện</Text>
          </View>
        )}
      </TouchableOpacity>

      <Button title="Lưu Profile" onPress={handleSaveProfile} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 4,
  },
  disabledInput: {
    backgroundColor: '#eee',
    color: 'gray',
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  placeholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
});

export default ProfileEditScreen;
