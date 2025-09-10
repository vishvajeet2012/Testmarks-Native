import LoadingScreen from "@/components/Loading";
import { AppDispatch, RootState } from "@/redux/store";
import { getRolebaseuser } from "@/thunk/auth/user";
import { Ionicons } from '@expo/vector-icons';
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
  View,
  useColorScheme
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

interface User {
  user_id: number;
  name: string;
  email: string;
  mobile_number: string | null;
  role: string;
  status: string;
  profile_picture: string | null;
  created_at: string;
  updated_at: string;
  class?: string;
  subjectTeacher?: string;
}

const lightTheme = {
  background: "#F9FAFB",
  surface: "#FFFFFF",
  primary: "#E11B23",
  primaryLight: "#3B82F6",
  secondary: "#6366F1",
  accent: "#E11B23",
  text: "#111827",
  textSecondary: "#6B7280",
  textLight: "#9CA3AF",
  success: "#10B981",
  successLight: "#D1FAE5",
  successText: "#065F46",
  error: "#EF4444",
  errorLight: "#FEE2E2",
  errorText: "#991B1B",
  border: "#E5E7EB",
  borderLight: "#F3F4F6",
  shadow: "rgba(0, 0, 0, 0.1)",
};

const darkTheme = {
  background: "#111827",
  surface: "#1F2937",
  primary: "#E11B23",
  primaryLight: "#60A5FA",
  secondary: "#8B5CF6",
  accent: "#E11B23",
  text: "#F9FAFB",
  textSecondary: "#D1D5DB",
  textLight: "#9CA3AF",
  success: "#10B981",
  successLight: "#064E3B",
  successText: "#6EE7B7",
  error: "#F87171",
  errorLight: "#7F1D1D",
  errorText: "#FCA5A5",
  border: "#374151",
  borderLight: "#4B5563",
  shadow: "rgba(0, 0, 0, 0.3)",
};

