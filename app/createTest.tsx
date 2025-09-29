import { useAppDispatch, useAppSelector } from '@/hooks/reduxhooks';
import { resetCreateTestState } from '@/redux/slice/createTestSlice';
import { createTestAndNotifyStudents } from '@/thunk/teacherScreen/createTestAndNotify';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Subject {
  subjectId: number;
  subjectName: string;
}

interface Section {
  sectionId: number;
  sectionName: string;
  isClassTeacher: boolean;
  studentCount: number;
}

interface ClassData {
  classId: number;
  className: string;
  subjects: Subject[];
  sections: Section[];
}

interface CreateTestProps {
  visible: boolean;
  onClose: () => void;
  classData: ClassData;
}

export default function CreateTest({ visible, onClose, classData }: CreateTestProps) {
  const dispatch = useAppDispatch();
  const { loading, error, data } = useAppSelector((state) => state.createTest);

  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [testName, setTestName] = useState('');
  const [dateConducted, setDateConducted] = useState('');
  const [maxMarks, setMaxMarks] = useState('');

  const handleCreateTest = () => {
    if (!selectedSection || !selectedSubject || !testName || !dateConducted || !maxMarks) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const payload = {
      class_id: classData.classId,
      section_id: selectedSection,
      subject_id: selectedSubject,
      test_name: testName,
      date_conducted: dateConducted,
      max_marks: parseInt(maxMarks),
    };

    dispatch(createTestAndNotifyStudents(payload));
  };

  const handleClose = () => {
    dispatch(resetCreateTestState());
    setSelectedSection(null);
    setSelectedSubject(null);
    setTestName('');
    setDateConducted('');
    setMaxMarks('');
    onClose();
  };

  useEffect(() => {
    if (data) {
      Alert.alert('Success', data.message);
      handleClose();
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Test for {classData.className}</Text>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Select Section</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedSection}
              onValueChange={(itemValue) => setSelectedSection(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select Section" value={null} />
              {classData.sections.map((section) => (
                <Picker.Item key={section.sectionId} label={section.sectionName} value={section.sectionId} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Select Subject</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedSubject}
              onValueChange={(itemValue) => setSelectedSubject(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select Subject" value={null} />
              {classData.subjects.map((subject) => (
                <Picker.Item key={subject.subjectId} label={subject.subjectName} value={subject.subjectId} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Test Name</Text>
          <TextInput
            style={styles.input}
            value={testName}
            onChangeText={setTestName}
            placeholder="Enter test name"
          />

          <Text style={styles.label}>Date Conducted (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={dateConducted}
            onChangeText={setDateConducted}
            placeholder="e.g., 2023-12-01"
          />

          <Text style={styles.label}>Max Marks</Text>
          <TextInput
            style={styles.input}
            value={maxMarks}
            onChangeText={setMaxMarks}
            placeholder="Enter max marks"
            keyboardType="numeric"
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleCreateTest}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Create Test'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  closeButton: {
    fontSize: 24,
    color: '#64748b',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  picker: {
    height: 50,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  button: {
    backgroundColor: '#e11b23',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
