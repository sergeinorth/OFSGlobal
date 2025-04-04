# Чек-лист разработки организационной структуры на vis.js

## 1. Базовые компоненты ✅
- [x] Создать базовый компонент `VisNetworkGraph` для визуализации графа
- [x] Настроить типизацию данных для узлов и связей
- [x] Реализовать заглушку для отображения базовой страницы
- [x] Интегрировать vis.js Network с правильной типизацией
- [x] Настроить базовую визуализацию графа

## 2. Структура данных ✅
- [x] Определить модель данных для узлов (EntityNode)
- [x] Определить модель данных для связей (EntityRelation)
- [x] Создать моковые данные для тестирования
- [ ] Разработать API для получения данных структуры
- [ ] Добавить поддержку комментариев к узлам

## 3. Функционал узлов ⏳
- [x] Реализовать стилизацию узлов в кибер-стиле
- [ ] Добавить поддержку аватаров
- [x] Настроить hover-эффекты для узлов
- [x] Добавить обработку кликов и выбора узлов
- [x] Реализовать функционал добавления/удаления узлов
- [x] Добавить поддержку drag-and-drop

## 4. Организация страницы ✅
- [x] Создать страницу `OrganizationStructurePage`
- [x] Реализовать переключение между типами структур (бизнес, юридическая, территориальная)
- [x] Интегрировать URL-параметры для переключения режимов
- [x] Настроить базовый UI страницы в кибер-стиле
- [x] Добавить анимацию загрузки и переходов

## 5. Интерактивность и взаимодействие ✅
- [x] Настроить масштабирование колесиком мыши
- [x] Реализовать навигацию по графу
- [ ] Добавить контекстное меню для узлов
- [ ] Реализовать модальное окно для редактирования узлов
- [x] Настроить создание связей между узлами

## 6. Интеграция с API ⏳
- [ ] Создать сервис для работы с API организационной структуры
- [ ] Реализовать получение данных с сервера
- [ ] Добавить кэширование данных
- [ ] Настроить сохранение изменений через API
- [ ] Реализовать обработку ошибок и повторные запросы

## Статус проекта
- **Базовые компоненты**: 5/5 задач выполнено ✅
- **Структура данных**: 3/5 задач выполнено ✅
- **Функционал узлов**: 5/6 задач выполнено ⏳
- **Организация страницы**: 5/5 задач выполнено ✅
- **Интерактивность**: 3/5 задач выполнено ✅
- **Интеграция с API**: 0/5 задач выполнено ⏳

# Чек-лист миграции с vis.js на React Flow

## Основная информация
- **Библиотека**: React Flow
- **Причина миграции**: Более гибкая кастомизация узлов, лучшая типизация, проще в поддержке
- **Дизайн**: Сохраняем текущий тёмный стиль с цветовыми акцентами для разных типов узлов

## Задачи для реализации

### Базовая настройка
- [ ] Удалить текущую реализацию на vis.js
- [ ] Установить и настроить React Flow (`npm install reactflow`)
- [ ] Создать базовую структуру графа
- [ ] Стилизация узлов и соединений в текущем дизайне

### Узлы и их представление
- [ ] Кастомный компонент узла с разными типами (business, legal, territorial)
- [ ] Отображение имени, должности и руководителя в узле
- [ ] Индикация количества активных комментариев на узле
- [ ] Правильное позиционирование и фиксация узлов
- [ ] Сохранение позиций узлов в localStorage

### Интерактивность
- [ ] Перетаскивание узлов с сохранением позиции
- [ ] Масштабирование и перемещение по графу
- [ ] Подсветка узла при наведении и выборе
- [ ] Двойной клик для открытия карточки сотрудника

### Карточка сотрудника
- [ ] Реализация модального окна карточки при двойном клике
- [ ] Отображение данных сотрудника (имя, должность, руководитель)
- [ ] Белая иконка мусорки с диалогом подтверждения удаления
- [ ] Поле для добавления новых комментариев
- [ ] Отображение комментариев в виде тасклиста с чекбоксами
- [ ] Зачеркивание комментариев при отметке выполнения
- [ ] Сохранение комментариев в localStorage

### Управление графом
- [ ] Кнопка "+" для добавления новых узлов
- [ ] Интерфейс для создания связей между узлами
- [ ] Разные типы связей с визуальным отличием
- [ ] Функционал удаления узлов и связей

### Интеграция с данными
- [ ] Загрузка данных из API/моков
- [ ] Обновление состояния в родительском компоненте
- [ ] Структура данных для комментариев и их статусов
- [ ] Отправка изменений на сервер (или эмуляция)

### Оптимизация
- [ ] Производительность при большом количестве узлов
- [ ] Обработка ошибок и граничных случаев
- [ ] Возможность расширения функционала в будущем

## Дополнительные идеи
- [ ] Мини-карта для навигации по большому графу
- [ ] Фильтрация узлов по типу/должности
- [ ] Анимации для более плавного UX
- [ ] Режим полноэкранного просмотра
- [ ] Экспорт графа в изображение 

Storage as StorageIcon 