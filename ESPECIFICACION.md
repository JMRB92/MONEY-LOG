# MONEY LOG v1.02 (revisada) — Especificación técnica

## 1. Objetivo y alcance
PWA local, móvil y escritorio, íntegramente en español, para gestionar finanzas personales sin usuario, nube, sincronización ni conexiones bancarias. Incluye todas las funciones acordadas de la versión gratuita. No hay compras, bloqueos ni mensajes sobre ediciones de pago en la interfaz.

## 2. Arquitectura
- `index.html`: estructura semántica, menú, diálogos de ayuda y formularios, estructura de la PWA.
- `styles.css`: diseño adaptable, modo claro y oscuro, indicadores de presupuesto y paneles.
- `app.js`: estado, cálculos financieros, vistas, navegación, formularios, validaciones, datos, importación y exportación.
- `sw.js`: caché de la versión con enfoque **red primero** para navegación y recursos, caché de respaldo para uso sin conexión. Cache `moneylog-v102-revisada-2`. Registra `updateViaCache: 'none'` y comprueba actualizaciones.
- `manifest.webmanifest` e `icon.svg`: instalación como PWA con alcance relativo compatible con repositorios de GitHub Pages.
- Sin dependencias externas, analítica, anuncios, registro ni llamadas a API. HTTPS en GitHub Pages.

## 3. Persistencia y compatibilidad
- Persiste en `localStorage` en la clave **`moneylog_v101`**, deliberadamente sin cambiarla para mantener los datos que guardaron las versiones v1.01 y v1.02.
- Estructura principal: `accounts`, `transactions`, `categories`, `budgets`, `recurring`, `goals`, `settings`.
- `accounts`: `id`, `name`, `opening` (saldo inicial).
- `transactions`: `id`, `type` (`income`, `expense` o `transfer`), `amount`, `date`, `account`, `to` para transferencias, `category`, `note`, `recurringId` cuando corresponda.
- `budgets`: `id`, `category`, `limit`; el límite se aplica a cada nuevo mes, por categoría.
- `recurring`: `id`, `type`, `amount`, `account`, `category`, `note`, `frequency`, `next`, `anchorDay`, `active`; permite pausar y activar reglas. Solo se generan al abrir la aplicación, máximo 120 vencimientos por regla y apertura; evita duplicar el mismo vencimiento.
- `goals`: `id`, `name`, `target`, `saved`, `history` de aportaciones. Los datos nuevos se agregan de forma compatible, sin eliminar los anteriores.
- `settings`: `currency`, `theme`. Cambiar moneda solo afecta a la presentación: no convierte cantidades.
- Los importes se redondean a dos decimales para mitigar errores acumulados de coma flotante. En una versión con contabilidad más exigente convendría almacenar céntimos enteros.

## 4. Reglas financieras
- Saldo de cuenta: apertura + ingresos − gastos − transferencias enviadas + transferencias recibidas.
- Transferencias no cuentan en ingresos ni gastos de los informes.
- Ahorro mensual: ingresos − gastos. Tasa: (ingresos − gastos) / ingresos, si ingresos > 0.
- Gasto por presupuesto: suma de gastos de esa categoría del mes vigente; aviso visual al 80 % y 100 %.
- Metas: seguimiento *independiente*, no altera ninguna cuenta ni genera una transacción bancaria.

## 5. Módulos y experiencia de usuario
1. **Inicio**: cuatro indicadores y ayuda ⓘ, botones rápidos, cuentas, recientes, guía inicial y aviso de presupuestos.
2. **Movimientos**: alta, modificación, eliminación, duplicación, transferencias y filtros por mes, tipo, cuenta, categoría y texto.
3. **Cuentas**: creación, cambios en nombre y saldo inicial, saldo derivado; elimina cuentas solo sin referencias.
4. **Categorías**: etiquetas personalizadas, renombrado en cascada sobre operaciones/reglas/presupuestos; bloquea eliminación mientras existan referencias.
5. **Presupuestos**: límite por categoría y aviso visual verde/amarillo/rojo.
6. **Recurrentes**: reglas semanal/mensual/anual, ejecución al abrir, pausa/reactivación y seguimiento de siguiente fecha.
7. **Metas**: importe objetivo, ahorrado, barras y registro de aportaciones manuales.
8. **Estadísticas**: seis meses, gasto por categorías, tasa de ahorro y comparativa anterior.
9. **Informes**: CSV separado por `;` con UTF-8 BOM, vista de impresión/Guardar como PDF y copia/restauración JSON.
10. **Ajustes**: moneda, claro/oscuro, guía de inicio, copia y borrado con doble confirmación.

