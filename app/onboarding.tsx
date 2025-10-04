import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import PagerView from 'react-native-pager-view';

const { width, height } = Dimensions.get('window');

// Web-compatible onboarding component
const WebOnboarding = ({ onComplete }: { onComplete: () => void }) => (
  <View style={styles.webContainer}>
    <View style={styles.webContent}>
      <Text style={styles.webTitle}>Welcome to TestMarks</Text>
      <Text style={styles.webDescription}>
        Your comprehensive solution for managing educational assessments, marks, and student progress tracking.
      </Text>
      <Text style={styles.webFeatures}>
        Features include:
        • Student marks tracking and analytics
        • Teacher test creation and management
        • Admin user and system management
      </Text>
      <Pressable style={styles.webButton} onPress={onComplete}>
        <Text style={styles.webButtonText}>Get Started</Text>
      </Pressable>
    </View>
  </View>
);

interface Slide {
  id: number;
  title: string;
  description: string;
  icon: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: 'Welcome to TestMarks',
    description: 'Your comprehensive solution for managing educational assessments, marks, and student progress tracking.',
    icon: '📚',
  },
  {
    id: 2,
    title: 'For Students',
    description: 'View your test marks, track your academic progress, analyze your performance with detailed charts and insights.',
    icon: '🎓',
  },
  {
    id: 3,
    title: 'For Teachers',
    description: 'Create and manage tests, assign marks to students, monitor class performance, and provide feedback.',
    icon: '👨‍🏫',
  },
  {
    id: 4,
    title: 'For Administrators',
    description: 'Manage users, create classes and sections, oversee the entire system, and access comprehensive analytics.',
    icon: '👔',
  },
  {
    id: 5,
    title: 'Get Started',
    description: 'Join thousands of educational institutions using TestMarks for efficient assessment management.',
    icon: '🚀',
  },
];

export default function OnboardingScreen() {
  const [currentPage, setCurrentPage] = useState(0);
  const pagerRef = useRef<PagerView>(null);
  const router = useRouter();

  const handleNext = () => {
    if (currentPage < slides.length - 1) {
      pagerRef.current?.setPage(currentPage + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      router.replace('/login');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      router.replace('/login');
    }
  };

  // For web, show simplified onboarding
  if (Platform.OS === 'web') {
    return <WebOnboarding onComplete={completeOnboarding} />;
  }

  const renderSlide = (slide: Slide) => (
    <View key={slide.id} style={styles.slide}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{slide.icon}</Text>
      </View>
      <Text style={styles.title}>{slide.title}</Text>
      <Text style={styles.description}>{slide.description}</Text>
    </View>
  );

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {slides.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            currentPage === index && styles.activeDot,
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
      >
        {slides.map(renderSlide)}
      </PagerView>

      <View style={styles.bottomContainer}>
        {renderDots()}
        <View style={styles.buttonContainer}>
          <Pressable style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
          <Pressable style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextText}>
              {currentPage === slides.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  pagerView: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e11b23',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  icon: {
    fontSize: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  bottomContainer: {
    paddingHorizontal: 40,
    paddingBottom: 50,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ddd',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#e11b23',
    width: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: '#e11b23',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  nextText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Web-specific styles
  webContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  webContent: {
    maxWidth: 600,
    alignItems: 'center',
  },
  webTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  webDescription: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 30,
  },
  webFeatures: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  webButton: {
    backgroundColor: '#e11b23',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  webButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
