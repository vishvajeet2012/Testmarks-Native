import { USER_URL } from '@/utils/baseUrl';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export interface AuditLog {
  log_id: number;
  user_name: string;
  user_role: string;
  action: string;
  entity_type: string;
  entity_id: number;
  remarks: string;
  timestamp: string;
}

export const getAuditLogs = createAsyncThunk(
  'auditLog/getAuditLogs',
  async (_, { rejectWithValue }) => {
    try {
      const savedToken = await AsyncStorage.getItem('token');
      if (!savedToken) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${USER_URL}/auditlogs`, {
        headers: {
          Authorization: `Bearer ${savedToken}`,
        },
      });

      if (response.data && response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue(response.data?.error || 'Failed to fetch audit logs');
      }
    } catch (error: any) {
      if (error.response?.data?.error) {
        return rejectWithValue(error.response.data.error);
      }
      if (error.response?.data?.message) {
        return rejectWithValue(error.response.data.message);
      }
      return rejectWithValue(error.message || 'An error occurred while fetching audit logs');
    }
  }
);
