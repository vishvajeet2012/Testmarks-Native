import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface SectionHeaderProps {
  sectionName?: string;
  studentsCount: number;
  teachersCount: number;
  className?: any;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  sectionName,
  studentsCount,
  teachersCount,
}) => {
  return (
    <View style={styles.headerContainer}>
      {/* Title */}
      <Text style={styles.sectionTitle}>{sectionName || "Section Name"}</Text>
      <View style={styles.titleUnderline} />

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{studentsCount}</Text>
          <Text style={styles.statLabel}>Students</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{teachersCount}</Text>
          <Text style={styles.statLabel}>Teachers</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#222",
  },
  titleUnderline: {
    height: 3,
    width: 40,
    backgroundColor: "#e11b23",
    borderRadius: 2,
    marginTop: 6,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fafafa",
    paddingVertical: 16,
    marginHorizontal: 6,
    borderRadius: 12,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "700",
    color: "#e11b23",
  },
  statLabel: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
});
