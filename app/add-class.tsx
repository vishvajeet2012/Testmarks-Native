import { useAppDispatch, useAppSelector } from '@/hooks/reduxhooks';
import { RootState } from '@/redux/store';
import { createClass } from '@/thunk/classandsection/createClass';
import React, { useMemo, useState } from 'react';
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
    View,
} from 'react-native';

type SectionLabel = 'Section A' | 'Section B' | 'Section C' | 'Section D' | 'Section E' | 'Section F' | 'Section G' | 'Section H';

export default function AddClass() {
  const dispatch = useAppDispatch();

  // Form state
  const [className, setClassName] = useState('');
  const [description, setDescription] = useState('');
  const [subjects, setSubjects] = useState(''); // e.g. "English, Math, Biology"
  const [classTeacherId, setClassTeacherId] = useState('');
  const [selectedSections, setSelectedSections] = useState<SectionLabel[]>([]);
  const [showSectionsModal, setShowSectionsModal] = useState(false);

  const { loading, error, successMessage } = useAppSelector((state: RootState) => state.createClass);

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  // Available sections
  const sections: SectionLabel[] = useMemo(
    () => [
      'Section A',
      'Section B',
      'Section C',
      'Section D',
      'Section E',
      'Section F',
      'Section G',
      'Section H',
    ],
    []
  );

  // Toggle selection
  const toggleSection = (section: SectionLabel) => {
    setSelectedSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  // Convert ["Section A","Section C"] -> "a,c"
  const formatSectionsForPayload = (labels: string[]) => {
    const letters = labels
      .map(label => {
        const match = label.match(/Section\s+([A-H])/i);
        return match ? match[1].toLowerCase() : '';
      })
      .filter(Boolean);
    return letters.join(',');
  };

  const handleAddClass = async () => {
    // Basic validation
    if (!className.trim()) {
      Alert.alert('Error', 'Please enter class name');
      return;
    }
    if (selectedSections.length === 0) {
      Alert.alert('Error', 'Please select at least one section');
      return;
    }
    if (!classTeacherId.trim() || Number.isNaN(Number(classTeacherId))) {
      Alert.alert('Error', 'Please enter a valid numeric Class Teacher ID');
      return;
    }

    const classData = {
      className: className.trim(),
      description: description.trim(),
      section_name: formatSectionsForPayload(selectedSections),
      class_teacher_id: Number(classTeacherId),
      subjects: subjects.trim(), // as provided in example JSON
    };

    try {
      await dispatch(createClass(classData)).unwrap();
      if (!error && successMessage) {
        Alert.alert('Success', successMessage || 'Class added successfully!');
        // Reset form
        setClassName('');
        setDescription('');
        setSubjects('');
        setClassTeacherId('');
        setSelectedSections([]);
      }
    } catch (err) {
      console.error('Error adding class:', err);
    }
  };

  // UI helpers
  const selectedSectionsSummary =
    selectedSections.length === 0
      ? 'Select Sections'
      : `${selectedSections.length} selected: ${selectedSections.join(', ')}`;

  const renderSectionItem = ({ item }: { item: SectionLabel }) => {
    const isSelected = selectedSections.includes(item);
    return (
      <TouchableOpacity
        style={[styles.sectionItem, isSelected && styles.sectionItemSelected]}
        onPress={() => toggleSection(item)}
      >
        <Text style={[styles.sectionItemText, isDarkMode && styles.darkText]}>
          {item}
        </Text>
        <Text style={[styles.checkmark, isSelected ? styles.checkmarkOn : styles.checkmarkOff]}>
          {isSelected ? '✓' : ''}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <View style={styles.header}>
        <Text style={[styles.headerText, isDarkMode && styles.darkText]}>
          Add New Class
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={[styles.label, isDarkMode && styles.darkText]}>
            Class Name *
          </Text>
          <TextInput
            style={[styles.input, isDarkMode && styles.darkInput]}
            placeholder="Enter class name (e.g., Class 6)"
            placeholderTextColor={isDarkMode ? '#888' : '#999'}
            value={className}
            onChangeText={setClassName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, isDarkMode && styles.darkText]}>
            Description
          </Text>
          <TextInput
            style={[styles.input, styles.textArea, isDarkMode && styles.darkInput]}
            placeholder="Enter class description"
            placeholderTextColor={isDarkMode ? '#888' : '#999'}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, isDarkMode && styles.darkText]}>
            Sections *
          </Text>
          <TouchableOpacity
            style={[styles.input, styles.pickerInput, isDarkMode && styles.darkInput]}
            onPress={() => setShowSectionsModal(true)}
          >
            <Text
              style={[
                styles.pickerText,
                (!selectedSections.length) && styles.placeholderText,
                isDarkMode && styles.darkText,
              ]}
              numberOfLines={2}
            >
              {selectedSectionsSummary}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, isDarkMode && styles.darkText]}>
            Class Teacher ID *
          </Text>
          <TextInput
            style={[styles.input, isDarkMode && styles.darkInput]}
            placeholder="Enter teacher ID (numeric)"
            placeholderTextColor={isDarkMode ? '#888' : '#999'}
            value={classTeacherId}
            onChangeText={setClassTeacherId}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, isDarkMode && styles.darkText]}>
            Subjects
          </Text>
          <TextInput
            style={[styles.input, isDarkMode && styles.darkInput]}
            placeholder="e.g., English, Math, Biology"
            placeholderTextColor={isDarkMode ? '#888' : '#999'}
            value={subjects}
            onChangeText={setSubjects}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleAddClass}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Add Class</Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={showSectionsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSectionsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, isDarkMode && styles.darkModalContent]}>
            <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>
              Select Sections
            </Text>

            <FlatList
              data={sections}
              renderItem={renderSectionItem}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              extraData={selectedSections}
            />

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowSectionsModal(false)}
            >
              <Text style={styles.closeButtonText}>Done</Text>
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
  darkContainer: {
    backgroundColor: '#121212',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  darkText: {
    color: '#fff',
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  darkInput: {
    backgroundColor: '#333',
    borderColor: '#555',
    color: '#fff',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerInput: {
    justifyContent: 'center',
    minHeight: 48,
  },
  pickerText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '60%',
  },
  darkModalContent: {
    backgroundColor: '#333',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  sectionItem: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionItemSelected: {
    backgroundColor: '#e7f0ff',
  },
  sectionItemText: {
    fontSize: 16,
    color: '#333',
  },
  checkmark: {
    fontSize: 18,
    fontWeight: '700',
  },
  checkmarkOn: {
    color: '#007AFF',
  },
  checkmarkOff: {
    color: 'transparent',
  },
  closeButton: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
