import { AppDispatch, RootState } from '@/redux/store';
import { clearTeachers, fetchTeacherBySearch } from '@/thunk/teacher/teacherSearch';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

// Types
interface Section {
  section_id: number;
  section_name: string;
  class_id: number;
  class_name: string;
}

interface Teacher {
  teacher_id: number;
  name: string;
  email: string;
}

interface Subject {
  subject_id: number;
  subject_name: string;
  class_id: number;
}

interface FormData {
  section_id: number | null;
  teacher_id: number | null;
  subject_ids: number[];
}

const MAIN_COLOR = '#e11b23';

export default function AddedSectionTeachers() {

   const [searchTeacherByname, setSearchTeacherByName] = useState('');

  const dispatch = useDispatch<AppDispatch>();
  const { teachers:SearchTeacherResult, loading:searchTeacherLoading, error:SearhTeacherError } = useSelector((state: RootState) => state.teacherSearch);

  const handleSearch = () => {
    if (searchTeacherByname.trim()) {
      dispatch(fetchTeacherBySearch(searchTeacherByname));
    }
  };

  const handleClear = () => {
    dispatch(clearTeachers());
    searchTeacherByname('');
  };




  const [sections, setSections] = useState<Section[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showSubjectModal, setShowSubjectModal] = useState<boolean>(false);

  const [formData, setFormData] = useState<FormData>({
    section_id: null,
    teacher_id: null,
    subject_ids: []
  });

  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (formData.section_id) {
      const section = sections.find(s => s.section_id === formData.section_id);
      if (section) {
        const filteredSubjects = subjects.filter(sub => sub.class_id === section.class_id);
        setAvailableSubjects(filteredSubjects);
        setFormData(prev => ({ ...prev, subject_ids: [] }));
      }
    } else {
      setAvailableSubjects([]);
    }
  }, [formData.section_id, subjects, sections]);

  const loadInitialData = async (): Promise<void> => {
    setLoading(true);
    try {
      setSections([
        { section_id: 1, section_name: 'A', class_id: 1, class_name: 'Class 10' },
        { section_id: 2, section_name: 'B', class_id: 1, class_name: 'Class 10' },
        { section_id: 3, section_name: 'A', class_id: 2, class_name: 'Class 9' },
      ]);

      setTeachers([
        { teacher_id: 1, name: 'John Smith', email: 'john@school.com' },
        { teacher_id: 2, name: 'Sarah Johnson', email: 'sarah@school.com' },
        { teacher_id: 3, name: 'Mike Wilson', email: 'mike@school.com' },
      ]);

      setSubjects([
        { subject_id: 1, subject_name: 'Mathematics', class_id: 1 },
        { subject_id: 2, subject_name: 'Physics', class_id: 1 },
        { subject_id: 3, subject_name: 'Chemistry', class_id: 1 },
        { subject_id: 4, subject_name: 'English', class_id: 2 },
        { subject_id: 5, subject_name: 'History', class_id: 2 },
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSectionChange = (sectionId: number | null): void => {
    setFormData(prev => ({ 
      ...prev, 
      section_id: sectionId,
      subject_ids: [] 
    }));
  };

  const handleTeacherChange = (teacherId: number | null): void => {
    setFormData(prev => ({ ...prev, teacher_id: teacherId }));
  };

  const handleSubjectToggle = (subjectId: number): void => {
    setFormData(prev => ({
      ...prev,
      subject_ids: prev.subject_ids.includes(subjectId)
        ? prev.subject_ids.filter(id => id !== subjectId)
        : [...prev.subject_ids, subjectId]
    }));
  };

  const handleSubmit = async (): Promise<void> => {
    if (!formData.section_id || !formData.teacher_id) {
      Alert.alert('Error', 'Please select both section and teacher');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        section_id: formData.section_id,
        teacher_id: formData.teacher_id,
        subject_ids: formData.subject_ids
      };

      console.log('Submitting:', payload);

      const response = await fetch('/api/section-teachers/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        Alert.alert('Success', 'Teacher assigned successfully!');
        resetForm();
      } else {
        Alert.alert('Error', result.message || 'Assignment failed');
      }
    } catch (error) {
      console.error('Error submitting:', error);
      Alert.alert('Error', 'Failed to assign teacher');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = (): void => {
    setFormData({
      section_id: null,
      teacher_id: null,
      subject_ids: []
    });
    setAvailableSubjects([]);
  };

  const getSelectedSubjectNames = (): string => {
    const selected = availableSubjects.filter(sub => 
      formData.subject_ids.includes(sub.subject_id)
    );
    return selected.map(sub => sub.subject_name).join(', ');
  };

  const getSelectedSectionName = (): string => {
    if (!formData.section_id) return '';
    const section = sections.find(s => s.section_id === formData.section_id);
    return section ? `${section.class_name} - ${section.section_name}` : '';
  };

  const getSelectedTeacherName = (): string => {
    if (!formData.teacher_id) return '';
    const teacher = teachers.find(t => t.teacher_id === formData.teacher_id);
    return teacher ? teacher.name : '';
  };

  if (loading && sections.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={MAIN_COLOR} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <MaterialIcons name="school" size={28} color={MAIN_COLOR} />
          <Text style={styles.headerTitle}>Assign Section Teacher</Text>
        </View>

        {/* Main Form */}
        <View style={styles.formContainer}>
          {/* Section Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Select Section</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={formData.section_id}
                onValueChange={handleSectionChange}
                style={styles.picker}
              >
                <Picker.Item label="Choose Section..." value={null} />
                {sections.map((section) => (
                  <Picker.Item
                    key={section.section_id}
                    label={`${section.class_name} - ${section.section_name}`}
                    value={section.section_id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Teacher Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Select Teacher</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={formData.teacher_id}
                onValueChange={handleTeacherChange}
                style={styles.picker}
              >
                <Picker.Item label="Choose Teacher..." value={null} />
                {teachers.map((teacher) => (
                  <Picker.Item
                    key={teacher.teacher_id}
                    label={`${teacher.name} (${teacher.email})`}
                    value={teacher.teacher_id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Subject Selection (Only if section is selected) */}
          {formData.section_id && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Assign Subjects (Optional)</Text>
              <TouchableOpacity
                style={styles.subjectButton}
                onPress={() => setShowSubjectModal(true)}
              >
                <Text style={styles.subjectButtonText}>
                  {formData.subject_ids.length > 0 
                    ? `${formData.subject_ids.length} subject(s) selected`
                    : 'Select subjects...'
                  }
                </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color={MAIN_COLOR} />
              </TouchableOpacity>
              
              {formData.subject_ids.length > 0 && (
                <Text style={styles.selectedSubjects}>
                  {getSelectedSubjectNames()}
                </Text>
              )}
            </View>
          )}

          {/* Form Summary */}
          {(formData.section_id || formData.teacher_id || formData.subject_ids.length > 0) && (
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Assignment Summary</Text>
              {formData.section_id && (
                <Text style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Section: </Text>
                  {getSelectedSectionName()}
                </Text>
              )}
              {formData.teacher_id && (
                <Text style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Teacher: </Text>
                  {getSelectedTeacherName()}
                </Text>
              )}
              {formData.subject_ids.length > 0 && (
                <Text style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Subjects: </Text>
                  {getSelectedSubjectNames()}
                </Text>
              )}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={resetForm}
            >
              <Text style={styles.resetButtonText}>Reset Form</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitButton,
                (!formData.section_id || !formData.teacher_id || loading) && styles.disabledButton
              ]}
              onPress={handleSubmit}
              disabled={!formData.section_id || !formData.teacher_id || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <MaterialIcons name="check" size={20} color="white" />
                  <Text style={styles.submitButtonText}>Assign Teacher</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Subject Selection Modal */}
      <Modal
        visible={showSubjectModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSubjectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Subjects</Text>
              <TouchableOpacity
                onPress={() => setShowSubjectModal(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color={MAIN_COLOR} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {availableSubjects.map((subject) => (
                <TouchableOpacity
                  key={subject.subject_id}
                  style={[
                    styles.subjectOption,
                    formData.subject_ids.includes(subject.subject_id) && styles.selectedOption
                  ]}
                  onPress={() => handleSubjectToggle(subject.subject_id)}
                >
                  <Text style={[
                    styles.subjectOptionText,
                    formData.subject_ids.includes(subject.subject_id) && styles.selectedOptionText
                  ]}>
                    {subject.subject_name}
                  </Text>
                  {formData.subject_ids.includes(subject.subject_id) && (
                    <MaterialIcons name="check-circle" size={20} color={MAIN_COLOR} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => setShowSubjectModal(false)}
            >
              <Text style={styles.confirmButtonText}>
                Confirm ({formData.subject_ids.length} selected)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 12,
    color: '#333',
  },
  formContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fafafa',
  },
  picker: {
    height: 50,
  },
  subjectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fafafa',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  subjectButtonText: {
    fontSize: 16,
    color: '#333',
  },
  selectedSubjects: {
    fontSize: 14,
    color: MAIN_COLOR,
    marginTop: 8,
    fontStyle: 'italic',
  },
  summaryContainer: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: MAIN_COLOR,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  summaryItem: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  summaryLabel: {
    fontWeight: '600',
    color: MAIN_COLOR,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    flex: 1,
    backgroundColor: MAIN_COLOR,
    paddingVertical: 14,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    maxHeight: 300,
  },
  subjectOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedOption: {
    backgroundColor: '#f0f8ff',
  },
  subjectOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    color: MAIN_COLOR,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: MAIN_COLOR,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});