# HU 27 - Registro de facturación y pagos

| Campo | Valor |
|-------|-------|
| ID | HU 27 |
| Épica | Reportes y Cumplimiento |
| RF cubierto | RF-004.2 |
| Prioridad | Media |
| Versión | 1.0 |

## Historia de usuario

Yo como administrador quiero generar facturas para las empresas cliente y registrar los pagos que recibo contra cada una, para llevar un control interno de la cartera.

## Criterios de aceptación

- **CA-01:** Solo el rol Administrador accede a facturación, pagos y métodos de pago.
- **CA-02:** El sistema calcula el total de la factura a partir de sus conceptos y el saldo pendiente restando los pagos registrados.
- **CA-03:** No se puede eliminar una factura que ya tiene pagos asociados.

## Tareas técnicas

| Capa | Tarea |
|------|-------|
| Backend | `POST/GET /api/facturas`, `POST/GET /api/detalle-factura` |
| Backend | `POST/GET /api/pagos`, `POST/GET /api/metodos-pago` |
| Frontend | `Facturacion.tsx` — formulario de nueva factura, formulario de registro de pago, tabla de facturas |
| QA | CP-01: Crear factura con un concepto y verificar el total calculado |
| QA | CP-02: Registrar un pago parcial y verificar el saldo pendiente |
| QA | CP-03: Intentar eliminar una factura con pagos → rechazado |

## Notas técnicas

- Este módulo es un libro contable interno (registro manual), no procesa cobros reales — ver RF-004.1 para la integración con pasarelas de pago (PSE, Nequi, Daviplata), que sigue pendiente.
