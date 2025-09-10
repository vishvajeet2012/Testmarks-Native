import { register } from "@/redux/slice/authSlice";
import { AppDispatch, RootState } from "@/redux/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ColorSchemeName,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Signup: undefined;
};

type SignupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Signup'>;

function hasRole(user: any): user is { role: string } {
  return user && typeof user.role === 'string';
}

interface Theme {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  placeholder: string;
  inputBackground: string;
  inputBorder: string;
  primary: string;
  primaryDisabled: string;
  errorBackground: string;
  errorText: string;
}

export default function SignupScreen() {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isCheckingToken, setIsCheckingToken] = useState<boolean>(true);
  
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<SignupScreenNavigationProp>();
  const { loading, registerError, user, token, message } = useSelector((state: RootState) => state.auth);
  const colorScheme: ColorSchemeName = useColorScheme();
  const isDark: boolean = colorScheme === 'dark';
  
  const theme: Theme = {
    background: isDark ? '#272424ff' : '#fff',
    surface: isDark ? '#1e1e1e' : '#fff',
    text: isDark ? '#ffffff' : '#333333',
    textSecondary: isDark ? '#b3b3b3' : '#666666',
    placeholder: isDark ? '#888888' : '#cccccc',
    inputBackground: isDark ? '#2a2a2a' : '#f9f9f9',
    inputBorder: isDark ? '#404040' : '#dddddd',
    primary: '#e11b23',
    primaryDisabled: isDark ? '#555555' : '#cccccc',
    errorBackground: isDark ? '#2d1b1b' : '#ffe6e6',
    errorText: '#d32f2f',
  };

  useEffect(() => {
    const checkExistingToken = async () => {
      try {
        const savedToken = await AsyncStorage.getItem("token");
        if (savedToken && user) {
          if (hasRole(user) && user.role === 'Admin') {
            router.replace('/adminHomeScreen');
          } else if (hasRole(user) && user.role === 'Student') {
            router.replace('/studentHomeScreen');
          } else if (hasRole(user) && user.role === "Teacher") {
            router.replace("/teacherHomeScreen");
          }
        }
      } catch (error) {
        console.log('Error checking token:', error);
      } finally {
        setIsCheckingToken(false);
      }
    };
    
    checkExistingToken();
  }, [message]);

  useEffect(() => {
    if (token) {
      try {
        if (hasRole(user) && user.role === 'Admin') {
          router.replace('/adminHomeScreen');
        } else if (hasRole(user) && user.role === 'Student') {
          router.replace('/studentHomeScreen');
        } else if (hasRole(user) && user.role === "Teacher") {
          router.replace("/teacherHomeScreen");
        }
      } catch (error) {
        console.log('Navigation error:', error);
      }
    }
  }, [token]);

  useEffect(() => {
    if (message) {
      Alert.alert('Success', message);
    }
    
  }, [message]);

  const getErrorMessage = (error: string): string => {
    if (error === "Request failed with status code 409") {
      return "User already exists with this email";
    }
    if (error === "Request failed with status code 400") {
      return "User already exists with this email";
    }
    if (error === "Request failed with status code 500") {
      return "Server error. Please try again later";
    }
    if (error.includes("email")) {
      return "Please enter a valid email address";
    }
    if (error.includes("password")) {
      return "Password must be at least 6 characters long";
    }
    return error || "An unexpected error occurred";
  };

  const handleSignup = async (): Promise<void> => {
  
    if (!name || !email || !mobileNumber || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    const mobileRegex = /^[0-9]{10,15}$/;
    if (!mobileRegex.test(mobileNumber)) {
      Alert.alert('Error', 'Please enter a valid mobile number (10-15 digits)');
      return;
    }

    try {
      const result = await dispatch(register({ 
        name, 
        email, 
        mobileNumber, 
        password 
      })).unwrap();

      if (result?.token) {
        await AsyncStorage.setItem('userToken', result.token);
      }
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : 'Something went wrong';
    }
  };

  const handleLoginRedirect = (): void => {
    router.push('/login');
  };

  if (isCheckingToken) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[{ color: theme.text, marginTop: 16, fontSize: 16 }]}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar 
        barStyle={isDark ? "light-content" : "dark-content"} 
        backgroundColor={isDark ? "#000" : "#fff"} 
      />

      <View style={[styles.signupContainer, { backgroundColor: theme.surface }]}>
        <Text style={[styles.welcomeText, { color: theme.text }]}>
          Create Account
        </Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            autoCorrect={false}
            style={[
              styles.signupInput, 
              { 
                color: theme.text,
                backgroundColor: theme.inputBackground,
                borderColor: theme.inputBorder
              }
            ]}
            placeholderTextColor={theme.placeholder}
            placeholder="Full Name"
            value={name}
            onChangeText={(text: string) => setName(text)}
            autoCapitalize="words"
            editable={!loading}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <TextInput
            autoCorrect={false}
            style={[
              styles.signupInput, 
              { 
                color: theme.text,
                backgroundColor: theme.inputBackground,
                borderColor: theme.inputBorder
              }
            ]}
            placeholderTextColor={theme.placeholder}
            placeholder="Email Address"
            value={email}
            onChangeText={(text: string) => setEmail(text)}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <TextInput
            autoCorrect={false}
            style={[
              styles.signupInput, 
              { 
                color: theme.text,
                backgroundColor: theme.inputBackground,
                borderColor: theme.inputBorder
              }
            ]}
            placeholderTextColor={theme.placeholder}
            placeholder="Mobile Number"
            value={mobileNumber}
            onChangeText={(text: string) => setMobileNumber(text)}
            keyboardType="phone-pad"
            editable={!loading}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <TextInput
            autoCorrect={false}
            style={[
              styles.signupInput, 
              { 
                color: theme.text,
                backgroundColor: theme.inputBackground,
                borderColor: theme.inputBorder
              }
            ]}
            placeholderTextColor={theme.placeholder}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={(text: string) => setPassword(text)}
            editable={!loading}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <TextInput
            autoCorrect={false}
            style={[
              styles.signupInput, 
              { 
                color: theme.text,
                backgroundColor: theme.inputBackground,
                borderColor: theme.inputBorder
              }
            ]}
            placeholderTextColor={theme.placeholder}
            placeholder="Confirm Password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={(text: string) => setConfirmPassword(text)}
            editable={!loading}
          />
        </View>

        <View style={styles.inputContainer}>
          <Pressable 
            style={[
              styles.buttonContainer, 
              { backgroundColor: loading ? theme.primaryDisabled : theme.primary }
            ]} 
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.btn}>Sign Up</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.loginRedirectContainer}>
          <Pressable 
            style={styles.loginRedirectButtonContainer} 
            onPress={handleLoginRedirect}
            disabled={loading}
          >
            <Text style={[styles.loginRedirectBtn, { color: theme.textSecondary }]}>
              Already have an account?{" "}
              <Text style={[styles.loginText, { color: theme.primary }]}>Login</Text>
            </Text>
          </Pressable>
        </View>

        {registerError && (
          <View style={[
            styles.errorContainer, 
            { 
              backgroundColor: theme.errorBackground,
              borderLeftColor: theme.errorText
            }
          ]}>
            <Text style={[styles.errorText, { color: theme.errorText }]}>
              {getErrorMessage(registerError)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    justifyContent: 'center',
  },
  signupContainer: {
    width: "90%",
    alignSelf: "center",
    borderRadius: 30,
    padding: 25,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 15,
  },
  signupInput: {
    height: 50,
    borderWidth: 1.5,
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  buttonContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
    height: 50,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginTop: 10,
  },
  btn: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginRedirectContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  loginRedirectButtonContainer: {
    padding: 10,
    borderRadius: 8,
  },
  loginRedirectBtn: {
    fontSize: 14,
    textAlign: "center",
  },
  loginText: {
    fontWeight: "bold",
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    width: "100%",
    borderLeftWidth: 4,
  },
  errorText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
  },
});