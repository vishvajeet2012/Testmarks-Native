import { USER_URL } from '@/utils/baseUrl';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

interface ApproveMarksRequest {
  marks_id: number;
}

interface RejectMarksRequest {
  marks_id: number;
  reason?: string;
}

interface BulkApproveMarksRequest {
  marks_ids: number[];
}

interface MarksFilters {
  test_id?: string;
  status?: string;
  class_id?: string;
  section_id?: string;
  page?: number;
  limit?: number;
}

interface MarksData {
  marks_id: number;
  test_name: string;
  subject_name: string;
  class_name: string;
  section_name: string;
  student_name: string;
  student_email: string;
  marks_obtained: number;
  max_marks: number;
  percentage: string;
  status: string;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T> {
  message: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  approved_count?: number;
}

// Approve marks
export const approveMarks = async (data: ApproveMarksRequest): Promise<ApiResponse<any>> => {
  try {
    const savedToken = await AsyncStorage.getItem("token");
    if (!savedToken) {
      throw new Error("No authentication token found");
    }

    const response = await axios.post(
      `${USER_URL}/approveMarks`,
      data,
      {
        headers: {
          Authorization: `Bearer ${savedToken}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.error || 'Failed to approve marks');
    } else if (error.request) {
      throw new Error('Network error - please check your connection');
    } else {
      throw new Error('Something went wrong');
    }
  }
};

// Reject marks
export const rejectMarks = async (data: RejectMarksRequest): Promise<ApiResponse<any>> => {
  try {
    const savedToken = await AsyncStorage.getItem("token");
    if (!savedToken) {
      throw new Error("No authentication token found");
    }

    const response = await axios.post(
      `${USER_URL}/rejectMarks`,
      data,
      {
        headers: {
          Authorization: `Bearer ${savedToken}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.error || 'Failed to reject marks');
    } else if (error.request) {
      throw new Error('Network error - please check your connection');
    } else {
      throw new Error('Something went wrong');
    }
  }
};

// Get all marks (admin view)
export const getAllMarks = async (filters: MarksFilters = {}): Promise<ApiResponse<MarksData[]>> => {
  try {
    const savedToken = await AsyncStorage.getItem("token");
    if (!savedToken) {
      throw new Error("No authentication token found");
    }

    const queryParams = new URLSearchParams();
    if (filters.test_id) queryParams.append('test_id', filters.test_id);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.class_id) queryParams.append('class_id', filters.class_id);
    if (filters.section_id) queryParams.append('section_id', filters.section_id);
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());

    const url = `${USER_URL}/getAllMarks${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${savedToken}`,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });

    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.error || 'Failed to fetch marks');
    } else if (error.request) {
      throw new Error('Network error - please check your connection');
    } else {
      throw new Error('Something went wrong');
    }
  }
};

// Get pending marks for approval
export const getPendingMarks = async (params: { page?: number; limit?: number } = {}): Promise<ApiResponse<MarksData[]>> => {
  try {
    const savedToken = await AsyncStorage.getItem("token");
    if (!savedToken) {
      throw new Error("No authentication token found");
    }

    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const url = `${USER_URL}/getPendingMarks${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${savedToken}`,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });

    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.error || 'Failed to fetch pending marks');
    } else if (error.request) {
      throw new Error('Network error - please check your connection');
    } else {
      throw new Error('Something went wrong');
    }
  }
};

// Bulk approve marks
export const bulkApproveMarks = async (data: BulkApproveMarksRequest): Promise<ApiResponse<any>> => {
  try {
    const savedToken = await AsyncStorage.getItem("token");
    if (!savedToken) {
      throw new Error("No authentication token found");
    }

    const response = await axios.post(
      `${USER_URL}/bulkApproveMarks`,
      data,
      {
        headers: {
          Authorization: `Bearer ${savedToken}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.error || 'Failed to bulk approve marks');
    } else if (error.request) {
      throw new Error('Network error - please check your connection');
    } else {
      throw new Error('Something went wrong');
    }
  }
};
