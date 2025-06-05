# Frontend Next.js - Sistema de Restaurante

Esta es la versión migrada a Next.js del frontend del sistema de restaurante. Mantiene toda la funcionalidad original del frontend React pero aprovecha las ventajas de Next.js.

## Características

- **Framework**: Next.js 15 con App Router
- **Estilo**: Tailwind CSS para diseño responsivo
- **GraphQL**: Apollo Client para comunicación con el backend
- **TypeScript**: Tipado estático completo
- **Autenticación**: JWT con localStorage
- **Roles**: Soporte para SUPERADMIN, MANAGER y STAFF

## Funcionalidades

### Autenticación
- Login y registro de usuarios
- Botones de acceso rápido para usuarios de prueba
- Manejo de tokens JWT

### Gestión de Menú
- Ver todos los items del menú
- Crear nuevos platos (solo Manager/Admin)
- Eliminar items (solo Manager/Admin)
- Visualización de precios en formato colombiano

### Gestión de Mesas
- Ver todas las mesas del restaurante
- Agregar/eliminar mesas
- Ver pedidos activos por mesa
- Crear pedidos rápidos desde las mesas

### Gestión de Pedidos
- Ver todos los pedidos del sistema
- Cambiar estados de pedidos (Pendiente → Preparando → Listo)
- Procesar pagos
- Vista detallada por mesa y general

## Instalación

1. Asegúrate de que el backend esté corriendo en `http://localhost:4000/graphql`

2. Instala las dependencias:
```bash
npm install
```

3. Ejecuta en modo desarrollo:
```bash
npm run dev
```

4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador

## Scripts Disponibles

- `npm run dev` - Ejecuta en modo desarrollo con Turbopack
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Ejecuta la aplicación en modo producción
- `npm run lint` - Ejecuta el linter de código

## Usuarios de Prueba

Puedes usar estos usuarios pre-configurados para probar la aplicación:

- **Admin**: admin@food360.local / 123456
- **Manager**: manager@food360.local / manager  
- **Staff**: staff@food360.local / staff

## Diferencias con la Versión React

### Ventajas de Next.js
- **Server-Side Rendering (SSR)**: Mejor SEO y performance inicial
- **App Router**: Estructura de rutas más moderna y flexible
- **Optimizaciones automáticas**: Compresión de imágenes, code splitting, etc.
- **Tailwind CSS**: Diseño más moderno y responsivo
- **TypeScript mejorado**: Mejor integración con Next.js

### Estructura de Archivos
```
src/
├── app/
│   ├── layout.tsx          # Layout principal
│   ├── page.tsx           # Página principal
│   └── globals.css        # Estilos globales
├── components/
│   ├── Auth.tsx           # Componente de autenticación
│   └── Dashboard.tsx      # Dashboard principal
├── lib/
│   ├── apollo-client.ts   # Configuración Apollo Client
│   ├── apollo-provider.tsx # Provider para Apollo
│   └── queries.ts         # Queries y mutaciones GraphQL
└── types.ts               # Tipos TypeScript
```

## Configuración del Backend

Esta aplicación requiere que el backend GraphQL esté ejecutándose. Asegúrate de:

1. Tener el backend corriendo en `http://localhost:4000/graphql`
2. La base de datos PostgreSQL configurada
3. Los datos de seed cargados para los usuarios de prueba

## Tecnologías Utilizadas

- **Next.js 15**: Framework React con SSR
- **React 19**: Biblioteca de interfaz de usuario
- **TypeScript**: Superset tipado de JavaScript
- **Tailwind CSS**: Framework de CSS utilitario
- **Apollo Client**: Cliente GraphQL
- **GraphQL**: Lenguaje de consulta para APIs

## Próximos Pasos

Esta migración mantiene toda la funcionalidad del frontend React original. Posibles mejoras futuras:

- Implementar rutas protegidas con middleware de Next.js
- Agregar Server-Side Rendering para mejor SEO
- Implementar cache de Apollo con persistencia
- Agregar Progressive Web App (PWA) capabilities
- Implementar notificaciones en tiempo real
