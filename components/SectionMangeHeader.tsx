import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface SectionHeaderProps {
  sectionName?: string;
  studentsCount: number;
  teachersCount: number;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  sectionName,
  studentsCount,
  teachersCount,
}) => {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.sectionTitle}>
        {sectionName || 'Section Name'}
      </Text>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{studentsCount}</Text>
          <Text style={styles.statLabel}>Students</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{teachersCount}</Text>
          <Text style={styles.statLabel}>Teachers</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 20,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#e11b23',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
