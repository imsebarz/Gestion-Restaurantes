# 🧪 Plan de Pruebas BDD - Gestión de Pedidos y Pagos

## 📋 Índice
1. [Feature Files (Gherkin)](#feature-files)
2. [Step Definitions](#step-definitions)
3. [Unit Tests](#unit-tests)
4. [Helper Functions](#helper-functions)
5. [Test Data](#test-data)
6. [Configuration](#configuration)

## 🎯 Objetivos del Plan de Pruebas

- **Cobertura completa**: Validar todos los flujos críticos del sistema
- **BDD Testing**: Usar Gherkin para definir comportamientos esperados
- **Unit Testing**: Probar cada caso de uso de forma aislada
- **Integration Testing**: Validar la integración GraphQL + Base de datos
- **Edge Cases**: Manejar errores y casos límite

## 📊 Estructura de Pruebas

### 1. Feature Files (Gherkin)
- `gestion-pedidos-pagos.feature` - Flujos principales
- `gestion-pedidos-edge-cases.feature` - Casos límite
- `autorizacion-seguridad.feature` - Seguridad y autorización

### 2. Step Definitions
- `pedidos.steps.ts` - Pasos relacionados con pedidos
- `pagos.steps.ts` - Pasos relacionados con pagos
- `auth.steps.ts` - Pasos de autenticación
- `menu.steps.ts` - Pasos de gestión de menú

### 3. Unit Tests
- `CreateOrderByQrCode.test.ts`
- `UpdateOrderStatus.test.ts`
- `AuthenticateUser.test.ts`
- `ListMenuItems.test.ts`
- `ProcessPayment.test.ts`

### 4. Helper Functions
- `test-helpers.ts` - Utilidades para pruebas
- `graphql-client.ts` - Cliente GraphQL para pruebas
- `database-setup.ts` - Configuración de base de datos

## 🎭 Escenarios de Prueba

### Core Scenarios (Implementados)
1. ✅ Cliente crea un pedido desde QR
2. ✅ Chef cambia estado a PREPARING
3. ✅ Cajero procesa un pago en efectivo
4. ✅ Usuario consulta menú
5. ✅ Login con credenciales válidas

### Extended Scenarios (Nuevos)
6. 🆕 Manejo de errores en creación de pedidos
7. 🆕 Validaciones de transiciones de estado
8. 🆕 Diferentes métodos de pago
9. 🆕 Gestión de inventario y disponibilidad
10. 🆕 Autorización por roles
11. 🆕 Cancelación de pedidos
12. 🆕 Reportes y métricas

## 🚀 Comandos de Testing

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar solo pruebas BDD
npm run test:features

# Ejecutar pruebas con cobertura
npm run test:coverage

# Ejecutar pruebas en modo watch
npm run test:watch

# Ejecutar pruebas específicas
npm test -- --testNamePattern="Cliente crea un pedido"
```

## 📈 Métricas de Calidad

- **Cobertura mínima**: 85%
- **Tiempo máximo por test**: 30 segundos
- **Performance**: < 2 segundos por operación GraphQL
- **Reliability**: 99.9% success rate en CI/CD

## 🔧 Configuración Adicional

### Variables de Entorno para Testing
```env
NODE_ENV=test
DATABASE_URL="postgresql://test:test@localhost:5432/restaurant_test"
JWT_SECRET="test-secret-key-very-long-and-secure"
```

### Scripts de Setup
- `setup-test-db.sh` - Configurar base de datos de pruebas
- `cleanup-test-data.sh` - Limpiar datos de prueba

## 📝 Convenciones

1. **Naming**: Usar nombres descriptivos en español
2. **Structure**: Agrupar por funcionalidad
3. **Data**: Usar datos consistentes entre pruebas
4. **Cleanup**: Limpiar estado después de cada prueba
5. **Mocking**: Mockear dependencias externas
