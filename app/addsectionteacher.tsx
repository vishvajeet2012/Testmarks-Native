import { useAppDispatch, useAppSelector } from '@/hooks/reduxhooks';
import { createClass } from '@/thunk/section/addSectionTeacher';
import { clearSubjects, searchSubject } from '@/thunk/subject/searchSubject';
import { clearTeachers, fetchTeacherBySearch } from '@/thunk/teacher/teacherSearch';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Types
interface Teacher {
  teacher_id: number;
  name: string;
  email: string;
}

interface TeacherSearch {
  teacher_id: number;
  name: string;
  email: string;
  mobile_number: string;
}

interface Subject {
  subject_id: number;
  subject_name: string;
  class_id: number;
  Renamedclass?: {
    class_name: string;
    description: string;
  };
  created_at?: string;
}

interface FormData {
  teacher_id: number | null;
  subject_ids: number[];
}

interface SectionData {
  section_id: number;
  section_name: string;
}

const MAIN_COLOR = '#e11b23';

export default function AddedSectionTeachers({ 
  sectionId, 
  sectionName 
}: { 
  sectionId: number;
  sectionName: string;
}) {
  const [searchTeacherByName, setSearchTeacherByName] = useState('');
  const [searchName, setSearchName] = useState('');
  const [showTeacherSearchModal, setShowTeacherSearchModal] = useState(false);
  const [showSubjectSearchModal, setShowSubjectSearchModal] = useState(false);
  
  const dispatch = useAppDispatch();
  
  // Redux selectors
  const { 
    teachers: searchTeacherResult, 
    loading: searchTeacherLoading, 
    error: searchTeacherError 
  } = useAppSelector((state) => state.teacherSearch);

  const { 
    subjects: subjectResult, 
    loading: subjectLoading, 
    error: subjectError 
  } = useAppSelector((state) => state.subject);

  const { 
    loading: sectionLoading, 
    error: sectionError, 
    createdClass, 
    message 
  } = useAppSelector((state) => state.addSectionTeacher);

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [formData, setFormData] = useState<FormData>({
    teacher_id: null,
    subject_ids: []
  });

  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [selectedTeacherDetails, setSelectedTeacherDetails] = useState<Teacher | null>(null);
  const [sectionDetails, setSectionDetails] = useState<SectionData | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (sectionId) {
      loadSectionDetails();
      loadSubjectsForSection();
    }
  }, [sectionId]);

  useEffect(() => {
    if (createdClass && message) {
      Alert.alert('Success', message);
      resetForm();
    }
    if (sectionError) {
      Alert.alert('Error', sectionError);
    }
  }, [createdClass, message, sectionError]);

  const loadSectionDetails = async (): Promise<void> => {
    try {
      const sectionData: SectionData = {
        section_id: sectionId,
        section_name: sectionName,
      };
      setSectionDetails(sectionData);
    } catch (error) {
      console.error('Error loading section details:', error);
    }
  };

  const loadSubjectsForSection = async (): Promise<void> => {
    try {
      // Load subjects from API or leave empty for now
      setSubjects([]);
      setAvailableSubjects([]);
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };

  const loadInitialData = async (): Promise<void> => {
    setLoading(true);
    try {
      // Load teachers from API or leave empty for now
      setTeachers([]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Teacher search functions
  const handleTeacherSearch = () => {
    if (searchTeacherByName.trim()) {
      dispatch(fetchTeacherBySearch(searchTeacherByName));
    }
  };

  const handleClearTeacherSearch = () => {
    dispatch(clearTeachers());
    setSearchTeacherByName('');
  };

  const handleTeacherPress = (teacher: TeacherSearch) => {
    setFormData(prev => ({ ...prev, teacher_id: teacher.teacher_id }));
    setSelectedTeacherDetails({
      teacher_id: teacher.teacher_id,
      name: teacher.name,
      email: teacher.email
    });
    setShowTeacherSearchModal(false);
    handleClearTeacherSearch();
  };

  const handleSubjectSearch = async () => {
    if (searchName.trim()) {
      try {
        const result = await dispatch(searchSubject({ name: searchName.trim() })).unwrap();
        console.log('Search successful:', result);
      } catch (error) {
        console.error('Search failed:', error);
      }
    }
  };

  const handleClearSubjectSearch = () => {
    setSearchName('');
    dispatch(clearSubjects());
  };

  const handleSubjectPress = (subject: Subject) => {
    const isSelected = formData.subject_ids.includes(subject.subject_id);
    if (isSelected) {
      setFormData(prev => ({
        ...prev,
        subject_ids: prev.subject_ids.filter(id => id !== subject.subject_id)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        subject_ids: [...prev.subject_ids, subject.subject_id]
      }));
    }
  };

  const handleTeacherSelect = (teacher: Teacher) => {
    setFormData(prev => ({ ...prev, teacher_id: teacher.teacher_id }));
    setSelectedTeacherDetails(teacher);
  };

  const handleSubjectToggle = (subjectId: number): void => {
    setFormData(prev => ({
      ...prev,
      subject_ids: prev.subject_ids.includes(subjectId)
        ? prev.subject_ids.filter(id => id !== subjectId)
        : [...prev.subject_ids, subjectId]
    }));
  };

  const handleCreate = () => {
    if (!formData.teacher_id) {
      Alert.alert('Error', 'Teacher selection is required');
      return;
    }

    const payload = {
      section_id: sectionId,
      teacher_id: formData.teacher_id,
      subject_ids: formData.subject_ids
    };

    dispatch(createClass(payload));
  };

  const resetForm = (): void => {
    setFormData({
      teacher_id: null,
      subject_ids: []
    });
    setSelectedTeacherDetails(null);
  };

  const getSelectedSubjectNames = (): string => {
    const selected = availableSubjects.filter(sub => 
      formData.subject_ids.includes(sub.subject_id)
    );
    const searchedSelected = subjectResult?.filter(sub => 
      formData.subject_ids.includes(sub.subject_id)
    ) || [];
    
    const allSelected = [...selected, ...searchedSelected];
    return allSelected.map(sub => sub.subject_name).join(', ');
  };

  const getSelectedTeacherName = (): string => {
    if (selectedTeacherDetails) {
      return selectedTeacherDetails.name;
    }
    if (!formData.teacher_id) return '';
    const teacher = teachers.find(t => t.teacher_id === formData.teacher_id);
    return teacher ? teacher.name : '';
  };

  const renderTeacherItem = ({ item }: { item: TeacherSearch }) => (
    <TouchableOpacity
      style={styles.teacherItem}
      onPress={() => handleTeacherPress(item)}
    >
      <Text style={styles.teacherName}>{item.name}</Text>
      <Text style={styles.teacherEmail}>{item.email}</Text>
      <Text style={styles.teacherMobile}>{item.mobile_number}</Text>
    </TouchableOpacity>
  );

  const renderSubjectItem = ({ item }: { item: Subject }) => (
    <TouchableOpacity
      style={[
        styles.subjectSearchItem,
        formData.subject_ids.includes(item.subject_id) && styles.selectedSearchItem
      ]}
      onPress={() => handleSubjectPress(item)}
    >
      <View style={styles.subjectSearchInfo}>
        <Text style={[
          styles.subjectSearchName,
          formData.subject_ids.includes(item.subject_id) && styles.selectedSearchText
        ]}>
          {item.subject_name}
        </Text>
        {item.Renamedclass && (
          <>
            <Text style={styles.subjectSearchClass}>Class: {item.Renamedclass.class_name}</Text>
            <Text style={styles.subjectSearchDescription}>Description: {item.Renamedclass.description}</Text>
          </>
        )}
        {item.created_at && (
          <Text style={styles.subjectSearchDate}>
            Created: {new Date(item.created_at).toLocaleDateString()}
          </Text>
        )}
      </View>
      {formData.subject_ids.includes(item.subject_id) && (
        <MaterialIcons name="check-circle" size={20} color={MAIN_COLOR} />
      )}
    </TouchableOpacity>
  );

  if (loading && !sectionDetails) {
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
        <View style={styles.header}>
          <MaterialIcons name="school" size={28} color={MAIN_COLOR} />
          <Text style={styles.headerTitle}>Assign Section Teacher</Text>
        </View>

        {sectionDetails && (
          <View style={styles.sectionInfoContainer}>
            <Text style={styles.sectionInfoTitle}>Section Information</Text>
            <View style={styles.sectionInfo}>
              <Text style={styles.sectionInfoText}>
                <Text style={styles.sectionInfoLabel}>Section:</Text> {sectionDetails.section_name}
              </Text>
            </View>
          </View>
        )}

        {/* Main Form */}
        <View style={styles.formContainer}>
          {/* Teacher Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Select Teacher *</Text>
            
            {/* Teacher Selection Options */}
            <View style={styles.selectionOptions}>
              {/* Quick Select from Available Teachers */}
              {teachers.length > 0 ? (
                <>
                  <Text style={styles.subLabel}>Available Teachers:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.teacherScrollView}>
                    <View style={styles.teacherChipsContainer}>
                      {teachers.map((teacher) => (
                        <TouchableOpacity
                          key={teacher.teacher_id}
                          style={[
                            styles.teacherChip,
                            formData.teacher_id === teacher.teacher_id && styles.selectedTeacherChip
                          ]}
                          onPress={() => handleTeacherSelect(teacher)}
                        >
                          <Text style={[
                            styles.teacherChipText,
                            formData.teacher_id === teacher.teacher_id && styles.selectedTeacherChipText
                          ]}>
                            {teacher.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </>
              ) : (
                <Text style={styles.noDataText}>No teachers available. Use search to find teachers.</Text>
              )}
            </View>
            
            {/* Search Teacher Button */}
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => setShowTeacherSearchModal(true)}
            >
              <MaterialIcons name="search" size={20} color={MAIN_COLOR} />
              <Text style={styles.searchButtonText}>Search Teachers</Text>
            </TouchableOpacity>

            {/* Selected Teacher Display */}
            {selectedTeacherDetails && (
              <View style={styles.selectedTeacherContainer}>
                <Text style={styles.selectedTeacherLabel}>Selected Teacher:</Text>
                <View style={styles.selectedTeacherInfo}>
                  <MaterialIcons name="person" size={16} color={MAIN_COLOR} />
                  <Text style={styles.selectedTeacherName}>{selectedTeacherDetails.name}</Text>
                  <Text style={styles.selectedTeacherEmail}>({selectedTeacherDetails.email})</Text>
                </View>
              </View>
            )}
          </View>

          {/* Subject Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Assign Subjects (Optional)</Text>
            
            {/* Available Subjects */}
            {availableSubjects.length > 0 ? (
              <>
                <Text style={styles.subLabel}>Available Subjects for this Section:</Text>
                <View style={styles.subjectsGrid}>
                  {availableSubjects.map((subject) => (
                    <TouchableOpacity
                      key={subject.subject_id}
                      style={[
                        styles.subjectChip,
                        formData.subject_ids.includes(subject.subject_id) && styles.selectedSubjectChip
                      ]}
                      onPress={() => handleSubjectToggle(subject.subject_id)}
                    >
                      <Text style={[
                        styles.subjectChipText,
                        formData.subject_ids.includes(subject.subject_id) && styles.selectedSubjectChipText
                      ]}>
                        {subject.subject_name}
                      </Text>
                      {formData.subject_ids.includes(subject.subject_id) && (
                        <MaterialIcons name="check" size={16} color="white" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            ) : (
              <Text style={styles.noDataText}>No subjects available for this section.</Text>
            )}
            
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => setShowSubjectSearchModal(true)}
            >
              <MaterialIcons name="search" size={20} color={MAIN_COLOR} />
              <Text style={styles.searchButtonText}>Search Subjects</Text>
            </TouchableOpacity>
            
            {/* Selected Subjects Summary */}
            {formData.subject_ids.length > 0 && (
              <View style={styles.selectedSubjectsContainer}>
                <Text style={styles.selectedSubjectsLabel}>Selected Subjects:</Text>
                <Text style={styles.selectedSubjectsText}>{getSelectedSubjectNames()}</Text>
              </View>
            )}
          </View>

          {/* Form Summary */}
          {(formData.teacher_id || formData.subject_ids.length > 0) && (
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Assignment Summary</Text>
              {sectionDetails && (
                <Text style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Section: </Text>
                  {sectionDetails.section_name}
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
                (!formData.teacher_id || sectionLoading) && styles.disabledButton
              ]}
              onPress={handleCreate}
              disabled={!formData.teacher_id || sectionLoading}
            >
              {sectionLoading ? (
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

      {/* Teacher Search Modal */}
      <Modal
        visible={showTeacherSearchModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTeacherSearchModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.searchModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Search Teacher</Text>
              <TouchableOpacity
                onPress={() => setShowTeacherSearchModal(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color={MAIN_COLOR} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Enter teacher name..."
                value={searchTeacherByName}
                onChangeText={setSearchTeacherByName}
              />
              <View style={styles.searchButtonRow}>
                <TouchableOpacity
                  style={styles.searchActionButton}
                  onPress={handleTeacherSearch}
                  disabled={searchTeacherLoading}
                >
                  {searchTeacherLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.searchActionButtonText}>Search</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.clearActionButton}
                  onPress={handleClearTeacherSearch}
                >
                  <Text style={styles.clearActionButtonText}>Clear</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.searchResults}>
              {searchTeacherResult && searchTeacherResult.length > 0 ? (
                <FlatList
                  data={searchTeacherResult}
                  keyExtractor={(item) => item.teacher_id.toString()}
                  renderItem={renderTeacherItem}
                  style={styles.resultsList}
                />
              ) : (
                <Text style={styles.noResultsText}>
                  {searchTeacherByName ? 'No teachers found' : 'Enter a name to search'}
                </Text>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Subject Search Modal */}
      <Modal
        visible={showSubjectSearchModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSubjectSearchModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.searchModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Search Subjects</Text>
              <TouchableOpacity
                onPress={() => setShowSubjectSearchModal(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color={MAIN_COLOR} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Enter subject name..."
                value={searchName}
                onChangeText={setSearchName}
              />
              <View style={styles.searchButtonRow}>
                <TouchableOpacity
                  style={styles.searchActionButton}
                  onPress={handleSubjectSearch}
                  disabled={subjectLoading}
                >
                  {subjectLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.searchActionButtonText}>Search</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.clearActionButton}
                  onPress={handleClearSubjectSearch}
                >
                  <Text style={styles.clearActionButtonText}>Clear</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.searchResults}>
              {subjectResult && subjectResult.length > 0 ? (
                <FlatList
                  data={subjectResult}
                  keyExtractor={(item) => item.subject_id.toString()}
                  renderItem={renderSubjectItem}
                  style={styles.resultsList}
                />
              ) : (
                <Text style={styles.noResultsText}>
                  {searchName ? 'No subjects found' : 'Enter a name to search'}
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => setShowSubjectSearchModal(false)}
            >
              <Text style={styles.confirmButtonText}>
                Done ({formData.subject_ids.length} selected)
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
  sectionInfoContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: MAIN_COLOR,
    marginBottom: 8,
  },
  sectionInfo: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
  },
  sectionInfoText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  sectionInfoLabel: {
    fontWeight: '600',
    color: MAIN_COLOR,
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
    marginBottom: 12,
  },
  subLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  selectionOptions: {
    marginBottom: 12,
  },
  teacherScrollView: {
    marginBottom: 8,
  },
  teacherChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  teacherChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedTeacherChip: {
    backgroundColor: MAIN_COLOR,
    borderColor: MAIN_COLOR,
  },
  teacherChipText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  selectedTeacherChipText: {
    color: 'white',
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f8ff',
    borderWidth: 1,
    borderColor: MAIN_COLOR,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  searchButtonText: {
    color: MAIN_COLOR,
    fontWeight: '600',
    marginLeft: 8,
  },
  selectedTeacherContainer: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: MAIN_COLOR,
  },
  selectedTeacherLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: MAIN_COLOR,
    marginBottom: 4,
  },
  selectedTeacherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectedTeacherName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  selectedTeacherEmail: {
    fontSize: 14,
    color: '#666',
  },
  subjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  subjectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    gap: 6,
  },
  selectedSubjectChip: {
    backgroundColor: MAIN_COLOR,
    borderColor: MAIN_COLOR,
  },
  subjectChipText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  selectedSubjectChipText: {
    color: 'white',
  },
  selectedSubjectsContainer: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  selectedSubjectsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: MAIN_COLOR,
    marginBottom: 4,
  },
  selectedSubjectsText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
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
  noDataText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchModalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '95%',
    maxHeight: '80%',
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
  searchInputContainer: {
    marginBottom: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  searchButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 8,
  },
  searchActionButton: {
    flex: 1,
    backgroundColor: MAIN_COLOR,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  searchActionButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  clearActionButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  clearActionButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  searchResults: {
    flex: 1,
    minHeight: 200,
  },
  resultsList: {
    flex: 1,
  },
  noResultsText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 50,
  },
  teacherItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: 'white',
  },
  teacherName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  teacherEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  teacherMobile: {
    fontSize: 14,
    color: '#666',
  },
  subjectSearchItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedSearchItem: {
    backgroundColor: '#f0f8ff',
  },
  subjectSearchInfo: {
    flex: 1,
  },
  subjectSearchName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  selectedSearchText: {
    color: MAIN_COLOR,
  },
  subjectSearchClass: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  subjectSearchDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  subjectSearchDate: {
    fontSize: 12,
    color: '#999',
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
