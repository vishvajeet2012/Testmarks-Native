import React from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";

interface InfoCardProps {
  label: string;
  value: string | number;
  icon?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({ label, value, icon }) => {
  return (
    <View style={styles.card}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <View style={styles.textWrapper}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
};

export const InfoCardRow: React.FC<{
  data: Array<{ label: string; value: string | number; icon?: string }>;
}> = ({ data }) => {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 400;

  return (
    <View
      style={[
        styles.row,
        { flexDirection: isSmallScreen ? "column" : "row" },
      ]}
    >
      {data.map((item, index) => (
        <InfoCard key={index} {...item} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    justifyContent: "space-between",
    marginVertical: 10,
  },
  card: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    margin: 6,
    borderRadius: 16,
    elevation: 4,
  },
  icon: {
    fontSize: 28,
    marginRight: 12,
  },
  textWrapper: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: "#888",
    fontWeight: "500",
  },
  value: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    marginTop: 2,
  },
});
