# Brisa Pilates Reformer · Web

Web de una sola página para el estudio Brisa (prueba didáctica de la formación de Vibe Coding).
HTML, CSS y JavaScript sin herramientas extra: no hay nada que instalar.

## Cómo verla en tu ordenador

Abre una terminal en esta carpeta y lanza un servidor local (hace falta Python):

```bash
python -m http.server 8080
```

Después abre <http://localhost:8080> en el navegador.
(Abrir `index.html` con doble clic también funciona, salvo la página 404.)

## Cómo recibir las reservas en tu correo

1. Entra en <https://web3forms.com>, escribe el correo donde quieres recibir las reservas y pulsa **Create Access Key**. Te llega la clave al momento.
2. Abre `index.html`, busca esta línea (en la sección de reserva) y cambia el texto de ejemplo por tu clave:
   ```html
   <input type="hidden" name="access_key" value="PON_AQUI_TU_CLAVE_DE_WEB3FORMS">
   ```
   Al estar en el HTML, el formulario funciona aunque el navegador no ejecute JavaScript.
3. Listo. Cada reserva te llegará con el asunto «Nueva reserva de clase de prueba · Brisa» y el nombre, el teléfono y el correo de la persona.

Mientras no pongas la clave, el formulario funciona en **modo demo**: muestra la confirmación pero no envía nada.

## Cómo publicarla en Vercel

1. Entra en <https://vercel.com/new> e importa este repositorio de GitHub.
2. En **Framework Preset** elige **Other**. Deja vacíos el comando de build y el directorio de salida: la web se sirve tal cual desde la raíz.
3. Pulsa **Deploy**. Cada `push` a `main` vuelve a publicar la web sola.

La página `404.html` se usa sola cuando alguien entra en una dirección que no existe.
El archivo `.nojekyll` es para GitHub Pages: si también la publicas allí, sirve los archivos tal cual.

## Qué hay que cambiar antes de usarla de verdad

Todo lo marcado con `<!-- FICTICIO -->` en el código es inventado:

- **Horario y precios** (`index.html`, sección Clases y precios).
- **Testimonios** (`index.html`, sección Opiniones).
- **Dirección, teléfono, correo y WhatsApp** (`index.html`, contacto y pie de página; el número de WhatsApp está en el enlace `wa.me/34600000000`).
- **Mapa:** cambia las coordenadas del `iframe` de OpenStreetMap por las del estudio.
- **Textos legales** (`privacidad.html`, `aviso-legal.html`): titular, NIF y domicilio. Conviene que los revise una persona experta.
- **Fotos:** son de Unsplash (uso libre). Lo ideal es cambiarlas por fotos reales del estudio con luz natural.

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | La página principal con todas las secciones |
| `styles.css` | Colores, tipografías y estilos del manual de marca |
| `main.js` | Validación y envío del formulario, cabecera y animaciones suaves |
| `privacidad.html`, `aviso-legal.html` | Textos legales de ejemplo |
| `404.html` | «Esta página se ha ido a estirar» |
| `assets/` | Logo y favicon |
| `tests/check_site.py` | Comprobaciones automáticas: `python tests/check_site.py` |
| `tests/form-tests.html` | Pruebas del formulario: ábrela con el servidor local en marcha |
| `docs/` | Diseño y plan de la web |
