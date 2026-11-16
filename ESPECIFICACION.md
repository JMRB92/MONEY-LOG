# MONEY LOG v1.02 — Especificación técnica

## Arquitectura
PWA estática, HTML/CSS/JavaScript sin dependencias externas, desplegable en GitHub Pages. Persistencia local mediante localStorage (sin sincronización, servidor ni cuentas). Service Worker cachea recursos estáticos para uso sin conexión tras primera carga. El almacenamiento del navegador puede borrarse: exportar copias JSON.

## Modelo de datos
- `accounts`: `{id,name,opening}`. Saldo derivado de saldo inicial, ingresos, gastos y transferencias.
- `transactions`: `{id,type,amount,date,account,to?,category,note,recurringId?}`. Tipos `income`, `expense`, `transfer`.
- `categories`: cadenas personalizadas.
- `budgets`: `{id,category,limit}`; límites mensuales, evaluados en el mes actual.
- `recurring`: `{id,type,amount,account,category,note,frequency,next}`; frecuencias mensual, semanal y anual.
- `goals`: `{id,name,target,saved}`; seguimiento manual, no se descuenta automáticamente de cuentas.
- `settings`: moneda y tema.

## Funcionalidades incluidas
Dashboard con saldo consolidado, ingresos, gastos y ahorro; alta, edición y borrado de movimientos; transferencias internas que no cuentan como ingreso/gasto; cuentas y saldos; categorías editables; presupuestos; generación automática de recurrentes vencidos al abrir la app; metas; estadísticas mensuales y comparativa de seis meses; búsqueda y filtro; exportación CSV, informe imprimible como PDF, copia y restauración JSON; tema claro/oscuro; PWA.

## Gratis / PRO
La v1.02 tiene todas las funciones desbloqueadas. Se propone conservar en Gratis: movimientos ilimitados, cuentas, categorías, presupuestos, recurrentes, metas, estadísticas básicas, informes PDF, CSV y copias JSON. Reservar para una futura PRO: previsiones y estadísticas avanzadas, importación bancaria CSV, gestión de deudas y patrimonio, análisis avanzado de gastos. La división es una propuesta revisable; no existe pasarela de pago ni verificación de licencia en esta versión.

## Limitaciones y decisiones
- Sin conexión bancaria, nube, usuarios ni sincronización entre dispositivos.
- La restauración reemplaza los datos existentes.
- El informe PDF usa la función de impresión del navegador.
- El saldo de las metas se introduce manualmente.
- Los recurrentes se materializan al abrir la aplicación, con protección contra duplicados por fecha y regla; se procesan hasta 120 vencimientos por regla en una apertura.
- La moneda es un formato visual: cambiarla no convierte importes.
- localStorage tiene límites de capacidad y depende del navegador; para bases de datos muy grandes se recomienda migrar a IndexedDB.
- La PWA requiere HTTPS (GitHub Pages) o localhost para service worker. Abrir index.html directamente permite probar la mayoría de funciones, pero no instala la PWA.

## Cambios v1.02
- Eliminada la tarjeta de Ediciones de Ajustes.
- Botones de información contextual en los apartados y paneles principales.
- Ayudas accesibles, con cierre por botón, Escape o fuera del diálogo.
