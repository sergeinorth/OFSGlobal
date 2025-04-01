import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Badge,
  Box,
  Tooltip,
  Collapse,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Dashboard as DashboardIcon,
  AccountTree as AccountTreeIcon,
  ViewInAr as ViewInArIcon,
  DomainAdd as DomainAddIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  People as PeopleIcon,
  SwapVert as SwapVertIcon,
  Telegram as TelegramIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Business as BusinessIcon,
  Gavel as GavelIcon,
  Apartment as ApartmentIcon,
  BarChart as BarChartIcon,
  EmojiEvents as EmojiEventsIcon,
  AssignmentInd as AssignmentIndIcon,
  School as SchoolIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';

// Стилизованный ListItemButton в стиле Cryptonite
const NeomorphicButton = styled(ListItemButton)<{ isCollapsed?: boolean }>(({ theme, isCollapsed }) => ({
  padding: theme.spacing(1.5, isCollapsed ? 1 : 2),
  marginBottom: theme.spacing(1.2),
  borderRadius: 12,
  backgroundColor: 'rgba(32, 32, 36, 0.9)',
  transition: 'all 0.25s ease',
  position: 'relative',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
  border: '1px solid rgba(45, 45, 55, 0.9)',
  justifyContent: isCollapsed ? 'center' : 'flex-start',
  '&.Mui-selected': {
    backgroundColor: 'rgba(42, 42, 48, 0.95)',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.4), 0 0 20px rgba(157, 106, 245, 0.3), inset 0 0 8px rgba(157, 106, 245, 0.2)',
    border: '1px solid rgba(157, 106, 245, 0.4)',
    transform: 'translateY(-2px)',
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: '5px',
      background: 'linear-gradient(180deg, #9D6AF5, #b350ff)',
      borderRadius: '3px 0 0 3px',
      boxShadow: '0 0 15px 2px rgba(157, 106, 245, 0.7)',
      animation: 'pulse 2s infinite',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      borderRadius: 12,
      border: '1px solid rgba(157, 106, 245, 0.5)',
      opacity: 0.5,
      pointerEvents: 'none',
    },
  },
  '&:hover': {
    transform: 'translateY(-2px)',
    backgroundColor: 'rgba(38, 38, 44, 0.95)',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4), 0 0 10px rgba(157, 106, 245, 0.2)',
  },
  '@keyframes pulse': {
    '0%': {
      opacity: 0.7,
      boxShadow: '0 0 5px 2px rgba(157, 106, 245, 0.4)',
    },
    '50%': {
      opacity: 1,
      boxShadow: '0 0 15px 2px rgba(157, 106, 245, 0.7)',
    },
    '100%': {
      opacity: 0.7,
      boxShadow: '0 0 5px 2px rgba(157, 106, 245, 0.4)',
    },
  },
}));

const StyledListItemIcon = styled(ListItemIcon)<{ isCollapsed?: boolean }>(({ theme, isCollapsed }) => ({
  minWidth: isCollapsed ? 0 : 40,
  marginRight: isCollapsed ? 0 : undefined,
  '& .MuiSvgIcon-root': {
    fontSize: isCollapsed ? '1.5rem' : '1.3rem',
    color: '#9D6AF5',
    transition: 'all 0.25s ease',
  },
  '.Mui-selected & .MuiSvgIcon-root': {
    filter: 'drop-shadow(0 0 8px rgba(157, 106, 245, 0.7))',
    transform: 'scale(1.2)',
    color: '#b350ff',
  },
}));

const StyledListItemText = styled(ListItemText)(({ theme }) => ({
  '& .MuiListItemText-primary': {
    fontSize: '0.95rem',
    fontWeight: 400,
    color: '#fff',
    opacity: 0.85,
    transition: 'all 0.25s ease',
  },
  '.Mui-selected & .MuiListItemText-primary': {
    fontWeight: 500,
    opacity: 1,
    textShadow: '0 0 8px rgba(157, 106, 245, 0.6)',
  },
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#9D6AF5',
    color: '#fff',
    fontSize: '0.7rem',
    height: 18,
    minWidth: 18,
    boxShadow: '0 0 6px rgba(157, 106, 245, 0.5)',
  },
}));

