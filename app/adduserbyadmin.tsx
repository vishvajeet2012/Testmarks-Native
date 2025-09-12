import { useAppDispatch, useAppSelector } from '@/hooks/reduxhooks';
import { useAddUserByAdmin } from '@/hooks/useAdduser';
import { clearClasses } from '@/redux/slice/classAndSectionbysearch';
import { searchClassBySectionWithQuery } from '@/thunk/classandsection/getClassSectionBySearch';
import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// Define interfaces for type safety
interface ClassSection {
  section_id: number;
  section_name: string;
}

interface ClassData {
  class_id: number;
  class_name: string;
  sections: ClassSection[];
}

// Define form data types
interface StudentFormData {
  email: string;
  name: string;
  role: string;
  mobileNumber: string;
  profilePicture: string;
  guardianName: string;
  guardianMobileNumber: string;
  studentMobileNumber: string;
  dob: string;
  classId: string;
  sectionId: string;
  rollNumber: string;
}

interface TeacherFormData {
  email: string;
  name: string;
  role: string;
}

type FormData = StudentFormData | TeacherFormData;

export default function Adduserbyadmin() {
  const { role } = useLocalSearchParams<{ role?: string }>();
  const isStudent = role === "Student";
  const dispatch = useAppDispatch();
  
  const { data, loading, error, postData } = useAddUserByAdmin();
  const { classes, loading: classAndSectionLoading, error: classAndSectionError } = useAppSelector(
    (state) => state.class
  );

  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [showClassModal, setShowClassModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [selectedSection, setSelectedSection] = useState<ClassSection | null>(null);

  // Define initial form data with proper typing
  const initialFormData: FormData = isStudent ? {
    email: '',
    name: '',
    role: 'Student',
    mobileNumber: '',
    profilePicture: '',
    guardianName: '',
    guardianMobileNumber: '',
    studentMobileNumber: '',
    dob: '',
    classId: '',
    sectionId: '',
    rollNumber: ''
  } : {
    email: '',
    name: '',
    role: 'Teacher'
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);

  // Handle search for classes
  const handleClassSearch = () => {
    if (localSearchQuery.trim()) {
      dispatch(searchClassBySectionWithQuery(localSearchQuery));
      setShowClassModal(true);
    }
  };

  // Handle class selection
  const handleClassSelect = (classItem: ClassData) => {
    setSelectedClass(classItem);
    setSelectedSection(null);
    
    // Update form data with class ID (only for students)
    if (isStudent) {
      setFormData(prev => ({
        ...prev,
        classId: classItem.class_id.toString(),
        sectionId: ''
      } as StudentFormData));
    }
  };

  // Handle section selection
  const handleSectionSelect = (section: ClassSection) => {
    setSelectedSection(section);
    
    // Update form data with section ID (only for students)
    if (isStudent) {
      setFormData(prev => ({
        ...prev,
        sectionId: section.section_id.toString()
      } as StudentFormData));
    }
    
    setShowClassModal(false);
    setLocalSearchQuery('');
    dispatch(clearClasses());
  };

  // Clear search
  const handleClearSearch = () => {
    setLocalSearchQuery('');
    setShowClassModal(false);
    dispatch(clearClasses());
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    postData(formData);
    Alert.alert('Success', 'User information saved successfully');
  };

  // Render class item in search results
  const renderClassItem = ({ item }: { item: ClassData }) => (
    <View style={styles.classItem}>
      <TouchableOpacity
        style={[
          styles.classButton,
          selectedClass?.class_id === item.class_id && styles.selectedClassButton
        ]}
        onPress={() => handleClassSelect(item)}
      >
        <Text style={[
          styles.classButtonText,
          selectedClass?.class_id === item.class_id && styles.selectedClassButtonText
        ]}>
          {item.class_name}
        </Text>
      </TouchableOpacity>
      
      {selectedClass?.class_id === item.class_id && (
        <View style={styles.sectionsContainer}>
          <Text style={styles.sectionHeader}>Select Section:</Text>
          <FlatList
            data={item.sections}
            renderItem={renderSectionItem}
            keyExtractor={(section) => section.section_id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.sectionRow}
          />
        </View>
      )}
    </View>
  );

  // Render section item
  const renderSectionItem = ({ item }: { item: ClassSection }) => (
    <TouchableOpacity
      style={[
        styles.sectionButton,
        selectedSection?.section_id === item.section_id && styles.selectedSectionButton
      ]}
      onPress={() => handleSectionSelect(item)}
    >
      <Text style={[
        styles.sectionButtonText,
        selectedSection?.section_id === item.section_id && styles.selectedSectionButtonText
      ]}>
        {item.section_name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>
        Add {isStudent ? 'Student' : 'Teacher'}
      </Text>

      <View style={styles.section}>
        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
          placeholder="Enter email"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(value) => handleInputChange('name', value)}
          placeholder="Enter full name"
        />

        {!isStudent && (
          <>
            <Text style={styles.label}>Role</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={formData.role}
              editable={false}
            />
          </>
        )}
      </View>

      {isStudent && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Student Details</Text>

            <Text style={styles.label}>Mobile Number *</Text>
            <TextInput
              style={styles.input}
              value={(formData as StudentFormData).mobileNumber}
              onChangeText={(value) => handleInputChange('mobileNumber', value)}
              placeholder="Enter mobile number"
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>Profile Picture URL</Text>
            <TextInput
              style={styles.input}
              value={(formData as StudentFormData).profilePicture}
              onChangeText={(value) => handleInputChange('profilePicture', value)}
              placeholder="Enter profile picture URL"
            />

            <Text style={styles.label}>Date of Birth *</Text>
            <TextInput
              style={styles.input}
              value={(formData as StudentFormData).dob}
              onChangeText={(value) => handleInputChange('dob', value)}
              placeholder="YYYY-MM-DD"
            />

            {/* Class and Section Search */}
            <Text style={styles.label}>Search Class & Section *</Text>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search for class..."
                value={localSearchQuery}
                onChangeText={setLocalSearchQuery}
                onSubmitEditing={handleClassSearch}
              />
              <TouchableOpacity
                style={styles.searchButton}
                onPress={handleClassSearch}
                disabled={classAndSectionLoading}
              >
                <Text style={styles.searchButtonText}>Search</Text>
              </TouchableOpacity>
            </View>

            {/* Selected Class and Section Display */}
            {selectedClass && (
              <View style={styles.selectionDisplay}>
                <Text style={styles.selectionText}>
                  Selected: {selectedClass.class_name}
                  {selectedSection && ` - ${selectedSection.section_name}`}
                </Text>
                <TouchableOpacity
                  style={styles.changeButton}
                  onPress={() => setShowClassModal(true)}
                >
                  <Text style={styles.changeButtonText}>Change</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Show Class Name instead of ID */}
            <Text style={styles.label}>Class</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={selectedClass ? selectedClass.class_name : ''}
              editable={false}
              placeholder="Select class from search above"
            />

            {/* Show Section Name instead of ID */}
            <Text style={styles.label}>Section</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={selectedSection ? selectedSection.section_name : ''}
              editable={false}
              placeholder="Select section after choosing class"
            />

            <Text style={styles.label}>Roll Number *</Text>
            <TextInput
              style={styles.input}
              value={(formData as StudentFormData).rollNumber}
              onChangeText={(value) => handleInputChange('rollNumber', value)}
              placeholder="Enter roll number"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Guardian Information</Text>

            <Text style={styles.label}>Guardian Name *</Text>
            <TextInput
              style={styles.input}
              value={(formData as StudentFormData).guardianName}
              onChangeText={(value) => handleInputChange('guardianName', value)}
              placeholder="Enter guardian name"
            />

            <Text style={styles.label}>Guardian Mobile Number *</Text>
            <TextInput
              style={styles.input}
              value={(formData as StudentFormData).guardianMobileNumber}
              onChangeText={(value) => handleInputChange('guardianMobileNumber', value)}
              placeholder="Enter guardian mobile number"
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>Student Mobile Number</Text>
            <TextInput
              style={styles.input}
              value={(formData as StudentFormData).studentMobileNumber}
              onChangeText={(value) => handleInputChange('studentMobileNumber', value)}
              placeholder="Enter student mobile number"
              keyboardType="phone-pad"
            />
          </View>
        </>
      )}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Save User</Text>
      </TouchableOpacity>

      {/* Class Selection Modal */}
      <Modal
        visible={showClassModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Class & Section</Text>
            <TouchableOpacity onPress={handleClearSearch}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Search Input in Modal */}
          <View style={styles.modalSearchContainer}>
            <TextInput
              style={styles.modalSearchInput}
              placeholder="Search for class..."
              value={localSearchQuery}
              onChangeText={setLocalSearchQuery}
              onSubmitEditing={handleClassSearch}
            />
            <TouchableOpacity
              style={styles.modalSearchButton}
              onPress={handleClassSearch}
              disabled={classAndSectionLoading}
            >
              {classAndSectionLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.searchButtonText}>Search</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Loading Indicator */}
          {classAndSectionLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Searching...</Text>
            </View>
          )}

          {/* Search Results */}
          {!classAndSectionLoading && classes.length > 0 && (
            <FlatList
              data={classes}
              renderItem={renderClassItem}
              keyExtractor={(item) => item.class_id.toString()}
              style={styles.classList}
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* No Results */}
          {!classAndSectionLoading && localSearchQuery && classes.length === 0 && (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>
                No classes found for "{localSearchQuery}"
              </Text>
            </View>
          )}
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
    color: '#888',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 4,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  selectionDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e8f4fd',
    padding: 12,
    borderRadius: 4,
    marginBottom: 16,
  },
  selectionText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
    flex: 1,
  },
  changeButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  changeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
    paddingHorizontal: 8,
  },
  modalSearchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  modalSearchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    marginRight: 8,
  },
  modalSearchButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 4,
    justifyContent: 'center',
    minWidth: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
  },
  classList: {
    flex: 1,
    padding: 16,
  },
  classItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  classButton: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  selectedClassButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  classButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  selectedClassButtonText: {
    color: '#fff',
  },
  sectionsContainer: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    color: '#666',
  },
  sectionRow: {
    justifyContent: 'space-between',
  },
  sectionButton: {
    flex: 0.48,
    padding: 12,
    backgroundColor: '#e9ecef',
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  selectedSectionButton: {
    backgroundColor: '#28a745',
    borderColor: '#28a745',
  },
  sectionButtonText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
  },
  selectedSectionButtonText: {
    color: '#fff',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
