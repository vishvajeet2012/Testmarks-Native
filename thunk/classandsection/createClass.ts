import { USER_URL } from '@/utils/baseUrl';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';


export const createClass = createAsyncThunk(
    'class/createClass',
    async (classData: any, { rejectWithValue }) => {
        try {
            const savedToken = await AsyncStorage.getItem('token');
            if (!savedToken) {
                return rejectWithValue('No authentication token found');
            }

            const response = await axios.post(`${USER_URL}/createclass`, classData, {
                headers: {
                    Authorization: `Bearer ${savedToken}`,
                    'Content-Type': 'application/json',
                },
            });
            
            return response.data;
        } catch (error: any) {
            if (axios.isAxiosError(error) && error.response?.data) {
                return rejectWithValue(error.response.data.error || 'Error creating class');
            } else if (error instanceof Error) {
                return rejectWithValue(error.message);
            } else {
                return rejectWithValue('Unknown error occurred');
            }
        }
    }
);