const SubMenuButton = styled(ListItemButton)<{ isCollapsed?: boolean }>(({ theme, isCollapsed }) => ({
  padding: theme.spacing(1, isCollapsed ? 1 : 2),
  marginBottom: theme.spacing(0.8),
  marginLeft: isCollapsed ? 0 : theme.spacing(2),
  borderRadius: 8,
  backgroundColor: 'rgba(32, 32, 36, 0.7)',
  transition: 'all 0.25s ease',
  position: 'relative',
  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
  border: '1px solid rgba(45, 45, 55, 0.8)',
  justifyContent: isCollapsed ? 'center' : 'flex-start',
  '&.Mui-selected': {
    backgroundColor: 'rgba(42, 42, 48, 0.85)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3), 0 0 15px rgba(157, 106, 245, 0.2), inset 0 0 5px rgba(157, 106, 245, 0.1)',
    border: '1px solid rgba(157, 106, 245, 0.3)',
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: '3px',
      background: 'linear-gradient(180deg, #9D6AF5, #b350ff)',
      borderRadius: '3px 0 0 3px',
      boxShadow: '0 0 10px 1px rgba(157, 106, 245, 0.5)',
    },
  },
  '&:hover': {
    transform: 'translateY(-1px)',
    backgroundColor: 'rgba(38, 38, 44, 0.85)',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3), 0 0 8px rgba(157, 106, 245, 0.15)',
  },
}));

const StyledExpandIcon = styled(Box)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  color: 'rgba(255, 255, 255, 0.7)',
  transition: 'all 0.3s ease',
  '& .MuiSvgIcon-root': {
    fontSize: '1.2rem',
  },
  '.Mui-selected &': {
    color: '#9D6AF5',
    transform: 'scale(1.1)',
  },
}));

// Обновленные данные меню с подпунктами
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
    subMenu: [
      {
        text: "Бизнес-структура",
        icon: <BusinessIcon />,
        path: "/organization-structure/business",
      },
      {
        text: "Юридическая структура",
        icon: <GavelIcon />,
        path: "/organization-structure/legal",
      },
      {
        text: "Территориальная структура",
        icon: <ApartmentIcon />,
        path: "/organization-structure/territorial",
      },
    ],
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
    subMenu: [
      {
        text: "Профили",
        icon: <AssignmentIndIcon />,
        path: "/staff/profiles",
      },
      {
        text: "Компетенции",
        icon: <BarChartIcon />,
        path: "/staff/competencies",
      },
      {
        text: "Обучение",
        icon: <SchoolIcon />,
        path: "/staff/training",
      },
      {
        text: "Достижения",
        icon: <EmojiEventsIcon />,
        path: "/staff/achievements",
      },
    ],
  },
  {
    text: "Функциональные связи",
    icon: <SwapVertIcon />,
    path: "/functional-relations",
  },
  {
    text: "Управление БД",
    icon: <StorageIcon />,
    path: "/admin-database",
  },
  {
    text: "Telegram-бот",
    icon: <TelegramIcon />,
    path: "/telegram-bot",
    badge: 5,
  },
];

const bottomMenuItems = [
  { text: 'Настройки', path: '/settings', icon: <SettingsIcon /> },
  { text: 'Выход', path: '/logout', icon: <LogoutIcon /> }
];

interface MenuListItemsProps {
  isCollapsed?: boolean;
}

