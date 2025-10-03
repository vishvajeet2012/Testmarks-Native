import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import io from 'socket.io-client';
import { Notification_URL } from '../../utils/baseUrl';

export interface Notification {
  notification_id: number;
  user_id: number;
  message: string;
  is_read: boolean;
  created_at: string;
  [key: string]: any;
}

export const fetchNotifications = createAsyncThunk<
  { notifications: Notification[]; unread_count: number },
  { unread_only?: boolean } | undefined
>('notifications/fetchNotifications', async (params, { rejectWithValue }) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const config = {
      headers: { Authorization: `Bearer ${token}` },
      params: params?.unread_only ? { unread_only: params.unread_only.toString() } : {},
    };
    const response = await axios.get(`${Notification_URL}/getallnotification`, config);
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const markNotificationRead = createAsyncThunk<
  { notification_id: number },
  number
>('notifications/markNotificationRead', async (notification_id, { rejectWithValue }) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    await axios.put(`${Notification_URL}/${notification_id}/read`, {}, config);
    return { notification_id };
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

export const markAllNotificationsRead = createAsyncThunk<void, void>(
  'notifications/markAllNotificationsRead',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      await axios.put(`${Notification_URL}/read-all`, {}, config);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const deleteNotification = createAsyncThunk<
  { notification_id: number },
  number
>('notifications/deleteNotification', async (notification_id, { rejectWithValue }) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    await axios.delete(`${Notification_URL}/${notification_id}`, config);
    return { notification_id };
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

// Socket.io client setup and event handling
let socket: any = null;

export const initializeSocket = async (dispatch: any) => {
  if (socket) return; // already initialized

  const token = await AsyncStorage.getItem('token');

  socket = io("https://serversql-brown.vercel.app", {
    transports: ['websocket'],
    auth: { token },
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });

  socket.on('new_notification', (notification: Notification) => {
    dispatch({ type: 'notifications/addNotification', payload: notification });
  });

  socket.on('connect_error', (err: any) => {
    console.error('Socket error:', err);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
