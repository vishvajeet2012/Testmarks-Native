import { login } from "@/redux/slice/authSlice";
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
  AdminDashboard: undefined;
};

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

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
  roleButton: string;
  roleButtonSelected: string;
  roleButtonText: string;
  roleButtonTextSelected: string;
}

function hasRole(user: any): user is { role: string } {
  return user && typeof user.role === 'string';
}

type UserRole = 'Student' | 'Teacher' | 'Admin';

export default function LoginScreen() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('Student');
  const [isCheckingToken, setIsCheckingToken] = useState<boolean>(true);
  const router = useRouter();

  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { loading, loginError, user, token, message } = useSelector((state: RootState) => state.auth);
  const colorScheme: ColorSchemeName = useColorScheme();
  const isDark: boolean = colorScheme === 'dark';
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
    roleButton: isDark ? '#2a2a2a' : '#f0f0f0',
    roleButtonSelected: '#e11b23',
    roleButtonText: isDark ? '#ffffff' : '#333333',
    roleButtonTextSelected: '#ffffff',
  };

  useEffect(() => {
    checkExistingToken();
  }, []);

  useEffect(() => {
    const checkToken = async () => {
      const savedToken = await AsyncStorage.getItem("token");
      if (savedToken) return null;
    };
    checkToken();
  }, []);

  useEffect(() => {
    if (token && user) {
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
  }, [token, user]);



  const checkExistingToken = async (): Promise<void> => {
    try {
      const savedToken = await AsyncStorage.getItem('userToken');
      if (savedToken) {
        try {
          if (hasRole(user) && user.role === 'Admin') {
            router.replace('/adminHomeScreen');
          } else if (hasRole(user) && user.role === 'Student') {
            router.replace('/studentHomeScreen');
          } else if (hasRole(user) && user.role === "Teacher") {
            router.replace("/teacherHomeScreen");
          }
        } catch (error) {
          console.log( error);
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
      const result = await dispatch(login({ 
        email, 
        password, 
        role: selectedRole 
      })).unwrap();
      
      if (result.token) {
        await AsyncStorage.setItem('userToken', result.token);
      }
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : 'Something went wrong';
    }
  };

  const handleForgotPassword = (): void => {
  router.push("/forgetPassowrd")          

  };

  const getErrorMessage = (error: string): string => {
    if (error === "Request failed with status code 401") {
      return "Email or password is incorrect";
    }
     if (error === "Request failed with status code 403") {
      return "Invalid role specified";
    }
    if (error === "Request failed with status code 404") {
      return "User not found";
    }
    if (error === "Request failed with status code 500") {
      return "Server error. Please try again later";
    }
    return error || "An unexpected error occurred";
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

      <View style={[styles.loginContainer, { backgroundColor: theme.surface }]}>
        {/* <Text style={[styles.headerText, { color: theme.text }]}>
          Welcome Back
        </Text>       */}
        
        <View style={styles.roleContainer}>
          <Text style={[styles.roleLabel, { color: theme.text }]}>Login as:</Text>
          <View style={styles.roleButtonsContainer}>
            <Pressable 
              style={[
                styles.roleButton, 
                { 
                  backgroundColor: selectedRole === 'Student' 
                    ? theme.roleButtonSelected 
                    : theme.roleButton 
                }
              ]}
              onPress={() => setSelectedRole('Student')}
            >
              <Text style={[
                styles.roleButtonText,
                { 
                  color: selectedRole === 'Student' 
                    ? theme.roleButtonTextSelected 
                    : theme.roleButtonText 
                }
              ]}>
                Student
              </Text>
            </Pressable>
            
            <Pressable 
              style={[
                styles.roleButton, 
                { 
                  backgroundColor: selectedRole === 'Teacher' 
                    ? theme.roleButtonSelected 
                    : theme.roleButton 
                }
              ]}
              onPress={() => setSelectedRole('Teacher')}
            >
              <Text style={[
                styles.roleButtonText,
                { 
                  color: selectedRole === 'Teacher' 
                    ? theme.roleButtonTextSelected 
                    : theme.roleButtonText 
                }
              ]}>
                Teacher
              </Text>
            </Pressable>
            
            <Pressable 
              style={[
                styles.roleButton, 
                { 
                  backgroundColor: selectedRole === 'Admin' 
                    ? theme.roleButtonSelected 
                    : theme.roleButton 
                }
              ]}
              onPress={() => setSelectedRole('Admin')}
            >
              <Text style={[
                styles.roleButtonText,
                { 
                  color: selectedRole === 'Admin' 
                    ? theme.roleButtonTextSelected 
                    : theme.roleButtonText 
                }
              ]}>
                Admin
              </Text>
            </Pressable>
          </View>
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
            onPress={() => router.push("/Signup")}
            disabled={loading}
          >
            <Text style={[styles.signupBtn, { color: theme.textSecondary }]}>
              Don't have an account?{" "}
              <Text style={[styles.signUpText, { color: theme.primary }]}>Sign Up</Text>
            </Text>
          </Pressable>
        </View>

        <View style={styles.forgotPasswordContainer}>
          <Pressable onPress={()=>handleForgotPassword()}>
            <Text style={[styles.forgotPasswordText, { color: theme.primary }]}>
              Forgot Password?
            </Text>
          </Pressable>
        </View>

        {loginError && (
          <View style={[
            styles.errorContainer, 
            { 
              backgroundColor: theme.errorBackground,
              borderLeftColor: theme.errorText
            }
          ]}>
            <Text style={[styles.errorText, { color: theme.errorText }]}>
              {getErrorMessage(loginError)}
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  headerContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 30,
  },
  subHeaderText: {
    fontSize: 16,
    textAlign: "center",
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
  roleContainer: {
    width: "100%",
    marginBottom: 20,
    alignItems: "center",
  },
  roleLabel: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: "500",
  },
  roleButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  roleButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: "500",
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

