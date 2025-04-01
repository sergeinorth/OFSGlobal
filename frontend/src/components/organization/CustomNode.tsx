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
        width: '200px',
        padding: '10px',
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
        flexDirection: 'column',
        alignItems: 'center',
        color: '#ffffff'
      }}
    >
      {/* Коннекторы для входящих и исходящих связей */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: borderColor, width: '10px', height: '10px' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: borderColor, width: '10px', height: '10px' }}
      />
      
      {/* Аватар сотрудника (если есть) */}
      {avatar ? (
        <Avatar
          src={avatar}
          alt={label}
          sx={{
            width: 60,
            height: 60,
            mb: 1,
            border: `2px solid ${borderColor}`,
            boxShadow: '0 0 8px rgba(0, 0, 0, 0.3)'
          }}
        />
      ) : (
        <Avatar
          sx={{
            width: 60,
            height: 60,
            mb: 1,
            bgcolor: 'rgba(157, 106, 245, 0.7)',
            border: `2px solid ${borderColor}`,
            boxShadow: '0 0 8px rgba(0, 0, 0, 0.3)'
          }}
        >
          {label.substring(0, 1).toUpperCase()}
        </Avatar>
      )}
      
      {/* Имя сотрудника */}
      <Typography
        variant="subtitle1"
        fontWeight="bold"
        textAlign="center"
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
          textAlign="center"
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
          textAlign="center"
          sx={{
            color: '#aaaaaa',
            mb: 1
          }}
        >
          Руководитель: {manager}
        </Typography>
      )}
      
      {/* Индикатор комментариев */}
      {activeComments > 0 && (
        <Badge
          badgeContent={activeComments}
          color="error"
          sx={{
            position: 'absolute',
            top: '5px',
            right: '5px'
          }}
        >
          <CommentIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
        </Badge>
      )}
    </Box>
  );
};

export default CustomNode; 