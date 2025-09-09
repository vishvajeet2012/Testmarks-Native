import LoadingScreen from "@/components/Loading";
import { AppDispatch, RootState } from "@/redux/store";
import { getRolebaseuser } from "@/thunk/auth/user";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

// Updated User interface to match the actual data structure from API
interface User {
  user_id: number;
  name: string;
  email: string;
  mobile_number: string | null;
  role: string; // Changed from specific union type to string to match API response
  status: string; // Changed from specific union type to string
  profile_picture: string | null;
  created_at: string;
  updated_at: string;
  class?: string;
  subjectTeacher?: string;
}

export default function ManageUserScreen() {
  const router = useRouter();
  const { role } = useLocalSearchParams<{ role?: string }>();
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">("All");

  const dispatch = useDispatch<AppDispatch>();
  const { users, count, isLoading, error, message } = useSelector(
    (state: RootState) => state.user
  );

  useEffect(() => {
    if (role) {
      dispatch(getRolebaseuser({ role }));
    }
  }, [role]);

  const filteredUsers = (users || []).filter((user: any) => {
    if (statusFilter === "All") return true;
    return user.status === statusFilter;
  });

  const handleAdd = () => {
    // Navigate to add user screen or show modal
    console.log("Add user tapped for role:", role);
    // router.push(`/add-user?role=${role}`);
  };

  const handleUserAction = (user: User, action: string) => {
    Alert.alert(
      "User Action",
      `${action} user: ${user.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm", onPress: () => console.log(`${action} user:`, user.user_id) }
      ]
    );
  };

  const renderUserItem = ({ item: user }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <View style={styles.userHeader}>
          <Text style={styles.userName}>{user.name}</Text>
          <View style={[
            styles.statusBadge, 
            user.status === "Active" ? styles.activeBadge : styles.inactiveBadge
          ]}>
            <Text style={[
              styles.statusText,
              user.status === "Active" ? styles.activeText : styles.inactiveText
            ]}>
              {user.status}
            </Text>
          </View>
        </View>
        
        <Text style={styles.userEmail}>{user.email}</Text>
        {user.mobile_number && (
          <Text style={styles.userPhone}>{user.mobile_number}</Text>
        )}
        
        {user.class && (
          <Text style={styles.userDetail}>Class: {user.class}</Text>
        )}
        
        {user.subjectTeacher && (
          <Text style={styles.userDetail}>Subject: {user.subjectTeacher}</Text>
        )}
        
        <Text style={styles.userDate}>
          Created: {new Date(user.created_at).toLocaleDateString()}
        </Text>
      </View>
      
      <View style={styles.userActions}>
        <TouchableOpacity 
          style={styles.editBtn}
          onPress={() => handleUserAction(user, "Edit")}
        >
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionBtn, user.status === "Active" ? styles.deactivateBtn : styles.activateBtn]}
          onPress={() => handleUserAction(user, user.status === "Active" ? "Deactivate" : "Activate")}
        >
          <Text style={styles.actionText}>
            {user.status === "Active" ? "Deactivate" : "Activate"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>No {role?.toLowerCase()}s found</Text>
      <Text style={styles.emptySubtitle}>
        {statusFilter !== "All" 
          ? `No ${statusFilter.toLowerCase()} ${role?.toLowerCase()}s to display`
          : `No ${role?.toLowerCase()}s have been added yet`
        }
      </Text>
    </View>
  );

  if (isLoading) {
    return (
    <LoadingScreen/>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity 
            style={styles.retryBtn}
            onPress={() => role && dispatch(getRolebaseuser({ role }))}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Manage {role}s</Text>
          <Text style={styles.subtitle}>
            Total: {count || filteredUsers.length} users
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleAdd}>
            <Text style={styles.primaryText}>Add {role}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.secondaryText}>Go Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Filter by Status:</Text>
          <View style={styles.filterButtons}>
            {["All", "Active", "Inactive"].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterBtn,
                  statusFilter === status && styles.activeFilterBtn
                ]}
                onPress={() => setStatusFilter(status as "All" | "Active" | "Inactive")}
              >
                <Text style={[
                  styles.filterBtnText,
                  statusFilter === status && styles.activeFilterText
                ]}>
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <FlatList
          data={filteredUsers as any}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.user_id.toString()}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    paddingTop: StatusBar.currentHeight || 0,
  },
  container: { 
    flex: 1, 
    padding: 16,
  },
  
  // Header Styles
  header: { 
    marginBottom: 16 
  },
  title: { 
    fontSize: 24, 
    fontWeight: "700", 
    color: "#111", 
    marginBottom: 4 
  },
  subtitle: { 
    fontSize: 14, 
    color: "#6B7280" 
  },
  
  // Action Buttons
  actions: { 
    flexDirection: "row", 
    gap: 12, 
    marginBottom: 16 
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryText: { 
    color: "#fff", 
    fontWeight: "600" 
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: "#E5E7EB",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  secondaryText: { 
    color: "#374151", 
    fontWeight: "600" 
  },
  
  filterContainer: { 
    marginBottom: 16 
  },
  filterLabel: { 
    fontSize: 14, 
    fontWeight: "600", 
    color: "#374151", 
    marginBottom: 8 
  },
  filterButtons: { 
    flexDirection: "row", 
    gap: 8 
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  activeFilterBtn: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  filterBtnText: { 
    fontSize: 12, 
    fontWeight: "500", 
    color: "#6B7280" 
  },
  activeFilterText: { 
    color: "#FFFFFF" 
  },
  
  // List Styles
  listContainer: { 
    paddingBottom: 20 
  },
  
  // User Card Styles
  userCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userInfo: { 
    flex: 1, 
    marginBottom: 12 
  },
  userHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: 8 
  },
  userName: { 
    fontSize: 18, 
    fontWeight: "600", 
    color: "#111", 
    flex: 1 
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: { 
    backgroundColor: "#D1FAE5" 
  },
  inactiveBadge: { 
    backgroundColor: "#FEE2E2" 
  },
  statusText: { 
    fontSize: 12, 
    fontWeight: "600" 
  },
  activeText: { 
    color: "#065F46" 
  },
  inactiveText: { 
    color: "#991B1B" 
  },
  userEmail: { 
    fontSize: 14, 
    color: "#6B7280", 
    marginBottom: 4 
  },
  userPhone: { 
    fontSize: 14, 
    color: "#6B7280", 
    marginBottom: 4 
  },
  userDetail: { 
    fontSize: 14, 
    color: "#374151", 
    marginBottom: 4 
  },
  userDate: { 
    fontSize: 12, 
    color: "#9CA3AF" 
  },
  
  // User Actions
  userActions: { 
    flexDirection: "row", 
    gap: 8 
  },
  editBtn: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  editText: { 
    color: "#374151", 
    fontWeight: "500", 
    fontSize: 14 
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  activateBtn: { 
    backgroundColor: "#D1FAE5" 
  },
  deactivateBtn: { 
    backgroundColor: "#FEE2E2" 
  },
  actionText: { 
    fontWeight: "500", 
    fontSize: 14 
  },
  
  // Loading State
  loadingContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  loadingText: { 
    marginTop: 16, 
    fontSize: 16, 
    color: "#6B7280" 
  },
  
  // Error State
  errorContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    padding: 20 
  },
  errorText: { 
    fontSize: 16, 
    color: "#DC2626", 
    textAlign: "center", 
    marginBottom: 16 
  },
  retryBtn: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: { 
    color: "#FFFFFF", 
    fontWeight: "600" 
  },
  
  // Empty State
  emptyState: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    paddingVertical: 60 
  },
  emptyTitle: { 
    fontSize: 18, 
    fontWeight: "600", 
    color: "#374151", 
    marginBottom: 8 
  },
  emptySubtitle: { 
    fontSize: 14, 
    color: "#6B7280", 
    textAlign: "center" 
  },
});