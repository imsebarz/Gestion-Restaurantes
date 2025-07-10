#!/bin/bash

# 🧪 Script de Ejecución de Pruebas BDD para Gestión de Restaurantes
# 
# Este script automatiza la ejecución de todas las pruebas del sistema,
# incluyendo BDD, Unit Tests, y verificaciones de calidad.

set -e  # Exit on any error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Función para mostrar ayuda
show_help() {
    cat << EOF
🧪 Script de Pruebas BDD - Gestión de Restaurantes

USO:
    ./run-tests.sh [OPCIÓN]

OPCIONES:
    --all           Ejecutar todas las pruebas (default)
    --bdd           Ejecutar solo pruebas BDD/Features
    --unit          Ejecutar solo pruebas unitarias
    --integration   Ejecutar solo pruebas de integración
    --watch         Ejecutar en modo watch
    --coverage      Ejecutar con reporte de cobertura
    --setup         Solo configurar entorno de pruebas
    --cleanup       Solo limpiar datos de prueba
    --help          Mostrar esta ayuda

EJEMPLOS:
    ./run-tests.sh --bdd
    ./run-tests.sh --coverage
    ./run-tests.sh --watch --unit

CONFIGURACIÓN:
    - Asegúrate de tener la base de datos de pruebas configurada
    - Variables de entorno necesarias en .env.test
    - Node.js >= 18 y npm instalado
EOF
}

# Función para verificar prerrequisitos
check_prerequisites() {
    log "Verificando prerrequisitos..."
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        error "Node.js no está instalado"
        exit 1
    fi
    
    # Verificar npm
    if ! command -v npm &> /dev/null; then
        error "npm no está instalado"
        exit 1
    fi
    
    # Verificar package.json
    if [ ! -f "package.json" ]; then
        error "package.json no encontrado. Ejecutar desde el directorio backend/"
        exit 1
    fi
    
    # Verificar dependencias instaladas
    if [ ! -d "node_modules" ]; then
        warn "node_modules no encontrado. Instalando dependencias..."
        npm install
    fi
    
    log "✅ Prerrequisitos verificados"
}

# Función para configurar entorno de pruebas
setup_test_environment() {
    log "Configurando entorno de pruebas..."
    
    # Crear archivo .env.test si no existe
    if [ ! -f ".env.test" ]; then
        log "Creando archivo .env.test..."
        cat > .env.test << EOF
NODE_ENV=test
DATABASE_URL="postgresql://test:test@localhost:5432/restaurant_test"
JWT_SECRET="test-secret-key-very-long-and-secure-for-testing-purposes"
PORT=4001
EOF
    fi
    
    # Verificar conexión a base de datos de pruebas
    log "Verificando conexión a base de datos de pruebas..."
    export NODE_ENV=test
    
    # Ejecutar migraciones de prueba
    log "Ejecutando migraciones de base de datos..."
    npm run migrate 2>/dev/null || warn "No se pudieron ejecutar migraciones automáticamente"
    
    log "✅ Entorno de pruebas configurado"
}