export default function ManageUserScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const { role } = useLocalSearchParams<{ role?: string }>();
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">("All");
  const dispatch = useDispatch<AppDispatch>();
  const { users, count, isLoading, error } = useSelector(
    (state: RootState) => state.user
  );

  const styles = createStyles(theme);

  useEffect(() => {
    if (role) {
      dispatch(getRolebaseuser({ role }));
    }
  }, [role]);

  const filteredUsers = (users || []).filter((user: any) => {
    if (statusFilter === "All") return true;
    return user.status === statusFilter;
  });

  
  const handleAdd = (role?: string) => {
    if (!role) {
      console.warn("Role is missing");
      return;
      }
        router.push({
        pathname: "/adduserbyadmin",
        params: { role }
      })
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
          <View style={styles.userNameContainer}>
            <Text style={styles.userName}>{user.name}</Text>
            <View style={styles.roleContainer}>
              <Ionicons 
                name="person-circle-outline" 
                size={16} 
                color={theme.textSecondary} 
              />
              <Text style={styles.roleText}>{user.role}</Text>
            </View>
          </View>
          <View style={[
            styles.statusBadge, 
            user.status === "Active" ? styles.activeBadge : styles.inactiveBadge
          ]}>
            <View style={styles.statusIndicator}>
              <View style={[
                styles.statusDot,
                { backgroundColor: user.status === "Active" ? theme.success : theme.error }
              ]} />
              <Text style={[
                styles.statusText,
                { color: user.status === "Active" ? theme.successText : theme.errorText }
              ]}>
                {user.status}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.contactInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={16} color={theme.textSecondary} />
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
          
          {user.mobile_number && (
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={16} color={theme.textSecondary} />
              <Text style={styles.userPhone}>{user.mobile_number}</Text>
            </View>
          )}
        </View>
        
        {(user.class || user.subjectTeacher) && (
          <View style={styles.additionalInfo}>
            {user.class && (
              <View style={styles.infoBadge}>
                <Ionicons name="school-outline" size={14} color={theme.primary} />
                <Text style={styles.infoBadgeText}>Class: {user.class}</Text>
              </View>
            )}
            {user.subjectTeacher && (
              <View style={styles.infoBadge}>
                <Ionicons name="book-outline" size={14} color={theme.secondary} />
                <Text style={styles.infoBadgeText}>Subject: {user.subjectTeacher}</Text>
              </View>
            )}
          </View>
        )}
        
        <View style={styles.dateContainer}>
          <Ionicons name="calendar-outline" size={12} color={theme.textLight} />
          <Text style={styles.userDate}>
            Created: {new Date(user.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>
      
      <View style={styles.userActions}>
        <TouchableOpacity 
          style={styles.editBtn}
          onPress={() => handleUserAction(user, "Edit")}
          activeOpacity={0.7}
        >
          <Ionicons name="pencil-outline" size={16} color={theme.primary} />
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.actionBtn, 
            user.status === "Active" ? styles.deactivateBtn : styles.activateBtn
          ]}
          onPress={() => handleUserAction(user, user.status === "Active" ? "Deactivate" : "Activate")}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={user.status === "Active" ? "pause-circle-outline" : "play-circle-outline"} 
            size={16} 
            color={user.status === "Active" ? theme.errorText : theme.successText} 
          />
          <Text style={[
            styles.actionText,
            { color: user.status === "Active" ? theme.errorText : theme.successText }
          ]}>
            {user.status === "Active" ? "Deactivate" : "Activate"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={64} color={theme.textLight} />
      <Text style={styles.emptyTitle}>No {role?.toLowerCase()}s found</Text>
      <Text style={styles.emptySubtitle}>
        {statusFilter !== "All" 
          ? `No ${statusFilter.toLowerCase()} ${role?.toLowerCase()}s to display`
          : `No ${role?.toLowerCase()}s have been added yet`
        }
      </Text>
      <TouchableOpacity style={styles.emptyActionBtn} onPress={()=>handleAdd(role)}>
        <Ionicons name="add-circle-outline" size={20} color={theme.primary} />
        <Text style={styles.emptyActionText}>Add First {role}</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.error} />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryBtn}
            onPress={() => role && dispatch(getRolebaseuser({ role }))}
          >
            <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar 
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Manage {role}s</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{count || filteredUsers.length}</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>
            {filteredUsers.length === 1 ? '1 user' : `${filteredUsers.length} users`} 
            {statusFilter !== "All" && ` • ${statusFilter} only`}
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.primaryBtn} 
            onPress={()=>handleAdd(role)}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.primaryText}>Add {role}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={20} color={theme.textSecondary} />
            <Text style={styles.secondaryText}>Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Filter by Status</Text>
          <View style={styles.filterButtons}>
            {["All", "Active", "Inactive"].map((status, index) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterBtn,
                  statusFilter === status && styles.activeFilterBtn
                ]}
                onPress={() => setStatusFilter(status as "All" | "Active" | "Inactive")}
                activeOpacity={0.7}
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
          contentContainerStyle={[
            styles.listContainer,
            filteredUsers.length === 0 && styles.emptyListContainer
          ]}
        />
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: typeof lightTheme) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  container: { 
    flex: 1, 
    padding: 16,
  },
  
  header: { 
    marginBottom: 20 
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: { 
    fontSize: 28, 
    fontWeight: "700", 
    color: theme.text,
    flex: 1,
  },
  countBadge: {
    backgroundColor: theme.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 32,
    alignItems: 'center',
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  subtitle: { 
    fontSize: 16, 
    color: theme.textSecondary,
    fontWeight: '500',
  },
  
  actions: { 
    flexDirection: "row", 
    gap: 12, 
    marginBottom: 20 
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: theme.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: 'row',
    gap: 8,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryText: { 
    color: "#FFFFFF", 
    fontWeight: "600",
    fontSize: 16,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: theme.surface,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  secondaryText: { 
    color: theme.textSecondary, 
    fontWeight: "600",
    fontSize: 16,
  },
  
  filterContainer: { 
    marginBottom: 20 
  },
  filterLabel: { 
    fontSize: 16, 
    fontWeight: "600", 
    color: theme.text, 
    marginBottom: 12 
  },
  filterButtons: { 
    flexDirection: "row", 
    gap: 10 
  },
  filterBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    minWidth: 80,
    alignItems: 'center',
  },
  activeFilterBtn: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  filterBtnText: { 
    fontSize: 14, 
    fontWeight: "500", 
    color: theme.textSecondary 
  },
  activeFilterText: { 
    color: "#FFFFFF",
    fontWeight: "600",
  },
  
  listContainer: { 
    paddingBottom: 20 
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  
  userCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: theme.border,
  },
  userInfo: { 
    marginBottom: 16 
  },
  userHeader: { 
    marginBottom: 12 
  },
  userNameContainer: {
    marginBottom: 8,
  },
  userName: { 
    fontSize: 20, 
    fontWeight: "700", 
    color: theme.text,
    marginBottom: 4,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  roleText: {
    fontSize: 14,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  activeBadge: { 
    backgroundColor: theme.successLight,
  },
  inactiveBadge: { 
    backgroundColor: theme.errorLight,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: { 
    fontSize: 14, 
    fontWeight: "600" 
  },
  
  contactInfo: {
    gap: 8,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userEmail: { 
    fontSize: 15, 
    color: theme.textSecondary,
    flex: 1,
  },
  userPhone: { 
    fontSize: 15, 
    color: theme.textSecondary,
    flex: 1,
  },
  
  additionalInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.borderLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  infoBadgeText: {
    fontSize: 13,
    color: theme.text,
    fontWeight: '500',
  },
  
  // Date
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userDate: { 
    fontSize: 13, 
    color: theme.textLight,
    fontWeight: '500',
  },
  
  // User Actions
  userActions: { 
    flexDirection: "row", 
    gap: 12 
  },
  editBtn: {
    flex: 1,
    backgroundColor: theme.borderLight,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: 'row',
    gap: 6,
    borderWidth: 1,
    borderColor: theme.border,
  },
  editText: { 
    color: theme.primary, 
    fontWeight: "600", 
    fontSize: 15 
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: 'row',
    gap: 6,
  },
  activateBtn: { 
    backgroundColor: theme.successLight,
  },
  deactivateBtn: { 
    backgroundColor: theme.errorLight,
  },
  actionText: { 
    fontWeight: "600", 
    fontSize: 15 
  },
  
  // Error State
  errorContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    padding: 20 
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: { 
    fontSize: 16, 
    color: theme.error, 
    textAlign: "center", 
    marginBottom: 20,
    lineHeight: 22,
  },
  retryBtn: {
    backgroundColor: theme.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  retryText: { 
    color: "#FFFFFF", 
    fontWeight: "600",
    fontSize: 16,
  },
  
  emptyState: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: { 
    fontSize: 22, 
    fontWeight: "600", 
    color: theme.text, 
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: { 
    fontSize: 16, 
    color: theme.textSecondary, 
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.surface,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border,
  },
  emptyActionText: {
    color: theme.primary,
    fontWeight: '600',
    fontSize: 16,
  },
});
