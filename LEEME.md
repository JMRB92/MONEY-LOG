# MONEY LOG v1.02 — Paquete corregido

## Publicación en GitHub Pages
1. Extraer el ZIP.
2. Copiar a la **raíz del repositorio** los seis archivos: `index.html`, `app.js`, `styles.css`, `sw.js`, `manifest.webmanifest`, `icon.svg`. Los documentos `.md` son opcionales.
3. En GitHub, confirmar y publicar los cambios. Comprobar que la rama usada en **Settings → Pages** es la que acabas de actualizar.
4. Abrir `https://TUUSUARIO.github.io/TUREPOSITORIO/index.html?v=102r2` (cambiar TUUSUARIO y TUREPOSITORIO por los tuyos).
5. En pantalla debe aparecer **MONEY LOG v1.02**, y cada sección debe tener botones redondos **i**. En Ajustes no debe existir «Ediciones».

## Si sigue saliendo la versión antigua
- Comprobar en GitHub que los archivos nuevos se han subido, especialmente `app.js`, `styles.css` y `sw.js`.
- Probar con el enlace con `?v=102r2` de arriba. Después, recarga forzada: `Ctrl+Shift+R` en ordenador.
- Si persiste un Service Worker antiguo, puede desregistrarse desde las herramientas del navegador, apartado Application / Service Workers, **sin borrar el almacenamiento del sitio**.
- **No pulses «Borrar datos del sitio»** ni borres `localStorage`/cookies sin exportar antes una copia JSON, porque allí viven tus datos financieros.

## Principales cambios
- Se corrige el encabezado que seguía mostrando v1.01.
- Desaparece por completo el bloque «Ediciones» de los Ajustes.
- Se implementan ayudas ⓘ en cada sección, panel y campos de formularios.
- Guía inicial disponible desde arriba a la derecha.
- SW versión nueva, red primero, soporte offline y URL de publicación con anticaché.
- Filtros completos, duplicación de movimientos, alertas 80/100 %, aportaciones a metas, pausa/reactivación de recurrentes, comparativa de ahorro y restauración JSON validada.
- Conserva los datos de las anteriores versiones usando la misma clave de almacenamiento: `moneylog_v101`.

## Privacidad y uso
No se envía información a servidores. Todos los datos se almacenan en el navegador de este dispositivo. Usa **Informes → Descargar copia JSON** con regularidad. Las metas no modifican las cuentas y la moneda no se convierte automáticamente.
