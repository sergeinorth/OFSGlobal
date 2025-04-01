import axios from 'axios';
import { API_URL } from '../config';

// Создаем инстанс axios с базовыми настройками
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  // Отключаем для тестирования
  withCredentials: false
});

// Перехватчик для обработки ошибок
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // Ошибка от сервера
      console.error('API Error:', error.response.data);
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // Ошибка сети
      console.error('Network Error:', error.request);
      return Promise.reject(new Error('Ошибка сети. Проверьте подключение.'));
    } else {
      // Другие ошибки
      console.error('Error:', error.message);
      return Promise.reject(error);
    }
  }
);

// Настройка токена авторизации если есть
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api; 