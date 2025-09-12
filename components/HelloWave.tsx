import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export default function AdminHomeScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.headerText} type="title">Hello, {params?.name}</ThemedText>
        <TouchableOpacity style={styles.logoutButtonContainer}>
         
        <ThemedText  style={styles.logout} type="title">Logout</ThemedText>

        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push({
            pathname: "/manageUser",
            params: { role: "Student" }
          })}
        >
          <ThemedText style={styles.cardText} type="defaultSemiBold">Manage Students</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push({
            pathname: "/manageUser",
            params: { role: "Teacher" }
          })}
        >
          <ThemedText  style={styles.cardText} type="defaultSemiBold">Manage Teachers</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push({
            pathname: "/classmanagement"
          })}
        >
          <ThemedText  style={styles.cardText} type="defaultSemiBold">Manage Classes</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop:20,
    padding: 20,
  },
  header: {
  flexDirection:"row", 
   alignItems: "center", 
     justifyContent: "space-between",
    marginBottom: 30,
  },headerText:{
    fontSize:20
  },
  
  logoutButtonContainer:{

   paddingHorizontal:10,
      borderRadius: 5,
      backgroundColor:"#e11b23",
     },

logout:{
    color:"white",
  fontSize:16
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
    flexWrap: "wrap",
    gap: 10,
  },
  card: {
    backgroundColor: "#e11b23",
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginHorizontal: 5,
    minWidth: 120,
  },cardText:{
    color:"white"
  }
});