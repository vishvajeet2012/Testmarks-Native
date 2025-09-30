import React from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';

interface Student {
  studentId: number;
  name: string;
  email: string;
  rollNumber: string;
  profilePicture: string;
}

interface Test {
  testId: number;
  testName: string;
  subjectName: string;
  dateConducted: string;
  maxMarks: number;
  testRank: number | null;
  createdBy: {
    teacherId: number;
    teacherName: string;
    teacherEmail: string;
  };
  studentMarks: any[];
  totalStudents: number;
  averageMarks: number;
}

interface SelectedSection {
  sectionName: string;
  className: string;
  students: Student[];
  studentCount: number;
  tests?: Test[];
  viewMode: 'students' | 'tests';
}

interface StudentListModalProps {
  visible: boolean;
  onClose: () => void;
  selectedSection: SelectedSection | null;
}

export default function StudentListModal({
  visible,
  onClose,
  selectedSection,
}: StudentListModalProps) {
  if (!selectedSection) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <View>
            <ThemedText style={styles.modalTitle}>
              {selectedSection.className} - {selectedSection.sectionName}
            </ThemedText>
            {selectedSection.viewMode === 'students' ? (
              <ThemedText style={styles.modalSubtitle}>
                {selectedSection.studentCount} Students
              </ThemedText>
            ) : (
              <ThemedText style={styles.modalSubtitle}>
                {selectedSection.tests && selectedSection.tests.length > 0
                  ? `${selectedSection.tests.length} Tests`
                  : 'No tests currently'}
              </ThemedText>
            )}
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <ThemedText style={styles.closeButtonText}>✕</ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.studentList} showsVerticalScrollIndicator={false}>
          {selectedSection.viewMode === 'students' ? (
            selectedSection.students.map((student) => (
              <TouchableOpacity key={student.studentId} style={styles.studentItem}>
                <View style={styles.studentAvatar}>
                  <ThemedText style={styles.studentAvatarText}>
                    {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </ThemedText>
                </View>
                <View style={styles.studentInfo}>
                  <ThemedText style={styles.studentName}>{student.name}</ThemedText>
                  <ThemedText style={styles.studentDetails}>
                    Roll: {student.rollNumber} • Email: {student.email}
                  </ThemedText>
                </View>
                <View style={styles.studentActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <ThemedText style={styles.actionButtonText}>📞</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <ThemedText style={styles.actionButtonText}>📧</ThemedText>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            selectedSection.tests && selectedSection.tests.length > 0 ? (
              selectedSection.tests.map((test) => (
                <View key={test.testId} style={styles.testItem}>
                  <ThemedText style={styles.testName}>{test.testName}</ThemedText>
                  <ThemedText style={styles.testDetails}>
                    {test.subjectName} • {new Date(test.dateConducted).toLocaleDateString()} • Max: {test.maxMarks} • Avg: {test.averageMarks}
                  </ThemedText>
                </View>
              ))
            ) : (
              <ThemedText style={styles.noTestsText}>No tests currently</ThemedText>
            )
          )}

          <View style={styles.modalBottomSpacing} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#64748b',
    fontWeight: '600',
  },
  studentList: {
    flex: 1,
    padding: 16,
  },
  studentItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  studentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e11b23',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  studentAvatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  studentDetails: {
    fontSize: 12,
    color: '#64748b',
  },
  studentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
  },
  modalBottomSpacing: {
    height: 40,
  },
  testItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  testDetails: {
    fontSize: 12,
    color: '#64748b',
  },
  noTestsText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#64748b',
    textAlign: 'center',
    marginTop: 20,
  },
});
