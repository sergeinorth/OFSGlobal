import React, { useState, useCallback, useRef, useEffect, Suspense } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  NodeTypes,
  EdgeTypes,
  NodeMouseHandler,
  NodeChange,
  EdgeChange,
  ConnectionLineType,
  Panel,
  MarkerType,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Box, styled, Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, IconButton, List, ListItem, ListItemText, 
  ListItemSecondaryAction, ListItemIcon, Checkbox, Tooltip, 
  Fab, Typography, Paper, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import CommentIcon from '@mui/icons-material/Comment';

// Импортируем типы
import { EntityType, RelationType, EntityNode, EntityRelation, Comment } from './types';

// Импортируем кастомный компонент узла напрямую
import CustomNode from './CustomNode';

// Стилизованный контейнер для графа
const GraphContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '500px',
  backgroundColor: 'rgba(26, 26, 30, 0.7)',
  borderRadius: '12px',
  border: '1px solid rgba(157, 106, 245, 0.2)',
  overflow: 'hidden',
  position: 'relative',
  backdropFilter: 'blur(4px)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
}));

// Цвета для разных типов связей
const RELATION_COLORS = {
  manager: '#ff8a00', // оранжевый
  department: '#ffffff', // белый
  functional: '#00b3ff', // голубой
  other: '#9D6AF5', // фиолетовый (по умолчанию)
};

// Интерфейс для пропсов компонента
export interface ReactFlowGraphProps {
  type: 'business' | 'legal' | 'territorial';
  nodes: EntityNode[];
  edges: EntityRelation[];
  selectedNodeId?: string | null;
  onNodeSelect?: (nodeId: string | null) => void;
  onNodeAdd?: (position: { x: number, y: number }) => void;
  onNodeDelete?: (nodeId: string) => void;
  onNodeUpdate?: (updatedNode: EntityNode) => void;
  onEdgeAdd?: (edge: { from: string, to: string, type: RelationType }) => void;
  onEdgeDelete?: (edgeId: string) => void;
  readOnly?: boolean;
  height?: number | string;
}

// Функция для сохранения комментариев узла
const saveNodeComments = (nodeId: string, type: string, comments: Comment[]) => {
  try {
    const key = `node_comments_${type}_${nodeId}`;
    localStorage.setItem(key, JSON.stringify(comments));
    console.log(`Комментарии для узла ${nodeId} сохранены в localStorage`);
  } catch (error) {
    console.error('Ошибка при сохранении комментариев в localStorage:', error);
  }
};

// Функция для загрузки комментариев узла
const loadNodeComments = (nodeId: string, type: string): Comment[] | null => {
  try {
    const key = `node_comments_${type}_${nodeId}`;
    const savedComments = localStorage.getItem(key);
    if (savedComments) {
      return JSON.parse(savedComments);
    }
  } catch (error) {
    console.error('Ошибка при загрузке комментариев из localStorage:', error);
  }
  return null;
};

// Функция для сохранения позиций узлов
const saveNodePositions = (nodes: Node[], type: string) => {
  try {
    const positions = nodes.map(node => ({
      id: node.id,
      position: node.position
    }));
    const key = `node_positions_${type}`;
    localStorage.setItem(key, JSON.stringify(positions));
    console.log(`Позиции узлов для типа ${type} сохранены в localStorage`);
  } catch (error) {
    console.error('Ошибка при сохранении позиций узлов в localStorage:', error);
  }
};

// Функция для загрузки позиций узлов
const loadNodePositions = (type: string): Record<string, { x: number; y: number }> => {
  try {
    const key = `node_positions_${type}`;
    const savedPositions = localStorage.getItem(key);
    if (savedPositions) {
      const positions = JSON.parse(savedPositions);
      const positionsMap: Record<string, { x: number; y: number }> = {};
      positions.forEach((item: { id: string; position: { x: number; y: number } }) => {
        positionsMap[item.id] = item.position;
      });
      console.log(`Позиции узлов для типа ${type} загружены из localStorage`);
      return positionsMap;
    }
  } catch (error) {
    console.error('Ошибка при загрузке позиций узлов из localStorage:', error);
  }
  return {};
};

