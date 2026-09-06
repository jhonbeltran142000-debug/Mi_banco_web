# Sistema Bancario Web

Aplicación web para gestión de préstamos y cartera de clientes.

## Stack Tecnológico
- **Frontend:** React 18 + Vite + Axios + React Router
- **Backend:** Node.js + Express + PostgreSQL
- **PDFs:** pdfkit
- **Auth:** JWT + bcryptjs

## Requisitos
- Node.js 18+
- PostgreSQL 14+
- npm o yarn

## Instalación

### 1. Base de datos
```sql
-- Crear la base de datos
CREATE DATABASE banco_oficial_produccion;

-- Ejecutar el esquema
\i backend/schema.sql

-- Ejecutar el seed (usuario admin)
\i backend/seed.sql
```

### 2. Backend
```bash
cd backend
npm install
# Configurar .env con tus datos de PostgreSQL
npm run dev
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

## Credenciales por defecto
- **Usuario:** admin
- **Contraseña:** 123456

## Funcionalidades
- Gestión de clientes (registro, búsqueda, ocultar)
- Simulador financiero (Bancario y Gota a Gota)
- Desembolso de créditos
- Registro de pagos de cuotas
- Generación de PDFs (Pagaré, Recibo, Cierre de Caja)
- Envío de recordatorios por WhatsApp
- Dashboard con métricas de cartera
- Sistema de scoring crediticio

## Estructura del Proyecto
```
banco-web/
├── backend/
│   ├── src/
│   │   ├── config/       # Conexión a PostgreSQL
│   │   ├── middleware/    # JWT auth middleware
│   │   ├── routes/       # API endpoints
│   │   └── utils/        # Generación PDF, scoring
│   ├── schema.sql        # Esquema de BD
│   ├── seed.sql          # Datos iniciales
│   └── .env              # Variables de entorno
├── frontend/
│   ├── src/
│   │   ├── components/   # Componentes React
│   │   ├── context/      # Auth context
│   │   └── services/     # API axios
│   └── vite.config.js
└── README.md
```
