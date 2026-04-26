# AutoService SPA — Lab 3

Single Page Application для управління персоналом автосервісу.

**Стек:** React 18 · React Router v6 · Django REST Framework · Basic Auth

---

## Запуск

### 1. Backend

```bash
# Активуй venv і запусти Django
python manage.py runserver 8000
```

> Переконайся що є Django-користувач. Якщо немає — створи:
> ```bash
> python manage.py createsuperuser
> ```

### 2. Frontend

```bash
cd spa
npm install
npm start
```

Відкриється `http://localhost:3000`. Запити до `/api/*` автоматично проксіюються на `http://127.0.0.1:8000`.

---

## Авторизація

Використовується **HTTP Basic Authentication** — логін і пароль Django-користувача.

- Логін `admin` → роль **admin** (повний CRUD)
- Будь-який інший Django-юзер → роль **manager** (тільки перегляд)

---

## Структура

```
spa/
├── public/index.html
└── src/
    ├── services/api.js          # всі fetch-запити до backend
    ├── context/AuthContext.jsx  # стан авторизації (localStorage)
    ├── hooks/useEmployees.js    # завантаження і CRUD працівників
    ├── components/
    │   ├── PrivateRoute.jsx     # захист маршрутів
    │   ├── Layout.jsx           # сторінка з navbar
    │   ├── Navbar.jsx           # навігація і кнопка виходу
    │   └── EmployeeModal.jsx    # форма створення / редагування
    ├── pages/
    │   ├── LoginPage.jsx        # сторінка входу
    │   └── UsersPage.jsx        # список і CRUD працівників
    ├── styles/index.css
    └── App.jsx                  # маршрутизація
```

---

## Функціонал

| Функція | Admin | Manager |
|---------|-------|---------|
| Перегляд списку | ✅ | ✅ |
| Створення | ✅ | ❌ |
| Редагування | ✅ | ❌ |
| Видалення | ✅ | ❌ |

- Після F5 на `/users` — сторінка залишається (BrowserRouter)
- Немає помилок і логів у консолі
- Код відповідає Airbnb style guide
