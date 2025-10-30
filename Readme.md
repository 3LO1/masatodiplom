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

SQL запросы:

 Аутентификация (authController.js)
sql
-- Поиск пользователя по email
SELECT * FROM users WHERE email = $1

-- Регистрация нового пользователя  
INSERT INTO users (full_name, email, password) VALUES ($1, $2, $3)

Помещения (roomController.js)
sql
-- Получение всех помещений с информацией об арендаторах
SELECT r.*, req.start_date, req.end_date, u.full_name AS tenant_name, u.email AS tenant_email
FROM rooms r
LEFT JOIN requests req ON r.id = req.room_id AND req.status = 'approved'
LEFT JOIN users u ON req.user_id = u.id

-- Создание помещения
INSERT INTO rooms (room_number, floor, area, price, type, status, photo_url) 
VALUES ($1, $2, $3, $4, $5, 'available', $6) 
RETURNING *

-- Обновление помещения
UPDATE rooms 
SET room_number = $1, floor = $2, area = $3, price = $4, type = $5, photo_url = $6
WHERE id = $7 
RETURNING *

-- Удаление помещения
DELETE FROM rooms WHERE id = $1 RETURNING *

Заявки (requestController.js)
sql
-- Создание заявки
INSERT INTO requests (user_id, room_id, start_date, end_date, comment, iin)
VALUES ($1, $2, $3, $4, $5, $6) 
RETURNING *

-- Получение заявок пользователя
SELECT r.*, rm.room_number, rm.floor, rm.area, rm.price, rm.type as room_type
FROM requests r
JOIN rooms rm ON r.room_id = rm.id
WHERE r.user_id = $1 
ORDER BY r.id DESC

-- Получение всех заявок для администратора
SELECT r.*, u.email as user_email, u.full_name as user_full_name,
       rm.room_number, rm.floor, rm.area, rm.price, rm.type as room_type
FROM requests r
JOIN users u ON r.user_id = u.id
JOIN rooms rm ON r.room_id = rm.id
ORDER BY r.id DESC

-- Одобрение заявки
UPDATE requests SET status = 'approved' WHERE id = $1

-- Отклонение заявки  
UPDATE requests SET status = 'rejected' WHERE id = $1 RETURNING user_id, room_id

Платежи (paymentController.js)
sql
-- Создание платежа
INSERT INTO payments (request_id, amount) VALUES ($1, $2)

-- Получение платежей пользователя
SELECT p.*, r.room_id, rm.room_number
FROM payments p
JOIN requests r ON p.request_id = r.id
JOIN rooms rm ON r.room_id = rm.id
WHERE r.user_id = $1
ORDER BY p.payment_date DESC

-- Статистика платежей
SELECT 
  EXTRACT(YEAR FROM payment_date)::integer AS year,
  COUNT(*)::integer AS count,
  COALESCE(SUM(amount)::float, 0) AS total_amount
FROM payments
WHERE payment_date IS NOT NULL
GROUP BY year
ORDER BY year

-- Популярность помещений
SELECT 
  r.room_number,
  r.type,
  COUNT(rq.id)::integer AS rental_count,
  COALESCE(SUM(p.amount)::float, 0) AS total_revenue
FROM requests rq
JOIN rooms r ON rq.room_id = r.id
LEFT JOIN payments p ON p.request_id = rq.id
WHERE rq.status = 'approved'
GROUP BY r.room_number, r.type
ORDER BY rental_count DESC

Административные функции (adminController.js)
sql
-- Получение всех заявок для админа
SELECT rr.*, u.email AS user_email, u.full_name AS user_full_name,
       r.number AS room_number, r.floor, r.area, r.price, r.type AS room_type
FROM requests rr
JOIN users u ON rr.user_id = u.id
JOIN rooms r ON rr.room_id = r.id
ORDER BY rr.created_at DESC

-- Данные для налогового отчета
SELECT 
  u.full_name, 
  r.iin,
  rm.room_number, 
  rm.area, 
  rm.price
FROM requests r
JOIN users u ON r.user_id = u.id
JOIN rooms rm ON r.room_id = rm.id
WHERE r.status = 'approved'
AND (r.end_date IS NULL OR r.end_date >= CURRENT_DATE)

-- Сохранение отчета
INSERT INTO tax_reports (file_url, generated_by) VALUES ($1, $2)

Договоры (requestController.js - generateContract)
sql
-- Данные для генерации договора
SELECT r.*, u.full_name, u.email, rm.room_number, rm.floor, rm.area, rm.price, rm.type
FROM requests r
JOIN users u ON r.user_id = u.id
JOIN rooms rm ON r.room_id = rm.id
WHERE r.id = $1 AND r.status = 'approved'

-- Сохранение договора
INSERT INTO contracts (user_id, request_id, file_url) VALUES ($1, $2, $3)

Уведомления (notificationRoutes.js)
sql
-- Получение уведомлений пользователя
SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC

-- Отметка как прочитанного
UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2

-- Создание уведомления (из requestController.js)
INSERT INTO notifications (user_id, request_id, message)
VALUES ($1, $2, 'Ваша заявка была одобрена')

Пользователи (userRoutes.js)
sql
-- Информация о пользователе
SELECT id, email, full_name FROM users WHERE id = $1


