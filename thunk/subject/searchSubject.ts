export interface Subject {
  subject_id: number;
  class_id: number;
  subject_name: string;
  subject_teacher_id: number | null;
  created_at: string;
  updated_at: string;
  Renamedclass: {
    class_id: number;
    class_name: string;
    description: string;
  };
  test: any[];
}

export interface SearchSubjectRequest {
  name: string;
}

export interface SearchSubjectResponse {
  success: boolean;
  data: Subject[];
  count: number;
}

export interface SearchSubjectState {
  subjects: Subject[];
  loading: boolean;
  error: string | null;
  count: number;
}




import { USER_URL } from '@/utils/baseUrl';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';


export const searchSubject = createAsyncThunk<
  SearchSubjectResponse,
  SearchSubjectRequest,
  {
    rejectValue: string;
  }
>(
  'subject/searchSubject',
  async (searchData: SearchSubjectRequest, { rejectWithValue }) => {
    try {
      const savedToken = await AsyncStorage.getItem('userToken');
      
      if (!savedToken) {
        return rejectWithValue('No authentication token found');
      }

      const response = await axios.post(
        `${USER_URL}/searchsubject`,
        { name: searchData.name },
        {
          headers: {
            Authorization: `Bearer ${savedToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      return response.data as SearchSubjectResponse;
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message || 'Failed to search subjects';
        return rejectWithValue(message);
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

const initialState: SearchSubjectState = {
  subjects: [],
  loading: false,
  error: null,
  count: 0,
};

const subjectSlice = createSlice({
  name: 'subject',
  initialState,
  reducers: {
    clearSubjects: (state) => {
      state.subjects = [];
      state.count = 0;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchSubject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchSubject.fulfilled, (state, action: PayloadAction<SearchSubjectResponse>) => {
        state.loading = false;
        state.subjects = action.payload.data;
        state.count = action.payload.count;
        state.error = null;
      })
      .addCase(searchSubject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to search subjects';
        state.subjects = [];
        state.count = 0;
      });
  },
});

export const { clearSubjects, clearError } = subjectSlice.actions;
export default subjectSlice.reducer;
