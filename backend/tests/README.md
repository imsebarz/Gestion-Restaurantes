# 🧪 Pruebas BDD - Gestión de Pedidos y Pagos

Este directorio contiene la implementación completa de pruebas BDD (Behavior Driven Development) para el sistema de gestión de restaurantes.

## 📋 Estructura del Proyecto de Pruebas

```
tests/
├── features/                          # Archivos .feature (Gherkin)
│   ├── gestion-pedidos-pagos.feature         # Escenarios principales
│   ├── gestion-pedidos-avanzada.feature      # Casos expandidos
│   ├── gestion-pedidos-pagos.feature.spec.ts # Step definitions originales
│   └── gestion-pedidos-avanzada.feature.spec.ts # Step definitions expandidos
├── unit/                              # Pruebas unitarias
│   └── useCases/
│       ├── CreateOrderByQrCode.test.ts           # Tests originales
│       ├── CreateOrderByQrCode.expanded.test.ts  # Tests expandidos
│       ├── UpdateOrderStatus.test.ts
│       ├── UpdateOrderStatus.expanded.test.ts
│       ├── AuthenticateUser.test.ts
│       └── ListMenuItems.test.ts
├── helpers/                           # Utilidades para pruebas
│   └── test-helpers.ts                       # Funciones compartidas
├── setup.ts                          # Configuración global de Jest
├── run-tests.sh                      # Script de ejecución
├── BDD_TEST_PLAN.md                  # Plan de pruebas documentado
└── README.md                         # Este archivo
```

## 🎯 Escenarios de Prueba Implementados

### ✅ Escenarios Core (Funcionalidad Básica)

1. **Cliente crea un pedido desde QR**
   - Escaneo de QR válido
   - Selección de items del menú
   - Creación exitosa del pedido
   - Validación de estado PENDING

2. **Chef cambia estado a PREPARING**
   - Autenticación de staff
   - Actualización de estado del pedido
   - Notificaciones en tiempo real

3. **Cajero procesa un pago en efectivo**
   - Validación de pedido READY
   - Procesamiento de pago
   - Generación de recibo
   - Cambio a estado PAID

4. **Usuario consulta menú**
   - Listado de items disponibles
   - Filtros por precio y disponibilidad
   - Información detallada de productos

5. **Login con credenciales válidas**
   - Autenticación por email/password
   - Generación de JWT
   - Validación de roles

### 🆕 Escenarios Expandidos (Casos Avanzados)

6. **Manejo de errores**
   - QR códigos inválidos
   - Items no disponibles
   - Credenciales incorrectas
   - Transiciones de estado inválidas

7. **Validaciones de negocio**
   - Límites de cantidad por item
   - Montos máximos de pedido
   - Horarios de operación
   - Disponibilidad de mesas

8. **Autorización por roles**
   - Permisos por tipo de usuario
   - Acceso a operaciones específicas
   - Protección de datos sensibles

9. **Casos límite**
   - Concurrencia en pedidos
   - Fallos de base de datos
   - Timeouts de red
   - Volúmenes altos de datos

## 🚀 Comandos de Ejecución

### Ejecución Rápida
```bash
# Ejecutar todas las pruebas
./tests/run-tests.sh

# Ejecutar solo pruebas BDD
./tests/run-tests.sh --bdd

# Ejecutar solo pruebas unitarias
./tests/run-tests.sh --unit
```

### Ejecución con Opciones
```bash
# Ejecutar con cobertura
./tests/run-tests.sh --coverage

# Ejecutar en modo watch
./tests/run-tests.sh --watch

# Solo configurar entorno
./tests/run-tests.sh --setup

# Limpiar datos de prueba
./tests/run-tests.sh --cleanup
```

### Ejecución con npm
```bash
# Todas las pruebas
npm test

# Solo pruebas BDD
npm run test:features

# Con cobertura
npm run test:coverage

# En modo watch
npm run test:watch
```

## 📊 Métricas de Calidad

### Objetivos de Cobertura
- **Líneas**: 85% mínimo
- **Funciones**: 90% mínimo
- **Ramas**: 80% mínimo
- **Statements**: 85% mínimo

### Performance
- **Tiempo máximo por test**: 30 segundos
- **Respuesta GraphQL**: < 2 segundos
- **Query de DB**: < 1 segundo

### Confiabilidad
- **Success rate en CI/CD**: 99.9%
- **Flaky test tolerance**: < 1%
- **Isolation**: 100% entre tests

## 🔧 Configuración

### Variables de Entorno
```bash
# Copiar configuración de pruebas
cp .env.test.example .env.test

# Configurar base de datos de pruebas
DATABASE_URL="postgresql://test:test@localhost:5432/restaurant_test"
```

### Base de Datos de Pruebas
```bash
# Crear base de datos
createdb restaurant_test

# Ejecutar migraciones
npm run migrate

# Seed con datos de prueba (opcional)
npm run seed
```

