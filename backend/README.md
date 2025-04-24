# Proyecto Restaurantes – Backend

Este repositorio contiene el backend mínimo para:
- Autenticación/Autorización (signup, login, JWT)  
- Listar menú, crear pedidos, procesar pagos  
- API GraphQL con Node.js + Express + Prisma + PostgreSQL  

## Cómo arrancar

1. Copiar `backend/prisma/.env.example` a `backend/prisma/.env` y ajustar variables.  
2. `cd backend`  
3. `npm install`  
4. `npx prisma generate`  
5. `npx prisma migrate dev --name init`  
6. `npm run dev`  
