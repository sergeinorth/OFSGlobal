import React from 'react';
import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import './styles/App.css';

import MainLayout from './components/layout/MainLayout';
import LandingPage from './pages/LandingPage';
import OrganizationStructurePage from './pages/OrganizationStructurePage';
import FunctionalRelationsPage from './pages/FunctionalRelationsPage';
import DivisionsPage from './pages/divisions/DivisionsPage';
import PositionsPage from './pages/positions/PositionsPage';
import StaffList from './components/staff/StaffList';
import StaffForm from './components/staff/StaffForm';

// Новые страницы для новой структуры ОФС
import DashboardPage from './pages/DashboardPage';
import TelegramBotPage from './pages/TelegramBotPage';
import AdminDatabasePage from './pages/AdminDatabasePage';
import NotFoundPage from './pages/NotFoundPage';

// Новые страницы администрирования с использованием роутера
import AdminOrganizationsPage from './pages/AdminOrganizationsPage';
import AdminStaffPage from './pages/AdminStaffPage';
import AdminDivisionsPage from './pages/AdminDivisionsPage';
import AdminPositionsPage from './pages/AdminPositionsPage';
import AdminFunctionalRelationsPage from './pages/AdminFunctionalRelationsPage';

// Placeholder компоненты для других страниц
function Reports() { return <div>Reports Page</div>; }
function Profile() { return <div>Profile Page</div>; }
function Settings() { return <div>Settings Page</div>; }

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="telegram-bot" element={<TelegramBotPage />} />
          <Route path="organization-structure">
            <Route index element={<Navigate to="/organization-structure/business" replace />} />
            <Route path="business" element={<OrganizationStructurePage />} />
            <Route path="legal" element={<OrganizationStructurePage />} />
            <Route path="territorial" element={<OrganizationStructurePage />} />
          </Route>
          <Route path="functional-relations" element={<FunctionalRelationsPage />} />
          
          {/* Новая структура роутов для администрирования */}
          <Route path="admin">
            {/* Редирект с корневого пути admin на страницу организаций */}
            <Route index element={<Navigate to="/admin/organizations" replace />} />
            <Route path="organizations" element={<AdminOrganizationsPage />} />
            <Route path="divisions" element={<AdminDivisionsPage />} />
            <Route path="positions" element={<AdminPositionsPage />} />
            <Route path="staff" element={<AdminStaffPage />} />
            <Route path="functional-relations" element={<AdminFunctionalRelationsPage />} />
          </Route>
          
          {/* Старый роут - оставляем для обратной совместимости, но редиректим на новую страницу */}
          <Route path="admin-database" element={<Navigate to="/admin/organizations" replace />} />
          
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="staff">
            <Route index element={<StaffList />} />
            <Route path="new" element={<StaffForm />} />
            <Route path=":id" element={<StaffForm />} />
            <Route path="profiles" element={<StaffList />} />
            <Route path="competencies" element={<div>Компетенции сотрудников</div>} />
            <Route path="training" element={<div>Обучение сотрудников</div>} />
            <Route path="achievements" element={<div>Достижения сотрудников</div>} />
          </Route>
          <Route path="reports" element={<Reports />} />
          <Route path="divisions" element={<DivisionsPage />} />
          <Route path="positions" element={<PositionsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="/landing" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App; 