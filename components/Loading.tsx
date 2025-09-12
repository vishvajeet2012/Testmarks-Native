import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ActivityIndicator, StyleSheet } from "react-native";

export default function LoadingScreen() {
  return (
    <ThemedView style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#e11b23" />
      <ThemedText style={styles.loadingText}>Loading...</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
});
