# Food Store — Sistema de Pedidos de Comida

# Estudiante: Airalde, Milagros Abril.

# Trabajo Práctico Integrador de **Programación 4** — Tecnicatura Universitaria en Programación a Distancia (UTN).

Aplicación web para la gestión de pedidos de comidas desarrollada con **FastAPI + SQLModel** en el backend (arquitectura en capas con Unit of Work, autenticación con JWT en cookie HttpOnly y autorización por roles) y **React + TypeScript + Tailwind CSS** en el frontend (organizado por features con Axios, TanStack Query, TanStack Form, TanStack Table y Zustand).

## Enlaces

- **Repositorio de GitHub:** https://github.com/MilagrosAi/tpi-food-store
- **Video desmotrativo:** `https://youtu.be/kfOHo3cvoQQ

---

## Requisitos

- **Python** 3.11 a 3.13 *(SQLModel no es compatible con Python 3.14)*
- **Node.js** 20.19 o superior
- **pnpm** 9 o superior
- **PostgreSQL** 15 o superior *(para desarrollo local también se puede usar SQLite cambiando `DATABASE_URL`)*

---

## Variables de entorno

### Backend (`backend/.env`)

Copiar `backend/.env.example` a `backend/.env` y configurar:

| Variable | Descripción | Valor de ejemplo |
| :--- | :--- | :--- |
| `DATABASE_URL` | Conexión a PostgreSQL o SQLite | `postgresql://user:pass@localhost:5432/foodstore_db` *(local: `sqlite:///./foodstore.db`)* |
| `SECRET_KEY` | Clave para firmar el JWT (mínimo 32 caracteres) | `cambiar-esta-clave-de-al-menos-32-caracteres` |
| `ALGORITHM` | Algoritmo de firma JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Expiración del token y de la cookie (minutos) | `30` |
| `FRONTEND_ORIGIN` | Origen permitido en CORS con credenciales | `http://localhost:5173` |

### Frontend (`frontend/.env`)

Copiar `frontend/.env.example` a `frontend/.env` y configurar:

| Variable | Descripción | Valor de ejemplo |
| :--- | :--- | :--- |
| `VITE_API_URL` | URL base de la API REST | `http://localhost:8000/api/v1` |

---

## Instalación y ejecución

### 1. Backend


    cd backend
    python -m venv .venv

    Activar el entorno virtual:

    Windows (PowerShell): .\.venv\Scripts\activate

    Linux / macOS: source .venv/bin/activate

    Instalar dependencias, configurar variables de entorno, cargar datos iniciales e iniciar el servidor:

    pip install -r requirements.txt
    cp .env.example .env
    python -m app.db.seed
    uvicorn app.main:app --reload

    API base: http://localhost:8000/api/v1

    Documentación Swagger UI: http://localhost:8000/docs

    Documentación ReDoc: http://localhost:8000/redoc

2. Frontend
    En una segunda terminal:

    cd frontend
    cp .env.example .env
    pnpm install
    pnpm build
    pnpm dev

    Aplicación web: http://localhost:5173

    Usuario administrador del seed
    El comando python -m app.db.seed es idempotente y carga el usuario administrador, 4 categorías y 10 productos con stock:

    Usuario: admin

    Contraseña: Admin1234!

    Rol: admin

