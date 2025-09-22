import LoadingScreen from '@/components/Loading';
import { InfoCard } from '@/components/sectionINfoCards';
import { SectionHeader } from '@/components/SectionMangeHeader';
import SectionStudentView from '@/components/sectionStudentViewList';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxhooks';
import { resetSectionState } from '@/redux/slice/sectionSlice/getSectionSlice';
import { fetchSectionDetails } from '@/thunk/section/getsectionDetails';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
 
type Params = {
  classId?: string;
  className?: string;
  sectionId?: string;
  sectionName?: string;
};

type ActiveView = 'info' | 'students' | 'teachers' | 'settings';

export default function SectionManagement() {
  const { sectionId, sectionName } = useLocalSearchParams<Params>();
  const dispatch = useAppDispatch();
  const { loading, error, data, message } = useAppSelector((s) => s.section);
  const [activeView, setActiveView] = useState<ActiveView>('info');

  useEffect(() => {
    const id = Number(sectionId);
    if (Number.isFinite(id)) {
      dispatch(fetchSectionDetails(id));
    }
    return () => {
      dispatch(resetSectionState());
    };
  }, [dispatch, sectionId]);

  if (loading) {
    return <LoadingScreen/>;
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'crimson' }}>Error: {error}</Text>
      </View>
    );
  }

  const studentsCount = data?.total_students || 0;
  const teachersCount = data?.total_section_teachers || 0;

  const handleViewStudents = () => {
    setActiveView('students');
  };

  const handleViewTeachers = () => {
    setActiveView('teachers');
    Alert.alert('View Teachers', 'Navigate to teachers list');
  };

  const handleAddStudent = () => {
    Alert.alert('Add Student', 'Navigate to add student form');
  };

  const handleManageSection = () => {
    setActiveView('settings');
    Alert.alert('Manage Section', 'Navigate to section settings');
  };

  const handleShowInfo = () => {
    setActiveView('info');
  };

  const renderContent = () => {
    switch (activeView) {
      case 'students':
        return <SectionStudentView dataStudent={data?.students || { students: [] }} />;
      case 'teachers':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.contentText}>Teachers View - Coming Soon</Text>
          </View>
        );
      case 'settings':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.contentText}>Section Settings - Coming Soon</Text>
          </View>
        );
      case 'info':
      default:
        return (
          <View style={styles.headerContent}>
          <InfoCard label="Section ID" value={String(sectionId) || 'N/A'} icon="🆔" />
 <InfoCard label="Section Name" value={sectionName || 'N/A'} icon="📚" />
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <SectionHeader 
        sectionName={data?.section?.class_details?.class_name || sectionName}
        studentsCount={studentsCount}
        teachersCount={teachersCount}
      />
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.navButton, activeView === 'info' && styles.activeButton]}
          onPress={handleShowInfo}
        >
          <Text style={[styles.buttonText, activeView === 'info' && styles.activeButtonText]}>
            📊 Info
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navButton, activeView === 'students' && styles.activeButton]}
          onPress={handleViewStudents}
        >
          <Text style={[styles.buttonText, activeView === 'students' && styles.activeButtonText]}>
            👥 Students
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navButton, activeView === 'teachers' && styles.activeButton]}
          onPress={handleViewTeachers}
        >
          <Text style={[styles.buttonText, activeView === 'teachers' && styles.activeButtonText]}>
            👨‍🏫 Teachers
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navButton, activeView === 'settings' && styles.activeButton]}
          onPress={handleManageSection}
        >
          <Text style={[styles.buttonText, activeView === 'settings' && styles.activeButtonText]}>
            ⚙️ Settings
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentWrapper}>
        {renderContent()}
      </View>

      {activeView !== 'students' && (
        <TouchableOpacity style={styles.addButton} onPress={handleAddStudent}>
          <Text style={styles.addButtonText}>+ Add Student</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  navButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 2,
    backgroundColor: '#f1f3f4',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeButton: {
    backgroundColor: '#666',
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  activeButtonText: {
    color: '#ffffff',
  },
  contentWrapper: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  contentText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#e11b23',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
