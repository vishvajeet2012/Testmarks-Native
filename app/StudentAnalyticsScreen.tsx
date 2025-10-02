import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import { useDispatch, useSelector } from 'react-redux';

import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { AppDispatch, RootState } from '../redux/store';
import { getStudentAnalytics } from '../thunk/studentscreen/studentAnalytics';

const screenWidth = Dimensions.get('window').width;

export default function StudentAnalyticsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector(
    (state: RootState) => state.studentAnalytics as { data: any; loading: boolean; error: string | null }
  );

  useEffect(() => {
    dispatch(getStudentAnalytics());
  }, [dispatch]);

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <Ionicons name="stats-chart-outline" size={48} color="#6C63FF" />
        <ThemedText style={styles.loadingText}>Loading analytics...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
        <ThemedText style={styles.errorText}>Error: {error}</ThemedText>
      </ThemedView>
    );
  }

  if (!data) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText style={styles.emptyText}>No analytics available</ThemedText>
      </ThemedView>
    );
  }

  const chartConfig = {
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
  };

  // Performance Trend Data
  const trendData = {
    labels: data.performance_trend.map((item: any) => {
      const [year, month] = item.month.split('-');
      return `${month}/${year.slice(2)}`;
    }),
    datasets: [
      {
        data: data.performance_trend.map((item: any) => item.average_percentage),
        color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  // Subject-wise Performance Data
  const subjectData = {
    labels: data.subject_wise_performance.map((item: any) =>
      item.subject.length > 8 ? item.subject.substring(0, 8) + '...' : item.subject
    ),
    datasets: [
      {
        data: data.subject_wise_performance.map((item: any) => item.average_percentage),
      },
    ],
  };

  // Grade Distribution Pie Chart
  const gradeColors = ['#4CAF50', '#8BC34A', '#FFC107', '#FF9800', '#F44336'];
  const pieData = [
    {
      name: 'Excellent',
      population: data.grade_distribution.excellent,
      color: gradeColors[0],
      legendFontColor: '#333',
      legendFontSize: 12,
    },
    {
      name: 'Good',
      population: data.grade_distribution.good,
      color: gradeColors[1],
      legendFontColor: '#333',
      legendFontSize: 12,
    },
    {
      name: 'Average',
      population: data.grade_distribution.average,
      color: gradeColors[2],
      legendFontColor: '#333',
      legendFontSize: 12,
    },
    {
      name: 'Below Avg',
      population: data.grade_distribution.below_average,
      color: gradeColors[3],
      legendFontColor: '#333',
      legendFontSize: 12,
    },
    {
      name: 'Poor',
      population: data.grade_distribution.poor,
      color: gradeColors[4],
      legendFontColor: '#333',
      legendFontSize: 12,
    },
  ].filter((item) => item.population > 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Overview Cards */}
      <View style={styles.overviewContainer}>
        <View style={[styles.overviewCard, styles.percentageCard]}>
          <Ionicons name="trophy" size={32} color="#6C63FF" />
          <ThemedText style={styles.overviewNumber}>
            {data.overview.overall_percentage}%
          </ThemedText>
          <ThemedText style={styles.overviewLabel}>Overall Score</ThemedText>
        </View>
        <View style={[styles.overviewCard, styles.testsCard]}>
          <Ionicons name="document-text" size={32} color="#4CAF50" />
          <ThemedText style={styles.overviewNumber}>{data.overview.total_tests}</ThemedText>
          <ThemedText style={styles.overviewLabel}>Tests Taken</ThemedText>
        </View>
        <View style={[styles.overviewCard, styles.completionCard]}>
          <Ionicons name="checkmark-circle" size={32} color="#2196F3" />
          <ThemedText style={styles.overviewNumber}>
            {data.overview.completion_rate}%
          </ThemedText>
          <ThemedText style={styles.overviewLabel}>Completion</ThemedText>
        </View>
      </View>

      {/* Performance Trend Chart */}
      {data.performance_trend.length > 0 && (
        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Ionicons name="trending-up" size={24} color="#6C63FF" />
            <ThemedText style={styles.chartTitle}>Performance Trend</ThemedText>
          </View>
          <View style={styles.chartContainer}>
            <LineChart
              data={trendData}
              width={screenWidth - 48}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withInnerLines={true}
              withOuterLines={true}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              fromZero
              segments={5}
            />
          </View>
        </View>
      )}

      {/* Subject-wise Performance Chart */}
      {data.subject_wise_performance.length > 0 && (
        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Ionicons name="bar-chart" size={24} color="#4CAF50" />
            <ThemedText style={styles.chartTitle}>Subject Performance</ThemedText>
          </View>
          <View style={styles.chartContainer}>
            <BarChart
              data={subjectData}
              width={screenWidth - 48}
              height={220}
              yAxisLabel=""
              yAxisSuffix="%"
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
              }}
              style={styles.chart}
              showValuesOnTopOfBars={true}
              fromZero
            />
          </View>
        </View>
      )}

      {/* Grade Distribution Pie Chart */}
      {pieData.length > 0 && (
        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Ionicons name="pie-chart" size={24} color="#FF9800" />
            <ThemedText style={styles.chartTitle}>Grade Distribution</ThemedText>
          </View>
          <View style={styles.chartContainer}>
            <PieChart
              data={pieData}
              width={screenWidth - 48}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
              style={styles.chart}
            />
          </View>
          <View style={styles.legendInfo}>
            <ThemedText style={styles.legendText}>
              • Excellent: 90-100% • Good: 75-89% • Average: 60-74%
            </ThemedText>
            <ThemedText style={styles.legendText}>
              • Below Average: 40-59% • Poor: 0-39%
            </ThemedText>
          </View>
        </View>
      )}

      {/* Class Comparison */}
      {data.class_comparison.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people" size={24} color="#2196F3" />
            <ThemedText style={styles.sectionTitle}>Class Comparison</ThemedText>
          </View>
          {data.class_comparison.map((item: any, index: number) => (
            <View key={index} style={styles.comparisonCard}>
              <ThemedText style={styles.comparisonSubject}>{item.subject}</ThemedText>
              <View style={styles.comparisonData}>
                <View style={styles.comparisonItem}>
                  <ThemedText style={styles.comparisonLabel}>Your Avg</ThemedText>
                  <ThemedText style={styles.comparisonValue}>
                    {item.student_average}
                  </ThemedText>
                </View>
                <View style={styles.comparisonDivider} />
                <View style={styles.comparisonItem}>
                  <ThemedText style={styles.comparisonLabel}>Class Avg</ThemedText>
                  <ThemedText style={[styles.comparisonValue, styles.classAvg]}>
                    {item.class_average}
                  </ThemedText>
                </View>
              </View>
              <View
                style={[
                  styles.comparisonBadge,
                  item.student_average >= item.class_average
                    ? styles.aboveAverage
                    : styles.belowAverage,
                ]}
              >
                <Ionicons
                  name={
                    item.student_average >= item.class_average
                      ? 'arrow-up'
                      : 'arrow-down'
                  }
                  size={14}
                  color="#FFFFFF"
                />
                <ThemedText style={styles.badgeText}>
                  {item.student_average >= item.class_average
                    ? 'Above Average'
                    : 'Below Average'}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Recent Test Scores */}
      {data.recent_tests.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time" size={24} color="#9C27B0" />
            <ThemedText style={styles.sectionTitle}>Recent Test Scores</ThemedText>
          </View>
          {data.recent_tests.map((test: any, index: number) => (
            <View key={index} style={styles.recentTestCard}>
              <View style={styles.testInfo}>
                <ThemedText style={styles.testName}>{test.test_name}</ThemedText>
                <ThemedText style={styles.testSubject}>{test.subject}</ThemedText>
                <ThemedText style={styles.testDate}>
                  {new Date(test.date).toLocaleDateString()}
                </ThemedText>
              </View>
              <View style={styles.testScore}>
                <ThemedText style={styles.scoreNumber}>
                  {test.marks_obtained}/{test.max_marks}
                </ThemedText>
                <View
                  style={[
                    styles.percentageBadge,
                    { backgroundColor: test.percentage >= 75 ? '#4CAF50' : '#FF9800' },
                  ]}
                >
                  <ThemedText style={styles.percentageText}>{test.percentage}%</ThemedText>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6C63FF',
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#FF6B6B',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  overviewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  overviewCard: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  percentageCard: {
    backgroundColor: '#E6E6FF',
  },
  testsCard: {
    backgroundColor: '#E8F5E9',
  },
  completionCard: {
    backgroundColor: '#E3F2FD',
  },
  overviewNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  overviewLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  chartSection: {
    marginBottom: 24,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  chartContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  chart: {
    borderRadius: 8,
  },
  legendInfo: {
    marginTop: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  comparisonCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  comparisonSubject: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  comparisonData: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  comparisonItem: {
    flex: 1,
    alignItems: 'center',
  },
  comparisonLabel: {
    fontSize: 12,
    color: '#666',
  },
  comparisonValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  classAvg: {
    color: '#2196F3',
  },
  comparisonDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#CCC',
  },
  comparisonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  aboveAverage: {
    backgroundColor: '#4CAF50',
  },
  belowAverage: {
    backgroundColor: '#F44336',
  },
  badgeText: {
    color: '#FFF',
    marginLeft: 4,
    fontSize: 12,
  },
  recentTestCard: {
    backgroundColor: '#F3E5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  testInfo: {
    flex: 1,
  },
  testName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  testSubject: {
    fontSize: 14,
    color: '#666',
  },
  testDate: {
    fontSize: 12,
    color: '#999',
  },
  testScore: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  percentageBadge: {
    marginTop: 4,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  percentageText: {
    color: '#FFF',
    fontSize: 12,
  },
});
