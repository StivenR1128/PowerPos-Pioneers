markdown# PowerPOS Pioneers 🍔

Sistema de gestión gastronómica empresarial moderno, escalable y en tiempo real.

## ¿Qué es PowerPOS Pioneers?

Plataforma SaaS multiempresa diseñada para restaurantes, food trucks, cafeterías, panaderías y cualquier negocio gastronómico. Permite controlar completamente la operación desde cualquier lugar en tiempo real.

## Módulos implementados

- ✅ Sistema POS Web — ventas rápidas con exclusiones de ingredientes
- ✅ KDS Cocina — pantalla en tiempo real para cocineros
- ✅ Dashboard administrativo — métricas y control de pedidos
- ✅ Gestión de productos y categorías
- ✅ Inventario inteligente — descuento automático por receta
- ✅ Autenticación JWT con roles
- ✅ Arquitectura multiempresa

## Roles del sistema

| Rol | Acceso |
|-----|--------|
| SUPERADMIN | Gestión global de empresas |
| ADMIN_EMPRESA | Dashboard, POS, Cocina, Productos |
| GERENTE | Dashboard, reportes |
| CAJERO | POS — registro de pedidos |
| COCINERO | KDS — pantalla de cocina |

## Stack tecnológico

### Backend
- NestJS + TypeScript
- PostgreSQL + Prisma ORM
- JWT + Passport
- Redis
- Docker

### Frontend
- Next.js 16 + TypeScript
- Tailwind CSS
- Zustand
- Axios

## Requisitos previos

- Node.js 20+
- Docker Desktop
- npm

## Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/PowerPos-Pioneers.git
cd PowerPos-Pioneers
```

### 2. Levantar base de datos

```bash
docker-compose up -d
```

### 3. Configurar el backend

```bash
cd api
npm install
```

Crea el archivo `.env` en la carpeta `api`:

```env
DATABASE_URL="postgresql://powerpos:powerpos123@localhost:5432/powerpos_dev?schema=public"
JWT_SECRET="powerpos_jwt_super_secreto_2024"
```

```bash
npx prisma migrate deploy
npx prisma db seed
```

Iniciar el servidor:

```bash
npm run start:dev
```

El backend corre en `http://localhost:3000`

### 4. Configurar el frontend

```bash
cd web
npm install
npm run dev
```

El frontend corre en `http://localhost:3001`

## Usuarios de prueba

| Usuario | Email | Password | Rol |
|---------|-------|----------|-----|
| Juan Carlos López | juan@donjuancho.com | Admin123* | ADMIN_EMPRESA |
| María Cocinera | maria@donjuancho.com | Cocina123* | COCINERO |
| Carlos Cajero | carlos@donjuancho.com | Cajero123* | CAJERO |

## Flujo de operación

1. **Cajero** inicia sesión → va al POS → registra pedido con exclusiones de ingredientes
2. **Pedido** aparece en cocina automáticamente en tiempo real
3. **Cocinero** ve exclusiones resaltadas en rojo → prepara → marca como listo
4. **Admin** monitorea todo desde el dashboard en tiempo real

## Estructura del proyecto
PowerPos-Pioneers/

├── api/                    # Backend NestJS

│   ├── src/

│   │   ├── auth/           # Autenticación JWT

│   │   ├── categorias/     # Gestión de categorías

│   │   ├── pedidos/        # Sistema POS

│   │   ├── productos/      # Gestión de productos

│   │   ├── prisma/         # Conexión base de datos

│   │   ├── sucursales/     # Gestión de sucursales

│   │   └── usuarios/       # Gestión de usuarios

│   └── prisma/

│       ├── schema.prisma   # Modelo de datos

│       └── seed.ts         # Datos de prueba

├── web/                    # Frontend Next.js

│   └── app/

│       ├── login/          # Pantalla de login

│       ├── pos/            # Sistema POS

│       ├── cocina/         # KDS Cocina

│       ├── dashboard/      # Panel administrativo

│       └── productos/      # Gestión de productos

└── docker-compose.yml      # PostgreSQL + Redis

## Características destacadas

- **Exclusiones de ingredientes** — el cajero puede marcar qué ingredientes no quiere el cliente en cada producto
- **Inventario automático** — al registrar un pedido se descuentan los ingredientes usados respetando las exclusiones
- **Multirol** — cada usuario ve solo lo que necesita según su rol
- **Tiempo real** — cocina y dashboard se actualizan automáticamente
- **Multiempresa** — arquitectura preparada para vender como SaaS a múltiples negocios

## Desarrollado por

PowerPOS Pioneers Team — 2026