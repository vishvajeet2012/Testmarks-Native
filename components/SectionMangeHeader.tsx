import React from "react";
import { StyleSheet, Text, View } from "react-native";

// A smaller placeholder for an icon
const IconPlaceholder = () => <View style={styles.iconShape} />;

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
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Header Title */}
        <Text style={styles.sectionTitle}>{sectionName || "Class Overview"}</Text>
        <View style={styles.titleDivider} />

        {/* Stats Container */}
        <View style={styles.statsContainer}>
          {/* Students Stat */}
          <View style={styles.statItem}>
            <View style={styles.iconContainer}>
              <IconPlaceholder />
            </View>
            <View style={styles.statTextContainer}>
              <Text style={styles.statNumber}>{studentsCount}</Text>
              <Text style={styles.statLabel}>Students</Text>
            </View>
          </View>

          {/* Vertical Divider */}
          <View style={styles.verticalDivider} />

          {/* Teachers Stat */}
          <View style={styles.statItem}>
            <View style={styles.iconContainer}>
              <IconPlaceholder />
            </View>
            <View style={styles.statTextContainer}>
              <Text style={styles.statNumber}>{teachersCount}</Text>
              <Text style={styles.statLabel}>Teachers</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F0F0F3',
  },
  card: {
    backgroundColor: '#F0F0F3',
    borderRadius: 20,
    padding: 18, // Reduced padding
    shadowColor: '#a9a9b1',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  sectionTitle: {
    fontSize: 20, // Slightly smaller
    fontWeight: '700',
    color: '#444',
    textAlign: 'center',
  },
  titleDivider: {
    height: 1,
    backgroundColor: '#e0e0e3',
    marginVertical: 15, // Reduced margin
    marginHorizontal: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 40, // Smaller
    height: 40, // Smaller
    borderRadius: 12, // Adjusted radius
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F3',
    marginRight: 12, // Reduced margin
    shadowColor: '#ffffff',
    shadowOffset: { width: -4, height: -4 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
  },
  iconShape: {
    width: 18, // Smaller
    height: 18, // Smaller
    borderRadius: 4, // Adjusted radius
    backgroundColor: '#e11b23',
  },
  statTextContainer: {
    alignItems: 'flex-start',
  },
  statNumber: {
    fontSize: 24, // Smaller
    fontWeight: 'bold',
    color: '#e11b23',
  },
  statLabel: {
    fontSize: 12, // Smaller
    color: '#888',
    marginTop: 2,
  },
  verticalDivider: {
    width: 1,
    height: '50%', // Adjusted height
    backgroundColor: '#d1d1d6',
  },
});