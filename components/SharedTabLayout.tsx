import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxhooks';
import { useColorScheme } from '@/hooks/useColorScheme';
import { deleteNotification, fetchNotifications, markNotificationRead } from '@/thunk/NotificationService/notifcationThunk';
import { getAuditLogs } from '@/thunk/admin/auditLog';
import { getMyAllFeedbacks, getTestFeedbacks, replyToFeedback } from '@/thunk/feedback/feedbackThunk';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Platform, RefreshControl, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path, SvgProps } from 'react-native-svg';

interface SharedTabLayoutProps {
  homeContent: React.ReactNode;
}

// Custom SVG Icon Props Interface
interface IconProps extends SvgProps {
  size?: number;
  color?: string;
}

interface StarIconProps extends IconProps {
  filled?: boolean;
}

// Custom color scheme with e11b23 as primary
const CustomColors = {
  light: {
    tint: '#e11b23',
    background: '#ffffff',
    border: '#e5e5e5',
    text: '#000000',
    tabBackground: '#ffffff',
  },
  dark: {
    tint: '#e11b23',
    background: '#000000',
    border: '#333333',
    text: '#ffffff',
    tabBackground: '#1c1c1e',
  },
};

// Custom SVG Icons
const BellIcon: React.FC<IconProps> = ({ size = 24, color = '#000', ...props }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={color}
    />
    <Path
      d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const StarIcon: React.FC<StarIconProps> = ({ size = 24, color = '#000', filled = true, ...props }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={filled ? color : 'none'}
    />
  </Svg>
);

const HomeIcon: React.FC<IconProps> = ({ size = 24, color = '#000', ...props }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={color}
    />
    <Path
      d="M9 22V12H15V22"
      stroke={color === '#ffffff' ? color : '#ffffff'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CheckmarkIcon: React.FC<IconProps> = ({ size = 24, color = '#000', ...props }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Circle cx="12" cy="12" r="10" fill={color} />
    <Path
      d="M9 12L11 14L15 10"
      stroke="#ffffff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const WarningIcon: React.FC<IconProps> = ({ size = 24, color = '#000', ...props }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M10.29 3.86L1.82 18C1.64537 18.3024 1.55296 18.6453 1.55199 18.9945C1.55101 19.3437 1.64151 19.6871 1.81442 19.9905C1.98733 20.2939 2.23672 20.5467 2.53771 20.7239C2.83869 20.9011 3.18082 20.9962 3.53 21H20.47C20.8192 20.9962 21.1613 20.9011 21.4623 20.7239C21.7633 20.5467 22.0127 20.2939 22.1856 19.9905C22.3585 19.6871 22.449 19.3437 22.448 18.9945C22.447 18.6453 22.3546 18.3024 22.18 18L13.71 3.86C13.5317 3.56611 13.2807 3.32312 12.9812 3.15448C12.6817 2.98585 12.3437 2.89725 12 2.89725C11.6563 2.89725 11.3183 2.98585 11.0188 3.15448C10.7193 3.32312 10.4683 3.56611 10.29 3.86V3.86Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={color}
    />
    <Path d="M12 9V13" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="17" r="1" fill="#ffffff" />
  </Svg>
);

const ErrorIcon: React.FC<IconProps> = ({ size = 24, color = '#000', ...props }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill={color} />
    <Path d="M15 9L9 15M9 9L15 15" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const InfoIcon: React.FC<IconProps> = ({ size = 24, color = '#000', ...props }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill={color} />
    <Path d="M12 16V12M12 8H12.01" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const TrashIcon: React.FC<IconProps> = ({ size = 24, color = '#000', ...props }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M3 6H5H21"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CheckIcon: React.FC<IconProps> = ({ size = 24, color = '#000', ...props }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M20 6L9 17L4 12"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PencilIcon: React.FC<IconProps> = ({ size = 24, color = '#000', ...props }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M17 3C17.2626 2.73735 17.5744 2.52901 17.9176 2.38687C18.2608 2.24473 18.6286 2.17157 19 2.17157C19.3714 2.17157 19.7392 2.24473 20.0824 2.38687C20.4256 2.52901 20.7374 2.73735 21 3C21.2626 3.26264 21.471 3.57444 21.6131 3.9176C21.7553 4.26077 21.8284 4.62856 21.8284 5C21.8284 5.37143 21.7553 5.73923 21.6131 6.08239C21.471 6.42555 21.2626 6.73735 21 7L7.5 20.5L2 22L3.5 16.5L17 3Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const QuestionIcon: React.FC<IconProps> = ({ size = 24, color = '#000', ...props }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Path
      d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="17" r="1" fill={color} />
  </Svg>
);

const ChevronRightIcon: React.FC<IconProps> = ({ size = 24, color = '#000', ...props }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M9 18L15 12L9 6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const BellSlashIcon: React.FC<IconProps> = ({ size = 24, color = '#000', ...props }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M1 1L23 23" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const TriangleAlertIcon: React.FC<IconProps> = ({ size = 24, color = '#000', ...props }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M10.29 3.86L1.82 18C1.64537 18.3024 1.55296 18.6453 1.55199 18.9945C1.55101 19.3437 1.64151 19.6871 1.81442 19.9905C1.98733 20.2939 2.23672 20.5467 2.53771 20.7239C2.83869 20.9011 3.18082 20.9962 3.53 21H20.47C20.8192 20.9962 21.1613 20.9011 21.4623 20.7239C21.7633 20.5467 22.0127 20.2939 22.1856 19.9905C22.3585 19.6871 22.449 19.3437 22.448 18.9945C22.447 18.6453 22.3546 18.3024 22.18 18L13.71 3.86C13.5317 3.56611 13.2807 3.32312 12.9812 3.15448C12.6817 2.98585 12.3437 2.89725 12 2.89725C11.6563 2.89725 11.3183 2.98585 11.0188 3.15448C10.7193 3.32312 10.4683 3.56611 10.29 3.86V3.86Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M12 9V13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="17" r="1" fill={color} />
  </Svg>
);

function NotificationScreen() {
  const dispatch = useAppDispatch();
  const { notifications, loading, error, unreadCount } = useAppSelector((state: any) => state.notifications);
  const colorScheme = useColorScheme();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchNotifications());
    setRefreshing(false);
  }, [dispatch]);

  const handleMarkAsRead = (id: number) => {
    dispatch(markNotificationRead(id));
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => dispatch(deleteNotification(id)) },
      ]
    );
  };

  const getNotificationIcon = (type?: string) => {
    const color = getNotificationColor(type);
    switch (type?.toLowerCase()) {
      case 'success':
        return <CheckmarkIcon size={20} color={color} />;
      case 'warning':
        return <WarningIcon size={20} color={color} />;
      case 'error':
        return <ErrorIcon size={20} color={color} />;
      case 'info':
        return <InfoIcon size={20} color={color} />;
      default:
        return <BellIcon size={20} color={color} />;
    }
  };

  const getNotificationColor = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'success':
        return '#34C759';
      case 'warning':
        return '#FF9500';
      case 'error':
        return '#e11b23';
      case 'info':
        return '#e11b23';
      default:
        return CustomColors[colorScheme ?? 'light'].tint;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderNotification = ({ item }: { item: any }) => (
    <ThemedView 
      style={[
        styles.notificationItem,
        !item.is_read && styles.unreadNotification,
        { borderLeftColor: getNotificationColor(item.type) }
      ]}
    >
      <View style={styles.notificationHeader}>
        <View style={styles.notificationIconContainer}>
          {getNotificationIcon(item.type)}
        </View>
        <View style={styles.notificationContent}>
          <ThemedText style={styles.notificationTitle}>
            {item.title || 'Notification'}
          </ThemedText>
          <ThemedText style={styles.notificationMessage}>
            {item.message}
          </ThemedText>
          <ThemedText style={styles.notificationDate}>
            {formatTime(item.created_at)}
          </ThemedText>
        </View>
        {!item.is_read && (
          <View style={styles.unreadBadge}>
            <View style={[styles.unreadDot, { backgroundColor: getNotificationColor(item.type) }]} />
          </View>
        )}
      </View>
      
      <View style={styles.notificationActions}>
        {!item.is_read && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.markReadButton]}
            onPress={() => handleMarkAsRead(item.notification_id)}
          >
            <CheckIcon size={16} color="#fff" />
            <ThemedText style={styles.actionButtonText}>Mark Read</ThemedText>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item.notification_id)}
        >
          <TrashIcon size={16} color="#fff" />
          <ThemedText style={styles.actionButtonText}>Delete</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );

  if (loading && !refreshing) {
    return (
      <ThemedView style={styles.center}>
        <View style={styles.loadingContainer}>
          <BellIcon size={48} color={CustomColors[colorScheme ?? 'light'].tint} />
          <ThemedText style={styles.loadingText}>Loading notifications...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.center}>
        <View style={styles.errorContainer}>
          <TriangleAlertIcon size={48} color="#e11b23" />
          <ThemedText type="subtitle" style={styles.errorTitle}>Unable to load notifications</ThemedText>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={() => dispatch(fetchNotifications())}>
            <ThemedText style={styles.retryButtonText}>Try Again</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.notificationsContainer}>
      <View style={styles.header}>
        <View>
          <ThemedText type="title" style={styles.title}>
            Notifications
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </ThemedText>
        </View>
        {notifications.length > 0 && unreadCount > 0 && (
          <TouchableOpacity 
            style={styles.markAllButton}
            onPress={() => {
              Alert.alert('Mark all as read', 'This will mark all notifications as read.');
            }}
          >
            <ThemedText style={styles.markAllText}>Mark all read</ThemedText>
          </TouchableOpacity>
        )}
      </View>

      {notifications.length === 0 ? (
        <ThemedView style={styles.emptyState}>
          <BellSlashIcon size={64} color="#C7C7CC" />
          <ThemedText type="subtitle" style={styles.emptyStateTitle}>
            No notifications yet
          </ThemedText>
          <ThemedText style={styles.emptyStateText}>
            We'll notify you when something new arrives
          </ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => (item?.notification_id ? item.notification_id?.toString() : Math.random().toString())}
          renderItem={renderNotification}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={CustomColors[colorScheme ?? 'light'].tint}
            />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </ThemedView>
  );
}

