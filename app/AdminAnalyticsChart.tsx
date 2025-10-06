import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Alert, Dimensions, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import { useDispatch, useSelector } from 'react-redux';
import { approveMarkAsync, fetchPendingMarksAsync, rejectMarkAsync } from '../redux/slice/adminTestMarksSlice';
import { AppDispatch, RootState } from '../redux/store';
import { getAdminAnalytics } from '../thunk/admin/adminAnalytics';

const screenWidth = Dimensions.get('window').width;
const PRIMARY_COLOR = '#e11b23';

export default function AdminAnalyticsChart() {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector(
    (state: RootState) => state.adminAnalytics as { data: any; loading: boolean; error: string | null }
  );
  const { pendingMarks, loading: marksLoading } = useSelector(
    (state: RootState) => state.adminTestMarks
  );

  useEffect(() => {
    dispatch(getAdminAnalytics());
    dispatch(fetchPendingMarksAsync());
  }, [dispatch]);

  const handleApprove = (marks_id: number) => {
    dispatch(approveMarkAsync(marks_id))
      .unwrap()
      .then(() => {
        Alert.alert('Success', 'Mark approved successfully');
        dispatch(fetchPendingMarksAsync());
      })
      .catch((err) => {
        Alert.alert('Error', err || 'Failed to approve mark');
      });
  };

  const handleReject = (marks_id: number) => {
    Alert.prompt(
      'Reject Mark',
      'Please provide a reason for rejection (optional):',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reject',
          onPress: (reason: string | undefined) => {
            dispatch(rejectMarkAsync({ marks_id, reason }))
              .unwrap()
              .then(() => {
                Alert.alert('Success', 'Mark rejected successfully');
                dispatch(fetchPendingMarksAsync());
              })
              .catch((err) => {
                Alert.alert('Error', err || 'Failed to reject mark');
              });
          },
          style: 'destructive',
        },
      ],
      'plain-text'
    );
  };

  const onRefresh = () => {
    dispatch(getAdminAnalytics());
  };

  // Chart Configuration
  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: '#ffffff',
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => `rgba(225, 27, 35, ${opacity})`,
    strokeWidth: 3,
    barPercentage: 0.6,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: PRIMARY_COLOR,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: '#e3e3e3',
      strokeWidth: 1,
    },
  };

  if (loading && !data) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="analytics-outline" size={64} color={PRIMARY_COLOR} />
        <Text style={styles.loadingText}>Loading Analytics Dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={PRIMARY_COLOR} />
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Ionicons name="refresh" size={20} color="#FFFFFF" />
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="document-text-outline" size={64} color="#CCCCCC" />
        <Text style={styles.emptyText}>No analytics data available</Text>
      </View>
    );
  }

  const analyticsData = data || {};

  // Prepare Enrollment Trend Data for Line Chart
  const enrollmentChartData = {
    labels: analyticsData.enrollment_trend?.slice(0, 6).map((item: any) => {
      const [year, month] = item.month.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return monthNames[parseInt(month) - 1];
    }) || [],
    datasets: [
      {
        data: analyticsData.enrollment_trend?.slice(0, 6).map((item: any) => item.student_count) || [0],
      },
    ],
  };

  // Prepare Class Performance Data for Bar Chart
  const classPerformanceChartData = {
    labels: analyticsData.class_performance?.slice(0, 5).map((item: any) => item.class_name) || [],
    datasets: [
      {
        data: analyticsData.class_performance?.slice(0, 5).map((item: any) => item.average_percentage) || [0],
      },
    ],
  };

  // Prepare Subject Performance Data for Bar Chart
  const subjectPerformanceChartData = {
    labels: analyticsData.subject_performance?.slice(0, 5).map((item: any) => 
      item.subject_name.length > 8 ? item.subject_name.substring(0, 8) + '...' : item.subject_name
    ) || [],
    datasets: [
      {
        data: analyticsData.subject_performance?.slice(0, 5).map((item: any) => item.average_percentage) || [0],
      },
    ],
  };

  // Prepare Grade Distribution Data for Pie Chart
  const gradeDistributionData = analyticsData.grade_distribution?.map((item: any, index: number) => {
    const colors = ['#4CAF50', '#8BC34A', '#FFC107', '#FF9800', '#F44336'];
    return {
      name: item.grade.split(' ')[0],
      population: item.count,
      color: colors[index] || PRIMARY_COLOR,
      legendFontColor: '#333333',
      legendFontSize: 12,
    };
  }) || [];

  // Monthly Test Trend for Line Chart
  const monthlyTestChartData = {
    labels: analyticsData.monthly_test_trend?.slice(0, 6).map((item: any) => {
      const [year, month] = item.month.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return monthNames[parseInt(month) - 1];
    }) || [],
    datasets: [
      {
        data: analyticsData.monthly_test_trend?.slice(0, 6).map((item: any) => item.test_count) || [0],
        color: (opacity = 1) => `rgba(225, 27, 35, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={PRIMARY_COLOR} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="stats-chart" size={32} color={PRIMARY_COLOR} />
          <Text style={styles.headerTitle}>Admin Analytics</Text>
        </View>
        <Text style={styles.headerSubtitle}>Comprehensive System Overview</Text>
      </View>

      {/* Overall Statistics Cards */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="bar-chart-outline" size={24} color={PRIMARY_COLOR} />
          <Text style={styles.sectionTitle}>System Overview</Text>
        </View>
        <View style={styles.statsGrid}>
          <StatCard
            icon="school-outline"
            value={analyticsData.overall_statistics?.total_students ?? 0}
            label="Students"
            color="#4CAF50"
          />
          <StatCard
            icon="people-outline"
            value={analyticsData.overall_statistics?.total_teachers ?? 0}
            label="Teachers"
            color="#2196F3"
          />
          <StatCard
            icon="book-outline"
            value={analyticsData.overall_statistics?.total_classes ?? 0}
            label="Classes"
            color="#FF9800"
          />
          <StatCard
            icon="library-outline"
            value={analyticsData.overall_statistics?.total_sections ?? 0}
            label="Sections"
            color="#9C27B0"
          />
          <StatCard
            icon="flask-outline"
            value={analyticsData.overall_statistics?.total_subjects ?? 0}
            label="Subjects"
            color="#00BCD4"
          />
          <StatCard
            icon="document-text-outline"
            value={analyticsData.overall_statistics?.total_tests ?? 0}
            label="Total Tests"
            color={PRIMARY_COLOR}
          />
        </View>

        {/* Performance Metrics */}
        <View style={styles.metricsContainer}>
          <MetricCard
            icon="checkmark-circle"
            value={`${analyticsData.overall_statistics?.test_completion_rate?.toFixed(1) ?? 0}%`}
            label="Test Completion Rate"
            color="#4CAF50"
          />
          <MetricCard
            icon="trending-up"
            value={`${analyticsData.overall_statistics?.student_participation_rate?.toFixed(1) ?? 0}%`}
            label="Participation Rate"
            color={PRIMARY_COLOR}
          />
        </View>
      </View>

      {/* Enrollment Trend Chart */}
      {enrollmentChartData.labels.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trending-up-outline" size={24} color={PRIMARY_COLOR} />
            <Text style={styles.sectionTitle}>Enrollment Trend (6 Months)</Text>
          </View>
          <View style={styles.chartCard}>
            <LineChart
              data={enrollmentChartData}
              width={screenWidth - 64}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              yAxisLabel=""
              yAxisSuffix=""
              withInnerLines={true}
              withOuterLines={true}
              withVerticalLines={false}
              withHorizontalLines={true}
              fromZero={true}
            />
          </View>
        </View>
      )}

      {/* Class Performance Chart */}
      {classPerformanceChartData.labels.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="podium-outline" size={24} color={PRIMARY_COLOR} />
            <Text style={styles.sectionTitle}>Class Performance</Text>
          </View>
          <View style={styles.chartCard}>
            <BarChart
              data={classPerformanceChartData}
              width={screenWidth - 64}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              yAxisLabel=""
              yAxisSuffix="%"
              fromZero={true}
              showBarTops={true}
              withInnerLines={true}
            />
          </View>
        </View>
      )}

      {/* Subject Performance Chart */}
      {subjectPerformanceChartData.labels.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="book-outline" size={24} color={PRIMARY_COLOR} />
            <Text style={styles.sectionTitle}>Subject-wise Performance</Text>
          </View>
          <View style={styles.chartCard}>
            <BarChart
              data={subjectPerformanceChartData}
              width={screenWidth - 64}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              yAxisLabel=""
              yAxisSuffix="%"
              fromZero={true}
              showBarTops={true}
              withInnerLines={true}
            />
          </View>
        </View>
      )}

      {/* Grade Distribution Chart */}
      {gradeDistributionData.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="pie-chart-outline" size={24} color={PRIMARY_COLOR} />
            <Text style={styles.sectionTitle}>Grade Distribution</Text>
          </View>
          <View style={styles.chartCard}>
            <PieChart
              data={gradeDistributionData}
              width={screenWidth - 64}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
              style={styles.chart}
            />
          </View>
        </View>
      )}

      {/* Monthly Test Trend Chart */}
      {monthlyTestChartData.labels.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar-outline" size={24} color={PRIMARY_COLOR} />
            <Text style={styles.sectionTitle}>Monthly Test Trend</Text>
          </View>
          <View style={styles.chartCard}>
            <LineChart
              data={monthlyTestChartData}
              width={screenWidth - 64}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              yAxisLabel=""
              yAxisSuffix=""
              withInnerLines={true}
              withOuterLines={true}
              withVerticalLines={false}
              withHorizontalLines={true}
              fromZero={true}
            />
          </View>
        </View>
      )}

      {/* Recent Activities */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="time-outline" size={24} color={PRIMARY_COLOR} />
          <Text style={styles.sectionTitle}>Recent Activities (30 Days)</Text>
        </View>
        <View style={styles.activityGrid}>
          <ActivityCard
            icon="document-text"
            value={analyticsData.recent_activities?.tests_created ?? 0}
            label="Tests Created"
            color={PRIMARY_COLOR}
          />
          <ActivityCard
            icon="chatbubbles"
            value={analyticsData.recent_activities?.feedback_given ?? 0}
            label="Feedback"
            color="#4CAF50"
          />
          <ActivityCard
            icon="checkmark-done"
            value={analyticsData.recent_activities?.marks_approved ?? 0}
            label="Marks Approved"
            color="#2196F3"
          />
          <ActivityCard
            icon="person-add"
            value={analyticsData.recent_activities?.new_enrollments ?? 0}
            label="New Enrollments"
            color="#FF9800"
          />
        </View>
      </View>

      {/* Pending Actions Alert */}
      {analyticsData.pending_actions?.marks_pending_approval > 0 && (
        <View style={styles.section}>
          <View style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <Ionicons name="warning" size={28} color="#FF9800" />
              <Text style={styles.alertTitle}>Pending Actions Required</Text>
            </View>
            <View style={styles.alertContent}>
              <View style={styles.alertItem}>
                <Ionicons name="hourglass-outline" size={20} color="#FF9800" />
                <Text style={styles.alertText}>
                  {analyticsData.pending_actions.marks_pending_approval} marks awaiting approval
                </Text>
              </View>
              {/* List pending marks with approve/reject buttons */}
              {pendingMarks.length > 0 && pendingMarks.map((mark) => (
                <View key={mark.marks_id} style={{ marginTop: 8, padding: 8, backgroundColor: '#FFF8E1', borderRadius: 8 }}>
                  <Text style={{ fontWeight: 'bold' }}>{mark.student_name} - {mark.class_name} - {mark.subject_name}</Text>
                  <View style={{ flexDirection: 'row', marginTop: 4 }}>
                    <TouchableOpacity
                      style={[styles.approveButton]}
                      onPress={() => handleApprove(mark.marks_id)}
                    >
                      <Text style={styles.buttonText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.rejectButton]}
                      onPress={() => handleReject(mark.marks_id)}
                    >
                      <Text style={styles.buttonText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Top Students */}
      {analyticsData.top_students?.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trophy-outline" size={24} color={PRIMARY_COLOR} />
            <Text style={styles.sectionTitle}>Top Performing Students</Text>
          </View>
          {analyticsData.top_students.slice(0, 5).map((student: any, index: number) => (
            <View key={index} style={styles.studentCard}>
              <View style={styles.studentRank}>
                <Text style={styles.rankNumber}>#{index + 1}</Text>
              </View>
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{student.student_name}</Text>
                <Text style={styles.studentDetails}>
                  {student.class} - {student.section} • Roll: {student.roll_number}
                </Text>
              </View>
              <View style={styles.studentScore}>
                <Text style={styles.scoreValue}>{student.average_percentage.toFixed(1)}%</Text>
                <Text style={styles.scoreLabel}>{student.total_tests} tests</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Teacher Performance */}
      {analyticsData.teacher_performance?.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people-outline" size={24} color={PRIMARY_COLOR} />
            <Text style={styles.sectionTitle}>Teacher Performance</Text>
          </View>
          {analyticsData.teacher_performance.slice(0, 5).map((teacher: any, index: number) => (
            <View key={index} style={styles.teacherCard}>
              <View style={styles.teacherHeader}>
                <Ionicons name="person-circle-outline" size={40} color={PRIMARY_COLOR} />
                <View style={styles.teacherInfo}>
                  <Text style={styles.teacherName}>{teacher.teacher_name}</Text>
                  <Text style={styles.teacherEmail}>{teacher.teacher_email}</Text>
                </View>
              </View>
              <View style={styles.teacherMetrics}>
                <View style={styles.teacherMetric}>
                  <Ionicons name="document-text-outline" size={18} color="#666" />
                  <Text style={styles.teacherMetricText}>{teacher.tests_created} tests</Text>
                </View>
                <View style={styles.teacherMetric}>
                  <Ionicons name="chatbubble-outline" size={18} color="#666" />
                  <Text style={styles.teacherMetricText}>{teacher.feedback_given} feedback</Text>
                </View>
                <View style={styles.teacherMetric}>
                  <Ionicons name="grid-outline" size={18} color="#666" />
                  <Text style={styles.teacherMetricText}>{teacher.sections_assigned} sections</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

// Reusable Components
const StatCard = ({ icon, value, label, color }: any) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <Ionicons name={icon} size={28} color={color} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const MetricCard = ({ icon, value, label, color }: any) => (
  <View style={[styles.metricCard, { borderLeftColor: color }]}>
    <Ionicons name={icon} size={32} color={color} />
    <View style={styles.metricContent}>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  </View>
);

const ActivityCard = ({ icon, value, label, color }: any) => (
  <View style={styles.activityCard}>
    <View style={[styles.activityIcon, { backgroundColor: color + '15' }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <Text style={styles.activityValue}>{value}</Text>
    <Text style={styles.activityLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  contentContainer: {
    paddingBottom: 32,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: PRIMARY_COLOR,
    textAlign: 'center',
    fontWeight: '500',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginLeft: 44,
  },
  section: {
    paddingHorizontal: 10,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  metricsContainer: {
    marginTop: 12,
    gap: 12,
  },
  metricCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    gap: 16,
  },
  metricContent: {
    flex: 1,
  },
  metricValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  activityCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  activityIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  activityLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  alertCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  alertContent: {
    gap: 8,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertText: {
    fontSize: 14,
    color: '#666',
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  studentRank: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: PRIMARY_COLOR + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  studentDetails: {
    fontSize: 12,
    color: '#666',
  },
  studentScore: {
    alignItems: 'flex-end',
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
    marginBottom: 2,
  },
  scoreLabel: {
    fontSize: 11,
    color: '#999',
  },
  teacherCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  teacherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  teacherEmail: {
    fontSize: 12,
    color: '#666',
  },
  teacherMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  teacherMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  teacherMetricText: {
    fontSize: 12,
    color: '#666',
  },
  approveButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 8,
  },
  rejectButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
