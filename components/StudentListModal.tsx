import { useAppDispatch, useAppSelector } from '@/hooks/reduxhooks';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { clearBulkUpdateResult, clearUpdateResult } from '../redux/slice/marksSlice';
import { bulkUpdateMarks, getMyTestMarks, updateStudentMarks } from '../thunk/teacher/marks';
import { getTestRanking } from '../thunk/teacher/testRanking';
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
  selectedTest?: Test | null;
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
  const dispatch = useAppDispatch();
  const { marks, loading: marksLoading, updateLoading, updateError, lastUpdateResult, bulkUpdateLoading, bulkUpdateError, bulkUpdateResult } = useAppSelector((state) => state.marks);
  const { data: rankingData, loading: rankingLoading, error: rankingError } = useAppSelector((state: any) => state.testRanking);

  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [editingMarks, setEditingMarks] = useState<{ [key: number]: string }>({});
  const [viewMode, setViewMode] = useState<'tests' | 'marks' | 'rankings'>('tests');

  useEffect(() => {
    if (visible && selectedSection?.viewMode === 'tests' && selectedTest) {
      dispatch(getMyTestMarks({ test_id: selectedTest.testId }));
    }
  }, [visible, selectedSection, selectedTest, dispatch]);

  useEffect(() => {
    if (!visible) {
      setSelectedTest(null);
      setEditingMarks({});
      dispatch(clearUpdateResult());
    }
  }, [visible, dispatch]);

  useEffect(() => {
    if (lastUpdateResult) {
      Alert.alert('Success', 'Marks updated successfully and sent for approval.');
      dispatch(clearUpdateResult());
    }
  }, [lastUpdateResult, dispatch]);

  useEffect(() => {
    if (updateError) {
      Alert.alert('Error', updateError);
      dispatch(clearUpdateResult());
    }
  }, [updateError, dispatch]);

  useEffect(() => {
    if (bulkUpdateResult) {
      Alert.alert('Success', 'All marks updated successfully and sent for approval.');
      dispatch(clearBulkUpdateResult());
    }
  }, [bulkUpdateResult, dispatch]);

  useEffect(() => {
    if (bulkUpdateError) {
      Alert.alert('Error', bulkUpdateError);
      dispatch(clearBulkUpdateResult());
    }
  }, [bulkUpdateError, dispatch]);

  const handleTestSelect = (test: Test) => {
    Alert.alert(
      'Select Action',
      `What would you like to do with ${test.testName}?`,
      [
        {
          text: 'Edit Marks',
          onPress: () => {
            setSelectedTest(test);
            setViewMode('marks');
          },
        },
        {
          text: 'View Rankings',
          onPress: () => {
            setSelectedTest(test);
            setViewMode('rankings');
            dispatch(getTestRanking({ test_id: test.testId.toString() }));
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleMarksChange = (studentId: number, marks: string) => {
    setEditingMarks(prev => ({
      ...prev,
      [studentId]: marks
    }));
  };

  const handleMarksUpdate = (studentId: number) => {
    if (!selectedTest) return;

    const marksValue = parseFloat(editingMarks[studentId]);
    if (isNaN(marksValue) || marksValue < 0 || marksValue > selectedTest.maxMarks) {
      Alert.alert('Invalid Marks', `Marks must be between 0 and ${selectedTest.maxMarks}`);
      return;
    }

    dispatch(updateStudentMarks({
      test_id: selectedTest.testId,
      student_id: studentId,
      marks_obtained: marksValue
    }));
  };

  const getStudentMarks = (studentId: number) => {
    const studentMarks = marks.find((m: any) => m.student_id === studentId);
    return studentMarks ? studentMarks.marks_obtained.toString() : '0';
  };

  const getMarksStatus = (studentId: number) => {
    const studentMarks = marks.find((m: any) => m.student_id === studentId);
    return studentMarks ? studentMarks.status : 'Not Submitted';
  };

  const handleBulkUpdate = () => {
    if (!selectedTest) return;

    const marksData = Object.entries(editingMarks)
      .map(([studentId, marksStr]) => {
        const marksValue = parseFloat(marksStr);
        if (isNaN(marksValue) || marksValue < 0 || marksValue > selectedTest.maxMarks) {
          return null;
        }
        return {
          student_id: parseInt(studentId),
          marks_obtained: marksValue
        };
      })
      .filter(item => item !== null);

    if (marksData.length === 0) {
      Alert.alert('No Valid Marks', 'Please enter valid marks for at least one student.');
      return;
    }

    dispatch(bulkUpdateMarks({
      test_id: selectedTest.testId,
      marks_data: marksData
    }));
  };

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
              {selectedTest
                ? `${selectedSection.className} - ${selectedSection.sectionName} - ${selectedTest.testName}`
                : `${selectedSection.className} - ${selectedSection.sectionName}`
              }
            </ThemedText>
            {selectedTest ? (
              <ThemedText style={styles.modalSubtitle}>
                Max Marks: {selectedTest.maxMarks} • Students: {selectedSection.students.length}
              </ThemedText>
            ) : selectedSection.viewMode === 'students' ? (
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
          <View style={styles.headerActions}>
            {selectedTest && (
              <>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => {
                    setSelectedTest(null);
                    setViewMode('tests');
                  }}
                >
                  <ThemedText style={styles.backButtonText}>← Back</ThemedText>
                </TouchableOpacity>
                {viewMode === 'marks' && (
                  <TouchableOpacity
                    style={[styles.bulkUpdateButton, bulkUpdateLoading && styles.bulkUpdateButtonDisabled]}
                    onPress={handleBulkUpdate}
                    disabled={bulkUpdateLoading}
                  >
                    <ThemedText style={styles.bulkUpdateButtonText}>
                      {bulkUpdateLoading ? '...' : 'Bulk Update'}
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <ThemedText style={styles.closeButtonText}>✕</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.studentList} showsVerticalScrollIndicator={false}>
          {selectedTest && viewMode === 'marks' ? (
            // Show students with marks for selected test
            selectedSection.students.map((student) => {
              const currentMarks = editingMarks[student.studentId] ?? getStudentMarks(student.studentId);
              const status = getMarksStatus(student.studentId);

              return (
                <View key={student.studentId} style={styles.marksItem}>
                  <View style={styles.studentAvatar}>
                    <ThemedText style={styles.studentAvatarText}>
                      {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </ThemedText>
                  </View>
                  <View style={styles.studentInfo}>
                    <ThemedText style={styles.studentName}>{student.name}</ThemedText>
                    <ThemedText style={styles.studentDetails}>
                      Roll: {student.rollNumber}
                    </ThemedText>
                  </View>
                  <View style={styles.marksContainer}>
                    <TextInput
                      style={styles.marksInput}
                      value={currentMarks}
                      onChangeText={(text) => handleMarksChange(student.studentId, text)}
                      keyboardType="numeric"
                      placeholder="0"
                      maxLength={3}
                    />
                    <ThemedText style={styles.maxMarksText}>/{selectedTest.maxMarks}</ThemedText>
                  </View>
                  <View style={styles.marksActions}>
                    <ThemedText style={[styles.statusText, { color: status === 'Approved' ? '#10b981' : status === 'PendingApproval' ? '#f59e0b' : '#ef4444' }]}>
                      {status}
                    </ThemedText>
                    <TouchableOpacity
                      style={[styles.updateButton, updateLoading && styles.updateButtonDisabled]}
                      onPress={() => handleMarksUpdate(student.studentId)}
                      disabled={updateLoading}
                    >
                      <ThemedText style={styles.updateButtonText}>
                        {updateLoading ? '...' : 'Update'}
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          ) : selectedTest && viewMode === 'rankings' ? (
            // Show rankings for selected test
            rankingLoading ? (
              <View style={styles.loadingContainer}>
                <ThemedText style={styles.loadingText}>Loading rankings...</ThemedText>
              </View>
            ) : rankingError ? (
              <View style={styles.errorContainer}>
                <ThemedText style={styles.errorText}>{rankingError}</ThemedText>
              </View>
            ) : rankingData ? (
              <>
                <View style={styles.rankingSummary}>
                  <ThemedText style={styles.summaryTitle}>Test Summary</ThemedText>
                  <View style={styles.summaryGrid}>
                    <View style={styles.summaryItem}>
                      <ThemedText style={styles.summaryValue}>{rankingData.total_students}</ThemedText>
                      <ThemedText style={styles.summaryLabel}>Total Students</ThemedText>
                    </View>
                    <View style={styles.summaryItem}>
                      <ThemedText style={styles.summaryValue}>{rankingData.students_attempted}</ThemedText>
                      <ThemedText style={styles.summaryLabel}>Attempted</ThemedText>
                    </View>
                    <View style={styles.summaryItem}>
                      <ThemedText style={styles.summaryValue}>{rankingData.average_marks.toFixed(1)}</ThemedText>
                      <ThemedText style={styles.summaryLabel}>Average</ThemedText>
                    </View>
                    <View style={styles.summaryItem}>
                      <ThemedText style={styles.summaryValue}>{rankingData.highest_marks}</ThemedText>
                      <ThemedText style={styles.summaryLabel}>Highest</ThemedText>
                    </View>
                  </View>
                </View>
                <View style={styles.rankingsHeader}>
                  <ThemedText style={styles.rankingsTitle}>Student Rankings</ThemedText>
                </View>
                {rankingData.student_rankings.map((student: any) => (
                  <View key={student.student_id} style={styles.rankingItem}>
                    <View style={styles.rankBadge}>
                      <ThemedText style={styles.rankText}>#{student.rank}</ThemedText>
                    </View>
                    <View style={styles.studentAvatar}>
                      <ThemedText style={styles.studentAvatarText}>
                        {student.student_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                      </ThemedText>
                    </View>
                    <View style={styles.studentInfo}>
                      <ThemedText style={styles.studentName}>{student.student_name}</ThemedText>
                      <ThemedText style={styles.studentDetails}>
                        {student.student_email}
                      </ThemedText>
                    </View>
                    <View style={styles.marksContainer}>
                      <ThemedText style={styles.marksValue}>{student.marks_obtained}/{rankingData.max_marks}</ThemedText>
                      <ThemedText style={styles.percentageText}>{student.percentage.toFixed(1)}%</ThemedText>
                    </View>
                  </View>
                ))}
              </>
            ) : (
              <View style={styles.noDataContainer}>
                <ThemedText style={styles.noDataText}>No ranking data available</ThemedText>
              </View>
            )
          ) : selectedSection.viewMode === 'students' ? (
            // Show students list
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
            // Show tests list
            selectedSection.tests && selectedSection.tests.length > 0 ? (
              selectedSection.tests.map((test) => (
                <TouchableOpacity
                  key={test.testId}
                  style={styles.testItem}
                  onPress={() => handleTestSelect(test)}
                >
                  <View style={styles.testInfo}>
                    <ThemedText style={styles.testName}>{test.testName}</ThemedText>
                    <ThemedText style={styles.testDetails}>
                      {test.subjectName} • {new Date(test.dateConducted).toLocaleDateString()} • Max: {test.maxMarks} • Avg: {test.averageMarks}
                    </ThemedText>
                  </View>
                  <View style={styles.testArrow}>
                    <ThemedText style={styles.testArrowText}>›</ThemedText>
                  </View>
                </TouchableOpacity>
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
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    minHeight: 80,
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
    paddingTop: 20,
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexShrink: 0,
  },
  backButton: {
    width: 60,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  bulkUpdateButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  bulkUpdateButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  bulkUpdateButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  marksItem: {
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
  marksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  marksInput: {
    width: 60,
    height: 36,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    paddingHorizontal: 8,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    backgroundColor: '#f8fafc',
  },
  maxMarksText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 4,
  },
  marksActions: {
    alignItems: 'center',
    minWidth: 80,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  updateButton: {
    backgroundColor: '#e11b23',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  updateButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  updateButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  testInfo: {
    flex: 1,
  },
  testArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  testArrowText: {
    fontSize: 18,
    color: '#64748b',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  rankingSummary: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#e11b23',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  rankingsHeader: {
    marginBottom: 12,
  },
  rankingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  rankingItem: {
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
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  marksValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  percentageText: {
    fontSize: 12,
    color: '#64748b',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noDataText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
});
