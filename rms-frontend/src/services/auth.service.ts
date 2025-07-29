import axios from '@/lib/axios';

export interface User {
  id: string;
  _id?: string; // Backend returns _id
  name: string;
  email: string;
  role: 'engineer' | 'manager';
}

export const getProfile = async (): Promise<User> => {
  const response = await axios.get('/auth/profile');
  return response.data;
};

export const login = async (email: string, password: string): Promise<{ token: string; role: string }> => {
  const response = await axios.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (name: string, email: string, password: string, role: 'engineer' | 'manager'): Promise<{ token: string; user: User }> => {
  const response = await axios.post('/auth/register', { name, email, password, role });
  return response.data;
}; 