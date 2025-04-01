import React, { useState } from 'react';
import {
  Box,
  InputBase,
  IconButton,
  styled,
  Menu,
  MenuItem,
  Typography,
  Badge,
  Avatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Assignment as AssignmentIcon,
  Message as MessageIcon,
  Event as EventIcon,
} from '@mui/icons-material';

const TopBarContainer = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgba(20, 20, 22, 0.8)',
  backdropFilter: 'blur(10px)',
  padding: theme.spacing(1.5),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: theme.spacing(2),
  position: 'fixed',
  top: 0,
  right: 0,
  zIndex: 1100,
  borderRadius: '0 0 0 15px',
  boxShadow: '0 4px 15px -5px rgba(0, 0, 0, 0.5), 0 0 10px rgba(0, 0, 0, 0.2)',
  width: 'auto',
  border: '1px solid rgba(45, 45, 55, 0.9)',
  borderRight: 'none',
  borderTop: 'none',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: 'linear-gradient(90deg, rgba(157, 106, 245, 0.8), transparent)',
  },
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  '&:hover .search-box, &:focus-within .search-box': {
    width: '300px',
    opacity: 1,
    pointerEvents: 'all',
    transform: 'translateX(0)',
  },
}));

const SearchBox = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgba(42, 42, 42, 0.5)',
  borderRadius: '12px',
  padding: theme.spacing(1, 2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  backdropFilter: 'blur(5px)',
  boxShadow: `
    -4px -4px 8px rgba(255, 255, 255, 0.03),
    4px 4px 8px rgba(0, 0, 0, 0.4),
    inset 2px 2px 4px rgba(0, 0, 0, 0.2)
  `,
  transition: 'all 0.3s ease',
  width: 0,
  opacity: 0,
  position: 'absolute',
  right: '50px',
  pointerEvents: 'none',
  transform: 'translateX(20px)',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 'inherit',
    padding: '1px',
    background: 'linear-gradient(45deg, transparent, rgba(157, 106, 245, 0.2), transparent)',
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
  },
  '&:focus-within': {
    '&::before': {
      background: 'linear-gradient(45deg, rgba(157, 106, 245, 0.2), rgba(191, 85, 236, 0.4), rgba(157, 106, 245, 0.2))',
    },
  },
}));

const SearchInput = styled(InputBase)(({ theme }) => ({
  flex: 1,
  color: '#fff',
  '& input': {
    padding: theme.spacing(0.5, 0),
    '&::placeholder': {
      color: 'rgba(255, 255, 255, 0.5)',
      opacity: 1,
      transition: 'color 0.3s ease',
    },
    '&:focus::placeholder': {
      color: 'rgba(157, 106, 245, 0.5)',
    },
  },
}));

const StyledSearchIcon = styled('div')(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.3s ease',
  '& svg': {
    fontSize: '1.2rem',
  },
  '.Mui-focused &': {
    color: 'rgba(157, 106, 245, 0.8)',
    filter: 'drop-shadow(0 0 4px rgba(157, 106, 245, 0.4))',
  },
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: '#fff',
  backgroundColor: 'rgba(42, 42, 42, 0.5)',
  borderRadius: '10px',
  padding: theme.spacing(1),
  backdropFilter: 'blur(5px)',
  boxShadow: `
    -2px -2px 4px rgba(255, 255, 255, 0.03),
    2px 2px 4px rgba(0, 0, 0, 0.3)
  `,
  transition: 'all 0.3s ease',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 'inherit',
    padding: '1px',
    background: 'linear-gradient(45deg, transparent, rgba(157, 106, 245, 0.1), transparent)',
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover': {
    backgroundColor: 'rgba(50, 50, 50, 0.6)',
    boxShadow: `
      -4px -4px 6px rgba(255, 255, 255, 0.03),
      4px 4px 6px rgba(0, 0, 0, 0.4),
      inset 1px 1px 2px rgba(0, 0, 0, 0.2)
    `,
    '& svg': {
      filter: 'drop-shadow(0 0 4px rgba(157, 106, 245, 0.6))',
    },
    '&::before': {
      opacity: 1,
    },
  },
  '& svg': {
    fontSize: '1.2rem',
    transition: 'all 0.3s ease',
  },
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#9D6AF5',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '0.7rem',
    minWidth: '20px',
    height: '20px',
    borderRadius: '10px',
    boxShadow: '0 0 8px rgba(157, 106, 245, 0.6)',
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '2px solid #9D6AF5',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(1)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2)',
      opacity: 0,
    },
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 38,
  height: 38,
  border: '2px solid transparent',
  backgroundImage: 'linear-gradient(#2A2A2A, #2A2A2A), linear-gradient(45deg, #9D6AF5, #BF55EC)',
  backgroundOrigin: 'border-box',
  backgroundClip: 'content-box, border-box',
  boxShadow: `
    0 0 10px rgba(157, 106, 245, 0.3),
    inset 0 0 4px rgba(0, 0, 0, 0.4)
  `,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: `
      0 0 15px rgba(157, 106, 245, 0.5),
      inset 0 0 6px rgba(0, 0, 0, 0.6)
    `,
  },
}));

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    backgroundColor: 'rgba(42, 42, 42, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    marginTop: '8px',
    minWidth: 200,
    boxShadow: `
      0 0 20px rgba(0, 0, 0, 0.5),
      0 0 10px rgba(157, 106, 245, 0.2),
      inset 0 0 4px rgba(157, 106, 245, 0.1)
    `,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: 'inherit',
      padding: '1px',
      background: 'linear-gradient(45deg, transparent, rgba(157, 106, 245, 0.2), transparent)',
      WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
      WebkitMaskComposite: 'xor',
      maskComposite: 'exclude',
    },
  },
}));

