import { useEffect } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import LoadingScreen from '@/components/Loading';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AppDispatch, RootState } from '@/redux/store';
import { getStudentDashboard } from '@/thunk/studentscreen/dashboard';

// Helper to determine status color
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'approved':
      return '#10b981';
    case 'pending':
    case 'pendingapproval':
      return '#f59e0b';
    default:
      return '#64748b';
  }
};

// Helper to check if date is today
const isToday = (dateString: string) => {
  const testDate = new Date(dateString);
  const today = new Date();
  
  return testDate.getDate() === today.getDate() &&
    testDate.getMonth() === today.getMonth() &&
    testDate.getFullYear() === today.getFullYear();
};

export default function StudentHomeScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector((state: RootState) => state.studentDashboard);

  useEffect(() => {
    dispatch(getStudentDashboard());
  }, [dispatch]);

  if (loading) {
    return <LoadingScreen/>;
  } 

  if (error) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ThemedText type="subtitle" style={{ color: '#ef4444' }}>Error: {error}</ThemedText>
      </ThemedView>
    );
  }

  if (!data) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ThemedText type="subtitle">No data available.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Student Info */}
      <ThemedView style={styles.header}>
        <View>
          <ThemedText type="title" style={styles.headerTitle}>Welcome,</ThemedText>
          <ThemedText type="title" style={styles.studentNameHeader}>{data.student.name}</ThemedText>
          <ThemedText style={styles.studentDetailsHeader}>
            {data.student.class} - {data.student.section} | Roll No: {data.student.roll_number}
          </ThemedText>
        </View>
        {data.student.profile_picture && (
          <Image source={{ uri: data.student.profile_picture }} style={styles.profileImage} />
        )}
      </ThemedView>

      {/* Summary Section */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Summary</ThemedText>
        <View style={styles.summaryGrid}>
          <ThemedView style={styles.summaryCard}>
            <ThemedText style={styles.summaryValue}>{data.summary.total_completed}</ThemedText>
            <ThemedText style={styles.summaryLabel}>Completed</ThemedText>
          </ThemedView>
          <ThemedView style={styles.summaryCard}>
            <ThemedText style={styles.summaryValue}>{data.summary.total_pending}</ThemedText>
            <ThemedText style={styles.summaryLabel}>Pending</ThemedText>
          </ThemedView>
          <ThemedView style={styles.summaryCard}>
            <ThemedText style={styles.summaryValue}>{data.summary.total_upcoming}</ThemedText>
            <ThemedText style={styles.summaryLabel}>Upcoming</ThemedText>
          </ThemedView>
        </View>
      </ThemedView>

      {/* Completed Tests */}
      {data.completed_tests.length > 0 && (
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Completed Tests</ThemedText>
          {data.completed_tests.map((test) => {
            const testIsToday = isToday(test.date_conducted);
            return (
              <ThemedView key={test.test_id} style={[styles.card, testIsToday && styles.todayCard]}>
                <View style={styles.cardHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <ThemedText style={styles.testName}>{test.test_name}</ThemedText>
                    {testIsToday && (
                      <View style={styles.todayBadge}>
                        <ThemedText style={styles.todayBadgeText}>TODAY</ThemedText>
                      </View>
                    )}
                  </View>
                  <ThemedText style={styles.testSubject}>{test.subject}</ThemedText>
                </View>
                <View style={styles.cardBody}>
                  <View style={styles.marksContainer}>
                    <ThemedText style={styles.marksObtained}>{test.marks_obtained}</ThemedText>
                    <ThemedText style={styles.maxMarks}>/ {test.max_marks}</ThemedText>
                  </View>
                  {test.test_rank && (
                    <View style={styles.rankBadge}>
                      <ThemedText style={styles.rankText}>Rank #{test.test_rank}</ThemedText>
                    </View>
                  )}
                </View>
                <ThemedText style={[styles.statusText, { color: getStatusColor(test.status) }]}>
                  Status: {test.status}
                </ThemedText>
                {test.feedback.length > 0 && (
                  <View style={styles.feedbackSection}>
                    <ThemedText style={styles.feedbackTitle}>Feedback from {test.teacher.name}:</ThemedText>
                    {test.feedback.map((fb) => (
                      <ThemedText key={fb.feedback_id} style={styles.feedbackText}>"{fb.message}"</ThemedText>
                    ))}
                  </View>
                )}
              </ThemedView>
            );
          })}
        </View>
      )}

      {/* Pending Tests */}
      {data.pending_tests.length > 0 && (
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Pending Tests</ThemedText>
          {data.pending_tests.map((test) => {
            const testIsToday = isToday(test.date_conducted);
            return (
              <ThemedView key={test.test_id} style={[styles.card, testIsToday && styles.todayCard]}>
                <View style={styles.cardHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <ThemedText style={styles.testName}>{test.test_name}</ThemedText>
                    {testIsToday && (
                      <View style={styles.todayBadge}>
                        <ThemedText style={styles.todayBadgeText}>TODAY</ThemedText>
                      </View>
                    )}
                  </View>
                  <ThemedText style={styles.testSubject}>{test.subject}</ThemedText>
                </View>
                <View style={styles.cardRow}>
                  <ThemedText style={styles.detailLabel}>Date:</ThemedText>
                  <ThemedText style={[styles.detailValue, testIsToday && { color: '#e11b23', fontWeight: 'bold' }]}>
                    {testIsToday ? 'Today' : new Date(test.date_conducted).toLocaleDateString()}
                  </ThemedText>
                </View>
                <View style={styles.cardRow}>
                  <ThemedText style={styles.detailLabel}>Status:</ThemedText>
                  <ThemedText style={[styles.detailValue, { color: getStatusColor(test.status), fontWeight: 'bold' }]}>
                    {test.status}
                  </ThemedText>
                </View>
              </ThemedView>
            );
          })}
        </View>
      )}

      {/* Upcoming Tests */}
      {data.upcoming_tests.length > 0 && (
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Upcoming Tests</ThemedText>
          {data.upcoming_tests.map((test) => {
            const testIsToday = isToday(test.date_conducted);
            return (
              <ThemedView key={test.test_id} style={[styles.card, testIsToday && styles.todayCard]}>
                <View style={styles.cardHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <ThemedText style={styles.testName}>{test.test_name}</ThemedText>
                    {testIsToday && (
                      <View style={styles.todayBadge}>
                        <ThemedText style={styles.todayBadgeText}>TODAY</ThemedText>
                      </View>
                    )}
                  </View>
                  <ThemedText style={styles.testSubject}>{test.subject}</ThemedText>
                </View>
                <View style={styles.cardRow}>
                  <ThemedText style={styles.detailLabel}>Scheduled On:</ThemedText>
                  <ThemedText style={[styles.detailValue, testIsToday && { color: '#e11b23', fontWeight: 'bold' }]}>
                    {testIsToday ? 'Today' : new Date(test.date_conducted).toLocaleDateString()}
                  </ThemedText>
                </View>
                <View style={styles.cardRow}>
                  <ThemedText style={styles.detailLabel}>Max Marks:</ThemedText>
                  <ThemedText style={styles.detailValue}>{test.max_marks}</ThemedText>
                </View>
              </ThemedView>
            );
          })}
        </View>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingVertical: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    color: '#64748b',
  },
  studentNameHeader: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  studentDetailsHeader: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#e11b23',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e11b23',
  },
  summaryLabel: {
    fontSize: 14,
    marginTop: 4,
    color: '#64748b',
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  todayCard: {
    borderWidth: 2,
    borderColor: '#e11b23',
  },
  todayBadge: {
    backgroundColor: '#e11b23',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  todayBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  cardHeader: {
    marginBottom: 12,
  },
  testName: {
    fontSize: 18,
    fontWeight: '600',
  },
  testSubject: {
    fontSize: 14,
    color: '#e11b23',
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  marksContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  marksObtained: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#e11b23',
  },
  maxMarks: {
    fontSize: 18,
    color: '#64748b',
    marginLeft: 4,
  },
  rankBadge: {
    backgroundColor: '#fde68a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  rankText: {
    color: '#ca8a04',
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  feedbackSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
  },
  feedbackTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#334155',
  },
  feedbackText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#64748b',
  },
});
