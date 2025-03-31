import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
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
import OrganizationVisualizationPage from './pages/OrganizationVisualizationPage';
import TelegramBotPage from './pages/TelegramBotPage';
import AdminDatabasePage from './pages/AdminDatabasePage';

// Placeholder компоненты для других страниц
function Reports() { return <div>Reports Page</div>; }
function Profile() { return <div>Profile Page</div>; }
function Settings() { return <div>Settings Page</div>; }
function NotFound() { return <div>404 - Страница не найдена</div>; }

// Определение темы для MaterialUI
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    success: {
      main: '#2e7d32',
    },
    warning: {
      main: '#ed6c02',
    },
    error: {
      main: '#d32f2f',
    },
    info: {
      main: '#0288d1',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage: 'url("/images/ofs_logo.png")',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right bottom',
          backgroundSize: '200px',
          backgroundAttachment: 'fixed',
          backgroundBlendMode: 'soft-light',
          backgroundOpacity: 0.2,
        },
      },
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/organization-structure" element={<OrganizationStructurePage />} />
            <Route path="/organization-visualization" element={<OrganizationVisualizationPage />} />
            <Route path="/functional-relations" element={<FunctionalRelationsPage />} />
            <Route path="/telegram-bot" element={<TelegramBotPage />} />
            <Route path="/admin-database" element={<AdminDatabasePage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/staff" element={<StaffList />} />
            <Route path="/staff/new" element={<StaffForm />} />
            <Route path="/staff/:id" element={<StaffForm />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/divisions" element={<DivisionsPage />} />
            <Route path="/positions" element={<PositionsPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="/landing" element={<LandingPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App; 