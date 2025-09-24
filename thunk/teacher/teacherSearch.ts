// thunk/teacher/teacherSearch.ts
import { Teacher_URL } from '@/utils/baseUrl';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface TeacherSearch {
  teacher_id: number;
  name: string;
  mobile_number: string;
  email: string;
}

interface TeacherState {
  teachers: TeacherSearch[];
  loading: boolean;
  error: string | null;
}

const initialState: TeacherState = {
  teachers: [],
  loading: false,
  error: null,
};

export const fetchTeacherBySearch = createAsyncThunk<
  TeacherSearch[], 
  string,      
  { rejectValue: string }
>(
  'teacher/fetchTeacherBySearch',
  async (name, { rejectWithValue }) => {
    try {
      const savedToken = await AsyncStorage.getItem("token");
      if (!savedToken) {
        return rejectWithValue("No authentication token found");
      }

      const response = await axios.post(
        `${Teacher_URL}/searchteacher`,
        { name },
        {
          headers: {
            Authorization: `Bearer ${savedToken}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      return response.data.data as TeacherSearch[];
    } catch (error: any) {
      if (error.response) {
        return rejectWithValue(
          error.response.data.message || 'Failed to fetch teachers'
        );
      } else if (error.request) {
        return rejectWithValue('Network error - please check your connection');
      } else {
        return rejectWithValue('Something went wrong');
      }
    }
  }
);

const teacherSearchSlice = createSlice({
  name: 'teacherSearch',
  initialState,
  reducers: {
    clearTeachers: (state) => {
      state.teachers = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeacherBySearch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeacherBySearch.fulfilled, (state, action: PayloadAction<TeacherSearch[]>) => {
        state.loading = false;
        state.teachers = action.payload;
      })
      .addCase(fetchTeacherBySearch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch teachers';
      });
  },
});

export const { clearTeachers } = teacherSearchSlice.actions;
export default teacherSearchSlice.reducer;
