import { useAppDispatch, useAppSelector } from '@/hooks/reduxhooks';
import { useAddUserByAdmin } from '@/hooks/useAdduser';
import { clearClasses } from '@/redux/slice/classAndSectionbysearch';
import { searchClassBySectionWithQuery } from '@/thunk/classandsection/getClassSectionBySearch';
import { useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
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

interface ClassAssignment {
  class_id: number;
  section_id: number;
}

interface SubjectAssignment {
  class_id: number;
  subject_name: string;
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
  mobileNumber: string;
  profilePicture: string;
  assignedSubjects: string[];
  classAssignments: ClassAssignment[];
  subjectAssignments: SubjectAssignment[];
  isClassTeacher: boolean;
  classTeacherForSection: string;
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

  // Teacher-specific states
  const [currentSubject, setCurrentSubject] = useState('');
  const [selectedClassAssignments, setSelectedClassAssignments] = useState<ClassAssignment[]>([]);

  // New states for Class Teacher Section search
  const [showClassTeacherModal, setShowClassTeacherModal] = useState(false);
  const [classTeacherSearchQuery, setClassTeacherSearchQuery] = useState('');
  const [selectedClassTeacherSection, setSelectedClassTeacherSection] = useState<{
    class_id: number;
    section_id: number;
    class_name: string;
    section_name: string;
  } | null>(null);

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
    role: 'Teacher',
    mobileNumber: '',
    profilePicture: '',
    assignedSubjects: [],
    classAssignments: [],
    subjectAssignments: [],
    isClassTeacher: false,
    classTeacherForSection: ''
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);

  // Filter assigned classes for class teacher selection
  const assignedClassesForTeacher = useMemo(() => {
    if (isStudent) return [];
    
    const teacherData = formData as TeacherFormData;
    return classes.filter(classItem => 
      teacherData.classAssignments.some(assignment => assignment.class_id === classItem.class_id)
    ).map(classItem => ({
      ...classItem,
      sections: classItem.sections.filter(section =>
        teacherData.classAssignments.some(assignment => 
          assignment.class_id === classItem.class_id && assignment.section_id === section.section_id
        )
      )
    }));
  }, [classes, formData, isStudent]);

  // Filter assigned classes based on search query
  const filteredAssignedClasses = useMemo(() => {
    if (!classTeacherSearchQuery.trim()) return assignedClassesForTeacher;
    
    const searchTerm = classTeacherSearchQuery.toLowerCase();
    return assignedClassesForTeacher.filter(classItem => {
      const classMatch = classItem.class_name.toLowerCase().includes(searchTerm);
      const sectionMatch = classItem.sections.some(section => 
        section.section_name.toLowerCase().includes(searchTerm)
      );
      const combinedMatch = `${classItem.class_name} ${classItem.sections.map(s => s.section_name).join(' ')}`.toLowerCase().includes(searchTerm);
      
      return classMatch || sectionMatch || combinedMatch;
    });
  }, [assignedClassesForTeacher, classTeacherSearchQuery]);

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
    
    if (isStudent) {
      // Update form data with class ID (only for students)
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
    
    if (isStudent) {
      // Update form data with section ID (only for students)
      setFormData(prev => ({
        ...prev,
        sectionId: section.section_id.toString()
      } as StudentFormData));
    }
    
    setShowClassModal(false);
    setLocalSearchQuery('');
    dispatch(clearClasses());
  };

  // Handle class assignment for teachers
  const handleTeacherClassAssignment = (section: ClassSection) => {
    if (!selectedClass) return;

    const newAssignment: ClassAssignment = {
      class_id: selectedClass.class_id,
      section_id: section.section_id
    };

    const teacherData = formData as TeacherFormData;
    const existingAssignment = teacherData.classAssignments.find(
      assignment => assignment.class_id === newAssignment.class_id && assignment.section_id === newAssignment.section_id
    );

    if (!existingAssignment) {
      setFormData(prev => ({
        ...prev,
        classAssignments: [...teacherData.classAssignments, newAssignment]
      } as TeacherFormData));
      setSelectedClassAssignments(prev => [...prev, newAssignment]);
    }

    setShowClassModal(false);
    setLocalSearchQuery('');
    dispatch(clearClasses());
  };

  // Handle class teacher section selection
  const handleClassTeacherSectionSelect = (classItem: ClassData, section: ClassSection) => {
    const selectionData = {
      class_id: classItem.class_id,
      section_id: section.section_id,
      class_name: classItem.class_name,
      section_name: section.section_name
    };

    setSelectedClassTeacherSection(selectionData);
    setFormData(prev => ({
      ...prev,
      classTeacherForSection: section.section_id.toString()
    } as TeacherFormData));

    setShowClassTeacherModal(false);
    setClassTeacherSearchQuery('');
  };

  // Remove class assignment for teachers
  const removeClassAssignment = (assignmentToRemove: ClassAssignment) => {
    const teacherData = formData as TeacherFormData;
    setFormData(prev => ({
      ...prev,
      classAssignments: teacherData.classAssignments.filter(
        assignment => !(assignment.class_id === assignmentToRemove.class_id && assignment.section_id === assignmentToRemove.section_id)
      )
    } as TeacherFormData));
    setSelectedClassAssignments(prev => prev.filter(
      assignment => !(assignment.class_id === assignmentToRemove.class_id && assignment.section_id === assignmentToRemove.section_id)
    ));

    // Clear class teacher selection if it matches the removed assignment
    if (selectedClassTeacherSection && 
        selectedClassTeacherSection.class_id === assignmentToRemove.class_id && 
        selectedClassTeacherSection.section_id === assignmentToRemove.section_id) {
      setSelectedClassTeacherSection(null);
      setFormData(prev => ({
        ...prev,
        classTeacherForSection: ''
      } as TeacherFormData));
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setLocalSearchQuery('');
    setShowClassModal(false);
    dispatch(clearClasses());
  };

  // Clear class teacher search
  const handleClearClassTeacherSearch = () => {
    setClassTeacherSearchQuery('');
    setShowClassTeacherModal(false);
  };

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear class teacher selection when isClassTeacher is set to false
    if (field === 'isClassTeacher' && value === false) {
      setSelectedClassTeacherSection(null);
      setFormData(prev => ({
        ...prev,
        classTeacherForSection: ''
      } as TeacherFormData));
    }
  };

  // Add subject to assigned subjects
  const addSubject = () => {
    if (currentSubject.trim() && !isStudent) {
      const teacherData = formData as TeacherFormData;
      if (!teacherData.assignedSubjects.includes(currentSubject.trim())) {
        setFormData(prev => ({
          ...prev,
          assignedSubjects: [...teacherData.assignedSubjects, currentSubject.trim()]
        } as TeacherFormData));
      }
      setCurrentSubject('');
    }
  };

  // Remove subject from assigned subjects
  const removeSubject = (subjectToRemove: string) => {
    if (!isStudent) {
      const teacherData = formData as TeacherFormData;
      setFormData(prev => ({
        ...prev,
        assignedSubjects: teacherData.assignedSubjects.filter(subject => subject !== subjectToRemove)
      } as TeacherFormData));
    }
  };

  // Add subject assignment
  const addSubjectAssignment = () => {
    if (selectedClass && currentSubject.trim() && !isStudent) {
      const teacherData = formData as TeacherFormData;
      const newSubjectAssignment: SubjectAssignment = {
        class_id: selectedClass.class_id,
        subject_name: currentSubject.trim()
      };

      const existingAssignment = teacherData.subjectAssignments.find(
        assignment => assignment.class_id === newSubjectAssignment.class_id && assignment.subject_name === newSubjectAssignment.subject_name
      );

      if (!existingAssignment) {
        setFormData(prev => ({
          ...prev,
          subjectAssignments: [...teacherData.subjectAssignments, newSubjectAssignment]
        } as TeacherFormData));
      }
      setCurrentSubject('');
    }
  };

  // Remove subject assignment
  const removeSubjectAssignment = (assignmentToRemove: SubjectAssignment) => {
    if (!isStudent) {
      const teacherData = formData as TeacherFormData;
      setFormData(prev => ({
        ...prev,
        subjectAssignments: teacherData.subjectAssignments.filter(
          assignment => !(assignment.class_id === assignmentToRemove.class_id && assignment.subject_name === assignmentToRemove.subject_name)
        )
      } as TeacherFormData));
    }
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    postData(formData);
    Alert.alert('Success', 'User information saved successfully');
  };

  // Get class name by ID
  const getClassNameById = (classId: number) => {
    const foundClass = classes.find(cls => cls.class_id === classId);
    return foundClass ? foundClass.class_name : `Class ${classId}`;
  };

  // Get section name by ID
  const getSectionNameById = (classId: number, sectionId: number) => {
    const foundClass = classes.find(cls => cls.class_id === classId);
    if (foundClass) {
      const foundSection = foundClass.sections.find(sec => sec.section_id === sectionId);
      return foundSection ? foundSection.section_name : `Section ${sectionId}`;
    }
    return `Section ${sectionId}`;
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
      onPress={() => isStudent ? handleSectionSelect(item) : handleTeacherClassAssignment(item)}
    >
      <Text style={[
        styles.sectionButtonText,
        selectedSection?.section_id === item.section_id && styles.selectedSectionButtonText
      ]}>
        {item.section_name}
      </Text>
    </TouchableOpacity>
  );

  // Render class teacher section item
  const renderClassTeacherSectionItem = ({ item }: { item: ClassData }) => (
    <View style={styles.classItem}>
      <View style={styles.classTeacherClassHeader}>
        <Text style={styles.classTeacherClassName}>{item.class_name}</Text>
      </View>
      <View style={styles.sectionsContainer}>
        <FlatList
          data={item.sections}
          renderItem={({ item: section }) => (
            <TouchableOpacity
              style={[
                styles.classTeacherSectionButton,
                selectedClassTeacherSection?.section_id === section.section_id && 
                selectedClassTeacherSection?.class_id === item.class_id && 
                styles.selectedClassTeacherSectionButton
              ]}
              onPress={() => handleClassTeacherSectionSelect(item, section)}
            >
              <Text style={[
                styles.classTeacherSectionButtonText,
                selectedClassTeacherSection?.section_id === section.section_id && 
                selectedClassTeacherSection?.class_id === item.class_id && 
                styles.selectedClassTeacherSectionButtonText
              ]}>
                {item.class_name} - {section.section_name}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(section) => `${item.class_id}-${section.section_id}`}
          numColumns={1}
        />
      </View>
    </View>
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

        <Text style={styles.label}>Role</Text>
        <TextInput
          style={[styles.input, styles.disabledInput]}
          value={formData.role}
          editable={false}
        />

        <Text style={styles.label}>Mobile Number *</Text>
        <TextInput
          style={styles.input}
          value={formData.mobileNumber}
          onChangeText={(value) => handleInputChange('mobileNumber', value)}
          placeholder="Enter mobile number"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Profile Picture URL</Text>
        <TextInput
          style={styles.input}
          value={formData.profilePicture}
          onChangeText={(value) => handleInputChange('profilePicture', value)}
          placeholder="Enter profile picture URL"
        />
      </View>

      {isStudent && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Student Details</Text>
            
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

      {!isStudent && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Teacher Details</Text>

            {/* Assigned Subjects */}
            <Text style={styles.label}>Assigned Subjects</Text>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Enter subject name"
                value={currentSubject}
                onChangeText={setCurrentSubject}
                onSubmitEditing={addSubject}
              />
              <TouchableOpacity
                style={styles.searchButton}
                onPress={addSubject}
              >
                <Text style={styles.searchButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            {/* Display assigned subjects */}
            {(formData as TeacherFormData).assignedSubjects.length > 0 && (
              <View style={styles.subjectsContainer}>
                {(formData as TeacherFormData).assignedSubjects.map((subject, index) => (
                  <View key={index} style={styles.subjectChip}>
                    <Text style={styles.subjectChipText}>{subject}</Text>
                    <TouchableOpacity onPress={() => removeSubject(subject)}>
                      <Text style={styles.removeChipText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Class Assignments */}
            <Text style={styles.label}>Class Assignments</Text>
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

            {/* Display class assignments */}
            {(formData as TeacherFormData).classAssignments.length > 0 && (
              <View style={styles.assignmentsContainer}>
                <Text style={styles.assignmentsHeader}>Assigned Classes:</Text>
                {(formData as TeacherFormData).classAssignments.map((assignment, index) => (
                  <View key={index} style={styles.assignmentChip}>
                    <Text style={styles.assignmentChipText}>
                      {getClassNameById(assignment.class_id)} - {getSectionNameById(assignment.class_id, assignment.section_id)}
                    </Text>
                    <TouchableOpacity onPress={() => removeClassAssignment(assignment)}>
                      <Text style={styles.removeChipText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Subject Assignments */}
            <Text style={styles.label}>Subject Assignments</Text>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Enter subject for selected class"
                value={currentSubject}
                onChangeText={setCurrentSubject}
              />
              <TouchableOpacity
                style={styles.searchButton}
                onPress={addSubjectAssignment}
                disabled={!selectedClass}
              >
                <Text style={styles.searchButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            {selectedClass && (
              <Text style={styles.helperText}>
                Adding subject for: {selectedClass.class_name}
              </Text>
            )}

            {/* Display subject assignments */}
            {(formData as TeacherFormData).subjectAssignments.length > 0 && (
              <View style={styles.assignmentsContainer}>
                <Text style={styles.assignmentsHeader}>Subject Assignments:</Text>
                {(formData as TeacherFormData).subjectAssignments.map((assignment, index) => (
                  <View key={index} style={styles.assignmentChip}>
                    <Text style={styles.assignmentChipText}>
                      {getClassNameById(assignment.class_id)} - {assignment.subject_name}
                    </Text>
                    <TouchableOpacity onPress={() => removeSubjectAssignment(assignment)}>
                      <Text style={styles.removeChipText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Class Teacher Settings */}
            <View style={styles.switchContainer}>
              <Text style={styles.label}>Is Class Teacher</Text>
              <Switch
                value={(formData as TeacherFormData).isClassTeacher}
                onValueChange={(value) => handleInputChange('isClassTeacher', value)}
              />
            </View>

            {(formData as TeacherFormData).isClassTeacher && (
              <>
                <Text style={styles.label}>Class Teacher For Section</Text>
                
                {/* Search for Class Teacher Section */}
                <View style={styles.searchContainer}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search from assigned classes..."
                    value={classTeacherSearchQuery}
                    onChangeText={setClassTeacherSearchQuery}
                  />
                  <TouchableOpacity
                    style={styles.searchButton}
                    onPress={() => setShowClassTeacherModal(true)}
                    disabled={(formData as TeacherFormData).classAssignments.length === 0}
                  >
                    <Text style={styles.searchButtonText}>Select</Text>
                  </TouchableOpacity>
                </View>

                {/* Selected Class Teacher Section Display */}
                {selectedClassTeacherSection && (
                  <View style={styles.selectionDisplay}>
                    <Text style={styles.selectionText}>
                      Selected: {selectedClassTeacherSection.class_name} - {selectedClassTeacherSection.section_name}
                    </Text>
                    <TouchableOpacity
                      style={styles.changeButton}
                      onPress={() => setShowClassTeacherModal(true)}
                    >
                      <Text style={styles.changeButtonText}>Change</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Display section ID (hidden input) */}
                <TextInput
                  style={[styles.input, styles.disabledInput]}
                  value={selectedClassTeacherSection ? 
                    `${selectedClassTeacherSection.class_name} - ${selectedClassTeacherSection.section_name}` : 
                    (formData as TeacherFormData).classTeacherForSection}
                  editable={false}
                  placeholder="Select from assigned classes above"
                />

                {(formData as TeacherFormData).classAssignments.length === 0 && (
                  <Text style={styles.helperText}>
                    Please add class assignments first to select class teacher section
                  </Text>
                )}
              </>
            )}
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
            <Text style={styles.modalTitle}>
              Select Class {!isStudent && '& Section for Assignment'}
            </Text>
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

      {/* Class Teacher Section Selection Modal */}
      <Modal
        visible={showClassTeacherModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Select Class Teacher Section
            </Text>
            <TouchableOpacity onPress={handleClearClassTeacherSearch}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Search Input in Modal */}
          <View style={styles.modalSearchContainer}>
            <TextInput
              style={styles.modalSearchInput}
              placeholder="Search assigned classes..."
              value={classTeacherSearchQuery}
              onChangeText={setClassTeacherSearchQuery}
            />
          </View>

          {/* Assigned Classes List */}
          {filteredAssignedClasses.length > 0 ? (
            <FlatList
              data={filteredAssignedClasses}
              renderItem={renderClassTeacherSectionItem}
              keyExtractor={(item) => `teacher-${item.class_id}`}
              style={styles.classList}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>
                {classTeacherSearchQuery ? 
                  `No assigned classes found for "${classTeacherSearchQuery}"` : 
                  'No assigned classes available'}
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
  // Teacher-specific styles
  subjectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  subjectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e1f5fe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    margin: 4,
  },
  subjectChipText: {
    color: '#01579b',
    marginRight: 8,
  },
  removeChipText: {
    color: '#01579b',
    fontWeight: 'bold',
  },
  assignmentsContainer: {
    marginBottom: 16,
  },
  assignmentsHeader: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#666',
  },
  assignmentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3e5f5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 4,
  },
  assignmentChipText: {
    color: '#4a148c',
    flex: 1,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  // Class Teacher Section Styles
  classTeacherClassHeader: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  classTeacherClassName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    textAlign: 'center',
  },
  classTeacherSectionButton: {
    backgroundColor: '#e9ecef',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  selectedClassTeacherSectionButton: {
    backgroundColor: '#28a745',
    borderColor: '#28a745',
  },
  classTeacherSectionButtonText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
  },
  selectedClassTeacherSectionButtonText: {
    color: '#fff',
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
    flex: 1,
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
