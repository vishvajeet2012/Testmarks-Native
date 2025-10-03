import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { deleteNotification, fetchNotifications, markAllNotificationsRead, markNotificationRead } from '../../thunk/NotificationService/notifcationThunk';

export interface Notification {
  notification_id: number;
  user_id: number;
  message: string;
  is_read: boolean;
  created_at: string;
  [key: string]: any;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification(state, action: PayloadAction<Notification>) {
      state.notifications.unshift(action.payload);
      state.unreadCount += action.payload.is_read ? 0 : 1;
    },
    markAsRead(state, action: PayloadAction<number>) {
      const notification = state.notifications.find(
        (n) => n.notification_id === action.payload
      );
      if (notification && !notification.is_read) {
        notification.is_read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead(state) {
      state.notifications.forEach((n) => (n.is_read = true));
      state.unreadCount = 0;
    },
    deleteNotificationLocal(state, action: PayloadAction<number>) {
      state.notifications = state.notifications.filter(
        (n) => n.notification_id !== action.payload
      );
      // Recalculate unreadCount
      state.unreadCount = state.notifications.filter((n) => !n.is_read).length;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unread_count;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(
          (n) => n.notification_id === action.payload.notification_id
        );
        if (notification && !notification.is_read) {
          notification.is_read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.notifications.forEach((n) => (n.is_read = true));
        state.unreadCount = 0;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.notifications = state.notifications.filter(
          (n) => n.notification_id !== action.payload.notification_id
        );
        state.unreadCount = state.notifications.filter((n) => !n.is_read).length;
      });
  },
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  deleteNotificationLocal,
} = notificationSlice.actions;

export default notificationSlice.reducer;
