import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

interface SharedTabLayoutProps {
  homeContent: React.ReactNode;
}

function NotificationScreen() {
  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ThemedText type="title">Notifications</ThemedText>
      <ThemedText>No new notifications.</ThemedText>
    </ThemedView>
  );
}

function FeedbackScreen() {
  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ThemedText type="title">Feedback</ThemedText>
      <ThemedText>Share your feedback here.</ThemedText>
    </ThemedView>
  );
}

export default function SharedTabLayout({ homeContent }: SharedTabLayoutProps) {
  const colorScheme = useColorScheme();
  const [selectedTab, setSelectedTab] = useState('Home');

  const renderContent = () => {
    switch (selectedTab) {
      case 'Home':
        return homeContent;
      case 'Notification':
        return <NotificationScreen />;
      case 'Feedback':
        return <FeedbackScreen />;
      default:
        return homeContent;
    }
  };

  const tabs = [
    { name: 'Home', icon: 'house.fill' },
    { name: 'Notification', icon: 'bell.fill' },
    { name: 'Feedback', icon: 'star.fill' },
  ];

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        {renderContent()}
      </View>
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.name}
            style={styles.tabButton}
            onPress={() => setSelectedTab(tab.name)}
          >
            <IconSymbol
              size={28}
              name={tab.icon as any}
              color={selectedTab === tab.name ? Colors[colorScheme ?? 'light'].tint : '#666'}
            />
            <ThemedText
              style={[
                styles.tabLabel,
                { color: selectedTab === tab.name ? Colors[colorScheme ?? 'light'].tint : '#666' }
              ]}
            >
              {tab.name}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
  },
});