function StudentFeedbackScreen() {
  const dispatch = useAppDispatch();
  const { feedbacks, loading, error } = useAppSelector((state: any) => state.feedback);
  const colorScheme = useColorScheme();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(getMyAllFeedbacks());
  }, [dispatch]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await dispatch(getMyAllFeedbacks());
    setRefreshing(false);
  }, [dispatch]);

  const renderFeedbackItem = ({ item }: { item: any }) => (
    <ThemedView style={styles.feedbackItem}>
      <View style={styles.feedbackItemHeader}>
        <ThemedText style={styles.feedbackTestName}>{item.test_name}</ThemedText>
        <ThemedText style={styles.feedbackDate}>
          {new Date(item.created_at).toLocaleDateString()}
        </ThemedText>
      </View>
      <ThemedText style={styles.feedbackMessage}>{item.message}</ThemedText>
      {item.teacher_reply && (
        <View style={styles.teacherReply}>
          <ThemedText style={styles.replyLabel}>Teacher's Reply:</ThemedText>
          <ThemedText style={styles.replyMessage}>{item.teacher_reply}</ThemedText>
        </View>
      )}
    </ThemedView>
  );

  if (loading && !refreshing) {
    return (
      <ThemedView style={styles.center}>
        <View style={styles.loadingContainer}>
          <StarIcon size={48} color={CustomColors[colorScheme ?? 'light'].tint} filled={true} />
          <ThemedText style={styles.loadingText}>Loading your feedback...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.feedbackContainer}>
      <View style={styles.feedbackHeader}>
        <StarIcon size={48} color={CustomColors[colorScheme ?? 'light'].tint} filled={true} />
        <ThemedText type="title" style={styles.feedbackTitle}>My Feedback</ThemedText>
        <ThemedText style={styles.feedbackSubtitle}>View feedback from your teachers</ThemedText>
      </View>

      {feedbacks.length === 0 ? (
        <ThemedView style={styles.emptyState}>
          <StarIcon size={64} color="#C7C7CC" filled={false} />
          <ThemedText type="subtitle" style={styles.emptyStateTitle}>
            No feedback yet
          </ThemedText>
          <ThemedText style={styles.emptyStateText}>
            Your feedback from teachers will appear here
          </ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={feedbacks}
          keyExtractor={(item) => item?.feedback_id?.toString()}
          renderItem={renderFeedbackItem}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={CustomColors[colorScheme ?? 'light'].tint}
            />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </ThemedView>
  );
}

function TeacherFeedbackScreen() {
  const dispatch = useAppDispatch();
  const { feedbacks, loading, error } = useAppSelector((state: any) => state.feedback);
  const colorScheme = useColorScheme();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    dispatch(getTestFeedbacks());
  }, [dispatch]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await dispatch(getTestFeedbacks());
    setRefreshing(false);
  }, [dispatch]);

  const handleReply = (feedback: any) => {
    setSelectedFeedback(feedback);
    setReplyText('');
  };

  const submitReply = () => {
    if (selectedFeedback && replyText.trim()) {
      dispatch(replyToFeedback({
        feedback_id: selectedFeedback.feedback_id,
        message: replyText.trim()
      }));
      setSelectedFeedback(null);
      setReplyText('');
    }
  };

  const renderFeedbackItem = ({ item }: { item: any }) => (
    <ThemedView style={styles.feedbackItem}>
      <View style={styles.feedbackItemHeader}>
        <View>
          <ThemedText style={styles.feedbackTestName}>{item.test_name}</ThemedText>
          <ThemedText style={styles.feedbackStudentName}>Student: {item.student_name}</ThemedText>
        </View>
        <ThemedText style={styles.feedbackDate}>
          {new Date(item.created_at).toLocaleDateString()}
        </ThemedText>
      </View>
      <ThemedText style={styles.feedbackMessage}>{item.message}</ThemedText>
      {item.teacher_reply ? (
        <View style={styles.teacherReply}>
          <ThemedText style={styles.replyLabel}>Your Reply:</ThemedText>
          <ThemedText style={styles.replyMessage}>{item.teacher_reply}</ThemedText>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.replyButton}
          onPress={() => handleReply(item)}
        >
          <PencilIcon size={16} color="#fff" />
          <ThemedText style={styles.replyButtonText}>Reply</ThemedText>
        </TouchableOpacity>
      )}
    </ThemedView>
  );

  if (loading && !refreshing) {
    return (
      <ThemedView style={styles.center}>
        <View style={styles.loadingContainer}>
          <StarIcon size={48} color={CustomColors[colorScheme ?? 'light'].tint} filled={true} />
          <ThemedText style={styles.loadingText}>Loading feedback...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.feedbackContainer}>
      <View style={styles.feedbackHeader}>
        <StarIcon size={48} color={CustomColors[colorScheme ?? 'light'].tint} filled={true} />
        <ThemedText type="title" style={styles.feedbackTitle}>Student Feedback</ThemedText>
        <ThemedText style={styles.feedbackSubtitle}>View and reply to student feedback</ThemedText>
      </View>

      {feedbacks.length === 0 ? (
        <ThemedView style={styles.emptyState}>
          <StarIcon size={64} color="#C7C7CC" filled={false} />
          <ThemedText type="subtitle" style={styles.emptyStateTitle}>
            No feedback yet
          </ThemedText>
          <ThemedText style={styles.emptyStateText}>
            Student feedback will appear here
          </ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={feedbacks}
          keyExtractor={(item) => item?.feedback_id?.toString()}
          renderItem={renderFeedbackItem}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={CustomColors[colorScheme ?? 'light'].tint}
            />
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      {selectedFeedback && (
        <View style={styles.replyModal}>
          <View style={styles.replyModalContent}>
            <ThemedText style={styles.replyModalTitle}>Reply to Feedback</ThemedText>
            <ThemedText style={styles.replyModalSubtitle}>
              {selectedFeedback.student_name} - {selectedFeedback.test_name}
            </ThemedText>
            <TextInput
              style={styles.replyInput}
              placeholder="Type your reply..."
              value={replyText}
              onChangeText={setReplyText}
              multiline
              numberOfLines={4}
            />
            <View style={styles.replyModalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setSelectedFeedback(null)}
              >
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={submitReply}
              >
                <ThemedText style={styles.submitButtonText}>Submit Reply</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ThemedView>
  );
}

function AdminFeedbackScreen() {
  const dispatch = useAppDispatch();
  const { feedbacks, loading, error } = useAppSelector((state: any) => state.feedback);
  const colorScheme = useColorScheme();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    dispatch(getTestFeedbacks());
  }, [dispatch]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await dispatch(getTestFeedbacks());
    setRefreshing(false);
  }, [dispatch]);

  const handleReply = (feedback: any) => {
    setSelectedFeedback(feedback);
    setReplyText('');
  };

  const submitReply = () => {
    if (selectedFeedback && replyText.trim()) {
      dispatch(replyToFeedback({
        feedback_id: selectedFeedback.feedback_id,
        message: replyText.trim()
      }));
      setSelectedFeedback(null);
      setReplyText('');
    }
  };

  const renderFeedbackItem = ({ item }: { item: any }) => (
    <ThemedView style={styles.feedbackItem}>
      <View style={styles.feedbackItemHeader}>
        <View>
          <ThemedText style={styles.feedbackTestName}>{item.test_name}</ThemedText>
          <ThemedText style={styles.feedbackStudentName}>Student: {item.student_name}</ThemedText>
          <ThemedText style={styles.feedbackTeacherName}>Teacher: {item.teacher_name}</ThemedText>
        </View>
        <ThemedText style={styles.feedbackDate}>
          {new Date(item.created_at).toLocaleDateString()}
        </ThemedText>
      </View>
      <ThemedText style={styles.feedbackMessage}>{item.message}</ThemedText>
      {item.teacher_reply ? (
        <View style={styles.teacherReply}>
          <ThemedText style={styles.replyLabel}>Teacher's Reply:</ThemedText>
          <ThemedText style={styles.replyMessage}>{item.teacher_reply}</ThemedText>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.replyButton}
          onPress={() => handleReply(item)}
        >
          <PencilIcon size={16} color="#fff" />
          <ThemedText style={styles.replyButtonText}>Reply as Admin</ThemedText>
        </TouchableOpacity>
      )}
    </ThemedView>
  );

  if (loading && !refreshing) {
    return (
      <ThemedView style={styles.center}>
        <View style={styles.loadingContainer}>
          <StarIcon size={48} color={CustomColors[colorScheme ?? 'light'].tint} filled={true} />
          <ThemedText style={styles.loadingText}>Loading all feedback...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.feedbackContainer}>
      <View style={styles.feedbackHeader}>
        <StarIcon size={48} color={CustomColors[colorScheme ?? 'light'].tint} filled={true} />
        <ThemedText type="title" style={styles.feedbackTitle}>All Feedback</ThemedText>
        <ThemedText style={styles.feedbackSubtitle}>Manage all student feedback</ThemedText>
      </View>

      {feedbacks.length === 0 ? (
        <ThemedView style={styles.emptyState}>
          <StarIcon size={64} color="#C7C7CC" filled={false} />
          <ThemedText type="subtitle" style={styles.emptyStateTitle}>
            No feedback yet
          </ThemedText>
          <ThemedText style={styles.emptyStateText}>
            All student feedback will appear here
          </ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={feedbacks}
          keyExtractor={(item) => item?.feedback_id?.toString()}
          renderItem={renderFeedbackItem}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={CustomColors[colorScheme ?? 'light'].tint}
            />
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      {selectedFeedback && (
        <View style={styles.replyModal}>
          <View style={styles.replyModalContent}>
            <ThemedText style={styles.replyModalTitle}>Reply to Feedback (Admin)</ThemedText>
            <ThemedText style={styles.replyModalSubtitle}>
              {selectedFeedback.student_name} - {selectedFeedback.test_name}
            </ThemedText>
            <TextInput
              style={styles.replyInput}
              placeholder="Type your reply..."
              value={replyText}
              onChangeText={setReplyText}
              multiline
              numberOfLines={4}
            />
            <View style={styles.replyModalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setSelectedFeedback(null)}
              >
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={submitReply}
              >
                <ThemedText style={styles.submitButtonText}>Submit Reply</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ThemedView>
  );
}

function FeedbackScreen() {
  const { user } = useAppSelector((state: any) => state.auth);

  if (!user || !user.role) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText type="subtitle">Unable to determine user role</ThemedText>
      </ThemedView>
    );
  }

  switch (user.role) {
    case 'Student':
      return <StudentFeedbackScreen />;
    case 'Teacher':
      return <TeacherFeedbackScreen />;
    case 'Admin':
      return <AdminFeedbackScreen />;
    default:
      return (
        <ThemedView style={styles.center}>
          <ThemedText type="subtitle">Invalid user role</ThemedText>
        </ThemedView>
      );
  }
}

function AuditLogScreen() {
  const dispatch = useAppDispatch();
  const { data: auditLogs, loading, error } = useAppSelector((state: any) => state.auditLog);
  const colorScheme = useColorScheme();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(getAuditLogs());
  }, [dispatch]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await dispatch(getAuditLogs());
    setRefreshing(false);
  }, [dispatch]);

  const renderAuditLogItem = ({ item }: { item: any }) => (
    <ThemedView style={styles.auditLogItem}>
      <View style={styles.auditLogItemHeader}>
        <ThemedText style={styles.auditLogAction}>{item.action}</ThemedText>
        <ThemedText style={styles.auditLogDate}>
          {new Date(item.timestamp).toLocaleString()}
        </ThemedText>
      </View>
      <ThemedText style={styles.auditLogUser}>User: {item.user_name} ({item.user_role})</ThemedText>
      <ThemedText style={styles.auditLogDetails}>{item.remarks}</ThemedText>
      {item.ip_address && (
        <ThemedText style={styles.auditLogIP}>IP: {item.ip_address}</ThemedText>
      )}
    </ThemedView>
  );

  if (loading && !refreshing) {
    return (
      <ThemedView style={styles.center}>
        <View style={styles.loadingContainer}>
          <InfoIcon size={48} color={CustomColors[colorScheme ?? 'light'].tint} />
          <ThemedText style={styles.loadingText}>Loading audit logs...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.center}>
        <View style={styles.errorContainer}>
          <TriangleAlertIcon size={48} color="#e11b23" />
          <ThemedText type="subtitle" style={styles.errorTitle}>Unable to load audit logs</ThemedText>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={() => dispatch(getAuditLogs())}>
            <ThemedText style={styles.retryButtonText}>Try Again</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.auditLogContainer}>
      <View style={styles.auditLogHeader}>
        <InfoIcon size={48} color={CustomColors[colorScheme ?? 'light'].tint} />
        <ThemedText type="title" style={styles.auditLogTitle}>Audit Logs</ThemedText>
        <ThemedText style={styles.auditLogSubtitle}>View system activity logs</ThemedText>
      </View>

      {auditLogs.length === 0 ? (
        <ThemedView style={styles.emptyState}>
          <InfoIcon size={64} color="#C7C7CC" />
          <ThemedText type="subtitle" style={styles.emptyStateTitle}>
            No audit logs yet
          </ThemedText>
          <ThemedText style={styles.emptyStateText}>
            System activity will appear here
          </ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={auditLogs}
          keyExtractor={(item) => item?.log_id?.toString()}
          renderItem={renderAuditLogItem}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={CustomColors[colorScheme ?? 'light'].tint}
            />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </ThemedView>
  );
}

