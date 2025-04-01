import React, { useState, useEffect } from 'react';
import { Box, Container, Paper, Fade, CircularProgress, styled } from '@mui/material';
import { ReactFlowProvider } from 'reactflow';
import OrganizationTree from '../components/organization/OrganizationTree';
import OrgTreeControls from '../components/organization/OrgTreeControls';
import { useNavigate, useLocation } from 'react-router-dom';
import { EntityNode, EntityRelation } from '../components/organization/types';
import ReactFlowGraph from '../components/organization/ReactFlowGraph';

// Стилизованные компоненты
const PageContainer = styled(Container)(({ theme }) => ({
  maxWidth: '100%',
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  position: 'relative',
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  height: 'calc(100vh - 180px)', // Увеличиваем высоту, так как убрали заголовок
  padding: theme.spacing(2),
  backgroundColor: 'rgba(26, 26, 30, 0.7)',
  borderRadius: 12,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
  border: '1px solid rgba(157, 106, 245, 0.2)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(157, 106, 245, 0.5), transparent)',
  },
}));

const LoadingOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(26, 26, 30, 0.7)',
  zIndex: 10,
  borderRadius: 12,
  backdropFilter: 'blur(4px)',
}));

const ControlsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

// Временные моковые данные для наших графов
const mockNodes: Record<string, EntityNode[]> = {
  business: [
    { id: '1', name: 'Генеральный директор', type: 'business', position: 'CEO' },
    { id: '2', name: 'Финансовый отдел', type: 'business' },
    { id: '3', name: 'Бухгалтерия', type: 'business' },
    { id: '4', name: 'Финансовый директор', type: 'business', position: 'CFO', manager: 'Генеральный директор' },
    { id: '5', name: 'Главный бухгалтер', type: 'business', position: 'Chief Accountant' },
    { id: '6', name: 'IT отдел', type: 'business' },
    { id: '7', name: 'Разработка', type: 'business' },
    { id: '8', name: 'Поддержка', type: 'business' },
    { id: '9', name: 'CTO', type: 'business', position: 'CTO', manager: 'Генеральный директор' },
  ],
  legal: [
    { id: 'l1', name: 'ООО "Компания"', type: 'legal' },
    { id: 'l2', name: 'ЗАО "Филиал 1"', type: 'legal' },
    { id: 'l3', name: 'ООО "Дочерняя компания"', type: 'legal' },
    { id: 'l4', name: 'ИП Иванов', type: 'legal' },
  ],
  territorial: [
    { id: 't1', name: 'Головной офис', type: 'territorial', position: 'Москва' },
    { id: 't2', name: 'Филиал Санкт-Петербург', type: 'territorial' },
    { id: 't3', name: 'Филиал Новосибирск', type: 'territorial' },
    { id: 't4', name: 'Филиал Казань', type: 'territorial' },
    { id: 't5', name: 'Региональный директор', type: 'territorial', position: 'Директор СПб филиала' },
  ],
};

const mockEdges: Record<string, EntityRelation[]> = {
  business: [
    { id: 'e1', from: '1', to: '2', type: 'department' },
    { id: 'e2', from: '1', to: '6', type: 'department' },
    { id: 'e3', from: '2', to: '3', type: 'department' },
    { id: 'e4', from: '1', to: '4', type: 'manager' },
    { id: 'e5', from: '4', to: '5', type: 'manager' },
    { id: 'e6', from: '6', to: '7', type: 'department' },
    { id: 'e7', from: '6', to: '8', type: 'department' },
    { id: 'e8', from: '1', to: '9', type: 'manager' },
    { id: 'e9', from: '9', to: '6', type: 'functional' },
  ],
  legal: [
    { id: 'le1', from: 'l1', to: 'l2', type: 'department' },
    { id: 'le2', from: 'l1', to: 'l3', type: 'department' },
    { id: 'le3', from: 'l3', to: 'l4', type: 'functional' },
  ],
  territorial: [
    { id: 'te1', from: 't1', to: 't2', type: 'department' },
    { id: 'te2', from: 't1', to: 't3', type: 'department' },
    { id: 'te3', from: 't1', to: 't4', type: 'department' },
    { id: 'te4', from: 't2', to: 't5', type: 'manager' },
  ],
};

const OrganizationStructurePage: React.FC = () => {
  // Используем location и navigate для работы с URL
  const location = useLocation();
  const navigate = useNavigate();
  
  // Извлекаем viewMode из URL
  const getViewModeFromPath = (): 'business' | 'legal' | 'territorial' => {
    const path = location.pathname;
    if (path.includes('/legal')) return 'legal';
    if (path.includes('/territorial')) return 'territorial';
    return 'business'; // По умолчанию
  };

  const [viewMode, setViewMode] = useState<'business' | 'legal' | 'territorial'>(getViewModeFromPath());
  const [displayMode, setDisplayMode] = useState<'tree' | 'list'>('tree');
  const [loading, setLoading] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Эффект для синхронизации viewMode с URL
  useEffect(() => {
    const currentMode = getViewModeFromPath();
    if (currentMode !== viewMode) {
      setViewMode(currentMode);
    }
  }, [location.pathname]);

  // Функция для изменения режима просмотра, обновляет также URL
  const handleViewModeChange = (mode: 'business' | 'legal' | 'territorial') => {
    setLoading(true);
    setViewMode(mode);
    
    // Обновляем URL в соответствии с выбранным режимом
    const basePath = '/organization-structure';
    const newPath = mode === 'business' 
      ? `${basePath}/business`
      : mode === 'legal' 
        ? `${basePath}/legal` 
        : `${basePath}/territorial`;
    
    navigate(newPath);
    
    // Имитируем загрузку данных
    setTimeout(() => {
      setLoading(false);
    }, 800);
  };

  // Обработчик выбора узла
  const handleNodeSelect = (nodeId: string | null) => {
    setSelectedNodeId(nodeId);
    console.log(`Выбран узел: ${nodeId}`);
  };

  return (
    <PageContainer>
      <ControlsContainer>
        {/* Переключатель дерево/список теперь слева */}
        <OrgTreeControls
          displayMode={displayMode}
          onDisplayModeChange={setDisplayMode}
        />
        {/* Пустое пространство справа */}
      </ControlsContainer>

      <StyledPaper>
        <Fade in={!loading} timeout={500}>
          <Box sx={{ height: '100%', width: '100%' }}>
            {/* Используем новый компонент с ReactFlow */}
            {displayMode === 'tree' ? (
              <ReactFlowProvider>
                <ReactFlowGraph
                  type={viewMode}
                  nodes={mockNodes[viewMode]}
                  edges={mockEdges[viewMode]}
                  selectedNodeId={selectedNodeId || undefined}
                  onNodeSelect={handleNodeSelect}
                  height={700}
                />
              </ReactFlowProvider>
            ) : (
              <OrganizationTree
                organizationId="1"
                viewMode={viewMode}
                displayMode={displayMode}
                zoomLevel={100}
                detailLevel={1}
              />
            )}
          </Box>
        </Fade>
        
        {loading && (
          <LoadingOverlay>
            <CircularProgress 
              size={60} 
              sx={{ 
                color: '#9D6AF5',
                '& .MuiCircularProgress-circle': {
                  strokeLinecap: 'round',
                  strokeWidth: 4,
                }
              }} 
            />
          </LoadingOverlay>
        )}
      </StyledPaper>
    </PageContainer>
  );
};

export default OrganizationStructurePage; 