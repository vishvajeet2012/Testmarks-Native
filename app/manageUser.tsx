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
  ScrollView,
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
  role: RoleType;
  status: string;
  profile_picture: string | null;
  created_at: string;
  updated_at: string;
  profile: {
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

type StatusType = "All" | "Active" | "Inactive";
type RoleType = "Student" | "Teacher" | "";

interface EditForm {
  name: string;
  email: string;
  mobile_number: string;
  role: RoleType;
  status: string;
  student: {
    roll_number: string;
    class_name: string;
    section_name: string;
    guardian_name: string;
    guardian_mobile_number: string;
    student_mobile_number: string;
    dob: string;
    studentClass?: {
      class_id: number;
      section_id: number;
    };
  };
  teacher: {
    classTeacher?: {
      section_id: number;
      teacher_id?: number;
    };
    subjectTeacher?: {
      subject_id: number;
      teacher_id?: number;
    };
    assigned_subjects_text: string;
    class_assignments_text: string;
  };
}

interface FormErrors {
  name?: string;
  email?: string;
  mobile_number?: string;
  role?: any;
  status?: string;
  student?: {
    roll_number?: string;
    class_name?: string;
    section_name?: string;
    guardian_name?: string;
    guardian_mobile_number?: string;
    student_mobile_number?: string;
    dob?: string;
  };
  teacher?: {
    assigned_subjects_text?: string;
    class_assignments_text?: string;
  };
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
  warning: "#F59E0B",
  warningLight: "#FEF3C7",
  warningText: "#92400E",
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
  warning: "#FBBF24",
  warningLight: "#451A03",
  warningText: "#FCD34D",
  border: "#374151",
  borderLight: "#4B5563",
  shadow: "rgba(0, 0, 0, 0.3)",
};

export default function ManageUserScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const { role } = useLocalSearchParams<{ role?: string }>();
  const [statusFilter, setStatusFilter] = useState<StatusType>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const manageLoading = useAppSelector(selectManageUserLoading);
  const manageSuccess = useAppSelector(selectManageUserSuccess);
  const manageError = useAppSelector(selectManageUserError);
  const updatedUser = useAppSelector(selectUpdatedUser);

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [editForm, setEditForm] = useState<EditForm>({
    name: '',
    email: '',
    mobile_number: '',
    role: '',
    status: '',
    student: {
      roll_number: '',
      class_name: '',
      section_name: '',
      guardian_name: '',
      guardian_mobile_number: '',
      student_mobile_number: '',
      dob: '',
    },
    teacher: {
      assigned_subjects_text: '',
      class_assignments_text: '',
    },
  });

  const { users, count, isLoading, error } = useSelector(
    (state: RootState) => state.user
  );

  const styles = createStyles(theme);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[0-9]{10,15}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  };

  const validateDate = (date: string): boolean => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;
    const parsedDate = new Date(date);
    return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!editForm.name.trim()) {
      errors.name = "Name is required";
    } else if (editForm.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    if (!editForm.email.trim()) {
      errors.email = "Email is required";
    } else if (!validateEmail(editForm.email.trim())) {
      errors.email = "Please enter a valid email address";
    }

    if (editForm.mobile_number.trim() && !validatePhone(editForm.mobile_number.trim())) {
      errors.mobile_number = "Please enter a valid phone number (10-15 digits)";
    }

    if (!editForm.role.trim()) {
      errors.role = "Role is required";
    } else if (!["Student", "Teacher"].includes(editForm.role.trim())) {
      errors.role = "Role must be either 'Student' or 'Teacher'";
    }

    if (!editForm.status.trim()) {
      errors.status = "Status is required";
    }

    // Role-specific validations
    if (editForm.role.trim() === "Student") {
      const studentErrors: any = {};
      
      if (!editForm.student.roll_number.trim()) {
        studentErrors.roll_number = "Roll number is required for students";
      }

      if (!editForm.student.class_name.trim()) {
        studentErrors.class_name = "Class name is required for students";
      }

      if (!editForm.student.section_name.trim()) {
        studentErrors.section_name = "Section name is required for students";
      }

      if (editForm.student.dob.trim() && !validateDate(editForm.student.dob.trim())) {
        studentErrors.dob = "Please enter a valid date (YYYY-MM-DD)";
      }

      if (editForm.student.guardian_mobile_number.trim() && !validatePhone(editForm.student.guardian_mobile_number.trim())) {
        studentErrors.guardian_mobile_number = "Please enter a valid guardian phone number";
      }

      if (editForm.student.student_mobile_number.trim() && !validatePhone(editForm.student.student_mobile_number.trim())) {
        studentErrors.student_mobile_number = "Please enter a valid student phone number";
      }

      if (Object.keys(studentErrors).length > 0) {
        errors.student = studentErrors;
      }
    }

    if (editForm.role.trim() === "Teacher") {
      const teacherErrors: any = {};

      if (!editForm.teacher.assigned_subjects_text.trim()) {
        teacherErrors.assigned_subjects_text = "At least one subject is required for teachers";
      }

      if (Object.keys(teacherErrors).length > 0) {
        errors.teacher = teacherErrors;
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setEditForm({
      name: '',
      email: '',
      mobile_number: '',
      role: '',
      status: '',
      student: {
        roll_number: '',
        class_name: '',
        section_name: '',
        guardian_name: '',
        guardian_mobile_number: '',
        student_mobile_number: '',
        dob: '',
      },
      teacher: {
        assigned_subjects_text: '',
        class_assignments_text: '',
      },
    });
    setFormErrors({});
    setHasUnsavedChanges(false);
  };

  const safeClassAssignments = (classAssignments?: any[]): string[] => {
    if (!classAssignments || !Array.isArray(classAssignments)) return [];
    
    return classAssignments.map(item => {
      if (typeof item === 'string') return item;
      if (typeof item === 'object' && item !== null) {
        return item.class_name || item.name || String(item.class_id || item.id || 'Unknown');
      }
      return String(item);
    }).filter(Boolean);
  };

  useEffect(() => {
    if (role) {
      dispatch(getRolebaseuser({ role }));
    }
  }, [role, dispatch]);

  useEffect(() => {
    if (manageSuccess && updatedUser) {
      setIsEditModalVisible(false);
      setSelectedUser(null);
      resetForm();
      if (role) {
        dispatch(getRolebaseuser({ role }));
      }
      Alert.alert("Success", "User updated successfully!");
    }
  }, [manageSuccess, updatedUser, role, dispatch]);

  useEffect(() => {
    if (manageError) {
      Alert.alert("Error", "Failed to update user. Please try again.");
    }
  }, [manageError]);

  const filteredUsers = (users || []).filter((user:any) => {
    if (statusFilter !== "All" && user.status !== statusFilter) {
      return false;
    }

    if (searchQuery.trim() === "") {
      return true;
    }

    const query = searchQuery.toLowerCase().trim();

    if (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      (user.mobile_number && user.mobile_number.toLowerCase().includes(query))
    ) {
      return true;
    }

    if (user.profile) {
      if (user.role === "Student") {
        return (
          (user.profile.roll_number && user.profile.roll_number.toLowerCase().includes(query)) ||
          (user.profile.class_name && user.profile.class_name.toLowerCase().includes(query)) ||
          (user.profile.section_name && user.profile.section_name.toLowerCase().includes(query)) ||
          (user.profile.guardian_name && user.profile.guardian_name.toLowerCase().includes(query))
        );
      } else if (user.role === "Teacher") {
        const safeSubjects = user.profile.assigned_subjects || [];
        const safeClasses = safeClassAssignments(user.profile.class_assignments);
        
        return (
          safeSubjects.some((subject:any) =>
            String(subject).toLowerCase().includes(query)
          ) ||
          safeClasses.some(classItem =>
            String(classItem).toLowerCase().includes(query)
          )
        );
      }
    }

    return false;
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
    const safeClasses = safeClassAssignments(user.profile?.class_assignments);
    
    const newForm = {
      name: user.name || '',
      email: user.email || '',
      mobile_number: user.mobile_number || '',
      role: (user.role as RoleType) || '',
      status: user.status || '',
      student: {
        roll_number: user.profile?.roll_number || '',
        class_name: user.profile?.class_name || '',
        section_name: user.profile?.section_name || '',
        guardian_name: user.profile?.guardian_name || '',
        guardian_mobile_number: user.profile?.guardian_mobile_number || '',
        student_mobile_number: user.profile?.student_mobile_number || '',
        dob: user.profile?.dob || '',
      },
      teacher: {
        assigned_subjects_text: (user.profile?.assigned_subjects || []).join(", "),
        class_assignments_text: safeClasses.join(", "),
      },
    };
    
    setEditForm(newForm);
    setFormErrors({});
    setHasUnsavedChanges(false);
    setIsEditModalVisible(true);
  };

  const handleFormChange = <T extends keyof EditForm>(
    field: T,
    value: EditForm[T] | ((prev: EditForm[T]) => EditForm[T])
  ) => {
    setEditForm(prev => ({
      ...prev,
      [field]: typeof value === 'function' ? value(prev[field]) : value
    }));
    setHasUnsavedChanges(true);
    
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleNestedFormChange = <T extends keyof EditForm, K extends keyof EditForm[T]>(
    parentField: T,
    field: K,
    value: EditForm[T][K]
  ) => {
    setEditForm(prev => ({
      ...prev,
      [parentField]: {
        ...(prev[parentField] as any),
        [field]: value
      }
    }));
    setHasUnsavedChanges(true);
    
    if (formErrors[parentField] && (formErrors[parentField] as any)[field]) {
      setFormErrors(prev => ({
        ...prev,
        [parentField]: {
          ...(prev[parentField] as any),
          [field]: undefined
        }
      }));
    }
  };

  const handleCloseModal = () => {
    if (hasUnsavedChanges) {
      Alert.alert(
        "Unsaved Changes",
        "You have unsaved changes. Are you sure you want to close?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Discard Changes",
            style: "destructive",
            onPress: () => {
              setIsEditModalVisible(false);
              setSelectedUser(null);
              resetForm();
            }
          }
        ]
      );
    } else {
      setIsEditModalVisible(false);
      setSelectedUser(null);
      resetForm();
    }
  };

  const handleEditUser = () => {
    if (!selectedUser) return;

    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fix the errors below and try again.");
      return;
    }

    const targetRole = (editForm.role || selectedUser.role).trim();

    const userData: any = {
      user_id: selectedUser.user_id,
      name: editForm.name.trim() || undefined,
      email: editForm.email.trim() || undefined,
      mobile_number: editForm.mobile_number.trim() || undefined,
      role: targetRole || undefined,
      status: editForm.status.trim() || undefined,
    };

    if (targetRole === "Student") {
      const s = editForm.student;
      userData.roll_number = s.roll_number.trim() || undefined;
      userData.class_name = s.class_name.trim() || undefined;
      userData.section_name = s.section_name.trim() || undefined;
      userData.guardian_name = s.guardian_name.trim() || undefined;
      userData.guardian_mobile_number = s.guardian_mobile_number.trim() || undefined;
      userData.student_mobile_number = s.student_mobile_number.trim() || undefined;
      userData.dob = s.dob.trim() || undefined;
    }

    if (targetRole === "Teacher") {
      const t = editForm.teacher;
      const subjects = t.assigned_subjects_text
        .split(",")
        .map(x => x.trim())
        .filter(Boolean);
      const classes = t.class_assignments_text
        .split(",")
        .map(x => x.trim())
        .filter(Boolean);

      userData.assigned_subjects = subjects.length ? subjects : undefined;
      userData.class_assignments = classes.length ? classes : undefined;
    }

    Object.keys(userData).forEach(key => {
      if (userData[key] === undefined) {
        delete userData[key];
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

  const clearSearch = () => {
    setSearchQuery("");
  };

  const renderFormField = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    options: {
      placeholder?: string;
      keyboardType?: any;
      multiline?: boolean;
      error?: string;
      required?: boolean;
    } = {}
  ) => (
    <View style={styles.inputGroup}>
      <View style={styles.labelContainer}>
        <Text style={styles.inputLabel}>
          {label}
          {options.required && <Text style={styles.requiredAsterisk}> *</Text>}
        </Text>
      </View>
      <TextInput
        style={[
          styles.textInput,
          options.error && styles.textInputError,
          options.multiline && styles.textInputMultiline
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={options.placeholder || `Enter ${label.toLowerCase()}`}
        placeholderTextColor={theme.textLight}
        keyboardType={options.keyboardType || 'default'}
        multiline={options.multiline}
        numberOfLines={options.multiline ? 3 : 1}
      />
      {options.error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={14} color={theme.error} />
          <Text style={styles.errorText}>{options.error}</Text>
        </View>
      )}
    </View>
  );

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
                          <Text style={styles.subjectText}>{String(subject)}</Text>
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
                    <View style={styles.classesList}>
                      {safeClassAssignments(user.profile.class_assignments).map((className, index) => (
                        <View key={index} style={styles.classBadge}>
                          <Text style={styles.classText}>{className}</Text>
                        </View>
                      ))}
                    </View>
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
            styles.statusToggleBtn,
            user.status === "Active" ? styles.activeStatusBtn : styles.inactiveStatusBtn
          ]}
          onPress={() => handleStatusToggle(user)}
          activeOpacity={0.8}
        >
          <View style={[
            styles.statusToggleIndicator,
            user.status === "Active" ? styles.activeToggleIndicator : styles.inactiveToggleIndicator
          ]}>
            <Ionicons
              name={user.status === "Active" ? "checkmark-circle" : "close-circle"}
              size={18}
              color="#FFFFFF"
            />
          </View>
          <View style={styles.statusToggleContent}>
            <Text style={[
              styles.statusToggleTitle,
              { color: user.status === "Active" ? theme.success : theme.error }
            ]}>
              {user.status}
            </Text>
            <Text style={styles.statusToggleSubtitle}>
              Tap to {user.status === "Active" ? "deactivate" : "activate"}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={64} color={theme.textLight} />
      <Text style={styles.emptyTitle}>
        {searchQuery.trim() !== ""
          ? `No ${role?.toLowerCase()}s found for "${searchQuery}"`
          : `No ${role?.toLowerCase()}s found`
        }
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery.trim() !== ""
          ? "Try adjusting your search terms"
          : statusFilter !== "All"
            ? `No ${statusFilter.toLowerCase()} ${role?.toLowerCase()}s to display`
            : `No ${role?.toLowerCase()}s have been added yet`
        }
      </Text>
      {searchQuery.trim() !== "" ? (
        <TouchableOpacity style={styles.emptyActionBtn} onPress={clearSearch}>
          <Ionicons name="close-circle-outline" size={20} color={theme.primary} />
          <Text style={styles.emptyActionText}>Clear Search</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.emptyActionBtn} onPress={() => handleAdd(role)}>
          <Ionicons name="add-circle-outline" size={20} color={theme.primary} />
          <Text style={styles.emptyActionText}>Add First {role}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderEditModal = () => {
    const currentRole = editForm.role || selectedUser?.role || "";

    return (
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalTitle}>Edit {role}</Text>
              </View>
              <TouchableOpacity
                onPress={handleCloseModal}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
              {/* Common fields */}
              {renderFormField(
                "Name",
                editForm.name,
                (text) => handleFormChange('name', text),
                {
                  placeholder: "Enter full name",
                  error: formErrors.name,
                  required: true
                }
              )}
              
              {renderFormField(
                "Email",
                editForm.email,
                (text) => handleFormChange('email', text),
                {
                  placeholder: "Enter email address",
                  keyboardType: "email-address",
                  error: formErrors.email,
                  required: true
                }
              )}
              
              {renderFormField(
                "Mobile Number",
                editForm.mobile_number,
                (text) => handleFormChange('mobile_number', text),
                {
                  placeholder: "Enter mobile number",
                  keyboardType: "phone-pad",
                  error: formErrors.mobile_number
                }
              )}
              
              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <Text style={styles.inputLabel}>
                    Role<Text style={styles.requiredAsterisk}> *</Text>
                  </Text>
                </View>
                <View style={styles.roleSelector}>
                  <View style={styles.roleOption}>
                    <Ionicons
                      name={editForm.role === role ? "radio-button-on" : "radio-button-off"}
                      size={20}
                      color={editForm.role === role ? theme.primary : theme.textSecondary}
                    />
                    <Text style={[
                      styles.roleOptionText,
                      editForm.role === role && styles.roleOptionTextSelected
                    ]}>
                      {role}
                    </Text>
                  </View>
                </View>
                {formErrors.role && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={14} color={theme.error} />
                    <Text style={styles.errorText}>{formErrors.role}</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <Text style={styles.inputLabel}>
                    Status<Text style={styles.requiredAsterisk}> *</Text>
                  </Text>
                </View>
                <View style={styles.statusFormContainer}>
                  {["Active", "Inactive"].map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.statusFormBtn,
                        editForm.status === status && (status === "Active" ? styles.activeFormBtn : styles.inactiveFormBtn)
                      ]}
                      onPress={() => handleFormChange('status', status)}
                    >
                      <Ionicons
                        name={status === "Active" ? "checkmark-circle-outline" : "close-circle-outline"}
                        size={20}
                        color={
                          editForm.status === status 
                            ? "#FFFFFF" 
                            : status === "Active" ? theme.success : theme.error
                        }
                      />
                      <Text style={[
                        styles.statusFormText,
                        editForm.status === status && styles.activeStatusFormText
                      ]}>
                        {status}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {formErrors.status && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={14} color={theme.error} />
                    <Text style={styles.errorText}>{formErrors.status}</Text>
                  </View>
                )}
              </View>

              {currentRole === "Student" && (
                <View style={styles.roleSpecificSection}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="school-outline" size={20} color={theme.primary} />
                    <Text style={styles.sectionTitle}>Student Information</Text>
                  </View>

                  {renderFormField(
                    "Roll Number",
                    editForm.student.roll_number,
                    (text) => handleNestedFormChange('student', 'roll_number', text),
                    {
                      placeholder: "Enter roll number",
                      error: formErrors.student?.roll_number,
                      required: true
                    }
                  )}

                  {renderFormField(
                    "Class Name",
                    editForm.student.class_name,
                    (text) => handleNestedFormChange('student', 'class_name', text),
                    {
                      placeholder: "e.g., Class 10, Grade 5",
                      error: formErrors.student?.class_name,
                      required: true
                    }
                  )}

                  {renderFormField(
                    "Section Name",
                    editForm.student.section_name,
                    (text) => handleNestedFormChange('student', 'section_name', text),
                    {
                      placeholder: "e.g., A, B, Alpha",
                      error: formErrors.student?.section_name,
                      required: true
                    }
                  )}

                  {renderFormField(
                    "Date of Birth",
                    editForm.student.dob,
                    (text) => handleNestedFormChange('student', 'dob', text),
                    {
                      placeholder: "YYYY-MM-DD",
                      error: formErrors.student?.dob
                    }
                  )}

                  <View style={styles.subsectionHeader}>
                    <Ionicons name="people-outline" size={18} color={theme.secondary} />
                    <Text style={styles.subsectionTitle}>Guardian Information</Text>
                  </View>

                  {renderFormField(
                    "Guardian Name",
                    editForm.student.guardian_name,
                    (text) => handleNestedFormChange('student', 'guardian_name', text),
                    {
                      placeholder: "Enter guardian's full name",
                      error: formErrors.student?.guardian_name
                    }
                  )}

                  {renderFormField(
                    "Guardian Mobile",
                    editForm.student.guardian_mobile_number,
                    (text) => handleNestedFormChange('student', 'guardian_mobile_number', text),
                    {
                      placeholder: "Enter guardian's mobile number",
                      keyboardType: "phone-pad",
                      error: formErrors.student?.guardian_mobile_number
                    }
                  )}

                  {renderFormField(
                    "Student Mobile",
                    editForm.student.student_mobile_number,
                    (text) => handleNestedFormChange('student', 'student_mobile_number', text),
                    {
                      placeholder: "Enter student's mobile number",
                      keyboardType: "phone-pad",
                      error: formErrors.student?.student_mobile_number
                    }
                  )}
                </View>
              )}

              {/* Teacher-specific fields */}
              {currentRole === "Teacher" && (
                <View style={styles.roleSpecificSection}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="person-outline" size={20} color={theme.primary} />
                    <Text style={styles.sectionTitle}>Teacher Information</Text>
                  </View>

                  {renderFormField(
                    "Assigned Subjects",
                    editForm.teacher.assigned_subjects_text,
                    (text) => handleNestedFormChange('teacher', 'assigned_subjects_text', text),
                    {
                      placeholder: "e.g., Mathematics, Science, English",
                      multiline: true,
                      error: formErrors.teacher?.assigned_subjects_text,
                      required: true
                    }
                  )}
                  <Text style={styles.helpText}>
                    Separate multiple subjects with commas
                  </Text>

                  {renderFormField(
                    "Class Assignments",
                    editForm.teacher.class_assignments_text,
                    (text) => handleNestedFormChange('teacher', 'class_assignments_text', text),
                    {
                      placeholder: "e.g., Class 9, Class 10, Grade 5",
                      multiline: true,
                      error: formErrors.teacher?.class_assignments_text
                    }
                  )}
                  <Text style={styles.helpText}>
                    Separate multiple classes with commas (optional)
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={handleCloseModal}
                disabled={manageLoading}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, manageLoading && styles.saveBtnDisabled]}
                onPress={handleEditUser}
                disabled={manageLoading}
              >
                {manageLoading ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.saveText}>Saving...</Text>
                  </View>
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.saveText}>Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

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
              <Text style={styles.countText}>{filteredUsers.length}</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>
            {filteredUsers.length === 1 ? '1 Total user' : `${filteredUsers.length} Total users`}
            {statusFilter !== "All" && ` • ${statusFilter} only`}
            {searchQuery.trim() !== "" && ` • Searching for "${searchQuery}"`}
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => handleAdd(role)}
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

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={[
            styles.searchInputContainer,
            isSearchFocused && styles.searchInputContainerFocused
          ]}>
            <Ionicons
              name="search"
              size={20}
              color={isSearchFocused ? theme.primary : theme.textLight}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder={`Search ${role?.toLowerCase()}s by name, email, class, etc...`}
              placeholderTextColor={theme.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color={theme.textLight} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Filter by Status</Text>
          <View style={styles.filterButtons}>
            {["All", "Active", "Inactive"].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterBtn,
                  statusFilter === status && styles.activeFilterBtn
                ]}
                onPress={() => setStatusFilter(status as StatusType)}
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
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
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

  // Search styles
  searchContainer: {
    marginBottom: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  searchInputContainerFocused: {
    borderColor: theme.primary,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.text,
    height: '100%',
  },
  clearButton: {
    padding: 4,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  userNameContainer: {
    flex: 1,
    marginRight: 10,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
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
    flexDirection: "row",
    flexWrap: 'wrap',
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
    marginBottom: 8,
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

  // Status toggle button styles
  statusToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
  },
  activeStatusBtn: {
    backgroundColor: '#F0FDF4',
    borderColor: theme.success,
  },
  inactiveStatusBtn: {
    backgroundColor: '#FEF2F2',
    borderColor: theme.error,
  },
  statusToggleIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeToggleIndicator: {
    backgroundColor: theme.success,
  },
  inactiveToggleIndicator: {
    backgroundColor: theme.error,
  },
  statusToggleContent: {
    flex: 1,
  },
  statusToggleTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  statusToggleSubtitle: {
    fontSize: 11,
    color: theme.textLight,
    fontWeight: '500',
  },

  // Modal styles
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
  modalTitleContainer: {
    flex: 1,
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
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },
  requiredAsterisk: {
    color: theme.error,
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
  textInputError: {
    borderColor: theme.error,
  },
  textInputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: theme.error,
  },

  // Role selector styles
  roleSelector: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleOptionText: {
    fontSize: 16,
    color: theme.textSecondary,
  },
  roleOptionTextSelected: {
    color: theme.primary,
    fontWeight: '600',
  },

  // Status form styles
  statusFormContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statusFormBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.background,
    gap: 8,
  },
  activeFormBtn: {
    backgroundColor: theme.success,
    borderColor: theme.success,
  },
  inactiveFormBtn: {
    backgroundColor: theme.error,
    borderColor: theme.error,
  },
  statusFormText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  activeStatusFormText: {
    color: '#FFFFFF',
  },

  // Role specific section
  roleSpecificSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
  },
  subsectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  helpText: {
    fontSize: 12,
    color: theme.textLight,
    marginTop: -8,
    marginBottom: 16,
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
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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

  // Empty state styles
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
    textAlign: 'center',
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