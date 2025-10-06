import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { Notification_URL, Serverurl } from '../../utils/baseUrl';

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
    await axios.post(`${Notification_URL}/notification_id/read`, { notification_id }, config);
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
    const response = await axios.post(`${Notification_URL}/notification_id`, { notification_id }, config);
    return { notification_id };
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

// Socket.io client setup - FIXED FOR RENDER.COM HTTPS
let socket: Socket | null = null;

export const initializeSocket = async (dispatch: any) => {
  try {
    // Prevent multiple connections
    if (socket?.connected) {
      console.log('Socket already connected');
      return socket;
    }

    // Get token
    const token = await AsyncStorage.getItem('token');
    
    if (!token) {
      console.log('No token available, skipping socket connection');
      return null;
    }

    console.log('Initializing socket connection to:', Serverurl);

    // Disconnect existing socket if any
    if (socket) {
      socket.disconnect();
      socket = null;
    }

    // Create new socket connection - CRITICAL FIX FOR RENDER
    socket = io(Serverurl, {
      // Key changes for Render.com HTTPS/WSS
      transports: ['websocket', 'polling'], // Allow fallback to polling
      secure: true, // Force secure connection (wss://)
      rejectUnauthorized: false, // Allow self-signed certs (remove in production if using valid SSL)
      
      // Reconnection settings
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10, // Increased for production
      
      // Authentication
      auth: {
        token: token,
      },
      
      // Timeout settings
      timeout: 20000,
    });

    // Connection success
    socket.on('connect', () => {
      console.log('✅ Socket connected successfully:', socket?.id);
      console.log('Transport used:', socket?.io?.engine?.transport?.name);
    });

    // New notification received
    socket.on('new_notification', (notification: Notification) => {
      console.log('📬 New notification received:', notification);
      dispatch({ type: 'notifications/addNotification', payload: notification });
    });

    // Notification marked as read
    socket.on('notification_marked_read', (data: { notification_id: number }) => {
      console.log('✓ Notification marked as read:', data.notification_id);
    });

    // Connection error
    socket.on('connect_error', async (err: any) => {
      console.error('❌ Socket connection error:', err.message);
      console.error('Error details:', {
        message: err.message,
        description: err.description,
        type: err.type,
      });
      
      // Try to refresh token if auth error
      if (err.message.includes('Authentication') || err.message.includes('auth')) {
        console.log('Attempting to refresh token...');
        const newToken = await AsyncStorage.getItem('token');
        if (newToken && socket) {
          socket.auth = { token: newToken };
          socket.connect();
        }
      }
    });

    // Disconnection
    socket.on('disconnect', (reason: string) => {
      console.log('🔌 Socket disconnected:', reason);
      
      // Auto-reconnect on unexpected disconnect
      if (reason === 'io server disconnect') {
        console.log('Server disconnected, attempting to reconnect...');
        socket?.connect();
      }
    });

    // Reconnection attempt
    socket.on('reconnect_attempt', (attemptNumber: number) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}...`);
    });

    // Reconnection success
    socket.on('reconnect', (attemptNumber: number) => {
      console.log(`✅ Reconnected after ${attemptNumber} attempts`);
    });

    // Reconnection failed
    socket.on('reconnect_failed', () => {
      console.error('❌ Reconnection failed after all attempts');
    });

    return socket;
  } catch (error) {
    console.error('Socket initialization error:', error);
    return null;
  }
};

export const disconnectSocket = () => {
  if (socket) {
    console.log('Disconnecting socket...');
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
