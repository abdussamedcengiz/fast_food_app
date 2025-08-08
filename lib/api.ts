import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

export const getCategories = async () => {
  const response = await axios.get(`${API_URL}/categories`);
  console.log('Kategoriler:', response.data);
  return response.data;
};

export const getCustomizations = async () => {
  const response = await axios.get(`${API_URL}/customizations`);
  console.log('Customizations:', response.data);
  return response.data;
};

export const getMenuItems = async () => {
  const response = await axios.get(`${API_URL}/menu-items`);
  console.log('MenuItems:', response.data);
  return response.data;
};

export const getAllMenuItems = async () => {
  const response = await axios.get(`${API_URL}/menu-items`);
  return response.data;
};

export const searchMenuItems = async (query: string) => {
  const response = await axios.get(`${API_URL}/menu-items`, { params: { search: query } });
  console.log('Arama Sonucu:', response.data);
  return response.data;
};

export const signUp = async (name: string, email: string, password: string) => {
  const response = await axios.post('http://127.0.0.1:8000/register', {
    name,
    email,
    password,
    password_confirmation: password,
  });
  return response.data;
};

export const signIn = async (email: string, password: string) => {
  const response = await axios.post('http://127.0.0.1:8000/login', {
    email,
    password,
  });
  return response.data;
};