const MenuListItems: React.FC<MenuListItemsProps> = ({ isCollapsed = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openSubMenus, setOpenSubMenus] = useState<{ [key: string]: boolean }>({});

  const toggleSubMenu = (path: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setOpenSubMenus(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  // Проверка, является ли путь или любой из его подпутей активным
  const isPathActive = (path: string, subMenu?: any[]) => {
    if (location.pathname === path) return true;
    if (subMenu && subMenu.some(item => location.pathname === item.path)) return true;
    // Проверка для активных подпутей (e.g. /staff/profiles должен активировать /staff)
    if (subMenu && location.pathname.startsWith(path + '/')) return true;
    return false;
  };

  const renderMenuItem = (item: any, index: number) => {
    const hasSubMenu = item.subMenu && item.subMenu.length > 0;
    const isActive = isPathActive(item.path, item.subMenu);
    const isOpen = openSubMenus[item.path] || (hasSubMenu && isActive && !isCollapsed);

    // Автоматическое открытие подменю если активен его подпункт
    React.useEffect(() => {
      if (hasSubMenu && isActive && !openSubMenus[item.path] && !isCollapsed) {
        setOpenSubMenus(prev => ({ ...prev, [item.path]: true }));
      }
    }, [location.pathname, item.path]);

    const handleClick = () => {
      if (hasSubMenu && !isCollapsed) {
        setOpenSubMenus(prev => ({ ...prev, [item.path]: !prev[item.path] }));
      } else {
        navigate(item.path);
      }
    };

    const button = (
      <NeomorphicButton
        isCollapsed={isCollapsed}
        selected={isActive}
        onClick={handleClick}
      >
        <StyledListItemIcon isCollapsed={isCollapsed}>
          {item.badge ? (
            <StyledBadge badgeContent={isCollapsed ? undefined : item.badge}>
              {item.icon}
            </StyledBadge>
          ) : (
            item.icon
          )}
        </StyledListItemIcon>
        {!isCollapsed && (
          <>
            <StyledListItemText primary={item.text} />
            {hasSubMenu && (
              <StyledExpandIcon>
                {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </StyledExpandIcon>
            )}
          </>
        )}
      </NeomorphicButton>
    );

    const subMenuItems = hasSubMenu && !isCollapsed && (
      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        <List disablePadding>
          {item.subMenu.map((subItem: any, subIndex: number) => (
            <ListItem key={subItem.path} disablePadding>
              <SubMenuButton
                selected={location.pathname === subItem.path}
                onClick={() => navigate(subItem.path)}
                isCollapsed={isCollapsed}
              >
                <StyledListItemIcon isCollapsed={isCollapsed}>
                  {subItem.icon}
                </StyledListItemIcon>
                <StyledListItemText 
                  primary={subItem.text}
                  sx={{ '& .MuiListItemText-primary': { fontSize: '0.9rem' } }}
                />
              </SubMenuButton>
            </ListItem>
          ))}
        </List>
      </Collapse>
    );

    return (
      <React.Fragment key={item.path}>
        <ListItem disablePadding>
          {isCollapsed && hasSubMenu ? (
            <Tooltip 
              title={
                <Box>
                  <div>{item.text}</div>
                  <List sx={{ pt: 1 }}>
                    {item.subMenu.map((subItem: any) => (
                      <ListItem key={subItem.path} dense onClick={() => navigate(subItem.path)}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          {subItem.icon}
                        </ListItemIcon>
                        <ListItemText primary={subItem.text} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              }
              placement="right"
              arrow
            >
              {button}
            </Tooltip>
          ) : isCollapsed ? (
            <Tooltip title={item.text} placement="right">
              {button}
            </Tooltip>
          ) : (
            button
          )}
        </ListItem>
        {subMenuItems}
      </React.Fragment>
    );
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      py: 1.5,
      px: isCollapsed ? 1 : 2,
      alignItems: isCollapsed ? 'center' : 'stretch',
    }}>
      <List disablePadding sx={{ width: '100%' }}>
        {menuItems.map((item, index) => renderMenuItem(item, index))}
      </List>
      
      <List sx={{ mt: 'auto', width: '100%' }} disablePadding>
        {bottomMenuItems.map((item, index) => renderMenuItem(item, index))}
      </List>
    </Box>
  );
};

export default MenuListItems; 