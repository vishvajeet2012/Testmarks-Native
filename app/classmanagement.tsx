import { useAppDispatch, useAppSelector } from '@/hooks/reduxhooks';
import { clearError } from '@/redux/slice/classAndSectionbysearch';
import { fetchAllClasses } from '@/thunk/classandsection/getallClassbysection';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
} from 'react-native';

interface SectionTeacher {
  teacher_id: number;
  name: string;
  email: string;
}

interface ClassTeacher {
  teacher_id: number;
  name: string;
  email: string;
  assigned_subjects: string[];
  class_assignments: Array<{ class_id: number; section_id: number }>;
  created_at: string;
  updated_at: string;
}

interface SectionData {
  section_id: number;
  section_name: string;
  total_students: number;
  class_teacher_id: number | null;
  section_created_at: string;
  section_updated_at: string;
  class_teacher: ClassTeacher | null;
  section_teachers: SectionTeacher[];
}

interface ClassData {
  class_id: number;
  class_name: string;
  description: string;
  class_created_at: string;
  class_updated_at: string;
  sections: SectionData[];
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

export default function ClassManagement() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const dispatch = useAppDispatch();
    const { classes, loading, error } = useAppSelector((state) => state.classesGetAll);
  
  const [statusFilter, setStatusFilter] = useState<"All" | "With Teacher" | "Without Teacher">("All");
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [editForm, setEditForm] = useState({
    class_name: '',
    description: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const styles = createStyles(theme);

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        { text: 'OK', onPress: () => dispatch(clearError()) }
      ]);
    }
  }, [error]);

  const loadClasses = () => {
    dispatch(fetchAllClasses());
  };

  const filteredClasses = (classes || []).filter((classItem: any) => {
    if (statusFilter !== "All") {
      const hasClassTeacher = classItem.sections.some((section:any) => 
        section.class_teacher_id !== null || 
        (section.class_teacher && section.class_teacher.teacher_id !== null)
      );
      
      if (statusFilter === "With Teacher" && !hasClassTeacher) return false;
      if (statusFilter === "Without Teacher" && hasClassTeacher) return false;
    }
    
    if (searchQuery.trim() === '') return true;
    
    const query = searchQuery.toLowerCase();
    
    if (classItem.class_name.toLowerCase().includes(query) || 
        classItem.description.toLowerCase().includes(query)) {
      return true;
    }
    
    const hasMatchingSection = classItem.sections.some((section:any) => {
      if (section.section_name.toLowerCase().includes(query)) return true;
      
      if (section.class_teacher && 
          (section.class_teacher.name.toLowerCase().includes(query) ||
           section.class_teacher.email.toLowerCase().includes(query))) {
        return true;
      }
      
      if (section.section_teachers.some((teacher:any) => 
          teacher.name.toLowerCase().includes(query) ||
          teacher.email.toLowerCase().includes(query))) {
        return true;
      }
      
      return false;
    });
    
    return hasMatchingSection;
  });

  const handleAddClass = () => {
    router.push('/add-class'); 
  };

  const openEditModal = (classItem: ClassData) => {
    setSelectedClass(classItem);
    setEditForm({
      class_name: classItem.class_name || '',
      description: classItem.description || '',
    });
    setIsEditModalVisible(true);
  };

  const handleEditClass = () => {
    if (!selectedClass) return;
    
    setIsEditModalVisible(false);
    setSelectedClass(null);
  };

  const handleDeleteClass = (classItem: ClassData) => {
    Alert.alert(
      'Delete Class',
      `Are you sure you want to delete "${classItem.class_name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // Implement your delete logic here
            console.log('Deleting class:', classItem.class_id);
          }
        }
      ]
    );
  };

  const handleManageSections = (section: SectionData) => {
    router.push({
      pathname: '/sectionmanagement',
      params: { 
    
      sectionId: section?.section_id,
      sectionName: section?.section_name          
    }
    });
  };

  const renderClassItem = ({ item: classItem }: { item: ClassData }) => {
    const totalStudents = classItem.sections.reduce((total, section) => total + section.total_students, 0);
    
    const hasClassTeacher = classItem.sections.some(section => 
      section.class_teacher_id !== null || 
      (section.class_teacher && section.class_teacher.teacher_id !== null)
    );
    
    const classTeacherSection = classItem.sections.find(section => 
      section.class_teacher_id !== null || 
      (section.class_teacher && section.class_teacher.teacher_id !== null)
    );
    
    const classTeacher = classTeacherSection ? 
      (classTeacherSection.class_teacher || { 
        teacher_id: classTeacherSection.class_teacher_id,
        name: "Unknown Teacher",
        email: "",
        assigned_subjects: []
      }) : null;

    return (
      <View style={styles.classCard}>
        <View style={styles.classInfo}>
          <View style={styles.classHeader}>
            <View style={styles.classNameContainer}>
              <Text style={styles.className}>{classItem.class_name}</Text>
              <Text style={styles.classDescription}>{classItem.description}</Text>
            </View>
            <View style={styles.classStats}>
              <View style={styles.statBadge}>
                <Ionicons name="people-outline" size={14} color={theme.primary} />
                <Text style={styles.statText}>
                  {totalStudents} Students
                </Text>
              </View>
              <View style={styles.statBadge}>
                <Ionicons name="library-outline" size={14} color={theme.secondary} />
                <Text style={styles.statText}>
                  {classItem.sections.length} Section{classItem.sections.length !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>
          </View>

          {hasClassTeacher && classTeacher ? (
            <View style={styles.teacherInfo}>
              <View style={styles.teacherHeader}>
                <Ionicons name="person-circle-outline" size={16} color={theme.success} />
                <Text style={styles.teacherLabel}>Class Teacher</Text>
              </View>
              <Text style={styles.teacherName}>{classTeacher.name}</Text>
              <Text style={styles.teacherEmail}>{classTeacher.email}</Text>
              {classTeacher.assigned_subjects && classTeacher.assigned_subjects.length > 0 && (
                <View style={styles.subjectsContainer}>
                  <Text style={styles.subjectsLabel}>Subjects:</Text>
                  <View style={styles.subjectsList}>
                    {classTeacher.assigned_subjects.map((subject: string, index: number) => (
                      <View key={index} style={styles.subjectBadge}>
                        <Text style={styles.subjectText}>{subject}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.noTeacherInfo}>
              <Ionicons name="person-add-outline" size={16} color={theme.error} />
              <Text style={styles.noTeacherText}>No class teacher assigned</Text>
            </View>
          )}

          {classItem.sections.length > 0 && (
            <View style={styles.sectionsContainer}>
              <View style={styles.sectionsHeader}>
                <Ionicons name="grid-outline" size={16} color={theme.text} />
                <Text style={styles.sectionsTitle}>Sections</Text>
              </View>

              
              <View style={styles.sectionsList}>
                {classItem.sections.map((section) => (
                  <TouchableOpacity     onPress={() => handleManageSections( section)}
 key={section.section_id} style={styles.sectionItem}>
                    <Text style={styles.sectionName}>{section.section_name}</Text>
                    <View style={styles.sectionDetails}>
                      <Text style={styles.sectionStudents}>
                        {section.total_students} student{section.total_students !== 1 ? 's' : ''}
                      </Text>
                      <Text style={styles.sectionTeachers}>
                        {section.section_teachers.length} teacher{section.section_teachers.length !== 1 ? 's' : ''}
                      </Text>
                    </View>
                    {(section.class_teacher_id || section.class_teacher) && (
                      <View style={styles.sectionTeacherBadge}>
                        <Ionicons name="person-outline" size={12} color={theme.success} />
                        <Text style={styles.sectionTeacherText}>Has class teacher</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={12} color={theme.textLight} />
            <Text style={styles.classDate}>
              Created: {new Date(classItem.class_created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.classActions}>
          <TouchableOpacity 
            style={styles.editBtn}
            onPress={() => openEditModal(classItem)}
            activeOpacity={0.7}
          >
            <Ionicons name="pencil-outline" size={16} color={theme.primary} />
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
          
          

          <TouchableOpacity 
            style={styles.deleteBtn}
            onPress={() => handleDeleteClass(classItem)}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={16} color={theme.errorText} />
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="school-outline" size={64} color={theme.textLight} />
      <Text style={styles.emptyTitle}>No classes found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery.trim() !== '' 
          ? `No classes match your search for "${searchQuery}"`
          : statusFilter !== "All" 
            ? `No classes ${statusFilter === "With Teacher" ? "with teachers" : "without teachers"} to display`
            : "No classes have been created yet"
        }
      </Text>
      {searchQuery.trim() !== '' ? (
        <TouchableOpacity 
          style={styles.emptyActionBtn} 
          onPress={() => setSearchQuery('')}
        >
          <Ionicons name="search-outline" size={20} color={theme.primary} />
          <Text style={styles.emptyActionText}>Clear Search</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.emptyActionBtn} onPress={handleAddClass}>
          <Ionicons name="add-circle-outline" size={20} color={theme.primary} />
          <Text style={styles.emptyActionText}>Create First Class</Text>
        </TouchableOpacity>
      )}
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
            <Text style={styles.modalTitle}>Edit Class</Text>
            <TouchableOpacity 
              onPress={() => setIsEditModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Class Name</Text>
              <TextInput
                style={styles.textInput}
                value={editForm.class_name}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, class_name: text }))}
                placeholder="Enter class name"
                placeholderTextColor={theme.textLight}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={editForm.description}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, description: text }))}
                placeholder="Enter class description"
                placeholderTextColor={theme.textLight}
                multiline
                numberOfLines={4}
              />
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
              onPress={handleEditClass}
            >
              <Text style={styles.saveText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Loading classes...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.error} />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadClasses}>
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
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Class Management</Text>
          </View>
          <Text style={styles.subtitle}>
            {filteredClasses.length === 1 ? '1 Total class' : `${filteredClasses.length} Total classes`}
            {statusFilter !== "All" && ` • ${statusFilter}`}
          </Text>
        </View>

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
              placeholder="Search classes, sections, or teachers..."
              placeholderTextColor={theme.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                onPress={() => setSearchQuery('')}
                style={styles.clearSearchButton}
              >
                <Ionicons name="close-circle" size={20} color={theme.textLight} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.primaryBtn} 
            onPress={handleAddClass}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.primaryText}>Add Class</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Filter Classes</Text>
          <View style={styles.filterButtons}>
            {["All", "With Teacher", "Without Teacher"].map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterBtn,
                  statusFilter === filter && styles.activeFilterBtn
                ]}
                onPress={() => setStatusFilter(filter as "All" | "With Teacher" | "Without Teacher")}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.filterBtnText,
                  statusFilter === filter && styles.activeFilterText
                ]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <FlatList
          data={filteredClasses}
          renderItem={renderClassItem}
          keyExtractor={(item) => item.class_id.toString()}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContainer,
            filteredClasses.length === 0 && styles.emptyListContainer
          ]}
          refreshing={loading}
          onRefresh={loadClasses}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: theme.textSecondary,
  },
  
  header: { 
    marginBottom: 16,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 10,
    padding: 4,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 6,
  },
  title: { 
    fontSize: 28, 
    fontWeight: "700", 
    color: theme.text,
    marginTop: 8,
  },
  subtitle: { 
    fontSize: 16, 
    color: theme.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  
  searchContainer: {
    marginBottom: 16,
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
  clearSearchButton: {
    padding: 4,
  },
  
  actions: { 
    flexDirection: "row", 
    gap: 12, 
    marginBottom: 16 
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
  
  filterContainer: { 
    marginBottom: 16 
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
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
  
  classCard: {
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
  classInfo: { 
    marginBottom: 16 
  },
  classHeader: { 
    marginBottom: 16 
  },
  classNameContainer: {
    marginBottom: 12,
  },
  className: { 
    fontSize: 22, 
    fontWeight: "700", 
    color: theme.text,
    marginBottom: 4,
  },
  classDescription: {
    fontSize: 15,
    color: theme.textSecondary,
    lineHeight: 20,
  },
  classStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.borderLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statText: {
    fontSize: 13,
    color: theme.text,
    fontWeight: '600',
  },
  
  teacherInfo: {
    backgroundColor: theme.successLight,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  teacherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  teacherLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.successText,
  },
  teacherName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 2,
  },
  teacherEmail: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 8,
  },
  
  noTeacherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.errorLight,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  noTeacherText: {
    fontSize: 14,
    color: theme.errorText,
    fontWeight: '500',
  },
  
  subjectsContainer: {
    marginTop: 8,
  },
  subjectsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 6,
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
    borderRadius: 6,
  },
  subjectText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  
  sectionsContainer: {
    marginBottom: 16,
  },
  sectionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  sectionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sectionItem: {
    backgroundColor: theme.borderLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
    minWidth: 120,
    position: 'relative',
  },
  sectionName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  sectionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionStudents: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  sectionTeachers: {
    fontSize: 12,
    color: theme.secondary,
    fontWeight: '500',
  },
  sectionTeacherBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  sectionTeacherText: {
    fontSize: 10,
    color: theme.successText,
  },
  
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  classDate: { 
    fontSize: 13, 
    color: theme.textLight,
    fontWeight: '500',
  },
  
  classActions: { 
    flexDirection: "row", 
    gap: 8 
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
    fontSize: 14 
  },
  manageBtn: {
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
  manageText: { 
    color: theme.secondary, 
    fontWeight: "600", 
    fontSize: 14 
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: theme.errorLight,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: 'row',
    gap: 6,
  },
  deleteText: { 
    color: theme.errorText, 
    fontWeight: "600", 
    fontSize: 14 
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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
  },
  saveText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  
  // Error and Empty states
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