const TopBar: React.FC = () => {
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };

  return (
    <TopBarContainer>
      <SearchContainer>
        <StyledIconButton>
          <SearchIcon />
        </StyledIconButton>
        <Box className="search-box">
          <SearchBox>
            <StyledSearchIcon>
              <SearchIcon />
            </StyledSearchIcon>
            <SearchInput placeholder="Поиск..." />
          </SearchBox>
        </Box>
      </SearchContainer>

      <StyledIconButton onClick={handleNotificationsOpen}>
        <StyledBadge badgeContent={4} overlap="circular">
          <NotificationsIcon />
        </StyledBadge>
      </StyledIconButton>

      <StyledIconButton edge="end" onClick={handleProfileMenuOpen}>
        <StyledAvatar src="/images/avatar.jpg" />
      </StyledIconButton>

      <StyledMenu
        anchorEl={notificationsAnchorEl}
        open={Boolean(notificationsAnchorEl)}
        onClose={handleNotificationsClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'rgba(42, 42, 42, 0.95)',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Typography sx={{ px: 2, py: 1, color: '#9D6AF5', fontWeight: 'bold' }}>
          Уведомления
        </Typography>
        {[
          { icon: <AssignmentIcon />, text: "Новая задача назначена", time: "10 мин назад" },
          { icon: <MessageIcon />, text: "Сообщение от Иванова И.И.", time: "2 часа назад" },
          { icon: <EventIcon />, text: "Встреча в 15:00", time: "5 часов назад" },
          { icon: <NotificationsIcon />, text: "Обновлены KPI по отделу", time: "Вчера" },
        ].map((notification, index) => (
          <MenuItem 
            key={index}
            onClick={handleNotificationsClose}
            sx={{ 
              py: 1,
              borderBottom: index < 3 ? '1px solid rgba(255,255,255,0.1)' : 'none',
              '&:hover': {
                background: 'rgba(157, 106, 245, 0.1)',
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box sx={{ 
                color: '#9D6AF5', 
                display: 'flex', 
                p: 0.5,
                borderRadius: '50%',
                background: 'rgba(157, 106, 245, 0.1)'
              }}>
                {notification.icon}
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: '#fff' }}>
                  {notification.text}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                  {notification.time}
                </Typography>
              </Box>
            </Box>
          </MenuItem>
        ))}
        <Box sx={{ p: 1, textAlign: 'center' }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#9D6AF5', 
              cursor: 'pointer', 
              '&:hover': { textDecoration: 'underline' } 
            }}
          >
            Показать все уведомления
          </Typography>
        </Box>
      </StyledMenu>

      <StyledMenu
        anchorEl={profileAnchorEl}
        open={Boolean(profileAnchorEl)}
        onClose={handleProfileMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'rgba(42, 42, 42, 0.95)',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <StyledAvatar 
            src="/images/avatar.jpg" 
            sx={{ width: 50, height: 50 }}
          />
          <Box>
            <Typography sx={{ color: '#fff', fontWeight: 'bold' }}>
              Администратор
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              admin@ofsglobal.ru
            </Typography>
          </Box>
        </Box>
        <MenuItem onClick={handleProfileMenuClose}>
          <AccountCircleIcon sx={{ mr: 2, color: '#9D6AF5' }} />
          <Typography>Мой профиль</Typography>
        </MenuItem>
        <MenuItem onClick={handleProfileMenuClose}>
          <SettingsIcon sx={{ mr: 2, color: '#9D6AF5' }} />
          <Typography>Настройки</Typography>
        </MenuItem>
        <MenuItem onClick={handleProfileMenuClose}>
          <LogoutIcon sx={{ mr: 2, color: '#9D6AF5' }} />
          <Typography>Выход</Typography>
        </MenuItem>
      </StyledMenu>
    </TopBarContainer>
  );
};

export default TopBar; 