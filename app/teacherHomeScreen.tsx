import StudentListModal from '@/components/StudentListModal';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxhooks';
import { getTeacherDashboard } from '@/thunk/teacherScreen/teacherDashbord';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import CreateTest from './createTest';

const { width } = Dimensions.get('window');

interface Section {
  sectionId: number;
  sectionName: string;
  studentCount: number;
  isClassTeacher: boolean;
}

interface Subject {
  subjectId: number;
  subjectName: string;
}

interface Class {
  classId: number;
  className: string;
  subjects: Subject[];
  sections: Section[];
}

export default function TeacherHomeScreen() {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((state) => state.teacherDashbord);
  const [selectedSection, setSelectedSection] = useState<any | null>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showCreateTest, setShowCreateTest] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  const handleSectionPress = (section: Section, className: string) => {
    // You can navigate to student list screen here or show modal
    setSelectedSection({ ...section, className });
    setShowStudentModal(true);
  };

  const handleClassPress = (cls: Class) => {
    setSelectedClass(cls);
    // Navigate to class details or show options
    Alert.alert(
      'Class Options',
      `What would you like to do with ${cls.className}?`,
      [
        { text: 'Create Test', onPress: () => setShowCreateTest(true) },
        { text: 'View All Students', onPress: () => showAllClassStudents(cls) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const showAllClassStudents = (cls: Class) => {
    // Combine all students from all sections
    const allStudents = cls.sections.flatMap(section => 
      // Mock student data - replace with actual student data from your API
      Array.from({ length: section.studentCount }, (_, index) => ({
        id: `${section.sectionId}-${index}`,
        name: `Student ${index + 1}`,
        rollNumber: `${section.sectionName}-${String(index + 1).padStart(3, '0')}`,
        section: section.sectionName
      }))
    );
    
    setSelectedSection({ 
      sectionName: 'All Sections', 
      className: cls.className,
      students: allStudents,
      studentCount: allStudents.length 
    });
    setShowStudentModal(true);
  };

  useEffect(() => {
    dispatch(getTeacherDashboard());
  }, [dispatch]);

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingDot} />
          <ThemedText style={styles.loadingText}>Loading Dashboard...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centerContainer}>
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorIcon}>⚠️</ThemedText>
          <ThemedText style={styles.errorTitle}>Oops! Something went wrong</ThemedText>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => dispatch(getTeacherDashboard())}
          >
            <ThemedText style={styles.retryButtonText}>Try Again</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  if (!data) {
    return (
      <ThemedView style={styles.centerContainer}>
        <View style={styles.noDataContainer}>
          <ThemedText style={styles.noDataIcon}>📊</ThemedText>
          <ThemedText style={styles.noDataText}>No dashboard data available</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const totalStudents = data.assignedClasses.reduce(
    (total, cls) => total + cls.sections.reduce((secTotal, sec) => secTotal + sec.studentCount, 0),
    0
  );
  const totalClasses = data.assignedClasses.length;
  const totalSections = data.assignedClasses.reduce(
    (total, cls) => total + cls.sections.length,
    0
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <ThemedText style={styles.welcomeText}>Welcome back,</ThemedText>
          <ThemedText style={styles.teacherName}>{data.teacherDetails.name}</ThemedText>
          <ThemedText style={styles.teacherEmail}>{data.teacherDetails.email}</ThemedText>
        </View>
        <View style={styles.avatarContainer}>
          <ThemedText style={styles.avatarText}>
            {data.teacherDetails.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </ThemedText>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <ThemedText style={styles.statNumber}>{totalStudents}</ThemedText>
          <ThemedText style={styles.statLabel}>Total Students</ThemedText>
        </View>
        <View style={styles.statCard}>
          <ThemedText style={styles.statNumber}>{totalClasses}</ThemedText>
          <ThemedText style={styles.statLabel}>Classes</ThemedText>
        </View>
        <View style={styles.statCard}>
          <ThemedText style={styles.statNumber}>{totalSections}</ThemedText>
          <ThemedText style={styles.statLabel}>Sections</ThemedText>
        </View>
      </View>

      {/* Classes Section */}
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>My Classes</ThemedText>
        <View style={styles.sectionDivider} />
      </View>

      {data.assignedClasses.map((cls, index) => (
        <TouchableOpacity 
          key={cls.classId} 
          style={styles.classCard}
          onPress={() => handleClassPress(cls)}
        >
          <View style={styles.classHeader}>
            <View style={styles.classIconContainer}>
              <ThemedText style={styles.classIcon}>📚</ThemedText>
            </View>
            <View style={styles.classInfo}>
              <ThemedText style={styles.className}>{cls.className}</ThemedText>
              <ThemedText style={styles.subjectsText}>
                {cls.subjects.map(s => s.subjectName).join(' • ')}
              </ThemedText>
            </View>
            <View style={styles.arrowContainer}>
              <ThemedText style={styles.arrow}>›</ThemedText>
            </View>
          </View>

          <View style={styles.sectionsGrid}>
            {cls.sections.map((sec) => (
              <TouchableOpacity 
                key={sec.sectionId} 
                style={styles.sectionChip}
                onPress={() => handleSectionPress(sec, cls.className)}
              >
                <View style={styles.sectionInfo}>
                  <ThemedText style={styles.sectionName}>{sec.sectionName}</ThemedText>
                  <ThemedText style={styles.studentCount}>
                    {sec.studentCount} students • Tap to view
                  </ThemedText>
                </View>
                {sec.isClassTeacher && (
                  <View style={styles.classTeacherBadge}>
                    <ThemedText style={styles.classTeacherText}>CT</ThemedText>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      ))}

      <View style={styles.bottomSpacing} />

      <StudentListModal
        visible={showStudentModal}
        onClose={() => setShowStudentModal(false)}
        selectedSection={selectedSection}
      />

      {selectedClass && (
        <CreateTest
          visible={showCreateTest}
          onClose={() => setShowCreateTest(false)}
          classData={selectedClass}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
  },

  // Loading States
  loadingContainer: {
    alignItems: 'center',
  },
  loadingDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e11b23',
    marginBottom: 16,
    opacity: 0.8,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },

  // Error States
  errorContainer: {
    alignItems: 'center',
    maxWidth: 300,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#e11b23',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },

  // No Data States
  noDataContainer: {
    alignItems: 'center',
  },
  noDataIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noDataText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },

  // Header
  headerContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerContent: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  teacherName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  teacherEmail: {
    fontSize: 14,
    color: '#64748b',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e11b23',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },

  // Stats Cards
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#e11b23',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },

  // Section Header
  sectionHeader: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  sectionDivider: {
    height: 3,
    backgroundColor: '#e11b23',
    width: 40,
    borderRadius: 2,
  },

  // Class Cards
  classCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  classHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  classIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  classIcon: {
    fontSize: 20,
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  subjectsText: {
    fontSize: 14,
    color: '#64748b',
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 18,
    color: '#64748b',
    fontWeight: '600',
  },

  // Sections Grid
  sectionsGrid: {
    gap: 8,
  },
  sectionChip: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 4,
    borderLeftColor: '#e11b23',
  },
  sectionInfo: {
    flex: 1,
  },
  sectionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  studentCount: {
    fontSize: 12,
    color: '#64748b',
  },
  classTeacherBadge: {
    backgroundColor: '#e11b23',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  classTeacherText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },

  bottomSpacing: {
    height: 20,
  },
});
