Feature: Gestión Básica de Pedidos

  Background:
    Given el sistema está funcionando correctamente
    And hay mesas disponibles con códigos QR
    And hay elementos de menú disponibles
    And hay usuarios con permisos adecuados

  Scenario: Cliente crea un pedido desde QR con múltiples items
    Given la mesa 7 tiene el código QR "QR123"
    And el elemento de menú "Hamburguesa Clásica" está disponible por 15000 COP
    And el elemento de menú "Papas Fritas" está disponible por 8000 COP
    When el cliente escanea el código QR "QR123"
    And selecciona 2 unidades de "Hamburguesa Clásica"
    And selecciona 1 unidad de "Papas Fritas"
    And confirma el pedido
    Then se debe crear un pedido con estado "PENDING"
    And el pedido debe tener 2 items
    And el total del pedido debe ser 38000 COP

  Scenario: Error al crear pedido con mesa inexistente
    Given no existe mesa con código QR "QR_INEXISTENTE"
    When el cliente escanea el código QR "QR_INEXISTENTE"
    And intenta crear un pedido
    Then debe recibir el error "Table not found"

  Scenario: Error al actualizar estado sin permisos
    Given hay un pedido con ID 1 en estado "PENDING"
    And el usuario "user@test.com" no tiene permisos para gestionar pedidos
    When el usuario intenta actualizar el pedido 1 a estado "PREPARING"
    Then debe recibir el error "User does not have permission to manage orders"
