import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Badge
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountTree as AccountTreeIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  SwapVert as SwapVertIcon,
  Work as WorkIcon,
  DomainAdd as DomainAddIcon,
  Telegram as TelegramIcon,
  LocationOn as LocationIcon,
  ViewInAr as ViewInArIcon,
  Visibility as VisibilityIcon,
  Storage as StorageIcon
} from '@mui/icons-material';
import './MainLayout.css';

const drawerWidth = 240;

// Пункты основного меню
const menuItems = [
  {
    text: "Дашборд",
    icon: <DashboardIcon />,
    path: "/dashboard",
  },
  {
    text: "Организационная структура",
    icon: <AccountTreeIcon />,
    path: "/organization-structure",
  },
  {
    text: "Визуализация структуры",
    icon: <ViewInArIcon />,
    path: "/organization-visualization",
  },
  {
    text: "Отделы",
    icon: <DomainAddIcon />,
    path: "/divisions",
  },
  {
    text: "Локации",
    icon: <LocationIcon />,
    path: "/organizations",
  },
  {
    text: "Должности",
    icon: <WorkIcon />,
    path: "/positions",
  },
  {
    text: "Сотрудники",
    icon: <PeopleIcon />,
    path: "/staff",
  },
  {
    text: "Функциональные связи",
    icon: <SwapVertIcon />,
    path: "/functional-relations",
  },
  {
    text: "Telegram-бот",
    icon: <TelegramIcon />,
    path: "/telegram-bot",
    badge: 5, // Количество новых запросов, в реальном приложении будет динамически загружаться
  },
];

// Функция для проверки прав суперадмина (временная, позже заменить на реальную проверку)
const isSuperAdmin = () => {
  // В реальном приложении здесь будет проверка из хранилища или из контекста аутентификации
  return true; // Для демонстрации всегда возвращаем true
};

// Пункты нижнего меню
const bottomMenuItems = [
  { name: 'Настройки', path: '/settings', icon: <SettingsIcon /> },
  { name: 'Выход', path: '/logout', icon: <LogoutIcon /> }
];

// Пункты меню администратора (видны только суперадмину)
const adminMenuItems = [
  { name: 'База данных', path: '/admin-database', icon: <StorageIcon />, requireSuperAdmin: true }
];

interface MenuListItemsProps {
  onItemClick: (path: string) => void;
}

const MenuListItems: React.FC<MenuListItemsProps> = ({ onItemClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <List>
      {menuItems.map((item) => (
        <ListItem 
          key={item.path} 
          disablePadding
          sx={{ display: 'block' }}
          onClick={() => {
            navigate(item.path);
            if (onItemClick) onItemClick(item.path);
          }}
        >
          <ListItemButton
            selected={location.pathname === item.path}
            sx={{
              minHeight: 48,
              justifyContent: 'initial',
              px: 2.5,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: 2,
                justifyContent: 'center',
              }}
            >
              {item.badge ? (
                <Badge badgeContent={item.badge} color="error">
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

const MainLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const handleMenuClick = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };
  
  // Определение активного пункта меню
  const isActiveItem = (path: string) => {
    return location.pathname === path;
  };
  
  // Содержимое бокового меню
  const drawer = (
    <div>
      <Toolbar className="drawer-header">
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <Avatar 
            src="/images/ofs_logo.png" 
            alt="OFS Global" 
            className="drawer-logo"
            sx={{ 
              width: 80, 
              height: 80,
              marginBottom: 1,
              backgroundColor: 'transparent'
            }} 
          />
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
            OFS Global
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <MenuListItems onItemClick={handleMenuClick} />
      <Divider />
      {/* Меню администратора (только для суперадмина) */}
      {isSuperAdmin() && (
        <>
          <List>
            {adminMenuItems.map((item) => (
              <ListItem key={item.name} disablePadding>
                <ListItemButton 
                  onClick={() => handleMenuClick(item.path)}
                  selected={location.pathname === item.path}
                  sx={{
                    backgroundColor: location.pathname === item.path ? '#f0f4f9' : 'transparent',
                    '&:hover': {
                      backgroundColor: '#e3f2fd',
                    },
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText 
                    primary={item.name} 
                    sx={{ 
                      color: '#d32f2f',
                      fontWeight: 'bold'
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
        </>
      )}
      <List className="bottom-menu">
        {bottomMenuItems.map((item) => (
          <ListItem key={item.name} disablePadding>
            <ListItemButton onClick={() => handleMenuClick(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );
  
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      {/* Брендовая полоса вверху сайта */}
      <Box className="brand-header"></Box>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          borderBottom: '1px solid rgba(0,0,0,0.12)',
          boxShadow: 'none',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <Avatar 
              src="/images/ofs_logo.png" 
              alt="OFS Global"
              sx={{ 
                width: 48, 
                height: 48, 
                marginRight: 2,
                backgroundColor: 'transparent' 
              }}
            />
          </Box>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            {/* Заголовок текущей страницы */}
            {menuItems.find(item => isActiveItem(item.path))?.text || 'OFS Global'}
          </Typography>
          <Button color="inherit">
            Профиль
          </Button>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        {/* Мобильная версия ящика */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Лучшая производительность на мобильных устройствах
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        {/* Постоянная версия ящика */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 0, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'fixed',
            bottom: 20,
            right: 20,
            width: 180,
            height: 180,
            backgroundImage: 'url("/images/ofs_logo.png")',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            opacity: 0.05,
            pointerEvents: 'none',
            zIndex: 0
          }
        }}
      >
        <Toolbar />
        {/* Содержимое страницы будет отображаться здесь через Outlet */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout; 