### Dependencias
```bash
# Instalar dependencias
npm install

# Dependencias específicas para pruebas
npm install --save-dev jest jest-cucumber supertest @types/supertest
```

## 📝 Escribir Nuevas Pruebas

### 1. Crear Feature File (.feature)
```gherkin
Feature: Nueva Funcionalidad

  Background:
    Given el sistema está inicializado

  Scenario: Caso de prueba exitoso
    Given una condición inicial
    When se ejecuta una acción
    Then se verifica el resultado
    And se valida un efecto secundario
```

### 2. Implementar Step Definitions (.feature.spec.ts)
```typescript
import { defineFeature, loadFeature } from 'jest-cucumber';

const feature = loadFeature('./path/to/nueva-funcionalidad.feature');

defineFeature(feature, (test) => {
  test('Caso de prueba exitoso', ({ given, when, then, and }) => {
    given('una condición inicial', () => {
      // Setup del test
    });

    when('se ejecuta una acción', async () => {
      // Acción a probar
    });

    then('se verifica el resultado', () => {
      // Assertions principales
    });

    and('se valida un efecto secundario', () => {
      // Assertions adicionales
    });
  });
});
```

### 3. Crear Unit Tests Complementarios
```typescript
describe('Nueva Funcionalidad - Unit Tests', () => {
  let mockRepository: jest.Mocked<Repository>;

  beforeEach(() => {
    mockRepository = createMockRepository();
  });

  it('should handle specific business logic', async () => {
    // Given
    const input = createTestInput();
    
    // When
    const result = await useCase.execute(input);
    
    // Then
    expect(result).toBeDefined();
  });
});
```

## 🛠️ Utilidades Disponibles

### Test Helpers
```typescript
import {
  setupTestDatabase,
  cleanupTestDatabase,
  createTestGraphQLClient,
  validateOrder,
  validatePayment,
  measureExecutionTime
} from './helpers/test-helpers';
```

### Mocks y Fixtures
```typescript
import {
  createRepositoryMocks,
  DEFAULT_TEST_USERS,
  DEFAULT_TEST_MENU_ITEMS,
  generateRandomOrderData
} from './helpers/test-helpers';
```

### Validaciones Personalizadas
```typescript
import {
  expectValidTimestamps,
  expectValidPrice,
  expectValidQuantity
} from './helpers/test-helpers';
```

## 🐛 Debugging y Troubleshooting

### Logs Detallados
```bash
# Ejecutar con logs verbose
DEBUG=true ./tests/run-tests.sh --bdd

# Ver logs de base de datos
DEBUG_SQL_QUERIES=true npm test
```

### Problemas Comunes

1. **Database connection errors**
   ```bash
   # Verificar que la DB de pruebas existe
   psql -h localhost -U test -d restaurant_test -c "SELECT 1;"
   ```

2. **Port already in use**
   ```bash
   # Cambiar puerto en .env.test
   PORT=4002
   ```

3. **Timeout errors**
   ```bash
   # Aumentar timeout en jest.config.js
   testTimeout: 60000
   ```

### Debugging Individual Tests
```bash
# Ejecutar test específico
npm test -- --testNamePattern="Cliente crea un pedido"

# Ejecutar con debugger
node --inspect-brk node_modules/.bin/jest --runInBand
```

## 📈 Reporting y Análisis

### Reportes de Cobertura
- **HTML**: `coverage/lcov-report/index.html`
- **JSON**: `coverage/coverage-final.json`
- **LCOV**: `coverage/lcov.info`

### Reportes de Pruebas
- **XML**: `test-results.xml`
- **JSON**: `test-results.json`

### Métricas de Performance
```bash
# Generar reporte de performance
npm run test:performance

# Benchmark de endpoints
npm run test:benchmark
```

## 🤝 Contribuir

### Guidelines
1. **Feature files** en español, usando Gherkin estándar
2. **Step definitions** en TypeScript con tipos estrictos
3. **Unit tests** con cobertura mínima del 85%
4. **Naming** descriptivo y consistente
5. **Cleanup** después de cada test

### Review Checklist
- [ ] Feature file con escenarios claros
- [ ] Step definitions implementadas
- [ ] Unit tests para lógica de negocio
- [ ] Validaciones de entrada/salida
- [ ] Manejo de errores
- [ ] Performance aceptable
- [ ] Documentación actualizada

## 📚 Referencias

- [Jest Documentation](https://jestjs.io/)
- [Jest-Cucumber](https://github.com/bencompton/jest-cucumber)
- [Gherkin Syntax](https://cucumber.io/docs/gherkin/)
- [Behavior Driven Development](https://cucumber.io/docs/bdd/)
- [GraphQL Testing](https://graphql.org/learn/testing/)

---

**¡Happy Testing! 🧪🎉**
