import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export interface ClassDetails {
  class_id: number;
  class_name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeacherDetails {
  teacher_id: number;
  name: string;
  email: string;
  mobile_number: string;
  profile_picture: string | null;
  assigned_subjects: unknown | null;
  class_assignments: unknown | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Section {
  section_id: number;
  section_name: string;
  class_id: number;
  class_teacher_id: number;
  created_at: string;
  updated_at: string;
  class_details: ClassDetails;
  class_teacher_details: TeacherDetails;
}

export interface Student {
  student_id: number;
  name: string;
  email: string;
  mobile_number: string;
  profile_picture: string | null | '';
  roll_number: string;
  dob: string;
  guardian_name: string;
  guardian_mobile_number: string;
  student_mobile_number: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SectionDetailsData {
  section: Section;
  students: Student[];
  section_teachers: unknown[]; // empty array in sample; keep as unknown[]
  total_students: number;
  total_section_teachers: number;
}

export interface APIResponse {
  success: boolean;
  message: string;
  data: SectionDetailsData;
}


export const fetchSectionDetails = createAsyncThunk<
  APIResponse,
  number,
  { rejectValue: string }
>('section/fetchSectionDetails', async (sectionId, { rejectWithValue }) => {
  try {
    const res = await axios.post<APIResponse>("https://serversql-brown.vercel.app/api/user/getsectiondetails", { sectionId });
    if (!res.data?.success) {
      return rejectWithValue(res.data?.message || 'Failed to fetch section details');
    }
    console.log(sectionId,"df")
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      return rejectWithValue(
        (err.response?.data as any)?.message ?? err.message ?? 'Request failed'
      );
    }
    return rejectWithValue('Request failed');
  }
});
