import LoadingScreen from '@/components/Loading';
import { InfoCard } from '@/components/sectionINfoCards';
import { SectionHeader } from '@/components/SectionMangeHeader';
import { QuickActions } from '@/components/sectionQuickAction';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxhooks';
import { resetSectionState } from '@/redux/slice/sectionSlice/getSectionSlice';
import { fetchSectionDetails } from '@/thunk/section/getsectionDetails';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';

type Params = {
  classId?: string;
  className?: string;
  sectionId?: string;
  sectionName?: string;
};

export default function SectionManagement() {
  const { sectionId, sectionName } = useLocalSearchParams<Params>();
  const dispatch = useAppDispatch();
  const { loading, error, data, message } = useAppSelector((s) => s.section);
console.log(data?.section?.class_teacher_details?.name)
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
    return (
      <LoadingScreen/>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={{ color: 'crimson' }}>Error: {error}</Text>
      </SafeAreaView>
    );
  }

  const studentsCount = data?.total_students|| 0;
  const teachersCount = data?.total_section_teachers || 0;

  const handleViewStudents = () => {
    Alert.alert('View Students', 'Navigate to students list');
  };

  const handleViewTeachers = () => {
    Alert.alert('View Teachers', 'Navigate to teachers list');
  };

  const handleAddStudent = () => {
    Alert.alert('Add Student', 'Navigate to add student form');
  };

  const handleManageSection = () => {
    Alert.alert('Manage Section', 'Navigate to section settings');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SectionHeader sectionName={data?.section?.class_details?.class_name || sectionName}
        studentsCount={studentsCount}
        teachersCount={teachersCount}
      />

      <InfoCard label="Section ID" value={sectionId || 'N/A'} icon="🆔" />
      <InfoCard label="Section Name" value={sectionName || 'N/A'} icon="📚" />

      <QuickActions
        onViewStudents={handleViewStudents}
        onViewTeachers={handleViewTeachers}
        onAddStudent={handleAddStudent}
        onManageSection={handleManageSection}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal:10,
    backgroundColor: '#f8f9fa',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