// Функция для преобразования EntityNode в Node для ReactFlow
const entityNodeToReactFlowNode = (node: EntityNode, allEdges: EntityRelation[]): Node => {
  // Загружаем комментарии из localStorage, если они есть
  const savedComments = loadNodeComments(node.id, node.type);
  if (savedComments && (!node.comments || node.comments.length === 0)) {
    node.comments = savedComments;
  }
  
  // Если комментарии в старом формате (строки), конвертируем в новый формат (объекты)
  if (node.comments && typeof node.comments[0] === 'string') {
    node.comments = (node.comments as unknown as string[]).map(text => ({
      text,
      completed: false,
      date: new Date().toISOString()
    }));
  }
  
  // Определяем цвет на основе входящих связей
  const incomingEdge = allEdges.find(edge => edge.to === node.id);
  const borderColor = !incomingEdge ? '#9D6AF5' : 
    RELATION_COLORS[incomingEdge.type] || RELATION_COLORS.other;
  
  // Считаем количество активных комментариев
  const activeComments = node.comments ? 
    node.comments.filter(c => !c.completed).length : 0;
  
  return {
    id: node.id,
    position: { x: 0, y: 0 }, // Начальная позиция, будет изменена позже
    type: 'customNode',
    data: {
      label: node.name,
      position: node.position,
      manager: node.manager,
      avatar: node.avatar,
      comments: node.comments,
      activeComments,
      borderColor,
      type: node.type
    }
  };
};

// Функция для преобразования EntityRelation в Edge для ReactFlow
const entityRelationToReactFlowEdge = (relation: EntityRelation): Edge => {
  return {
    id: relation.id,
    source: relation.from,
    target: relation.to,
    type: 'smoothstep',
    animated: relation.type === 'functional',
    style: { stroke: RELATION_COLORS[relation.type] || RELATION_COLORS.other, strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: RELATION_COLORS[relation.type] || RELATION_COLORS.other,
    },
    label: relation.label,
    data: { type: relation.type }
  };
};

