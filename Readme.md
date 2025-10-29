# 🏢 MASATO - Система аренды помещений

![React](https://img.shields.io/badge/React-18.2.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)
![JWT](https://img.shields.io/badge/JWT-Authentication-orange)

Веб-приложение для управления арендой офисных помещений, студий и апартаментов с полным циклом обработки заявок, генерацией договоров и системой платежей.

## Возможности

###  Для арендаторов
-  Просмотр каталога помещений с фильтрацией
-  Подача заявок на аренду
-  Просмотр статуса заявок
-  Оплата аренды онлайн
-  Личный кабинет с историей
-  Система уведомлений

###  Для администраторов
-  Полное управление помещениями (CRUD)
-  Модерация заявок (одобрение/отклонение)
-  Автоматическая генерация договоров PDF
-  Финансовая аналитика и отчеты
-  Визуальная статистика доходов
-  Управление арендаторами

## Технологии

### Backend
- **Node.js** + **Express.js** - серверная платформа
- **PostgreSQL** - реляционная база данных
- **JWT** - аутентификация и авторизация
- **bcrypt** - хеширование паролей
- **PDFKit** - генерация PDF документов
- **CORS** - межсайтовые запросы

### Frontend
- **React 18** - пользовательский интерфейс
- **React Router** - навигация
- **Axios** - HTTP клиент
- **Recharts** - визуализация данных
- **Context API** - управление состоянием

##  Быстрый старт

### Предварительные требования
- Node.js 16+
- PostgreSQL 12+
- npm или yarn

Структура проекта
masato-rental-system/
├── 📁 backend/
│   ├── 📁 controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── paymentController.js
│   │   ├── requestController.js
│   │   └── roomController.js
│   ├── 📁 middleware/
│   │   ├── adminMiddleware.js
│   │   └── authMiddleware.js
│   ├── 📁 routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── contractRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── requestRoutes.js
│   │   ├── roomRoutes.js
│   │   └── userRoutes.js
│   ├── 📁 utils/
│   │   ├── generateContract.js
│   │   └── generateTaxReport.js
│   ├── 📁 uploads/
│   │   ├── 📁 contracts/
│   │   └── 📁 tax_reports/
│   ├── 📁 fonts/
│   │   └── DejaVuSans.ttf
│   ├── server.js
│   ├── db.js
│   ├── package.json
│   └── .env
│
├── 📁 frontend/
│   ├── 📁 public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── 📁 src/
│   │   ├── 📁 components/
│   │   │   ├── Navbar.js
│   │   │   ├── ProtectedRoute.js
│   │   │   ├── AddRoomForm.js
│   │   │   └── EditRoomForm.js
│   │   ├── 📁 pages/
│   │   │   ├── LoginPage.js
│   │   │   ├── RegisterPage.js
│   │   │   ├── RoomsPage.js
│   │   │   ├── RequestFormPage.js
│   │   │   ├── RequestsPage.js
│   │   │   ├── AdminRequestsPage.js
│   │   │   ├── AdminAnalyticsPage.js
│   │   │   └── UserProfilePage.js
│   │   ├── 📁 context/
│   │   │   └── AuthContext.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── package-lock.json
│
├── 📁 database/
│   └── schema.sql

API Endpoint

Аутентификация
POST /api/auth/register - Регистрация пользователя
POST /api/auth/login - Вход в систему

Помещения
GET /api/rooms - Получить все помещения
POST /api/rooms - Создать помещение (admin only)
PUT /api/rooms/:id - Обновить помещение (admin only)
DELETE /api/rooms/:id - Удалить помещение (admin only)

Заявки
POST /api/requests - Подать заявку на аренду
GET /api/requests - Получить мои заявки
GET /api/requests/all - Получить все заявки (admin only)
POST /api/requests/:id/approve - Одобрить заявку (admin only)
POST /api/requests/:id/reject - Отклонить заявку (admin only)

Договоры и платежи
POST /api/requests/:id/generate-contract - Генерация договора (admin only)
POST /api/payments - Создать платеж
GET /api/payments - Получить мои платежи
GET /api/payments/stats - Статистика платежей (admin only)

Административные функции
POST /api/admin/generate-tax-report - Генерация налогового отчета (admin only)

 Функциональные модули
 Управление помещениями
Каталог с фильтрацией по этажу, площади, цене, типу
Статусы доступности в реальном времени
Фотографии и детальная информация о каждом помещении
Автоматическое обновление статусов при истечении срока аренды

 Система заявок
Многоэтапный процесс подачи заявки с валидацией
Проверка ИИН (12 цифр)
Автоматический расчет стоимости аренды
Уведомления о смене статуса заявки

 Договорная система
Автоматическая генерация PDF договоров
Юридически корректные шаблоны на русском языке
Хранение истории договоров
Скачивание готовых договоров

 Платежная система
Онлайн оплата аренды с выбором периода
Гибкая система периодов оплаты (помесячно)
История транзакций и квитанций
Интеграция с бухгалтерской отчетностью

Аналитика (admin)
Визуальные отчеты доходов по годам
Статистика популярности помещений
Налоговые отчеты с автоматической генерацией PDF
Расчет чистой прибыли с учетом налогов
