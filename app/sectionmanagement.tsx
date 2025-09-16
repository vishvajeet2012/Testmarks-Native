import { InfoCard } from '@/components/sectionINfoCards';
import { SectionHeader } from '@/components/SectionMangeHeader';
import { QuickActions } from '@/components/sectionQuickAction';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';

type Params = {
  classId?: string;
  className?: string;
  sectionId?: string;
  sectionName?: string;
};

export default function SectionManagement() {
  const { sectionId, sectionName } = useLocalSearchParams<Params>();

  const studentsCount = 32;
  const teachersCount = 4;

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
      <SectionHeader
        sectionName={sectionName as string}
        studentsCount={studentsCount}
        teachersCount={teachersCount}
      />

      <InfoCard
        label="Section ID"
        value={sectionId || 'N/A'}
        icon="🆔"
      />

      <InfoCard
        label="Section Name"
        value={sectionName || 'N/A'}
        icon="📚"
      />

      <InfoCard
        label="Total Capacity"
        value="40 Students"
        icon="👥"
      />

      <InfoCard
        label="Academic Year"
        value="2024-25"
        icon="📅"
      />

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
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
});