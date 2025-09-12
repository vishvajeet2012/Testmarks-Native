import { USER_URL } from "@/utils/baseUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError } from "axios";
import { useState } from "react";

interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  postData: (payload: any) => Promise<void>;
}

export const useAddUserByAdmin = <T = any>(): ApiResponse<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const postData = async (payload: any) => {
    setLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem("token");

      const response = await axios.post(
        `${USER_URL}/addUserByAdmin`,
        payload,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
        }
      );

      setData(response.data);
    } catch (err) {
      const axiosError = err as AxiosError;
      setError(
        (axiosError.response?.data as string) || axiosError.message
      );
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, postData };
};
