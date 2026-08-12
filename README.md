# Formulario de actualización de datos — FARES TAIE

Versión propia (HTML/CSS/JS, sin frameworks) del formulario de Google Forms
de alta/actualización de datos de clientes, pensada para publicarse en
GitHub Pages. Las respuestas se guardan en tu Google Sheet a través de un
script de Google Apps Script.

No necesitás backend ni hosting pago: **GitHub Pages sirve el sitio gratis**
y **Apps Script recibe los datos gratis**.

## Estructura del proyecto

```
formulario-fares-taie/
├── index.html            → el formulario (3 pasos)
├── assets/
│   ├── style.css
│   ├── script.js
│   └── config.js         → acá va la URL de tu Apps Script
├── apps-script/
│   └── Code.gs            → pegar en el editor de Apps Script de tu Sheet
└── README.md
```

## 1. Publicar el Apps Script

1. Abrí tu Google Sheet: `https://docs.google.com/spreadsheets/d/1SdYBwIPto-qnDGWm7SGrQfXSH-TzUWmg1H-uqEFoaPU/edit`
2. Menú **Extensiones → Apps Script**.
3. Borrá el contenido de `Código.gs` (o `Code.gs`) que aparece por defecto y
   pegá el contenido de `apps-script/Code.gs` de este proyecto.
4. Guardá (ícono de disquete o `Ctrl+S`).
5. (Opcional pero recomendado) Arriba, elegí la función `test` en el
   desplegable y tocá **Ejecutar** ▶️. La primera vez te va a pedir
   autorización — es tu propio script sobre tu propia planilla, es seguro
   aceptar. Después revisá la planilla: debería haberse creado una hoja
   **"Respuestas"** con encabezados y una fila de prueba. Podés borrar esa
   fila de prueba.
6. Arriba a la derecha, botón **Implementar → Nueva implementación**.
7. En "Seleccionar tipo", el ícono del engranaje → **Aplicación web**.
8. Configurá:
   - **Ejecutar como:** Yo (tu usuario)
   - **Quién tiene acceso:** Cualquier usuario
9. Tocá **Implementar**, autorizá de nuevo si lo pide, y copiá la
   **URL de la aplicación web** que te da (termina en `/exec`).

> Cada vez que modifiques `Code.gs` tenés que crear una **nueva versión** de
> la implementación (Implementar → Administrar implementaciones → ✏️ →
> Versión "Nueva versión" → Implementar) para que los cambios se reflejen
> en la URL pública.

## 2. Configurar el formulario con esa URL

Abrí `assets/config.js` y reemplazá:

```js
window.APPS_SCRIPT_URL = "PEGAR_URL_DEL_APPS_SCRIPT_ACA";
```

por la URL que copiaste en el paso anterior, por ejemplo:

```js
window.APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycb.../exec";
```

## 3. Publicar en GitHub Pages

1. Creá un repositorio nuevo en GitHub (puede ser público o privado — Pages
   funciona en ambos casos si tenés un plan que lo permita; si es público
   no hay restricción).
2. Subí el contenido de esta carpeta (`index.html`, `assets/`, etc.) a la
   raíz del repo. Por ejemplo, desde la terminal:

   ```bash
   git init
   git add .
   git commit -m "Formulario de actualización de datos"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
   git push -u origin main
   ```

   (También podés arrastrar los archivos directamente desde la web de
   GitHub con "Add file → Upload files".)

3. En el repo: **Settings → Pages**.
4. En "Source" elegí **Deploy from a branch**, rama `main`, carpeta `/root`.
5. Guardá. GitHub te va a dar una URL del tipo:
   `https://TU-USUARIO.github.io/TU-REPO/`
   (puede tardar 1-2 minutos en activarse la primera vez).

Esa es la URL que le compartís a los clientes.

## 4. Probar de punta a punta

1. Abrí la URL de GitHub Pages.
2. Completá el formulario con datos de prueba y enviá.
3. Verificá que apareció una fila nueva en la hoja "Respuestas" del Sheet.
4. Si no aparece nada, revisá:
   - Que `config.js` tenga la URL correcta (sin espacios, terminada en `/exec`).
   - Que la implementación de Apps Script tenga acceso **"Cualquier usuario"**.
   - Que hiciste una **nueva versión** después del último cambio en `Code.gs`.

## Notas técnicas

- El envío usa `fetch(..., { mode: 'no-cors' })` porque Apps Script no
  agrega headers CORS a su respuesta. Esto significa que el formulario no
  puede leer la respuesta del script, pero el dato **sí llega y se guarda**
  igual — por eso se muestra la pantalla de éxito apenas el navegador
  termina de enviar la petición, sin esperar confirmación del servidor.
  Es el mismo patrón que usan la mayoría de los formularios "Google Sheets
  como backend".
- El "Folio" (ej. `FT-20260812-4821`) se genera en el navegador solo para
  que el cliente tenga una referencia visual y quede guardado en la planilla
  como columna — no es un identificador con garantía de unicidad estricta,
  pero alcanza para uso administrativo.
- Los campos obligatorios y el resto de las validaciones replican
  exactamente los del formulario de Google Forms original.
- Si más adelante querés que además llegue un mail de aviso a facturación
  por cada respuesta nueva, se agrega fácil en `Code.gs` con
  `MailApp.sendEmail(...)` dentro de `doPost` — avisame y lo sumo.