const ReactFlowGraph: React.FC<ReactFlowGraphProps> = ({
  type,
  nodes: initialNodes,
  edges: initialEdges,
  selectedNodeId,
  onNodeSelect,
  onNodeAdd,
  onNodeDelete,
  onNodeUpdate,
  onEdgeAdd,
  onEdgeDelete,
  readOnly = false,
  height = 500,
}) => {
  // Состояние для узлов и связей
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Состояние для редактирования узла
  const [nodeEditDialogOpen, setNodeEditDialogOpen] = useState(false);
  const [currentEditNode, setCurrentEditNode] = useState<EntityNode | null>(null);
  const [editNodeName, setEditNodeName] = useState('');
  const [editNodePosition, setEditNodePosition] = useState('');
  const [editNodeManager, setEditNodeManager] = useState('');
  
  // Состояние для комментариев
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useReactFlow();

  // Регистрируем кастомные типы узлов
  const nodeTypes: NodeTypes = {
    customNode: CustomNode,
  };

  // Инициализация графа при изменении входных данных
  useEffect(() => {
    if (initialNodes && initialEdges) {
      // Преобразуем узлы
      const flowNodes = initialNodes.map(node => 
        entityNodeToReactFlowNode(node, initialEdges)
      );
      
      // Загружаем сохраненные позиции из localStorage
      const savedPositions = loadNodePositions(type);
      
      // Устанавливаем позиции узлов, используя сохраненные или дефолтные
      const positionedNodes = flowNodes.map((node, index) => {
        if (savedPositions[node.id]) {
          // Используем сохраненную позицию
          return {
            ...node,
            position: savedPositions[node.id]
          };
        } else {
          // Используем дефолтную позицию в виде сетки
          return {
            ...node,
            position: { 
              x: 100 + (index % 3) * 300, 
              y: 100 + Math.floor(index / 3) * 180 
            }
          };
        }
      });
      
      // Преобразуем связи
      const flowEdges = initialEdges.map(edge => 
        entityRelationToReactFlowEdge(edge)
      );
      
      setNodes(positionedNodes);
      setEdges(flowEdges);
      setIsLoading(false);
    }
  }, [initialNodes, initialEdges, type, setNodes, setEdges]);
  
  // Выделение узла
  useEffect(() => {
    if (selectedNodeId) {
      setNodes(nds => 
        nds.map(node => ({
          ...node,
          selected: node.id === selectedNodeId,
        }))
      );
    }
  }, [selectedNodeId, setNodes]);
  
  // Сохраняем позиции при изменении узлов
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    onNodesChange(changes);
    
    // Сохраняем позиции с небольшой задержкой, чтобы избежать частых записей при перетаскивании
    setTimeout(() => {
      const currentNodes = reactFlowInstance.getNodes();
      saveNodePositions(currentNodes, type);
    }, 500);
  }, [onNodesChange, reactFlowInstance, type]);
  
  // Обработчик клика по узлу
  const onNodeClick: NodeMouseHandler = useCallback((event, node) => {
    if (onNodeSelect) {
      onNodeSelect(node.id);
    }
  }, [onNodeSelect]);
  
  // Обработчик двойного клика по узлу
  const onNodeDoubleClick: NodeMouseHandler = useCallback((event, node) => {
    const entityNode = initialNodes.find(n => n.id === node.id);
    if (entityNode) {
      setCurrentEditNode(entityNode);
      setEditNodeName(entityNode.name);
      setEditNodePosition(entityNode.position || '');
      setEditNodeManager(entityNode.manager || '');
      setNodeEditDialogOpen(true);
    }
  }, [initialNodes]);
  
  // Обработчик добавления связи
  const onConnect = useCallback((params: Connection) => {
    if (params.source && params.target && onEdgeAdd) {
      const newEdge = {
        from: params.source,
        to: params.target,
        type: 'other' as RelationType
      };
      
      onEdgeAdd(newEdge);
    }
  }, [onEdgeAdd]);
  
  // Обработчик удаления узла
  const handleDeleteNode = useCallback(() => {
    if (currentEditNode && onNodeDelete) {
      onNodeDelete(currentEditNode.id);
      setNodeEditDialogOpen(false);
      setCurrentEditNode(null);
    }
  }, [currentEditNode, onNodeDelete]);
  
  // Обработчик сохранения изменений узла
  const handleSaveNodeEdit = useCallback(() => {
    if (currentEditNode && onNodeUpdate) {
      const updatedNode: EntityNode = {
        ...currentEditNode,
        name: editNodeName,
        position: editNodePosition,
        manager: editNodeManager
      };
      
      onNodeUpdate(updatedNode);
      setNodeEditDialogOpen(false);
      setCurrentEditNode(null);
    }
  }, [currentEditNode, editNodeName, editNodePosition, editNodeManager, onNodeUpdate]);
  
  // Обработчик клика по пустому месту для добавления нового узла
  const onPaneClick = useCallback((event: any) => {
    if (!readOnly && reactFlowWrapper.current && onNodeAdd) {
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      onNodeAdd(position);
    }
  }, [readOnly, reactFlowInstance, onNodeAdd]);

  // Обработчик клика на кнопку добавления узла
  const handleAddNodeBtnClick = useCallback(() => {
    if (onNodeAdd) {
      // Добавляем узел в центр видимой области
      const viewport = reactFlowInstance.getViewport();
      const center = reactFlowInstance.project({
        x: reactFlowWrapper.current ? reactFlowWrapper.current.clientWidth / 2 : 300,
        y: reactFlowWrapper.current ? reactFlowWrapper.current.clientHeight / 2 : 200,
      });
      onNodeAdd(center);
    }
  }, [reactFlowInstance, onNodeAdd]);
  
  // Обработчик открытия диалога комментариев
  const handleOpenCommentDialog = (node: EntityNode) => {
    setCurrentEditNode(node);
    setCommentDialogOpen(true);
    setNewComment('');
  };
  
  // Обработчик добавления комментария
  const handleAddComment = () => {
    if (currentEditNode && newComment.trim() && onNodeUpdate) {
      const newCommentObj: Comment = {
        text: newComment.trim(),
        completed: false,
        date: new Date().toISOString()
      };
      
      const updatedComments = currentEditNode.comments 
        ? [...currentEditNode.comments, newCommentObj] 
        : [newCommentObj];
      
      const updatedNode: EntityNode = {
        ...currentEditNode,
        comments: updatedComments
      };
      
      // Сохраняем комментарии в localStorage
      saveNodeComments(currentEditNode.id, currentEditNode.type, updatedComments);
      
      // Обновляем узел
      onNodeUpdate(updatedNode);
      setNewComment('');
    }
  };
  
  // Обработчик изменения статуса комментария
  const handleToggleCommentStatus = (commentIndex: number) => {
    if (currentEditNode && currentEditNode.comments && onNodeUpdate) {
      const updatedComments = [...currentEditNode.comments];
      updatedComments[commentIndex] = {
        ...updatedComments[commentIndex],
        completed: !updatedComments[commentIndex].completed
      };
      
      const updatedNode: EntityNode = {
        ...currentEditNode,
        comments: updatedComments
      };
      
      // Сохраняем комментарии в localStorage
      saveNodeComments(currentEditNode.id, currentEditNode.type, updatedComments);
      
      // Обновляем узел
      onNodeUpdate(updatedNode);
    }
  };
  
  return (
    <GraphContainer ref={reactFlowWrapper} sx={{ height }}>
      {isLoading ? (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%' 
          }}
        >
          <CircularProgress color="secondary" />
        </Box>
      ) : (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          onNodeDoubleClick={onNodeDoubleClick}
          fitView
          snapToGrid
          snapGrid={[15, 15]}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          onPaneClick={onPaneClick}
          zoomOnDoubleClick={false}
          connectionLineType={ConnectionLineType.SmoothStep}
          connectionLineStyle={{ stroke: '#9D6AF5', strokeWidth: 2 }}
          defaultEdgeOptions={{ 
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed }, 
            style: { stroke: '#9D6AF5', strokeWidth: 2 }
          }}
        >
          <Background color="#1a1a1e" gap={20} />
          <Controls 
            showInteractive={false} 
            position="bottom-right"
            style={{ 
              display: 'flex', 
              flexDirection: 'column',
              background: 'rgba(26, 26, 34, 0.9)',
              borderRadius: '8px',
              border: '1px solid rgba(157, 106, 245, 0.3)',
              padding: '8px' 
            }}
          />
          
          {!readOnly && (
            <Panel position="top-right">
              <Fab
                color="secondary"
                size="medium"
                onClick={handleAddNodeBtnClick}
                sx={{
                  background: 'linear-gradient(45deg, #9D6AF5, #b350ff)',
                  boxShadow: '0 4px 10px rgba(157, 106, 245, 0.5)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #a478f5, #c070ff)'
                  }
                }}
              >
                <AddIcon />
              </Fab>
            </Panel>
          )}
        </ReactFlow>
      )}
      
      {/* Диалог редактирования узла */}
      <Dialog open={nodeEditDialogOpen} onClose={() => setNodeEditDialogOpen(false)}>
        <DialogTitle>Редактировать {currentEditNode?.name}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Имя"
            fullWidth
            value={editNodeName}
            onChange={(e) => setEditNodeName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Должность"
            fullWidth
            value={editNodePosition}
            onChange={(e) => setEditNodePosition(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Руководитель"
            fullWidth
            value={editNodeManager}
            onChange={(e) => setEditNodeManager(e.target.value)}
          />
          
          {currentEditNode && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1">
                Комментарии ({currentEditNode.comments?.filter(c => !c.completed).length || 0} активных)
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
                <Button 
                  variant="outlined" 
                  startIcon={<CommentIcon />}
                  onClick={() => {
                    if (currentEditNode) {
                      handleOpenCommentDialog(currentEditNode);
                      setNodeEditDialogOpen(false);
                    }
                  }}
                >
                  Управление комментариями
                </Button>
              </Box>
            </Box>
          )}
          
        </DialogContent>
        <DialogActions>
          {!readOnly && (
            <Button 
              onClick={handleDeleteNode} 
              color="error" 
              startIcon={<DeleteIcon />}
            >
              Удалить
            </Button>
          )}
          <Button onClick={() => setNodeEditDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleSaveNodeEdit} variant="contained" color="primary">Сохранить</Button>
        </DialogActions>
      </Dialog>
      
      {/* Диалог управления комментариями */}
      <Dialog 
        open={commentDialogOpen} 
        onClose={() => setCommentDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Комментарии к {currentEditNode?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Новый комментарий"
              fullWidth
              multiline
              rows={2}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              variant="outlined"
            />
            <Button 
              onClick={handleAddComment} 
              variant="contained" 
              color="primary"
              sx={{ mt: 1 }}
              disabled={!newComment.trim()}
            >
              Добавить
            </Button>
          </Box>
          
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Список комментариев:
          </Typography>
          
          <List>
            {currentEditNode?.comments?.map((comment, index) => (
              <ListItem 
                key={index} 
                sx={{ 
                  bgcolor: 'rgba(26, 26, 30, 0.7)',
                  mb: 1,
                  borderRadius: 1,
                  border: '1px solid rgba(157, 106, 245, 0.2)'
                }}
              >
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={comment.completed}
                    onChange={() => handleToggleCommentStatus(index)}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography 
                      sx={{ 
                        textDecoration: comment.completed ? 'line-through' : 'none',
                        color: comment.completed ? 'text.disabled' : 'text.primary'
                      }}
                    >
                      {comment.text}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {new Date(comment.date).toLocaleString()}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
            
            {(!currentEditNode?.comments || currentEditNode.comments.length === 0) && (
              <Paper sx={{ p: 2, bgcolor: 'rgba(26, 26, 30, 0.7)' }}>
                <Typography variant="body2" color="text.secondary" align="center">
                  Нет комментариев
                </Typography>
              </Paper>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentDialogOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </GraphContainer>
  );
};

export default ReactFlowGraph; 