Todos los encabezados de sección, tarjetas principales y campos de formulario importantes contienen ayudas ⓘ con explicación de finalidad y modo de uso. La guía siempre está disponible en la cabecera. El apartado «Ediciones» está ausente de la interfaz.

## 6. Validaciones e integridad
- Cantidades positivas para movimientos, presupuestos y metas; transferencia obligatoriamente entre cuentas distintas.
- No permite duplicar presupuestos por categoría ni nombres duplicados de categoría.
- No permite eliminar cuentas o categorías con registros relacionados.
- Restauración de JSON: estructura, cuentas, tipos de movimiento, importes, fechas, referencias entre cuentas, reglas, metas y presupuestos. Confirmación con resumen previo al reemplazo.
- Guarda una copia JSON antes de una restauración o borrado. No existe recuperación automática fuera del dispositivo.
- Salidas HTML escapan contenido aportado por usuario para reducir riesgos de inyección.

## 7. Reserva de funcionalidades para futura separación Gratis / PRO
**Durante v1.02 todo está abierto y es gratis.** Propuesta de reparto, mantenida fuera de la interfaz hasta que el producto tenga un sistema de pago:

| Gratis, manteniendo lo que ya existe | PRO para incorporar en el futuro |
| --- | --- |
| Ingresos, gastos, transferencias ilimitadas | Estadísticas avanzadas, escenarios y previsiones |
| Cuentas, categorías y presupuestos | Importación bancaria CSV asistida |
| Recurrentes y metas de ahorro | Gestión de deudas, préstamos y patrimonio |
| Estadísticas básicas, evolución de 6 meses | Seguimiento avanzado de inversiones |
| Informes CSV/PDF, copias y restauración JSON | Análisis avanzado de gastos y automatizaciones de clasificación |
| Guía y ayudas, personalización, instalación PWA | Informes analíticos adicionales |

Con una aplicación 100 % estática y local, **un desbloqueo de pago solo local no sería seguro**. Antes de cobrar por PRO será necesario decidir una forma legítima de licencias o aceptar expresamente que un desbloqueo local puede eludirse. No hay pasarela, verificación ni claves en esta versión.

## 8. Limitaciones conocidas
- Un mismo dispositivo/navegador es el único almacén de datos; borrar datos del sitio puede eliminar todos los registros. El modo privado puede impedir su persistencia.
- `localStorage` tiene límites de capacidad. No conviene almacenar millones de movimientos sin migrar a IndexedDB.
- PDF mediante cuadro de impresión; no se genera por servidor.
- Service Worker e instalación PWA requieren HTTPS o localhost, pero la página base se puede abrir directamente para uso básico.
- No hay tasas de cambio ni sincronización ni conexión bancaria.
- Los recurrentes no se ejecutan en segundo plano cuando la app está cerrada.
- En algunas plataformas pueden existir limitaciones al instalar PWA con icono SVG; se podría añadir icono PNG en otra actualización.

## 9. Nota de despliegue y caché
Subir **todos** los archivos extraídos del ZIP a la raíz del repositorio (no el ZIP solo). Comprobar que `index.html`, `app.js`, `styles.css` y `sw.js` se han reemplazado. GitHub Pages debe publicar desde la rama `main` o la carpeta elegida. Para escapar de la caché antigua al abrir, acceder a `.../index.html?v=102r2` y recargar. El nuevo SW utilizará red primero para próximas actualizaciones. **No borrar datos del sitio ni restablecer almacenamiento** antes de exportar JSON: eso eliminaría los movimientos guardados.
