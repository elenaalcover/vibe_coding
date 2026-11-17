/* ==========================================================
   Brisa Pilates Reformer · Interacción
   - Validación y envío del formulario de reserva (Web3Forms)
   - Cabecera con borde al hacer scroll
   - Animación suave de entrada (respeta prefers-reduced-motion)
   ========================================================== */
(function () {
  'use strict';

  /* Pega aquí tu clave de Web3Forms.
     Cómo conseguirla: entra en https://web3forms.com, escribe el correo
     donde quieres recibir las reservas y te llegará la clave al momento.
     Mientras dejes este texto de ejemplo, el formulario funciona en
     "modo demo": muestra la confirmación pero NO envía nada. */
  const WEB3FORMS_KEY = 'PON_AQUI_TU_CLAVE_DE_WEB3FORMS';
  const DEMO_KEY = 'PON_AQUI_TU_CLAVE_DE_WEB3FORMS';
  const ENDPOINT = 'https://api.web3forms.com/submit';

  const MSG_OK = '¡Listo! Te esperamos. Si necesitas cambiar algo, escríbenos.';
  const MSG_ERROR = 'Vaya, falta un dato. Revísalo y lo intentamos de nuevo.';
  const MSG_SEND_FAIL = 'Vaya, no hemos podido enviar tu reserva. Inténtalo de nuevo en un momento o escríbenos por WhatsApp.';

  const FIELD_ORDER = ['nombre', 'telefono', 'email', 'privacidad'];

  /** Deja solo los dígitos nacionales: quita espacios, guiones, puntos,
      paréntesis y el prefijo +34 / 0034. */
  function normalizePhone(value) {
    let v = String(value || '').replace(/[\s\-.()]/g, '');
    v = v.replace(/^(\+34|0034)/, '');
    return v;
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
    if (!/^\d{9}$/.test(normalizePhone(data.telefono))) errors.push('telefono');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('email');
    if (data.privacidad !== true) errors.push('privacidad');
    return { ok: errors.length === 0, errors: FIELD_ORDER.filter(f => errors.includes(f)) };
  }

  window.Brisa = { WEB3FORMS_KEY, validateBooking, normalizePhone };

  /* ---------- Formulario ---------- */
  function initForm() {
    const form = document.getElementById('reserva-form');
    if (!form) return;
    const msg = document.getElementById('reserva-mensaje');
    const button = form.querySelector('button[type="submit"]');
    const buttonText = button.textContent;
    let sending = false;

    function showMessage(text, kind) {
      msg.textContent = text;
      msg.className = 'form__msg ' + (kind === 'ok' ? 'is-ok' : 'is-error');
    }

    function clearInvalid(input) {
      input.removeAttribute('aria-invalid');
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
        if (result.errors.includes(name)) input.setAttribute('aria-invalid', 'true');
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
        const key = window.Brisa.WEB3FORMS_KEY;
        form.elements.access_key.value = key;
        if (!key || key === DEMO_KEY) {
          console.info('[Brisa] Modo demo: añade tu clave de Web3Forms en main.js para recibir las reservas por correo.');
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