// Tab Button Component
const TabButton = ({ 
  tab, 
  isActive, 
  onPress, 
  unreadCount 
}: { 
  tab: { name: string; icon: string }; 
  isActive: boolean; 
  onPress: () => void;
  unreadCount: number;
}) => {
  const colorScheme = useColorScheme();
  const iconColor = isActive ? '#ffffff' : CustomColors[colorScheme ?? 'light'].tint;
  
  const renderIcon = () => {
    switch (tab.icon) {
      case 'house.fill':
        return <HomeIcon size={24} color={iconColor} />;
      case 'bell.fill':
        return <BellIcon size={24} color={iconColor} />;
      case 'star.fill':
        return <StarIcon size={24} color={iconColor} filled={true} />;
      case 'info.circle.fill':
        return <InfoIcon size={24} color={iconColor} />;
      default:
        return <HomeIcon size={24} color={iconColor} />;
    }
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.tabButton,
        isActive && styles.tabButtonActive
      ]}
      onPress={onPress}
    >
      <View style={styles.tabIconWrapper}>
        {renderIcon()}
        {tab.name === 'Notification' && unreadCount > 0 && (
          <View style={styles.notificationBadge}>
            <ThemedText style={styles.notificationBadgeText}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </ThemedText>
          </View>
        )}
      </View>
      <ThemedText
        style={[
          styles.tabLabel,
          { 
            color: isActive ? '#ffffff' : CustomColors[colorScheme ?? 'light'].tint,
          }
        ]}
      >
        {tab.name}
      </ThemedText>
    </TouchableOpacity>
  );
};

