import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    console.log(`[LOG:ProtectedRoute] Текущий путь: ${window.location.pathname}`);
    console.log(`[LOG:ProtectedRoute] Статус аутентификации: ${isAuthenticated}`);
    const token = localStorage.getItem('token');
    console.log(`[LOG:ProtectedRoute] Токен в localStorage: ${token ? 'присутствует' : 'отсутствует'}`);
    if (token) {
      console.log(`[LOG:ProtectedRoute] Начало токена: ${token.substring(0, 15)}...`);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    console.log('[LOG:ProtectedRoute] Пользователь не аутентифицирован, перенаправление на /login');
    return <Navigate to="/login" replace />;
  }

  console.log('[LOG:ProtectedRoute] Пользователь аутентифицирован, отображаем защищенный контент');
  return <>{children}</>;
};

export default ProtectedRoute; 