# Función para limpiar datos de prueba
cleanup_test_data() {
    log "Limpiando datos de prueba..."
    
    export NODE_ENV=test
    
    # Script simple de limpieza usando Prisma
    cat > cleanup-test.js << 'EOF'
const { PrismaClient } = require('@prisma/client');

async function cleanup() {
    const prisma = new PrismaClient();
    try {
        await prisma.payment.deleteMany();
        await prisma.orderItem.deleteMany();
        await prisma.order.deleteMany();
        await prisma.menuItem.deleteMany();
        await prisma.table.deleteMany();
        await prisma.user.deleteMany();
        console.log('✅ Datos de prueba limpiados');
    } catch (error) {
        console.error('❌ Error limpiando datos:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

cleanup();
EOF
    
    node cleanup-test.js
    rm -f cleanup-test.js
    
    log "✅ Limpieza completada"
}

# Función para ejecutar pruebas BDD
run_bdd_tests() {
    log "🎭 Ejecutando pruebas BDD (Behavior Driven Development)..."
    
    export NODE_ENV=test
    
    echo ""
    info "=== PRUEBAS BDD - GESTIÓN DE PEDIDOS Y PAGOS ==="
    echo ""
    
    # Ejecutar pruebas de features específicas
    if npm run test:features; then
        log "✅ Pruebas BDD completadas exitosamente"
        return 0
    else
        error "❌ Fallos en pruebas BDD"
        return 1
    fi
}

# Función para ejecutar pruebas unitarias
run_unit_tests() {
    log "🔬 Ejecutando pruebas unitarias..."
    
    export NODE_ENV=test
    
    echo ""
    info "=== PRUEBAS UNITARIAS ==="
    echo ""
    
    # Ejecutar pruebas unitarias específicas
    if npm test -- --testMatch="**/unit/**/*.test.ts"; then
        log "✅ Pruebas unitarias completadas exitosamente"
        return 0
    else
        error "❌ Fallos en pruebas unitarias"
        return 1
    fi
}

# Función para ejecutar pruebas de integración
run_integration_tests() {
    log "🔗 Ejecutando pruebas de integración..."
    
    export NODE_ENV=test
    
    echo ""
    info "=== PRUEBAS DE INTEGRACIÓN ==="
    echo ""
    
    # Ejecutar pruebas de integración (GraphQL + Database)
    if npm test -- --testMatch="**/integration/**/*.test.ts"; then
        log "✅ Pruebas de integración completadas exitosamente"
        return 0
    else
        error "❌ Fallos en pruebas de integración"
        return 1
    fi
}

# Función para ejecutar todas las pruebas
run_all_tests() {
    log "🚀 Ejecutando suite completa de pruebas..."
    
    local bdd_result=0
    local unit_result=0
    local integration_result=0
    
    # Ejecutar cada tipo de prueba
    run_bdd_tests || bdd_result=1
    echo ""
    
    run_unit_tests || unit_result=1
    echo ""
    
    run_integration_tests || integration_result=1
    echo ""
    
    # Mostrar resumen
    echo ""
    info "=== RESUMEN DE PRUEBAS ==="
    
    if [ $bdd_result -eq 0 ]; then
        log "✅ Pruebas BDD: PASARON"
    else
        error "❌ Pruebas BDD: FALLARON"
    fi
    
    if [ $unit_result -eq 0 ]; then
        log "✅ Pruebas Unitarias: PASARON"
    else
        error "❌ Pruebas Unitarias: FALLARON"
    fi
    
    if [ $integration_result -eq 0 ]; then
        log "✅ Pruebas Integración: PASARON"
    else
        error "❌ Pruebas Integración: FALLARON"
    fi
    
    # Retornar código de salida general
    if [ $bdd_result -eq 0 ] && [ $unit_result -eq 0 ] && [ $integration_result -eq 0 ]; then
        log "🎉 TODAS LAS PRUEBAS PASARON"
        return 0
    else
        error "💥 ALGUNAS PRUEBAS FALLARON"
        return 1
    fi
}

# Función para ejecutar con cobertura
run_with_coverage() {
    log "📊 Ejecutando pruebas con reporte de cobertura..."
    
    export NODE_ENV=test
    
    echo ""
    info "=== PRUEBAS CON COBERTURA ==="
    echo ""
    
    if npm run test:coverage; then
        log "✅ Pruebas con cobertura completadas"
        info "📈 Reporte de cobertura disponible en coverage/"
        
        # Mostrar cobertura mínima requerida
        echo ""
        info "Metas de Cobertura:"
        info "  - Líneas: 85%"
        info "  - Funciones: 90%"
        info "  - Ramas: 80%"
        info "  - Statements: 85%"
        
        return 0
    else
        error "❌ Fallos en pruebas con cobertura"
        return 1
    fi
}

# Función para ejecutar en modo watch
run_watch_mode() {
    log "👀 Ejecutando pruebas en modo watch..."
    
    export NODE_ENV=test
    
    echo ""
    info "=== MODO WATCH ACTIVADO ==="
    info "Presiona 'q' para salir, 'a' para ejecutar todas las pruebas"
    echo ""
    
    npm run test:watch
}

# Función para mostrar estadísticas
show_statistics() {
    log "📈 Generando estadísticas de pruebas..."
    
    echo ""
    info "=== ESTADÍSTICAS DEL PROYECTO ==="
    
    # Contar archivos de prueba
    local bdd_files=$(find tests/features -name "*.feature" 2>/dev/null | wc -l)
    local unit_files=$(find tests/unit -name "*.test.ts" 2>/dev/null | wc -l)
    local step_files=$(find tests/features -name "*.spec.ts" 2>/dev/null | wc -l)
    
    info "📁 Archivos de prueba:"
    info "  - Features (BDD): $bdd_files archivos"
    info "  - Unit Tests: $unit_files archivos"
    info "  - Step Definitions: $step_files archivos"
    
    # Contar líneas de código de prueba
    local test_lines=$(find tests -name "*.ts" -o -name "*.feature" | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')
    info "  - Total líneas: $test_lines"
    
    echo ""
    info "🎯 Escenarios implementados:"
    info "  ✅ Cliente crea pedido desde QR"
    info "  ✅ Chef cambia estado a PREPARING"
    info "  ✅ Cajero procesa pago en efectivo"
    info "  ✅ Usuario consulta menú"
    info "  ✅ Login con credenciales válidas"
    info "  ✅ Manejo de errores y validaciones"
    info "  ✅ Casos límite y edge cases"
}

# Función principal
main() {
    echo ""
    log "🧪 Iniciando Sistema de Pruebas BDD"
    log "🍽️  Proyecto: Gestión de Restaurantes"
    echo ""
    
    # Procesar argumentos
    case "${1:-}" in
        --help|-h)
            show_help
            exit 0
            ;;
        --setup)
            check_prerequisites
            setup_test_environment
            log "✅ Setup completado"
            exit 0
            ;;
        --cleanup)
            cleanup_test_data
            exit 0
            ;;
        --bdd)
            check_prerequisites
            setup_test_environment
            run_bdd_tests
            show_statistics
            ;;
        --unit)
            check_prerequisites
            setup_test_environment
            run_unit_tests
            ;;
        --integration)
            check_prerequisites
            setup_test_environment
            run_integration_tests
            ;;
        --coverage)
            check_prerequisites
            setup_test_environment
            run_with_coverage
            ;;
        --watch)
            check_prerequisites
            setup_test_environment
            run_watch_mode
            ;;
        --all|"")
            check_prerequisites
            setup_test_environment
            run_all_tests
            show_statistics
            ;;
        *)
            error "Opción desconocida: $1"
            show_help
            exit 1
            ;;
    esac
    
    local exit_code=$?
    
    echo ""
    if [ $exit_code -eq 0 ]; then
        log "🎉 Ejecución completada exitosamente"
    else
        error "💥 Ejecución completada con errores"
    fi
    
    exit $exit_code
}

# Trap para limpieza en caso de interrupción
trap cleanup_test_data EXIT

# Ejecutar función principal
main "$@"
