import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Animated, Easing, StyleSheet, TouchableOpacity, View } from "react-native";

export default function AdminHomeScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    const toValue = isMenuOpen ? 0 : 1;

    Animated.timing(animation, {
      toValue,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();

    setIsMenuOpen(!isMenuOpen);
  };

  const handleManageUsers = (role: any) => {
    setIsMenuOpen(false);
    animation.setValue(0);
    router.push({
      pathname: "/manageUser",
      params: { role },
    });
  };

    const handleManageTestMarks = () => {
      setIsMenuOpen(false);
      animation.setValue(0);
      router.push("/testManage");
    };

  const handleManageClasses = () => {
    setIsMenuOpen(false);
    animation.setValue(0);
    router.push("/classmanagement");
  };

  const handleSettings = () => {
    router.push("/setting");
  };

  const studentScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const teacherScale = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  const classScale = animation.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0, 0, 1],
  });

  const rotateInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"],
  });

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.headerText} type="title">
          Hello, {params?.name}
        </ThemedText>
        <TouchableOpacity style={styles.settingsButton} onPress={handleSettings}>
          <Ionicons name="settings" size={25} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="people" size={30} color="#4169E1" />
            <ThemedText style={styles.statNumber}>142</ThemedText>
            <ThemedText style={styles.statLabel}>Students</ThemedText>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="person" size={30} color="#32CD32" />
            <ThemedText style={styles.statNumber}>24</ThemedText>
            <ThemedText style={styles.statLabel}>Teachers</ThemedText>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="school" size={30} color="#FF8C00" />
            <ThemedText style={styles.statNumber}>18</ThemedText>
            <ThemedText style={styles.statLabel}>Classes</ThemedText>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={toggleMenu}
        activeOpacity={0.8}
      >
        <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
          <Ionicons name="add" size={32} color="white" />
        </Animated.View>
      </TouchableOpacity>

      {isMenuOpen && (
        <View style={styles.menuContainer}>
          <Animated.View
            style={[
              styles.menuItem,
              {
                transform: [{ scale: studentScale }],
                bottom: 80,
                right: 10,
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.menuButton, styles.studentButton]}
              onPress={() => handleManageUsers("Student")}
            >
              <Ionicons name="people" size={20} color="white" />
              <ThemedText style={styles.menuText}>Students</ThemedText>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            style={[
              styles.menuItem,
              {
                transform: [{ scale: teacherScale }],
                bottom: 150,
                right: 10,
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.menuButton, styles.teacherButton]}
              onPress={() => handleManageUsers("Teacher")}
            >
              <Ionicons name="person" size={20} color="white" />
              <ThemedText style={styles.menuText}>Teachers</ThemedText>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            style={[
              styles.menuItem,
              {
                transform: [{ scale: classScale }],
                bottom: 220,
                right: 10,
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.menuButton, styles.classButton]}
              onPress={handleManageClasses}
            >
              <Ionicons name="school" size={20} color="white" />
              <ThemedText style={styles.menuText}>Classes</ThemedText>
            </TouchableOpacity>

          </Animated.View>

          <Animated.View
            style={[
              styles.menuItem,
              {
                transform: [{ scale: classScale }],
                bottom: 290,
                right: 10,
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.menuButton, styles.testMakrsButton]}
              onPress={handleManageTestMarks}
            >
              <Ionicons name="school" size={20} color="white" />
              <ThemedText style={styles.menuText}>Test Marks</ThemedText>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerText: {
    fontSize: 20,
  },
  settingsButton: {
    padding: 4,
    borderRadius: 10,
    backgroundColor: "#e11b23",
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
    width: "30%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  floatingButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#e11b23",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 10,
  },
  menuContainer: {
    position: "absolute",
    right: 20,
    bottom: 20,
    zIndex: 9,
  },
  menuItem: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  menuButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  studentButton: {
    backgroundColor: "#4169E1",
  },
  teacherButton: {
    backgroundColor: "#32CD32",
  },
  classButton: {
    backgroundColor: "#FF8C00",
  },
  testMakrsButton :{
    backgroundColor: "#32CD32",
    
  },
  menuText: {
    color: "white",
    marginLeft: 8,
    fontSize: 14,
  },
});
