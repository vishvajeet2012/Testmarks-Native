import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ActionButton } from './sectionManageProps';

interface QuickActionsProps {
  onViewStudents: () => void;
  onViewTeachers: () => void;
  onAddStudent: () => void;
  onManageSection: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onViewStudents,
  onViewTeachers,
  onAddStudent,
  onManageSection,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      
      <View style={styles.buttonRow}>
        <ActionButton
          title="View Students"
          onPress={onViewStudents}
          style={styles.halfButton}
        />
        <ActionButton
          title="View Teachers"
          onPress={onViewTeachers}
          style={styles.halfButton}
          variant="outline"
        />
      </View>
      
      <View style={styles.buttonRow}>
        <ActionButton
          title="Add Student"
          onPress={onAddStudent}
          style={styles.halfButton}
          variant="secondary"
        />
        <ActionButton
          title="Manage Section"
          onPress={onManageSection}
          style={styles.halfButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  halfButton: {
    flex: 1,
    marginHorizontal: 6,
  },
});