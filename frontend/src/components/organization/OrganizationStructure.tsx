import React, { useState, useEffect } from 'react';
import { Box, Tab, Tabs, Button, CircularProgress, Typography } from '@mui/material';
import { ReactFlowProvider } from 'reactflow';
import ReactFlowGraph from './ReactFlowGraph';
import { EntityNode, EntityRelation, RelationType, Comment } from './types';
import axios from 'axios';

interface OrganizationStructureProps {
  type: 'business' | 'legal' | 'territorial';
}

const OrganizationStructure: React.FC<OrganizationStructureProps> = ({ type }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [nodes, setNodes] = useState<EntityNode[]>([]);
  const [edges, setEdges] = useState<EntityRelation[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Загрузка данных с сервера при монтировании компонента
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // В реальном приложении здесь будет запрос к API
        // const response = await axios.get(`/api/organization/${type}`);
        // setNodes(response.data.nodes);
        // setEdges(response.data.edges);
        
        // Временно используем моковые данные
        const mockData = generateMockData(type);
        setNodes(mockData.nodes);
        setEdges(mockData.edges);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type]);

  // Обработчики событий для графа
  const handleNodeSelect = (nodeId: string | null) => {
    setSelectedNodeId(nodeId);
  };

  const handleNodeAdd = async (position: { x: number, y: number }) => {
    // Создание нового узла
    const newNode: EntityNode = {
      id: `node_${Date.now()}`,
      name: 'Новый сотрудник',
      type: type,
      position: 'Должность',
      manager: 'Руководитель',
      comments: [{ 
        text: 'Новый сотрудник добавлен', 
        completed: false, 
        date: new Date().toISOString() 
      }]
    };

    // Добавляем узел в локальное состояние
    setNodes(prevNodes => [...prevNodes, newNode]);

    // В реальном приложении отправляем данные на сервер
    try {
      // await axios.post('/api/organization/nodes', newNode);
      console.log('Сотрудник добавлен:', newNode);
    } catch (error) {
      console.error('Ошибка при добавлении сотрудника:', error);
      // В случае ошибки удаляем узел из локального состояния
      setNodes(prevNodes => prevNodes.filter(node => node.id !== newNode.id));
    }
  };

  const handleNodeDelete = async (nodeId: string) => {
    // Сохраняем удаляемый узел для возможного восстановления
    const deletedNode = nodes.find(node => node.id === nodeId);
    
    // Удаляем узел из локального состояния
    setNodes(prevNodes => prevNodes.filter(node => node.id !== nodeId));
    
    // Удаляем связи, связанные с этим узлом
    setEdges(prevEdges => prevEdges.filter(edge => 
      edge.from !== nodeId && edge.to !== nodeId
    ));

    // В реальном приложении отправляем запрос на сервер
    try {
      // await axios.delete(`/api/organization/nodes/${nodeId}`);
      console.log('Сотрудник удален:', nodeId);
    } catch (error) {
      console.error('Ошибка при удалении сотрудника:', error);
      // В случае ошибки восстанавливаем узел
      if (deletedNode) {
        setNodes(prevNodes => [...prevNodes, deletedNode]);
      }
    }
  };

  const handleEdgeAdd = async (edge: { from: string, to: string, type: RelationType }) => {
    const newEdge: EntityRelation = {
      id: `edge_${Date.now()}`,
      from: edge.from,
      to: edge.to,
      type: edge.type,
      label: 'Новая связь'
    };

    // Добавляем связь в локальное состояние
    setEdges(prevEdges => [...prevEdges, newEdge]);

    // В реальном приложении отправляем данные на сервер
    try {
      // await axios.post('/api/organization/edges', newEdge);
      console.log('Связь добавлена:', newEdge);
    } catch (error) {
      console.error('Ошибка при добавлении связи:', error);
      // В случае ошибки удаляем связь из локального состояния
      setEdges(prevEdges => prevEdges.filter(e => e.id !== newEdge.id));
    }
  };

  const handleEdgeDelete = async (edgeId: string) => {
    // Сохраняем удаляемую связь для возможного восстановления
    const deletedEdge = edges.find(edge => edge.id === edgeId);
    
    // Удаляем связь из локального состояния
    setEdges(prevEdges => prevEdges.filter(edge => edge.id !== edgeId));

    // В реальном приложении отправляем запрос на сервер
    try {
      // await axios.delete(`/api/organization/edges/${edgeId}`);
      console.log('Связь удалена:', edgeId);
    } catch (error) {
      console.error('Ошибка при удалении связи:', error);
      // В случае ошибки восстанавливаем связь
      if (deletedEdge) {
        setEdges(prevEdges => [...prevEdges, deletedEdge]);
      }
    }
  };

  // Обработчик для обновления узла (например, изменение комментариев)
  const handleNodeUpdate = async (updatedNode: EntityNode) => {
    // Обновляем узел в локальном состоянии
    setNodes(prevNodes => prevNodes.map(node => 
      node.id === updatedNode.id ? updatedNode : node
    ));

    // В реальном приложении отправляем данные на сервер
    try {
      // await axios.put(`/api/organization/nodes/${updatedNode.id}`, updatedNode);
      console.log('Сотрудник обновлен:', updatedNode);
    } catch (error) {
      console.error('Ошибка при обновлении сотрудника:', error);
      // В случае ошибки можно восстановить предыдущее состояние
    }
  };

  // Рендерим граф организационной структуры
  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <CircularProgress />
        </Box>
      ) : (
        <ReactFlowProvider>
          <ReactFlowGraph
            type={type}
            nodes={nodes}
            edges={edges}
            selectedNodeId={selectedNodeId}
            onNodeSelect={handleNodeSelect}
            onNodeAdd={handleNodeAdd}
            onNodeDelete={handleNodeDelete}
            onNodeUpdate={handleNodeUpdate}
            onEdgeAdd={handleEdgeAdd}
            onEdgeDelete={handleEdgeDelete}
            height={800}
          />
        </ReactFlowProvider>
      )}
    </Box>
  );
};

