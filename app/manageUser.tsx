import LoadingScreen from "@/components/Loading";
import { useAppSelector } from "@/hooks/reduxhooks";
import { AppDispatch, RootState } from "@/redux/store";
import { getRolebaseuser } from "@/thunk/auth/user";
import {
  manageStudentUser,
  selectManageUserError,
  selectManageUserLoading,
  selectManageUserSuccess,
  selectUpdatedUser,
} from "@/thunk/user/userMange";
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View
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
  profile: {
    // Teacher profile
    teacher_id?: number;
    assigned_subjects?: string[];
    class_assignments?: string[];
    // Student profile
    student_id?: number;
    roll_number?: string;
    class_id?: number;
    section_id?: number;
    dob?: string;
    guardian_name?: string;
    guardian_mobile_number?: string;
    student_mobile_number?: string;
    class_name?: string;
    section_name?: string;
  } | null;
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
  
  const manageLoading = useAppSelector(selectManageUserLoading);
  const manageSuccess = useAppSelector(selectManageUserSuccess);
  const manageError = useAppSelector(selectManageUserError);
  const updatedUser = useAppSelector(selectUpdatedUser);

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    mobile_number: '',
    role: '',
    status: ''
  });

  const { users, count, isLoading, error } = useSelector(
    (state: RootState) => state.user
  );
  const styles = createStyles(theme);

  useEffect(() => {
    if (role) {
      dispatch(getRolebaseuser({ role }));
    }
  }, [role, dispatch]);

  useEffect(() => {
    if (manageSuccess && updatedUser) {
      setIsEditModalVisible(false);
      setSelectedUser(null);
      if (role) {
        dispatch(getRolebaseuser({ role }));
      }
    }
  }, [manageSuccess, updatedUser, role, dispatch]);

  useEffect(() => {
    if (manageError) {
      console.log("error")
    }
  }, [manageError]);

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
    });
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      mobile_number: user.mobile_number || '',
      role: user.role || '',
      status: user.status || ''
    });
    setIsEditModalVisible(true);
  };

  const handleEditUser = () => {
    if (!selectedUser) return;

    const userData = {
      user_id: selectedUser.user_id,
      name: editForm.name.trim() || undefined,
      email: editForm.email.trim() || undefined,
      mobile_number: editForm.mobile_number.trim() || undefined,
      role: editForm.role.trim() || undefined,
      status: editForm.status.trim() || undefined,
    };
                Object.keys(userData).forEach(key => {
      if (userData[key as keyof typeof userData] === undefined) {
        delete userData[key as keyof typeof userData];
      }
    });

    dispatch(manageStudentUser(userData));
  };

  const handleStatusToggle = (user: User) => {
    const newStatus = user.status === "Active" ? "Inactive" : "Active";
    const action = user.status === "Active" ? "Deactivate" : "Activate";
    
    Alert.alert(
      `${action} User`,
      `Are you sure you want to ${action.toLowerCase()} ${user.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Confirm", 
          onPress: () => {
            dispatch(manageStudentUser({
              user_id: user.user_id,
              status: newStatus
            }))
          }
        }
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
        
        {user.profile && (
          <View style={styles.additionalInfo}>
            {user.role === "Student" && (
              <>
                {user.profile.roll_number && (
                  <View style={styles.infoBadge}>
                    <Ionicons name="id-card-outline" size={14} color={theme.primary} />
                    <Text style={styles.infoBadgeText}>Roll: {user.profile.roll_number}</Text>
                  </View>
                )}
                {user.profile.class_name && (
                  <View style={styles.infoBadge}>
                    <Ionicons name="school-outline" size={14} color={theme.secondary} />
                    <Text style={styles.infoBadgeText}>{user.profile.class_name}</Text>
                  </View>
                )}
                {user.profile.section_name && (
                  <View style={styles.infoBadge}>
                    <Ionicons name="library-outline" size={14} color={theme.accent} />
                    <Text style={styles.infoBadgeText}>{user.profile.section_name}</Text>
                  </View>
                )}
                {user.profile.guardian_name && (
                  <View style={styles.infoBadge}>
                    <Ionicons name="people-outline" size={14} color={theme.textSecondary} />
                    <Text style={styles.infoBadgeText}>Guardian: {user.profile.guardian_name}</Text>
                  </View>
                )}
              </>
            )}
            
            {user.role === "Teacher" && (
              <>
                {user.profile.assigned_subjects && user.profile.assigned_subjects.length > 0 && (
                  <View style={styles.subjectsContainer}>
                    <View style={styles.subjectsHeader}>
                      <Ionicons name="book-outline" size={14} color={theme.secondary} />
                      <Text style={styles.subjectsLabel}>Subjects:</Text>
                    </View>
                    <View style={styles.subjectsList}>
                      {user.profile.assigned_subjects.map((subject, index) => (
                        <View key={index} style={styles.subjectBadge}>
                          <Text style={styles.subjectText}>{subject}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                {user.profile.class_assignments && user.profile.class_assignments.length > 0 && (
                  <View style={styles.classesContainer}>
                    <View style={styles.classesHeader}>
                      <Ionicons name="school-outline" size={14} color={theme.primary} />
                      <Text style={styles.classesLabel}>Classes:</Text>
                    </View>
                    {/* <View style={styles.classesList}>
                      {user?.profile?.class_assignments?.map((classItem, index) => (
                        <View key={index} style={styles.classBadge}>
                          <Text style={styles.classText}>{classItem}</Text>
                        </View>
                      ))}
                    </View> */}
                  </View>
                )}
              </>
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
          onPress={() => openEditModal(user)}
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
          onPress={() => handleStatusToggle(user)}
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

  const renderEditModal = () => (
    <Modal
      visible={isEditModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsEditModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit User</Text>
            <TouchableOpacity 
              onPress={() => setIsEditModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.textInput}
                value={editForm.name}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, name: text }))}
                placeholder="Enter name"
                placeholderTextColor={theme.textLight}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.textInput}
                value={editForm.email}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, email: text }))}
                placeholder="Enter email"
                placeholderTextColor={theme.textLight}
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mobile Number</Text>
              <TextInput
                style={styles.textInput}
                value={editForm.mobile_number}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, mobile_number: text }))}
                placeholder="Enter mobile number"
                placeholderTextColor={theme.textLight}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Role</Text>
              <TextInput
                style={styles.textInput}
                value={editForm.role}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, role: text }))}
                placeholder="Enter role"
                placeholderTextColor={theme.textLight}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Status</Text>
              <View style={styles.statusToggleContainer}>
                {["Active", "Inactive"].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusToggleBtn,
                      editForm.status === status && styles.activeStatusToggle
                    ]}
                    onPress={() => setEditForm(prev => ({ ...prev, status }))}
                  >
                    <Text style={[
                      styles.statusToggleText,
                      editForm.status === status && styles.activeStatusToggleText
                    ]}>
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={styles.cancelBtn}
              onPress={() => setIsEditModalVisible(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.saveBtn}
              onPress={handleEditUser}
              disabled={manageLoading}
            >
              <Text style={styles.saveText}>
                {manageLoading ? 'Saving...' : 'Save Changes'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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
          </View>
          <Text style={styles.subtitle}>
            {filteredUsers.length === 1 ? '1 Total user' : `${filteredUsers.length} Total users`} 
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

      {renderEditModal()}
    </SafeAreaView>
  );
}

const createStyles = (theme: typeof lightTheme) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
    paddingTop: 20
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
    flexDirection:"row",
  
    gap: 12,
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
    alignSelf: 'flex-start',
  },
  infoBadgeText: {
    fontSize: 13,
    color: theme.text,
    fontWeight: '500',
  },
  
  subjectsContainer: {
    gap: 6,
  },
  subjectsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subjectsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
  },
  subjectsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  subjectBadge: {
    backgroundColor: theme.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  subjectText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  
  classesContainer: {
    gap: 6,
  },
  classesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  classesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
  },
  classesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  classBadge: {
    backgroundColor: theme.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  classText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  
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
  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
  },
  closeButton: {
    padding: 4,
  },
  formContainer: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: theme.text,
    backgroundColor: theme.background,
  },
  statusToggleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statusToggleBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
    backgroundColor: theme.background,
  },
  activeStatusToggle: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  statusToggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textSecondary,
  },
  activeStatusToggleText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
    backgroundColor: theme.background,
  },
  cancelText: {
    color: theme.textSecondary,
    fontWeight: '600',
    fontSize: 16,
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: theme.primary,
    opacity: 1,
  },
  saveText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  // Error state styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.surface,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  emptyActionText: {
    color: theme.primary,
    fontWeight: '600',
    fontSize: 16,
  },
});
