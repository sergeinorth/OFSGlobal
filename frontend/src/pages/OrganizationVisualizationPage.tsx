import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  Grid, 
  Card, 
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Button,
  Chip
} from '@mui/material';
import * as d3 from 'd3';
import organizationData from '../mockData/organizationData';
import { Organization, Staff, Division, FunctionalRelation } from '../mockData/organizationData';

// Тип для режимов визуализации
type VisualizationMode = 'hierarchical' | 'network' | 'matrix';

const OrganizationVisualizationPage: React.FC = () => {
  // Стейты
  const [mode, setMode] = useState<VisualizationMode>('hierarchical');
  const [selectedEntity, setSelectedEntity] = useState<'legal' | 'location' | 'division'>('legal');
  const [selectedRelationType, setSelectedRelationType] = useState<string>('all');
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  
  // Рефы для контейнеров D3 визуализаций
  const hierarchyChartRef = useRef<SVGSVGElement>(null);
  const networkChartRef = useRef<SVGSVGElement>(null);
  const matrixChartRef = useRef<SVGSVGElement>(null);
  
  // Обработчики переключения режимов
  const handleModeChange = (_: React.SyntheticEvent, newMode: VisualizationMode) => {
    setMode(newMode);
  };
  
  const handleEntityTypeChange = (event: SelectChangeEvent) => {
    setSelectedEntity(event.target.value as 'legal' | 'location' | 'division');
  };
  
  const handleRelationTypeChange = (event: SelectChangeEvent) => {
    setSelectedRelationType(event.target.value);
  };

  // Функция для рендера иерархической визуализации (дерева)
  useEffect(() => {
    if (mode === 'hierarchical' && hierarchyChartRef.current) {
      renderHierarchyChart();
    }
  }, [mode, selectedEntity, hierarchyChartRef.current]);

  // Функция для рендера сетевой визуализации (force-directed graph)
  useEffect(() => {
    if (mode === 'network' && networkChartRef.current) {
      renderNetworkChart();
    }
  }, [mode, selectedRelationType, networkChartRef.current]);

  // Функция для рендера матричной визуализации (adjacency matrix)
  useEffect(() => {
    if (mode === 'matrix' && matrixChartRef.current) {
      renderMatrixChart();
    }
  }, [mode, selectedRelationType, matrixChartRef.current]);

  // Рендер иерархической визуализации
  const renderHierarchyChart = () => {
    const svg = d3.select(hierarchyChartRef.current);
    svg.selectAll("*").remove(); // Очищаем предыдущую визуализацию
    
    const width = 900;
    const height = 600;
    const margin = { top: 20, right: 120, bottom: 20, left: 120 };
    
    // Получаем данные в зависимости от выбранного типа структуры
    let data;
    if (selectedEntity === 'legal') {
      data = organizationData.getLegalEntityHierarchy()[0]; // Берем головную организацию с юрлицами
    } else if (selectedEntity === 'location') {
      data = organizationData.getLocationHierarchy()[0]; // Берем головную организацию с локациями
    } else {
      data = organizationData.getDivisionHierarchy()[0]; // Берем структуру подразделений
    }
    
    // Создаем иерархию и раскладку дерева
    const root = d3.hierarchy(data);
    
    const treeLayout = d3.tree()
      .size([height - margin.top - margin.bottom, width - margin.left - margin.right]);
    
    treeLayout(root);
    
    // Создаем группу для отрисовки
    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Добавляем связи между узлами
    g.selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d3.linkHorizontal()
        .x((d: any) => d.y)
        .y((d: any) => d.x)
      )
      .style('fill', 'none')
      .style('stroke', '#ccc')
      .style('stroke-width', 1.5);
    
    // Создаем группы для узлов
    const node = g.selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', d => `node ${d.children ? 'node--internal' : 'node--leaf'}`)
      .attr('transform', (d: any) => `translate(${d.y},${d.x})`)
      .on('click', (event, d: any) => {
        // При клике на узел показываем детальную информацию
        setSelectedNodeId(d.data.id);
      });
    
    // Добавляем круги для узлов
    node.append('circle')
      .attr('r', 5)
      .style('fill', d => d.data.is_active ? '#4caf50' : '#f44336')
      .style('stroke', '#fff')
      .style('stroke-width', 2);
    
    // Добавляем подписи
    node.append('text')
      .attr('dy', '.31em')
      .attr('x', d => d.children ? -8 : 8)
      .style('text-anchor', d => d.children ? 'end' : 'start')
      .text(d => d.data.name)
      .style('font-size', '12px');
  };
  
  // Рендер сетевой визуализации
  const renderNetworkChart = () => {
    const svg = d3.select(networkChartRef.current);
    svg.selectAll("*").remove(); // Очищаем предыдущую визуализацию
    
    const width = 900;
    const height = 600;
    
    // Получаем данные о функциональных связях
    const data = organizationData.getFunctionalRelationsNetwork();
    
    // Фильтруем связи по выбранному типу
    let filteredLinks = data.links;
    if (selectedRelationType !== 'all') {
      filteredLinks = data.links.filter(link => link.type === selectedRelationType);
    }
    
    // Создаем силовую симуляцию
    const simulation = d3.forceSimulation(data.nodes as any)
      .force('link', d3.forceLink(filteredLinks).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('x', d3.forceX(width / 2).strength(0.1))
      .force('y', d3.forceY(height / 2).strength(0.1));
    
    // Создаем группу для отрисовки
    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g');
    
    // Функция для получения цвета в зависимости от типа связи
    const getLinkColor = (type: string) => {
      switch(type) {
        case 'ADMINISTRATIVE': return '#4caf50';
        case 'FUNCTIONAL': return '#2196f3';
        case 'PROJECT': return '#ff9800';
        case 'TERRITORIAL': return '#9c27b0';
        case 'MENTORING': return '#e91e63';
        default: return '#ccc';
      }
    };
    
    // Рисуем связи
    const link = g.selectAll('.link')
      .data(filteredLinks)
      .enter()
      .append('line')
      .attr('class', 'link')
      .style('stroke', d => getLinkColor(d.type))
      .style('stroke-width', 1.5)
      .style('stroke-dasharray', d => d.type === 'FUNCTIONAL' ? '5,5' : 'none');
    
    // Рисуем узлы
    const node = g.selectAll('.node')
      .data(data.nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
      )
      .on('click', (event, d: any) => {
        // При клике на узел показываем детальную информацию
        setSelectedNodeId(d.id);
      });
    
    // Добавляем круги для узлов
    node.append('circle')
      .attr('r', 6)
      .style('fill', (d: any) => {
        // Цвет в зависимости от уровня
        return d.level === 1 ? '#f44336' : d.level === 2 ? '#ff9800' : '#4caf50';
      })
      .style('stroke', '#fff')
      .style('stroke-width', 1);
    
    // Добавляем подписи
    node.append('text')
      .attr('dx', 12)
      .attr('dy', '.35em')
      .text((d: any) => d.name)
      .style('font-size', '10px');
    
    // Обновляем позиции при каждом тике симуляции
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);
      
      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });
    
    // Функции для обработки перетаскивания
    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    
    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }
    
    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  };
  
  // Рендер матричной визуализации
  const renderMatrixChart = () => {
    const svg = d3.select(matrixChartRef.current);
    svg.selectAll("*").remove(); // Очищаем предыдущую визуализацию
    
    const width = 900;
    const height = 600;
    const margin = { top: 100, right: 50, bottom: 10, left: 100 };
    
    // Получаем данные о функциональных связях
    const networkData = organizationData.getFunctionalRelationsNetwork();
    
    // Фильтруем связи по выбранному типу
    let filteredLinks = networkData.links;
    if (selectedRelationType !== 'all') {
      filteredLinks = networkData.links.filter(link => link.type === selectedRelationType);
    }
    
    // Создаем матрицу смежности
    const nodes = networkData.nodes;
    const n = nodes.length;
    
    // Инициализируем матрицу смежности нулями
    const matrix: number[][] = [];
    for (let i = 0; i < n; i++) {
      const row: number[] = [];
      for (let j = 0; j < n; j++) {
        row.push(0);
      }
      matrix.push(row);
    }
    
    // Заполняем матрицу смежности
    filteredLinks.forEach(link => {
      const source = typeof link.source === 'object' ? link.source.id : link.source;
      const target = typeof link.target === 'object' ? link.target.id : link.target;
      
      // Находим индексы в массиве узлов
      const sourceIdx = nodes.findIndex((node: any) => node.id === source);
      const targetIdx = nodes.findIndex((node: any) => node.id === target);
      
      if (sourceIdx !== -1 && targetIdx !== -1) {
        matrix[sourceIdx][targetIdx] = 1;
      }
    });
    
    // Создаем группу для отрисовки
    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Создаем шкалы
    const xScale = d3.scaleBand()
      .domain(d3.range(n).map(String))
      .range([0, width - margin.left - margin.right])
      .padding(0.1);
    
    const yScale = d3.scaleBand()
      .domain(d3.range(n).map(String))
      .range([0, height - margin.top - margin.bottom])
      .padding(0.1);
    
    // Функция для получения цвета ячейки
    const getColor = (value: number) => value ? '#4caf50' : '#f5f5f5';
    
    // Рисуем ячейки матрицы
    g.selectAll('.cell')
      .data(matrix.flatMap((row, i) => row.map((value, j) => ({ i, j, value }))))
      .enter()
      .append('rect')
      .attr('class', 'cell')
      .attr('x', d => xScale(d.j.toString())!)
      .attr('y', d => yScale(d.i.toString())!)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .style('fill', d => getColor(d.value))
      .style('stroke', '#fff')
      .on('mouseover', function(this: SVGRectElement, event, d) {
        d3.select(this).style('fill', '#ff9800');
        
        // Показываем подсказку
        const source = nodes[d.i];
        const target = nodes[d.j];
        if (source && target) {
          tooltip
            .style('opacity', 0.9)
            .html(`От: ${source.name}<br>К: ${target.name}`)
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 28}px`);
        }
      })
      .on('mouseout', function(this: SVGRectElement) {
        d3.select(this).style('fill', d => getColor(d.value));
        tooltip.style('opacity', 0);
      });
    
    // Добавляем подписи по оси X (столбцы)
    g.selectAll('.x-label')
      .data(nodes)
      .enter()
      .append('text')
      .attr('class', 'x-label')
      .attr('x', (d, i) => xScale(i.toString())! + xScale.bandwidth() / 2)
      .attr('y', -10)
      .attr('transform', (d, i) => {
        const x = xScale(i.toString())! + xScale.bandwidth() / 2;
        return `rotate(-45, ${x}, -10)`;
      })
      .style('text-anchor', 'end')
      .style('font-size', '8px')
      .text((d: any) => d.name);
    
    // Добавляем подписи по оси Y (строки)
    g.selectAll('.y-label')
      .data(nodes)
      .enter()
      .append('text')
      .attr('class', 'y-label')
      .attr('x', -10)
      .attr('y', (d, i) => yScale(i.toString())! + yScale.bandwidth() / 2)
      .style('text-anchor', 'end')
      .style('alignment-baseline', 'middle')
      .style('font-size', '8px')
      .text((d: any) => d.name);
    
    // Создаем подсказку
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background-color', 'white')
      .style('border', '1px solid #ddd')
      .style('border-radius', '4px')
      .style('padding', '5px')
      .style('pointer-events', 'none');
  };
  
  // Получаем подробную информацию о выбранном элементе
  const getSelectedNodeDetails = () => {
    if (!selectedNodeId) return null;
    
    if (mode === 'hierarchical') {
      if (selectedEntity === 'legal' || selectedEntity === 'location') {
        const org = organizationData.organizations.find(org => org.id === selectedNodeId);
        if (org) {
          return (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6">{org.name}</Typography>
                <Typography variant="body2" color="text.secondary">Тип: {org.org_type === 'LEGAL_ENTITY' ? 'Юридическое лицо' : 'Локация'}</Typography>
                <Typography variant="body2">{org.description}</Typography>
                {org.legal_address && (
                  <Typography variant="body2">Юридический адрес: {org.legal_address}</Typography>
                )}
                {org.physical_address && (
                  <Typography variant="body2">Физический адрес: {org.physical_address}</Typography>
                )}
                {org.inn && (
                  <Typography variant="body2">ИНН: {org.inn}</Typography>
                )}
                {org.kpp && (
                  <Typography variant="body2">КПП: {org.kpp}</Typography>
                )}
                <Typography variant="body2">Статус: {org.is_active ? 'Активен' : 'Неактивен'}</Typography>
              </CardContent>
            </Card>
          );
        }
      } else {
        // Находим подразделение в дереве подразделений
        const findDivision = (divs: Division[], id: number): Division | null => {
          for (const div of divs) {
            if (div.id === id) return div;
            if (div.children) {
              const found = findDivision(div.children, id);
              if (found) return found;
            }
          }
          return null;
        };
        
        const div = findDivision(organizationData.divisions, selectedNodeId);
        if (div) {
          return (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6">{div.name}</Typography>
                {div.code && (
                  <Typography variant="body2" color="text.secondary">Код: {div.code}</Typography>
                )}
                <Typography variant="body2">{div.description}</Typography>
                <Typography variant="body2">Уровень: {div.level}</Typography>
                <Typography variant="body2">Статус: {div.is_active ? 'Активен' : 'Неактивен'}</Typography>
              </CardContent>
            </Card>
          );
        }
      }
    } else {
      // Для сетевой и матричной визуализации показываем информацию о сотруднике
      const person = organizationData.staff.find(p => p.id === selectedNodeId);
      if (person) {
        // Найдем организации для сотрудника
        const organization = organizationData.organizations.find(org => org.id === person.organization_id);
        const legalEntity = person.legal_entity_id 
          ? organizationData.organizations.find(org => org.id === person.legal_entity_id)
          : null;
        const location = person.location_id
          ? organizationData.organizations.find(org => org.id === person.location_id)
          : null;
        
        // Найдем связи этого сотрудника
        const relations = organizationData.functionalRelations.filter(
          rel => rel.manager_id === person.id || rel.subordinate_id === person.id
        );
        
        return (
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">{person.name}</Typography>
              <Typography variant="body2" color="text.secondary">Должность: {person.position}</Typography>
              <Typography variant="body2">Подразделение: {person.division}</Typography>
              <Typography variant="body2">Уровень: {person.level}</Typography>
              {organization && (
                <Typography variant="body2">Организация: {organization.name}</Typography>
              )}
              {legalEntity && (
                <Typography variant="body2">Юридическое лицо: {legalEntity.name}</Typography>
              )}
              {location && (
                <Typography variant="body2">Место работы: {location.name}</Typography>
              )}
              {person.email && (
                <Typography variant="body2">Email: {person.email}</Typography>
              )}
              {person.phone && (
                <Typography variant="body2">Телефон: {person.phone}</Typography>
              )}
              
              {relations.length > 0 && (
                <>
                  <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Функциональные связи:</Typography>
                  {relations.map(rel => {
                    const isManager = rel.manager_id === person.id;
                    const otherPerson = organizationData.staff.find(p => 
                      p.id === (isManager ? rel.subordinate_id : rel.manager_id)
                    );
                    
                    return (
                      <Box key={rel.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Chip 
                          label={getRelationTypeLabel(rel.relation_type)} 
                          size="small" 
                          color={getRelationTypeColor(rel.relation_type)}
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="body2">
                          {isManager ? 'Руководит: ' : 'Подчиняется: '}
                          {otherPerson?.name} ({otherPerson?.position})
                        </Typography>
                      </Box>
                    );
                  })}
                </>
              )}
            </CardContent>
          </Card>
        );
      }
    }
    
    return null;
  };
  
  // Вспомогательные функции для отображения типов связей
  const getRelationTypeLabel = (type: string) => {
    switch(type) {
      case 'ADMINISTRATIVE': return 'Административная';
      case 'FUNCTIONAL': return 'Функциональная';
      case 'PROJECT': return 'Проектная';
      case 'TERRITORIAL': return 'Территориальная';
      case 'MENTORING': return 'Менторство';
      default: return type;
    }
  };
  
  const getRelationTypeColor = (type: string): 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' => {
    switch(type) {
      case 'ADMINISTRATIVE': return 'success';
      case 'FUNCTIONAL': return 'primary';
      case 'PROJECT': return 'warning';
      case 'TERRITORIAL': return 'secondary';
      case 'MENTORING': return 'info';
      default: return 'primary';
    }
  };
  
  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Визуализация организационной структуры
        </Typography>
        
        <Tabs value={mode} onChange={handleModeChange} sx={{ mb: 4 }}>
          <Tab label="Иерархическая" value="hierarchical" />
          <Tab label="Сетевая" value="network" />
          <Tab label="Матричная" value="matrix" />
        </Tabs>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Настройки визуализации
              </Typography>
              
              {mode === 'hierarchical' && (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="entity-type-label">Тип структуры</InputLabel>
                  <Select
                    labelId="entity-type-label"
                    value={selectedEntity}
                    label="Тип структуры"
                    onChange={handleEntityTypeChange}
                  >
                    <MenuItem value="legal">Юридические лица</MenuItem>
                    <MenuItem value="location">Физические локации</MenuItem>
                    <MenuItem value="division">Структура подразделений</MenuItem>
                  </Select>
                </FormControl>
              )}
              
              {(mode === 'network' || mode === 'matrix') && (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="relation-type-label">Тип связей</InputLabel>
                  <Select
                    labelId="relation-type-label"
                    value={selectedRelationType}
                    label="Тип связей"
                    onChange={handleRelationTypeChange}
                  >
                    <MenuItem value="all">Все связи</MenuItem>
                    <MenuItem value="ADMINISTRATIVE">Административные</MenuItem>
                    <MenuItem value="FUNCTIONAL">Функциональные</MenuItem>
                    <MenuItem value="PROJECT">Проектные</MenuItem>
                    <MenuItem value="TERRITORIAL">Территориальные</MenuItem>
                    <MenuItem value="MENTORING">Менторство</MenuItem>
                  </Select>
                </FormControl>
              )}
              
              <Button 
                variant="outlined" 
                color="primary" 
                fullWidth
                onClick={() => setSelectedNodeId(null)}
                disabled={selectedNodeId === null}
              >
                Сбросить выделение
              </Button>
            </Paper>
            
            {selectedNodeId && getSelectedNodeDetails()}
            
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Легенда
              </Typography>
              
              {mode === 'hierarchical' && (
                <>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box component="span" sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#4caf50', display: 'inline-block', mr: 1 }} />
                    Активный элемент
                  </Typography>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box component="span" sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#f44336', display: 'inline-block', mr: 1 }} />
                    Неактивный элемент
                  </Typography>
                </>
              )}
              
              {mode === 'network' && (
                <>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box component="span" sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#f44336', display: 'inline-block', mr: 1 }} />
                    Уровень 1 (Высшее руководство)
                  </Typography>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box component="span" sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ff9800', display: 'inline-block', mr: 1 }} />
                    Уровень 2 (Руководители департаментов)
                  </Typography>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box component="span" sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#4caf50', display: 'inline-block', mr: 1 }} />
                    Уровень 3 (Сотрудники)
                  </Typography>
                  <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Типы связей:</Typography>
                  {['ADMINISTRATIVE', 'FUNCTIONAL', 'PROJECT', 'TERRITORIAL', 'MENTORING'].map(type => (
                    <Typography key={type} variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Chip 
                        label={getRelationTypeLabel(type)} 
                        size="small" 
                        color={getRelationTypeColor(type)}
                        sx={{ mr: 1 }}
                      />
                    </Typography>
                  ))}
                </>
              )}
              
              {mode === 'matrix' && (
                <>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box component="span" sx={{ width: 12, height: 12, bgcolor: '#4caf50', display: 'inline-block', mr: 1 }} />
                    Наличие связи
                  </Typography>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box component="span" sx={{ width: 12, height: 12, bgcolor: '#f5f5f5', display: 'inline-block', mr: 1 }} />
                    Отсутствие связи
                  </Typography>
                </>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={9}>
            <Paper sx={{ p: 2, height: 650, overflow: 'auto' }}>
              {mode === 'hierarchical' && (
                <svg ref={hierarchyChartRef} width="100%" height="600"></svg>
              )}
              
              {mode === 'network' && (
                <svg ref={networkChartRef} width="100%" height="600"></svg>
              )}
              
              {mode === 'matrix' && (
                <svg ref={matrixChartRef} width="100%" height="600"></svg>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default OrganizationVisualizationPage;
