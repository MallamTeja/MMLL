import { useState, useCallback } from 'react';
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

interface UseApiReturn<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  fetchData: <T = any>(
    url: string, 
    method?: 'get' | 'post' | 'put' | 'delete',
    data?: any,
    config?: AxiosRequestConfig
  ) => Promise<ApiResponse<T> | null>;
  clearError: () => void;
}

const useApi = <T,>(): UseApiReturn<T> => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(
    async <T = any>(
      url: string,
      method: 'get' | 'post' | 'put' | 'delete' = 'get',
      data?: any,
      config?: AxiosRequestConfig
    ): Promise<ApiResponse<T> | null> => {
      setLoading(true);
      setError(null);
      
      try {
        const response: AxiosResponse<T> = await axios({
          method,
          url,
          data,
          ...config
        });
        
        const result: ApiResponse<T> = {
          data: response.data,
          status: response.status,
          statusText: response.statusText
        };
        
        setData(result as any);
        return result;
      } catch (err) {
        const error = err as AxiosError<{ message?: string }>;
        const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { data, error, loading, fetchData, clearError };
};

export default useApi;
