/* ==========================================================
   Brisa Pilates Reformer · Interacción
   - Validación y envío del formulario de reserva (Web3Forms)
   - Cabecera con borde al hacer scroll
   - Animación suave de entrada (respeta prefers-reduced-motion)
   ========================================================== */
(function () {
  'use strict';

  /* La clave de Web3Forms está en index.html, en el campo oculto
     <input type="hidden" name="access_key" value="...">. Ahí se cambia
     (así el formulario también funciona si el navegador no ejecuta JavaScript).
     Mientras tenga el texto de ejemplo, el formulario funciona en
     "modo demo": muestra la confirmación pero NO envía nada. */
  const DEMO_KEY = 'PON_AQUI_TU_CLAVE_DE_WEB3FORMS';
  const ENDPOINT = 'https://api.web3forms.com/submit';

  const MSG_OK = '¡Listo! Te esperamos. Si necesitas cambiar algo, escríbenos.';
  const MSG_ERROR = 'Vaya, falta un dato. Revísalo y lo intentamos de nuevo.';
  const MSG_SEND_FAIL = 'Vaya, no hemos podido enviar tu reserva. Inténtalo de nuevo en un momento o escríbenos por WhatsApp.';

  const FIELD_ORDER = ['nombre', 'telefono', 'email', 'privacidad'];

  const FIELD_ERRORS = {
    nombre: 'Escribe tu nombre, por favor.',
    telefono: 'Revisa el teléfono: 9 cifras, o con su prefijo si es de fuera de España (+44…).',
    email: 'Revisa el correo: tiene que ser algo como nombre@correo.com.',
    privacidad: 'Para contactarte necesitamos que aceptes la política de privacidad.'
  };

  /** Quita espacios, guiones, puntos y paréntesis. */
  function normalizePhone(value) {
    return String(value || '').replace(/[\s\-.()]/g, '');
  }

  /** Móvil o fijo español (9 cifras que empiezan por 6, 7, 8 o 9, con o sin
      +34 / 0034 / 34) o número internacional con prefijo + / 00 (8–15 cifras). */
  function isValidPhone(value) {
    const v = normalizePhone(value);
    const spanish = /^[6789]\d{8}$/;
    const withEsPrefix = v.match(/^(?:\+|00)?34(\d+)$/);
    if (withEsPrefix && v.length > 9) return spanish.test(withEsPrefix[1]);
    // Internacional: el código de país no empieza por 0; 8–15 cifras en total (E.164).
    const intl = v.match(/^(?:\+|00)(\d+)$/);
    if (intl) return /^[1-9]\d{7,14}$/.test(intl[1]);
    return spanish.test(v);
  }

  /**
   * @param {{nombre:string, telefono:string, email:string, privacidad:boolean}} data
   * @returns {{ok:boolean, errors:Array<'nombre'|'telefono'|'email'|'privacidad'>}}
   */
  function validateBooking(data) {
    const errors = [];
    const nombre = String(data.nombre || '').trim();
    const email = String(data.email || '').trim();
    if (nombre.length < 2) errors.push('nombre');
    if (!isValidPhone(data.telefono)) errors.push('telefono');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('email');
    if (data.privacidad !== true) errors.push('privacidad');
    return { ok: errors.length === 0, errors: FIELD_ORDER.filter(f => errors.includes(f)) };
  }

  window.Brisa = { validateBooking, isValidPhone, FIELD_ERRORS };

  /* ---------- Formulario ---------- */
  function initForm() {
    const form = document.getElementById('reserva-form');
    if (!form) return;
    // Con JS validamos nosotros (mensajes de marca); sin JS valida el navegador.
    form.noValidate = true;
    const msg = document.getElementById('reserva-mensaje');
    const button = form.querySelector('button[type="submit"]');
    const buttonText = button.textContent;
    let sending = false;

    function showMessage(text, kind) {
      msg.textContent = text;
      msg.className = 'form__msg ' + (kind === 'ok' ? 'is-ok' : 'is-error');
    }

    function fieldError(input) {
      return document.getElementById(input.id + '-error');
    }

    function clearInvalid(input) {
      input.removeAttribute('aria-invalid');
      const err = fieldError(input);
      if (err) err.textContent = '';
    }

    function markInvalid(input, name) {
      input.setAttribute('aria-invalid', 'true');
      const err = fieldError(input);
      if (err) err.textContent = FIELD_ERRORS[name];
    }

    FIELD_ORDER.forEach(name => {
      const input = form.elements[name];
      input.addEventListener('input', () => clearInvalid(input));
      input.addEventListener('change', () => clearInvalid(input));
    });

    function setSending(state) {
      sending = state;
      button.disabled = state;
      button.textContent = state ? 'Enviando…' : buttonText;
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (sending) return;

      const data = {
        nombre: form.elements.nombre.value,
        telefono: form.elements.telefono.value,
        email: form.elements.email.value,
        privacidad: form.elements.privacidad.checked
      };
      const result = validateBooking(data);

      FIELD_ORDER.forEach(name => {
        const input = form.elements[name];
        if (result.errors.includes(name)) markInvalid(input, name);
        else clearInvalid(input);
      });

      if (!result.ok) {
        showMessage(MSG_ERROR, 'error');
        form.elements[result.errors[0]].focus();
        return;
      }

      setSending(true);
      msg.textContent = '';
      msg.className = 'form__msg';

      try {
        const key = form.elements.access_key.value.trim();
        if (!key || key === DEMO_KEY) {
          console.info('[Brisa] Modo demo: pon tu clave de Web3Forms en el campo access_key de index.html para recibir las reservas por correo.');
          await new Promise(r => setTimeout(r, 400));
        } else {
          const payload = Object.fromEntries(new FormData(form));
          payload.privacidad = 'Aceptada';
          payload.telefono = data.telefono.trim();
          const response = await fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(payload)
          });
          const json = await response.json().catch(() => ({}));
          if (!response.ok || json.success !== true) throw new Error(json.message || 'Error ' + response.status);
        }
        form.reset();
        showMessage(MSG_OK, 'ok');
      } catch (err) {
        console.error('[Brisa] Error al enviar la reserva:', err);
        showMessage(MSG_SEND_FAIL, 'error');
      } finally {
        setSending(false);
      }
    });
  }

  /* ---------- Cabecera ---------- */
  function initHeader() {
    const header = document.getElementById('cabecera');
    if (!header) return;
    const update = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  /* ---------- Animación de entrada ---------- */
  function initReveal() {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) return;
    const items = document.querySelectorAll('.reveal');
    if (!items.length) return;
    document.documentElement.classList.add('js-reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(el => io.observe(el));
  }

  function init() { initForm(); initHeader(); initReveal(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
