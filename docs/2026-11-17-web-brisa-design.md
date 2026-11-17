# Web de Brisa Pilates Reformer · Diseño

Fecha: 2026-11-17 · Estado: pendiente de aprobación

## Para qué
Prueba didáctica (formación de Vibe Coding) de una web que vende un estudio boutique de Pilates Reformer.
Problema a resolver (pizarra Miro): que los clientes puedan reservar sin que la dueña pierda tiempo.
Lo que buscan los clientes: agilidad.

## Objetivos
- Que quien llegue entienda en segundos qué es Brisa y pida su clase de prueba.
- Reserva mínima: **nombre, teléfono y correo** → llega por email a la dueña, que contacta y cierra la clase.
- Fiel al manual de marca (`Downloads/manual-de-marca-brisa-pilates.md`) y al logo (`Downloads/logo-brisa.svg`).
- Móvil primero.

## Fuera de alcance
- Sistema de reservas con calendario, plazas, bonos o pagos.
- Blog y páginas separadas (método, equipo…): quedan para más adelante.
- Dominio propio y analítica.

## Anti-objetivos (sería un fracaso aunque funcione)
- Tono de presión o de gimnasio ("¡Apúntate YA!").
- Colores, tipografías o estilos fuera del manual.
- Un formulario largo que frene la reserva.

## Enfoques considerados
1. **HTML + CSS + JS sin herramientas** — elegido. Se entiende archivo a archivo (ideal para formación), sin instalar nada, se publica gratis en Netlify Drop.
2. Framework (Astro/React) — descartado: exige Node y añade capas que distraen en una prueba.
3. Artifact de claude.ai — descartado: no es una web real y el envío del formulario a un servicio externo puede bloquearse.

## Decidido
- **Una sola página larga** con estas secciones, en orden:
  1. Cabecera: logo + botón «Reserva tu clase» (fija al hacer scroll).
  2. Hero: *Muévete con calma.* + subtítulo + botones «Reserva tu clase de prueba» / «Descubre el método» + foto.
  3. El método: fuerza · movilidad · bienestar.
  4. Por qué Brisa: grupos de 6 · trato personalizado · espacio tranquilo.
  5. Tu primera clase: cómo es, sin presión.
  6. Clases y precios (horario semanal orientativo + bonos).
  7. Testimonios.
  8. Reserva: formulario nombre · teléfono · correo + casilla de privacidad.
  9. Contacto: WhatsApp, dirección, mapa.
  10. Pie: aviso legal · política de privacidad.
- **Formulario vía Web3Forms**, que envía el email. La clave de acceso la obtiene Elena con su correo; hasta entonces queda un hueco marcado y el formulario muestra la confirmación sin enviar.
- **Mensajes del formulario** del manual: confirmación «¡Listo! Te esperamos…», error «Vaya, falta un dato…».
- **Legal (RGPD):** casilla de consentimiento obligatoria + páginas `privacidad.html` y `aviso-legal.html` con textos base y datos ficticios marcados.
- **Contenido inventado** (precios, horarios, testimonios, dirección, WhatsApp), coherente con el tono del manual.

## Mis decisiones (revisables)
- Archivos: `index.html`, `styles.css`, `main.js`, `assets/logo-brisa.svg`, `privacidad.html`, `aviso-legal.html`, `404.html` («Esta página se ha ido a estirar»).
- Fotos de ejemplo de bancos libres (Unsplash) con luz natural y tonos cálidos, con texto alternativo; bordes de 16 px.
- Mapa: iframe de OpenStreetMap con una dirección ficticia.
- Botón de WhatsApp con enlace `wa.me` a un número ficticio.
- Validación sencilla en el navegador (campos obligatorios, formato de correo y teléfono).
- Animaciones de entrada suaves (fundido 300–500 ms) que respetan `prefers-reduced-motion`.
- Sin modo oscuro: la marca es clara (arena/lino).

## Para quien construya
- Aplicar variables CSS, escala tipográfica, botones, tarjetas, espaciado y onda de marca tal como dice el manual.
- Comprobar en móvil (375 px) y escritorio, y repasar la checklist del apartado 12 del manual antes de dar por terminado.
