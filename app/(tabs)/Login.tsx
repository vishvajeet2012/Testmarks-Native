import { login } from "@/redux/slice/authSlice";
import { AppDispatch, RootState } from "@/redux/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ColorSchemeName,
  Image,
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
  // Add other screens here
};

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

// Theme interface
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
  overlayColor: string;
}

export default function LoginScreen() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isCheckingToken, setIsCheckingToken] = useState<boolean>(true);
  
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { loading, error, user, token } = useSelector((state: RootState) => state.auth);
  console.log(token, "vish")
  const colorScheme: ColorSchemeName = useColorScheme();
  const isDark: boolean = colorScheme === 'dark';
  // Dynamic theme colors
  const theme: Theme = {
    background: isDark ? '#121212' : '#fff',
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
    overlayColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.3)',
  };

  useEffect(() => {
    checkExistingToken();
  }, []);

  useEffect(() => {
    if (token) {
      try {
        navigation.replace('Home');
      } catch (error) {
        console.log('Home not found, trying other routes...', error);
      }
    }
  }, [token, navigation]);

  const checkExistingToken = async (): Promise<void> => {
    try {
      const savedToken = await AsyncStorage.getItem('userToken');
      if (savedToken) {
        try {
          navigation.replace('Home');
        } catch (error) {
          console.log('Navigation error, will handle after component loads', error);
        }
      }
    } catch (error) {
      console.error('Error checking token:', error);
    } finally {
      setIsCheckingToken(false);
    }
  };

  const handleLogin = async (): Promise<void> => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const result = await dispatch(login({ email, password })).unwrap();
      console.log('Login successful:', result);
      
      if (result.token) {
        await AsyncStorage.setItem('userToken', result.token);
      }
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : 'Something went wrong';
      Alert.alert('Login Failed', errorMessage);
    }
  };

  const handleSignup = (): void => {
    Alert.alert("Signup", "Navigate to signup screen");
    // Add navigation logic here
  };

  const handleForgotPassword = (): void => {
    Alert.alert("Forgot Password", "Navigate to forgot password screen");
  };

  if (isCheckingToken) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Checking authentication...
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

      <View style={styles.imageContainer}>
        <Image
          source={require("../../assets/images/pexels-willoworld-3768005.jpg")}
          style={styles.logo}
          resizeMode="cover" 
        />
        <View style={[styles.imageOverlay, { backgroundColor: theme.overlayColor }]} />
      </View>

      <View style={[styles.loginContainer, { backgroundColor: theme.surface }]}>
        <Text style={[styles.welcomeText, { color: theme.text }]}>
          Welcome
        </Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            autoCorrect={false}
            style={[
              styles.loginInput, 
              { 
                color: theme.text,
                backgroundColor: theme.inputBackground,
                borderColor: theme.inputBorder
              }
            ]}
            placeholderTextColor={theme.placeholder}
            placeholder="Enter your email"
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
              styles.loginInput, 
              { 
                color: theme.text,
                backgroundColor: theme.inputBackground,
                borderColor: theme.inputBorder
              }
            ]}
            placeholderTextColor={theme.placeholder}
            placeholder="Enter your password"
            secureTextEntry
            value={password}
            onChangeText={(text: string) => setPassword(text)}
            editable={!loading}
          />
        </View>

        <View style={styles.inputContainer}>
          <Pressable 
            style={[
              styles.buttonContainer, 
              { backgroundColor: loading ? theme.primaryDisabled : theme.primary }
            ]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.btn}>Login</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.signupContainer}>
          <Pressable 
            style={styles.signupButtonContainer} 
            onPress={handleSignup}
            disabled={loading}
          >
            <Text style={[styles.signupBtn, { color: theme.textSecondary }]}>
              Don't have an account?{" "}
              <Text style={[styles.signUpText, { color: theme.primary }]}>Sign Up</Text>
            </Text>
          </Pressable>
        </View>

        <View style={styles.forgotPasswordContainer}>
          <Pressable onPress={handleForgotPassword}>
            <Text style={[styles.forgotPasswordText, { color: theme.primary }]}>
              Forgot Password?
            </Text>
          </Pressable>
        </View>

        {error && (
          <View style={[
            styles.errorContainer, 
            { 
              backgroundColor: theme.errorBackground,
              borderLeftColor: theme.errorText
            }
          ]}>
            <Text style={[styles.errorText, { color: theme.errorText }]}>
              {error}
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
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  imageContainer: {
    height: "45%",
    width: "100%",
    position: "relative",
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  loginContainer: {
    flex: 1,
    width: "100%",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
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
    marginBottom: 20,
  },
  loginInput: {
    height: 55,
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
    height: 55,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  btn: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  signupContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  signupButtonContainer: {
    padding: 10,
    borderRadius: 8,
  },
  signupBtn: {
    fontSize: 14,
    textAlign: "center",
  },
  signUpText: {
    fontWeight: "bold",
  },
  forgotPasswordContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 14,
    textDecorationLine: "underline",
    fontWeight: "500",
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
