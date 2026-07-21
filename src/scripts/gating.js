const STORAGE_KEY = 'riviera_lead_captured';

// ---------------------------------------------------------------------------
// Popup timing — tune here, nowhere else.
// Retuned per marketing review: scroll-depth triggers removed entirely,
// timer only. First fire is now near-instant (3s — not 0, so the hero still
// gets a paint frame and Google's intrusive-interstitial mobile-search
// penalty isn't triggered by a truly 0ms popup), one re-fire at +60s if
// still dismissed, then stops for the session (no indefinite looping).
// ---------------------------------------------------------------------------
const POPUP_FIRST_DELAY_MS = 3000; // first fire, 3s after load (near-instant)
const POPUP_REFIRE_DELAY_MS = 60000; // single re-fire, 60s after the first, then stop

function hasCaptured() {
  return sessionStorage.getItem(STORAGE_KEY) === 'true';
}

function markCaptured() {
  sessionStorage.setItem(STORAGE_KEY, 'true');
}

// ---------------------------------------------------------------------------
// Stub only — real CRM/Sell.Do wiring happens in a later step.
// ---------------------------------------------------------------------------
function submitLead(data) {
  console.log('[submitLead:stub]', data);
  return Promise.resolve({ ok: true });
}

const INTENT_HEADINGS = {
  enquiry: 'Get the Details',
  siteplan: 'Unlock the Site Plan',
  brochure: 'Download the Brochure',
  sitevisit: 'Book a Site Visit',
};

const DOWNLOAD_INTENTS = new Set(['brochure', 'siteplan']);

