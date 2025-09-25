import { USER_URL } from '@/utils/baseUrl';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// ================== Types ==================
export interface CreateClassPayload {
  section_id: number;
  teacher_id: number;
  subject_ids: number[];
}

export interface CreateClassResponse {
  success: boolean;
  message: string;
  data: {
    assignment: {
      id: number;
      section_id: number;
      teacher_id: number;
      created_at: string;
    };
    section: {
      section_name: string;
      class_name: string;
      class_id: number;
    };
    teacher: {
      name: string;
      email: string;
    };
    assigned_subjects: any[];
    class_assignment: any;
  };
}

interface ClassState {
  loading: boolean;
  error: string | null;
  createdClass: CreateClassResponse['data'] | null;
  message: string | null;
}

// ================== Initial State ==================
const initialState: ClassState = {
  loading: false,
  error: null,
  createdClass: null,
  message: null,
};

// ================== Thunk ==================
export const createClass = createAsyncThunk<
  CreateClassResponse,      // return type
  CreateClassPayload,       // argument type
  { rejectValue: string }   // reject value type
>(
  'class/createClass',
  async (classData, { rejectWithValue }) => {
    try {
      const savedToken = await AsyncStorage.getItem('token');
      if (!savedToken) {
        return rejectWithValue('No authentication token found');
      }

      console.log(classData,"vishu")
      const response = await axios.post<CreateClassResponse>(
        `${USER_URL}/addsectionteacher`,
        classData,
        {
          headers: {
            Authorization: `Bearer ${savedToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.data) {
        return rejectWithValue(
          error.response.data.error || 'Error creating class'
        );
      } else if (error instanceof Error) {
        return rejectWithValue(error.message);
      } else {
        return rejectWithValue('Unknown error occurred');
      }
    }
  }
);

// ================== Slice ==================
const classSlice = createSlice({
  name: 'class',
  initialState,
  reducers: {
    resetClassState: (state) => {
      state.loading = false;
      state.error = null;
      state.createdClass = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createClass.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(
        createClass.fulfilled,
        (state, action: PayloadAction<CreateClassResponse>) => {
          state.loading = false;
          state.createdClass = action.payload.data;
          state.message = action.payload.message;
        }
      )
      .addCase(createClass.rejected, (state, action) => {
        state.loading = false;
        // ✅ FIX: tell TS that action.payload is string | undefined
        state.error = (action.payload as string) || 'Failed to create class';
      });
  },
});

export const { resetClassState } = classSlice.actions;
export default classSlice.reducer;
