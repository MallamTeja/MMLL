import axios from 'axios';

const API_URL = 'http://localhost:8001/api/auth';

type LoginResponse = {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
};

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  // In a real app, this would be an API call to your backend
  // For demo purposes, we'll return mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        token: 'mock-jwt-token',
        user: {
          id: '1',
          email,
          role: 'admin',
          name: 'Admin User',
        },
      });
    }, 1000);
  });
};

export const logout = async (): Promise<void> => {
  // In a real app, this would invalidate the token on the server
  return Promise.resolve();
};

export const getCurrentUser = async (): Promise<any> => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const response = await axios.get(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return null;
  }
};