function triggerDownload(intent) {
  // TODO: real brochure to be served via a signed, expiring S3 URL issued
  // by the backend only AFTER lead capture — replace this stub fetch with
  // that once the backend exists, e.g.:
  //   const { url } = await fetch(`/api/assets/${intent}?token=...`).then(r => r.json());
  //   then point the anchor at `url` instead of the static stub below.
  const stubUrl = '/downloads/placeholder-asset.txt';
  const a = document.createElement('a');
  a.href = stubUrl;
  a.download = `riviera-${intent}-placeholder.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------
const modal = document.getElementById('leadModal');
const modalHeading = document.getElementById('leadModalHeading');
const intentField = document.getElementById('leadIntent');
const form = document.getElementById('leadModalForm');
const submitBtn = document.getElementById('leadSubmit');
const nameInput = document.getElementById('leadName');
const emailInput = document.getElementById('leadEmail');
const phoneInput = document.getElementById('leadPhone');
const consentInput = document.getElementById('leadConsent');
const countryCodeSelect = document.getElementById('leadCountryCode');

// ---------------------------------------------------------------------------
// Country-code auto-detect (prep only). Hardcoded to India for now — this
// becomes a real detection once deployed behind CloudFront.
// ---------------------------------------------------------------------------
function detectCountryCode() {
  // TODO: once deployed behind AWS CloudFront, read the visitor's country
  // from the `CloudFront-Viewer-Country` request header (CloudFront adds this
  // for free — no third-party geolocation call needed) and map it to a
  // dial code here, e.g.:
  //   const viewerCountry = <value forwarded from the CloudFront-Viewer-Country
  //     header, e.g. via a small edge function or an origin-injected meta tag>;
  //   return COUNTRY_TO_DIAL[viewerCountry] || '+91';
  return '+91';
}

const detectedDialCode = detectCountryCode();
if (countryCodeSelect.querySelector(`option[value="${detectedDialCode}"]`)) {
  countryCodeSelect.value = detectedDialCode;
}

function isModalOpen() {
  return modal.classList.contains('is-open');
}

function openModal(intent = 'enquiry') {
  if (hasCaptured()) return;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  modalHeading.textContent = INTENT_HEADINGS[intent] || INTENT_HEADINGS.enquiry;
  intentField.value = intent;
  document.body.style.overflow = 'hidden';
  window.setTimeout(() => nameInput?.focus(), 50);
}

function closeModal() {
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

modal.querySelectorAll('[data-modal-close]').forEach((el) => {
  el.addEventListener('click', closeModal);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && isModalOpen()) closeModal();
});

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function setFieldError(input, isValid) {
  const field = input.closest('.form-field');
  field?.classList.toggle('has-error', !isValid && input.value.trim() !== '');
}

function isNameValid() {
  return nameInput.value.trim().length >= 2;
}

function isEmailValid() {
  return EMAIL_PATTERN.test(emailInput.value.trim());
}

function isPhoneValid() {
  const digits = phoneInput.value.replace(/[\s-]/g, '');
  return /^\d{7,15}$/.test(digits);
}

function isFormValid() {
  return isNameValid() && isEmailValid() && isPhoneValid() && consentInput.checked;
}

function refreshValidation() {
  setFieldError(nameInput, isNameValid());
  setFieldError(emailInput, isEmailValid());
  setFieldError(phoneInput, isPhoneValid());
  submitBtn.disabled = !isFormValid();
}

[nameInput, emailInput, phoneInput].forEach((input) => {
  input.addEventListener('input', refreshValidation);
  input.addEventListener('blur', refreshValidation);
});
consentInput.addEventListener('change', refreshValidation);
refreshValidation();

form.addEventListener('submit', (event) => {
  event.preventDefault();
  refreshValidation();
  if (!isFormValid()) return;

  const countryCode = document.getElementById('leadCountryCode').value;
  const digits = phoneInput.value.replace(/[\s-]/g, '');
  const intent = intentField.value;

  const lead = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    countryCode,
    phone: digits,
    intent,
  };

  submitLead(lead).then(() => {
    markCaptured();
    stopPopups();
    // Real navigation (not a modal state) so Google Ads / Meta conversion
    // pixels on /thank-you fire against a distinct URL.
    window.location.href = `/thank-you?intent=${encodeURIComponent(intent)}`;
  });
});

// ---------------------------------------------------------------------------
// Toast — lightweight, no-modal acknowledgement once already captured
// ---------------------------------------------------------------------------
let toastTimer;
function showToast(message) {
  let toast = document.getElementById('riviera-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'riviera-toast';
    toast.style.cssText =
      'position:fixed;left:50%;bottom:5.5rem;transform:translateX(-50%);' +
      'background:var(--brand-forest-deep);color:var(--text-on-dark);' +
      'padding:0.65rem 1rem;font-size:0.78rem;z-index:600;opacity:0;' +
      'transition:opacity 0.25s ease;pointer-events:none;text-align:center;max-width:90vw;';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.opacity = '1';
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.style.opacity = '0';
  }, 2200);
}

// ---------------------------------------------------------------------------
// Explicit-interest CTAs only — nav, hamburger, and gallery are NOT gated.
// ---------------------------------------------------------------------------
document.querySelectorAll('[data-gate-trigger]').forEach((el) => {
  el.addEventListener('click', (event) => {
    const intent = el.dataset.intent || 'enquiry';

    if (hasCaptured()) {
      event.preventDefault();
      if (DOWNLOAD_INTENTS.has(intent)) {
        triggerDownload(intent);
      } else {
        showToast("Thanks — we already have your details. We'll be in touch.");
      }
      return;
    }

    event.preventDefault();
    openModal(intent);
  });
});

// ---------------------------------------------------------------------------
// Nav toggle — always ungated
// ---------------------------------------------------------------------------
const navToggle = document.getElementById('navToggle');
const siteNav = document.getElementById('siteNav');

navToggle.addEventListener('click', () => {
  const isActive = siteNav.classList.toggle('is-active');
  navToggle.classList.toggle('is-active', isActive);
  navToggle.setAttribute('aria-expanded', String(isActive));
  document.body.style.overflow = isActive ? 'hidden' : '';
});

siteNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    siteNav.classList.remove('is-active');
    navToggle.classList.remove('is-active');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

// ---------------------------------------------------------------------------
// Timed popup only (scroll-depth triggers removed per marketing review).
// Fires once at POPUP_FIRST_DELAY_MS, re-fires once at +POPUP_REFIRE_DELAY_MS
// if still dismissed, then stops permanently for the session. Also stops
// completely once captured.
// ---------------------------------------------------------------------------
function maybeShowPopup() {
  if (hasCaptured() || isModalOpen()) return;
  openModal('enquiry');
}

let popupTimerId = window.setTimeout(() => {
  maybeShowPopup();
  popupTimerId = window.setTimeout(() => {
    maybeShowPopup();
  }, POPUP_REFIRE_DELAY_MS);
}, POPUP_FIRST_DELAY_MS);

function stopPopups() {
  window.clearTimeout(popupTimerId);
}

// ---------------------------------------------------------------------------
// WhatsApp — direct contact channel, does not open the lead modal.
// ---------------------------------------------------------------------------
document.getElementById('whatsappFab')?.addEventListener('click', () => {
  // TODO: fire a Meta pixel "Contact" (or custom "WhatsAppClick") event here
  // once the pixel is wired up, so this channel stays attributable.
  // Do not preventDefault — the wa.me link must still open normally.
});

// ---------------------------------------------------------------------------
// Call button — direct dial, does not open the lead modal.
// ---------------------------------------------------------------------------
document.getElementById('callFab')?.addEventListener('click', () => {
  // TODO: fire a Meta pixel / Google Ads "Contact" call-click event here
  // once the pixel is wired up. Do not preventDefault — the tel: link must
  // still open normally.
});