export default function SharedTabLayout({ homeContent }: SharedTabLayoutProps) {
  const colorScheme = useColorScheme();
  const [selectedTab, setSelectedTab] = useState('Home');
  const { unreadCount } = useAppSelector((state: any) => state.notifications);
  const { user } = useAppSelector((state: any) => state.auth);

  const renderContent = () => {
    switch (selectedTab) {
      case 'Home':
        return homeContent;
      case 'Notification':
        return <NotificationScreen />;
      case 'Feedback':
        return <FeedbackScreen />;
      case 'AuditLog':
        return <AuditLogScreen />;
      default:
        return homeContent;
    }
  };

  const baseTabs = [
    { name: 'Home', icon: 'house.fill' },
    { name: 'Notification', icon: 'bell.fill' },
    { name: 'Feedback', icon: 'star.fill' },
  ];

  const tabs = user?.role === 'Admin' ? [...baseTabs, { name: 'AuditLog', icon: 'info.circle.fill' }] : baseTabs;

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        {renderContent()}
      </View>
      
      <View style={[styles.tabBar, { 
        backgroundColor: CustomColors[colorScheme ?? 'light'].tabBackground,
      }]}>
        {tabs.map((tab) => (
          <TabButton
            key={tab.name}
            tab={tab}
            isActive={selectedTab === tab.name}
            onPress={() => setSelectedTab(tab.name)}
            unreadCount={unreadCount}
          />
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
    paddingBottom: Platform.OS === 'ios' ? 25 : 15,
    paddingTop: 8,
    paddingHorizontal: 10,
    borderTopWidth: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 16,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  tabButtonActive: {
    backgroundColor: '#e11b23',
    shadowColor: '#e11b23',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  tabIconWrapper: {
    position: 'relative',
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  notificationBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#e11b23',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  notificationBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  notificationsContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 4,
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(225, 27, 35, 0.1)',
    borderRadius: 8,
  },
  markAllText: {
    color: '#e11b23',
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  notificationItem: {
    backgroundColor: 'rgba(118, 118, 128, 0.12)',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#e11b23',
  },
  unreadNotification: {
    backgroundColor: 'rgba(225, 27, 35, 0.05)',
    borderLeftWidth: 4,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  notificationIconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
    opacity: 0.8,
  },
  notificationDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  unreadBadge: {
    paddingLeft: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notificationActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  markReadButton: {
    backgroundColor: '#34C759',
  },
  deleteButton: {
    backgroundColor: '#e11b23',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
  },
  errorContainer: {
    alignItems: 'center',
    gap: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorText: {
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#e11b23',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyStateText: {
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 20,
  },
  feedbackContainer: {
    flex: 1,
    padding: 20,
  },
  feedbackHeader: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  feedbackTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  feedbackSubtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  feedbackContent: {
    gap: 12,
  },
  feedbackOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(118, 118, 128, 0.12)',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  feedbackOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(225, 27, 35, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackOptionText: {
    flex: 1,
  },
  feedbackOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  feedbackOptionDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  feedbackItem: {
    backgroundColor: 'rgba(118, 118, 128, 0.12)',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  feedbackItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  feedbackTestName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  feedbackStudentName: {
    fontSize: 14,
    opacity: 0.7,
  },
  feedbackTeacherName: {
    fontSize: 14,
    opacity: 0.7,
  },
  feedbackDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  feedbackMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  teacherReply: {
    backgroundColor: 'rgba(225, 27, 35, 0.05)',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#e11b23',
  },
  replyLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#e11b23',
    marginBottom: 4,
  },
  replyMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e11b23',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 6,
  },
  replyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  replyModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  replyModalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  replyModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  replyModalSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
  },
  replyInput: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  replyModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f2f2f7',
  },
  cancelButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#e11b23',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  auditLogContainer: {
    flex: 1,
    padding: 20,
  },
  auditLogHeader: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  auditLogTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  auditLogSubtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  auditLogItem: {
    backgroundColor: 'rgba(118, 118, 128, 0.12)',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  auditLogItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  auditLogAction: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  auditLogDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  auditLogUser: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 8,
  },
  auditLogDetails: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  auditLogIP: {
    fontSize: 12,
    opacity: 0.6,
  },
});
