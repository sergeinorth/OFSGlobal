import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Box, Typography, Badge, Avatar } from '@mui/material';
import CommentIcon from '@mui/icons-material/Comment';
import { Comment } from './types';

interface CustomNodeData {
  label: string;
  position?: string;
  manager?: string;
  avatar?: string;
  comments?: Comment[];
  activeComments: number;
  borderColor: string;
  type: string;
}

const CustomNode: React.FC<NodeProps<CustomNodeData>> = ({ data, selected }) => {
  const { label, position, manager, avatar, activeComments, borderColor, type } = data;
  
  return (
    <Box
      sx={{
        width: '280px',
        padding: '12px',
        backgroundColor: 'rgba(26, 26, 34, 0.9)',
        borderRadius: '8px',
        border: `2px solid ${borderColor}`,
        boxShadow: selected 
          ? `0 0 10px 2px ${borderColor}` 
          : '0 4px 12px rgba(0, 0, 0, 0.3)',
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: 'rgba(30, 30, 38, 0.95)',
          transform: 'translateY(-2px)',
          boxShadow: `0 6px 16px rgba(0, 0, 0, 0.4), 0 0 0 1px ${borderColor}`
        },
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        color: '#ffffff',
        cursor: 'pointer'
      }}
    >
      {/* Коннекторы для входящих и исходящих связей - делаем больше для лучшего UX */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: borderColor, width: '12px', height: '12px', top: '-6px' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: borderColor, width: '12px', height: '12px', bottom: '-6px' }}
      />
      
      {/* Аватар сотрудника (если есть) - добавляем отступ справа */}
      <Box sx={{ mr: 2 }}>
        {avatar ? (
          <Avatar
            src={avatar}
            alt={label}
            sx={{
              width: 56,
              height: 56,
              border: `2px solid ${borderColor}`,
              boxShadow: '0 0 8px rgba(0, 0, 0, 0.3)'
            }}
          />
        ) : (
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: 'rgba(157, 106, 245, 0.7)',
              border: `2px solid ${borderColor}`,
              boxShadow: '0 0 8px rgba(0, 0, 0, 0.3)'
            }}
          >
            {label.substring(0, 1).toUpperCase()}
          </Avatar>
        )}
      </Box>
      
      {/* Текстовая информация - справа от аватара */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1 }}>
        {/* Имя сотрудника */}
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          sx={{
            mb: 0.5,
            color: '#ffffff',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
          }}
        >
          {label}
        </Typography>
        
        {/* Должность */}
        {position && (
          <Typography
            variant="body2"
            sx={{
              mb: 0.5,
              color: '#cccccc',
              fontFamily: 'monospace',
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              px: 1,
              py: 0.5,
              borderRadius: '4px',
              width: '100%'
            }}
          >
            {position}
          </Typography>
        )}
        
        {/* Руководитель */}
        {manager && (
          <Typography
            variant="caption"
            fontStyle="italic"
            sx={{
              color: '#aaaaaa'
            }}
          >
            Руководитель: {manager}
          </Typography>
        )}
      </Box>
      
      {/* Индикатор комментариев - увеличиваем размер для лучшего клика */}
      {activeComments > 0 && (
        <Badge
          badgeContent={activeComments}
          color="error"
          sx={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            '& .MuiBadge-badge': {
              fontSize: '0.8rem',
              height: '22px',
              minWidth: '22px'
            }
          }}
        >
          <CommentIcon sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.4rem' }} />
        </Badge>
      )}
    </Box>
  );
};

export default CustomNode; 