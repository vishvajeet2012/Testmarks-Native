import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function UserSetting() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    // Prevent multiple logout attempts
    if (isLoggingOut) return;

    // Show confirmation dialog
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: performLogout
        }
      ]
    );
  };

  const performLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      // Remove token and any other user data
      await AsyncStorage.removeItem("token");
      // You might want to remove other user-related data too:
      // await AsyncStorage.removeItem("userData");
      // await AsyncStorage.removeItem("userPreferences");
      
      // Navigate to login/home screen
      router.replace("/login");
      
    } catch (error) {
      console.error("Error logging out:", error);
      
      // Show error message to user
      Alert.alert(
        "Error", 
        "Failed to logout. Please try again.",
        [{ text: "OK" }]
      );
      
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleProfile = () => {
    // Navigate to profile screen
    console.log("comming soon")
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <TouchableOpacity 
        style={styles.option} 
        onPress={handleProfile}
        activeOpacity={0.7}
      >
        <Text style={styles.optionText}>Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.option, styles.logout]} 
        onPress={handleLogout}
        disabled={isLoggingOut}
        activeOpacity={0.7}
      >
        {isLoggingOut ? (
          <View style={styles.logoutContent}>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={[styles.optionText, styles.logoutText, { marginLeft: 10 }]}>
              Logging out...
            </Text>
          </View>
        ) : (
          <Text style={[styles.optionText, styles.logoutText]}>
            Logout
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: "#F9FAFB" 
  },
  title: { 
    fontSize: 22, 
    fontWeight: "700", 
    marginBottom: 20,
    color: "#111827"
  },
  option: { 
    padding: 15, 
    borderRadius: 10, 
    backgroundColor: "#E5E7EB", 
    marginBottom: 15,
    minHeight: 50,
    justifyContent: "center"
  },
  optionText: { 
    fontSize: 16, 
    fontWeight: "500", 
    color: "#111827" 
  },
  logout: { 
    backgroundColor: "#EF4444" 
  },
  logoutText: {
    color: "#fff"
  },
  logoutContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  }
});