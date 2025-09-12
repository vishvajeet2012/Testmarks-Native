import { USER_URL } from '@/utils/baseUrl';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

interface ClassState {
    loading: boolean;
    classData: any | null;
    sectionData: any | null;
    error: string | null;
    successMessage: string | null;
}

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

const initialState: ClassState = {
    loading: false,
    classData: null,
    sectionData: null,
    error: null,
    successMessage: null,
};

const classSlice = createSlice({
    name: 'class',
    initialState,
    reducers: {
        clearState: (state) => {
            state.loading = false;
            state.classData = null;
            state.sectionData = null;
            state.error = null;
            state.successMessage = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createClass.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(createClass.fulfilled, (state, action) => {
                state.loading = false;
                state.classData = action.payload.data.class;
                state.sectionData = action.payload.data.section;
                state.successMessage = action.payload.message;
                state.error = null;
            })
            .addCase(createClass.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || 'Failed to create class';
                state.successMessage = null;
            });
    },
});

export const { clearState } = classSlice.actions;
export default classSlice.reducer;