// Функция для генерации моковых данных
const generateMockData = (type: string) => {
  // Примеры комментариев для демонстрации
  const ceoComments: Comment[] = [
    { text: 'Провести совещание с руководителями подразделений', completed: true, date: '2023-10-05T10:00:00Z' },
    { text: 'Подготовить отчет за квартал', completed: false, date: '2023-10-10T14:30:00Z' }
  ];
  
  const ctoComments: Comment[] = [
    { text: 'Оптимизировать инфраструктуру', completed: false, date: '2023-10-12T11:20:00Z' },
    { text: 'Обсудить новую технологию с командой разработки', completed: true, date: '2023-10-03T16:45:00Z' }
  ];

  const nodes: EntityNode[] = [
    { id: 'ceo', name: 'Иванов И.И.', type: type as any, position: 'CEO', comments: ceoComments },
    { id: 'cfo', name: 'Петров П.П.', type: type as any, position: 'CFO', manager: 'Иванов И.И.' },
    { id: 'cto', name: 'Сидоров С.С.', type: type as any, position: 'CTO', manager: 'Иванов И.И.', comments: ctoComments },
    { id: 'cmo', name: 'Николаев Н.Н.', type: type as any, position: 'CMO', manager: 'Иванов И.И.' },
    { id: 'dev_lead', name: 'Михайлов М.М.', type: type as any, position: 'Руководитель разработки', manager: 'Сидоров С.С.' },
    { id: 'dev1', name: 'Алексеев А.А.', type: type as any, position: 'Разработчик', manager: 'Михайлов М.М.' },
    { id: 'dev2', name: 'Сергеев С.С.', type: type as any, position: 'Разработчик', manager: 'Михайлов М.М.' },
    { id: 'design_lead', name: 'Дмитриев Д.Д.', type: type as any, position: 'Руководитель дизайна', manager: 'Николаев Н.Н.' },
    { id: 'designer1', name: 'Кузнецов К.К.', type: type as any, position: 'Дизайнер', manager: 'Дмитриев Д.Д.' },
    { id: 'finance1', name: 'Васильев В.В.', type: type as any, position: 'Финансовый специалист', manager: 'Петров П.П.' },
    { id: 'hr', name: 'Андреева А.А.', type: type as any, position: 'HR Менеджер', manager: 'Иванов И.И.' },
    { id: 'regional1', name: 'Романов Р.Р.', type: type as any, position: 'Региональный менеджер', manager: 'Николаев Н.Н.' }
  ];

  const edges: EntityRelation[] = [
    { id: 'e1', from: 'ceo', to: 'cfo', type: 'manager' },
    { id: 'e2', from: 'ceo', to: 'cto', type: 'manager' },
    { id: 'e3', from: 'ceo', to: 'cmo', type: 'manager' },
    { id: 'e4', from: 'ceo', to: 'hr', type: 'manager' },
    { id: 'e5', from: 'cto', to: 'dev_lead', type: 'manager' },
    { id: 'e6', from: 'dev_lead', to: 'dev1', type: 'manager' },
    { id: 'e7', from: 'dev_lead', to: 'dev2', type: 'manager' },
    { id: 'e8', from: 'cmo', to: 'design_lead', type: 'manager' },
    { id: 'e9', from: 'design_lead', to: 'designer1', type: 'manager' },
    { id: 'e10', from: 'cfo', to: 'finance1', type: 'manager' },
    { id: 'e11', from: 'cmo', to: 'regional1', type: 'manager' },
    { id: 'e12', from: 'dev1', to: 'designer1', type: 'functional', label: 'Совместная работа' },
    { id: 'e13', from: 'dev2', to: 'finance1', type: 'functional', label: 'Разработка финансовых модулей' },
    { id: 'e14', from: 'dev_lead', to: 'cmo', type: 'functional', label: 'Согласование требований' }
  ];

  return { nodes, edges };
};

export default OrganizationStructure; 