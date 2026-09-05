/**
 * Android Club – Workshop Registration System v2
 * Fixed: SVG icon sizes, cross-device QR verification via URL-encoded data
 */

// ============================================================
//  CONFIG
// ============================================================
const WORKSHOP = {
  name:  'Android Development Workshop',
  club:  'Android Club',
  date:  'SAT, 18 OCT',
  time:  '10:00 AM – 1:00 PM',
  venue: 'Android Lab · Block A',
};

// ============================================================
//  ICON HELPER — always produces sized SVG strings
// ============================================================
function icon(name, size = 16) {
  const paths = {
    android:    `<path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C14.15 1.23 13.11 1 12 1c-1.11 0-2.15.23-3.09.63L7.43.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.3 1.3C6.44 3.27 5.5 5 5.5 7h13c0-2-.94-3.73-2.97-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z"/>`,
    calendar:   `<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>`,
    clock:      `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`,
    location:   `<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>`,
    user:       `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`,
    mail:       `<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>`,
    phone:      `<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>`,
    building:   `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`,
    code:       `<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>`,
    graduation: `<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>`,
    check:      `<polyline points="20 6 9 17 4 12"/>`,
    x:          `<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>`,
    share:      `<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>`,
    arrow_left: `<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>`,
    hash:       `<line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>`,
    camera:     `<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>`,
    list:       `<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>`,
    warning:    `<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>`,
    link:       `<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>`,
  };

  const isFilled = ['android', 'warning'].includes(name);
  const fillColor = name === 'android' ? '#3ddc84' : 'currentColor';

  if (isFilled) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fillColor}" style="width:${size}px;height:${size}px;flex-shrink:0;">${paths[name] || ''}</svg>`;
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:${size}px;height:${size}px;flex-shrink:0;">${paths[name] || ''}</svg>`;
}

// ============================================================
//  DATA LAYER (localStorage)
// ============================================================
const DB = {
  _key: 'androidclub_v2',

  getAll() {
    try { return JSON.parse(localStorage.getItem(this._key) || '{}'); }
    catch { return {}; }
  },

  save(data) {
    localStorage.setItem(this._key, JSON.stringify(data));
  },

  register(participant) {
    const all = this.getAll();
    all[participant.id] = participant;
    this.save(all);
  },

  getById(id) {
    if (!id) return null;
    return this.getAll()[id.trim().toUpperCase()] || null;
  },

  markAttendance(id) {
    const all  = this.getAll();
    const upper = id.trim().toUpperCase();
    if (!all[upper]) return { ok: false, reason: 'not_found' };
    if (all[upper].checkedIn) return { ok: false, reason: 'duplicate', participant: all[upper] };
    all[upper].checkedIn    = true;
    all[upper].checkInTime  = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    this.save(all);
    return { ok: true, participant: all[upper] };
  },
};

// ============================================================
//  STATE
// ============================================================
let state = {
  currentScreen:  'landing',
  registration:   null,
  scanStream:     null,
  scanAnimFrame:  null,
  coordinatorTab: 'scan',
};

// ============================================================
//  UNIQUE ID GENERATOR
// ============================================================
function generateRegId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const rand = (n) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const randN = (n) => Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join('');
  const id = `REG-${rand(2)}${randN(1)}${rand(2)}${randN(2)}`;
  return DB.getById(id) ? generateRegId() : id;
}

// ============================================================
//  VERIFICATION URL BUILDER
//  QR encodes a URL pointing to verify.html with full reg data
//  embedded as a base64 URL fragment — no server required,
//  works cross-device when files are on the same network share,
//  or as a fallback the ID alone is encoded.
// ============================================================
function buildVerifyUrl(reg) {
  // Build an absolute URL to verify.html relative to current page
  const base = window.location.href.replace(/[^/]*$/, '');
  const verifyBase = base + 'verify.html';
  // Embed reg data as base64 fragment so verify.html can read it without a server
  const payload = btoa(JSON.stringify({
    id:   reg.id,
    name: reg.name,
  }));
  return `${verifyBase}#${encodeURIComponent(payload)}`;
}

// ============================================================
//  QR CODE RENDERER
// ============================================================
function renderQR(containerId, text, size) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  // Responsive size: never exceed container width
  const maxSize = Math.min(size, container.parentElement
    ? container.parentElement.clientWidth - 32
    : size);
  const qSize = Math.max(120, maxSize);

  try {
    new QRCode(container, {
      text:         text,
      width:        qSize,
      height:       qSize,
      colorDark:    '#000000',
      colorLight:   '#ffffff',
      correctLevel: QRCode.CorrectLevel.M,
    });
    // Ensure the generated canvas/img is styled correctly
    setTimeout(() => {
      const img    = container.querySelector('img');
      const canvas = container.querySelector('canvas');
      if (img)    { img.style.cssText    = `display:block;max-width:100%;width:${qSize}px;height:${qSize}px;`; }
      if (canvas) { canvas.style.cssText = `display:block;max-width:100%;width:${qSize}px;height:${qSize}px;`; }
    }, 50);
  } catch (e) {
    container.innerHTML = `<div style="width:${qSize}px;height:${qSize}px;background:#fff;display:flex;align-items:center;justify-content:center;font-size:10px;color:#111;text-align:center;padding:8px;font-family:monospace;">${text}</div>`;
  }
}

// ============================================================
//  TOAST
// ============================================================
function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ============================================================
//  NAVIGATE
// ============================================================
function navigate(screenId) {
  if (screenId !== 'coordinator') stopCamera();

  if (screenId === 'coordinator') {
    _showCoordinator();
    return;
  }
  if (screenId === 'success' && state.registration) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById('screen-success');
    if (el) { el.classList.add('active'); window.scrollTo({ top: 0 }); }
    setTimeout(() => renderQR('qr-success', buildVerifyUrl(state.registration), 180), 60);
    return;
  }
  if (screenId === 'pass' && state.registration) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById('screen-pass');
    if (el) { el.classList.add('active'); window.scrollTo({ top: 0 }); }
    setTimeout(() => renderQR('qr-pass', buildVerifyUrl(state.registration), 200), 60);
    return;
  }

  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('screen-' + screenId);
  if (el) { el.classList.add('active'); window.scrollTo({ top: 0 }); }
  state.currentScreen = screenId;
}

function _showCoordinator() {
  let el = document.getElementById('screen-coordinator');
  if (!el) {
    document.getElementById('app').insertAdjacentHTML('beforeend', buildCoordinator());
    el = document.getElementById('screen-coordinator');
  } else {
    // Refresh list in case new registrations added
    const listEl = document.getElementById('reg-list');
    if (listEl) listEl.outerHTML = buildRegListInner();
  }
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  el.classList.add('active');
  state.currentScreen = 'coordinator';
  window.scrollTo({ top: 0 });
  setTimeout(() => { if (state.coordinatorTab === 'scan') startCamera(); }, 250);
}

// ============================================================
//  SCREEN BUILDERS
// ============================================================

// ─── LANDING ───
function buildLanding() {
  return `
  <div id="screen-landing" class="screen active">
    <div class="aurora-bg">
      <div class="aurora-blob aurora-blob-1"></div>
      <div class="aurora-blob aurora-blob-2"></div>
      <div class="aurora-blob aurora-blob-3"></div>
    </div>
    <div class="landing-inner screen-container">
      <div class="landing-header">
        ${icon('android', 18)}
        <span class="brand-label" style="color:rgba(240,244,248,0.6)">ANDROID CLUB</span>
      </div>

      <div class="landing-hero">
        <h1 class="headline-xl">BUILD FOR<br>ANDROID.</h1>
        <p class="landing-tagline">A hands-on Android Development Workshop for builders ready to ship.</p>
      </div>

      <div class="glass-card landing-info-card">
        <div class="info-row">
          <div class="info-icon">${icon('calendar', 16)}</div>
          <span class="info-text">SAT, 18 OCT</span>
        </div>
        <div class="divider-line"></div>
        <div class="info-row">
          <div class="info-icon">${icon('clock', 16)}</div>
          <span class="info-text">10:00 AM – 1:00 PM</span>
        </div>
        <div class="divider-line"></div>
        <div class="info-row">
          <div class="info-icon">${icon('location', 16)}</div>
          <span class="info-text">Android Lab · Block A</span>
        </div>
      </div>

      <div class="landing-cta">
        <button id="btn-register-now" class="btn-primary" onclick="navigate('form')">
          ${icon('android', 18)}
          REGISTER NOW
        </button>
        <div class="coordinator-link">
          <button onclick="navigate('coordinator')">Coordinator? Mark attendance →</button>
        </div>
      </div>
    </div>
  </div>`;
}

// ─── REGISTRATION FORM ───
function buildForm() {
  return `
  <div id="screen-form" class="screen">
    <div class="aurora-bg">
      <div class="aurora-blob aurora-blob-1"></div>
      <div class="aurora-blob aurora-blob-2"></div>
    </div>
    <div class="form-inner screen-container">
      <div class="form-header">
        <button class="back-btn" onclick="navigate('landing')" aria-label="Go back">${icon('arrow_left', 20)}</button>
        ${icon('android', 16)}
        <span class="brand-label">ANDROID CLUB</span>
      </div>

      <div class="form-title-block">
        <h1>JOIN THE<br><span class="headline-green">WORKSHOP</span></h1>
      </div>
      <p class="form-subtitle">Reserve your seat and build something real.</p>

      <form id="reg-form" class="glass-card form-card" novalidate>

        <div class="field-group">
          <label class="field-label" for="f-name">Full Name</label>
          <div class="field-wrapper">
            <div class="field-icon">${icon('user', 16)}</div>
            <input id="f-name" class="field-input" type="text" placeholder="Aarav Mehta" autocomplete="name">
          </div>
          <div class="field-error" id="err-name">${icon('warning', 12)} Name is required</div>
        </div>

        <div class="field-group">
          <label class="field-label" for="f-email">Email</label>
          <div class="field-wrapper">
            <div class="field-icon">${icon('mail', 16)}</div>
            <input id="f-email" class="field-input" type="email" placeholder="aarav@example.com" autocomplete="email">
          </div>
          <div class="field-error" id="err-email">${icon('warning', 12)} Enter a valid email</div>
        </div>

        <div class="field-group">
          <label class="field-label" for="f-phone">Phone Number</label>
          <div class="field-wrapper">
            <div class="field-icon">${icon('phone', 16)}</div>
            <input id="f-phone" class="field-input" type="tel" placeholder="+91 98765 43210" autocomplete="tel">
          </div>
          <div class="field-error" id="err-phone">${icon('warning', 12)} Enter a valid phone number</div>
        </div>

        <div class="field-group">
          <label class="field-label" for="f-college">College / Institution</label>
          <div class="field-wrapper">
            <div class="field-icon">${icon('building', 16)}</div>
            <input id="f-college" class="field-input" type="text" placeholder="Tech Institute" autocomplete="organization">
          </div>
          <div class="field-error" id="err-college">${icon('warning', 12)} Institution is required</div>
        </div>

        <div class="field-group">
          <label class="field-label" for="f-dept">Department</label>
          <div class="field-wrapper">
            <div class="field-icon">${icon('code', 16)}</div>
            <input id="f-dept" class="field-input" type="text" placeholder="Computer Science">
          </div>
          <div class="field-error" id="err-dept">${icon('warning', 12)} Department is required</div>
        </div>

        <div class="field-group">
          <label class="field-label" for="f-year">Year of Study</label>
          <div class="field-wrapper">
            <div class="field-icon">${icon('graduation', 16)}</div>
            <select id="f-year" class="field-input select-field">
              <option value="" disabled selected>Select year</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
              <option value="PG / Masters">PG / Masters</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div class="field-error" id="err-year">${icon('warning', 12)} Please select your year</div>
        </div>

        <div style="margin-top:8px;">
          <button type="submit" id="btn-complete-reg" class="btn-primary">
            ${icon('android', 18)}
            COMPLETE REGISTRATION
          </button>
        </div>

      </form>
    </div>
  </div>`;
}

// ─── SUCCESS SCREEN ───
function buildSuccess(reg) {
  const verifyUrl = buildVerifyUrl(reg);
  return `
  <div id="screen-success" class="screen">
    <div class="aurora-bg">
      <div class="aurora-blob aurora-blob-1"></div>
      <div class="aurora-blob aurora-blob-2"></div>
      <div class="aurora-blob aurora-blob-3"></div>
    </div>
    <div class="success-inner screen-container">

      <div class="success-check">
        ${icon('check', 32)}
      </div>

      <div class="success-title">YOUR PASS IS READY.</div>
      <p class="success-subtitle">You're all set for the workshop. We can't wait to see you there!</p>

      <div class="glass-card success-participant">
        <div class="participant-avatar">${icon('user', 20)}</div>
        <div class="participant-name">${escHtml(reg.name)}</div>
      </div>

      <div class="glass-card success-workshop-info">
        <div class="workshop-row">${icon('calendar', 16)}<span>${WORKSHOP.date}</span></div>
        <div class="workshop-row">${icon('clock', 16)}<span>${WORKSHOP.time}</span></div>
        <div class="workshop-row">${icon('location', 16)}<span>${WORKSHOP.venue}</span></div>
        <div style="height:1px;background:rgba(255,255,255,0.06);"></div>
        <div class="reg-id-row">${icon('hash', 16)}<span class="mono">${escHtml(reg.id)}</span></div>
      </div>

      <div class="glass-card qr-pass-card">
        <div class="qr-pass-label">DIGITAL PASS</div>
        <div class="qr-container">
          <div id="qr-success"></div>
        </div>
        <div class="qr-instruction">Show this code at the entrance<br>to mark your attendance.</div>
      </div>

      <div class="success-actions">
        <button class="btn-primary" onclick="navigate('pass')" id="btn-view-pass">
          ${icon('android', 18)}
          VIEW DIGITAL PASS
        </button>
        <button class="btn-secondary" onclick="sharePass()" id="btn-share-pass">
          ${icon('share', 18)}
          SHARE PASS
        </button>
        <button class="btn-secondary" onclick="addToCalendar()" id="btn-calendar">
          ${icon('calendar', 18)}
          ADD TO CALENDAR
        </button>
      </div>

    </div>
  </div>`;
}

// ─── DIGITAL PASS ───
function buildPass(reg) {
  return `
  <div id="screen-pass" class="screen">
    <div class="aurora-bg">
      <div class="aurora-blob aurora-blob-1"></div>
      <div class="aurora-blob aurora-blob-2"></div>
      <div class="aurora-blob aurora-blob-3"></div>
    </div>
    <div class="pass-inner screen-container">

      <div class="pass-header">
        <button class="back-btn" onclick="navigate('success')" aria-label="Go back">${icon('arrow_left', 20)}</button>
        <span class="brand-label">DIGITAL PASS</span>
      </div>

      <div class="glass-card pass-card">
        <div class="pass-notch-left"></div>
        <div class="pass-notch-right"></div>

        <div class="pass-club-label">
          ${icon('android', 14)}
          ANDROID CLUB
        </div>
        <div class="pass-workshop-title">ANDROID<br>DEVELOPMENT</div>
        <div class="pass-workshop-subtitle">WORKSHOP</div>

        <div class="ticket-sep">
          <div class="ticket-sep-circle"></div>
        </div>

        <div class="pass-participant-section">
          <div class="pass-participant-label">PARTICIPANT</div>
          <div class="pass-participant-name">${escHtml(reg.name.toUpperCase())}</div>
          <div class="pass-participant-label" style="margin-top:8px;">REGISTRATION ID</div>
          <div class="pass-reg-id mono">${escHtml(reg.id)}</div>
        </div>

        <div class="pass-info-grid">
          <div class="pass-info-item">
            <div class="pass-info-label">DATE</div>
            <div class="pass-info-value">${WORKSHOP.date}</div>
          </div>
          <div class="pass-info-item">
            <div class="pass-info-label">TIME</div>
            <div class="pass-info-value">10:00 AM–1:00 PM</div>
          </div>
        </div>
        <div class="pass-info-item" style="margin-bottom:18px;">
          <div class="pass-info-label">VENUE</div>
          <div class="pass-info-value">${WORKSHOP.venue}</div>
        </div>

        <div class="pass-qr-wrapper">
          <div class="pass-qr-section">
            <div id="qr-pass"></div>
          </div>
        </div>

        <div class="pass-qr-instruction">Show this code at the entrance<br>to mark your attendance.</div>
      </div>

    </div>
  </div>`;
}

// ─── COORDINATOR ───
function buildRegListInner() {
  const items = Object.values(DB.getAll());
  if (items.length === 0) return `<div id="reg-list" class="reg-list"><div style="color:var(--text-secondary);font-size:13px;text-align:center;padding:20px 0;">No registrations yet.</div></div>`;
  return `<div id="reg-list" class="reg-list">${items.map(r => `
    <div class="reg-list-item ${r.checkedIn ? 'checked-in' : ''}" onclick="validateFromList('${escHtml(r.id)}')">
      <div>
        <div class="reg-list-name">${escHtml(r.name)}</div>
        <div class="reg-list-id">${escHtml(r.id)}</div>
      </div>
      <div class="reg-list-badge ${r.checkedIn ? 'badge-checked' : 'badge-pending'}">
        ${r.checkedIn ? '✓ Checked In' : 'Pending'}
      </div>
    </div>`).join('')}
  </div>`;
}

function buildCoordinator() {
  return `
  <div id="screen-coordinator" class="screen">
    <div class="aurora-bg">
      <div class="aurora-blob aurora-blob-1" style="opacity:0.18;"></div>
      <div class="aurora-blob aurora-blob-2" style="opacity:0.12;"></div>
    </div>
    <div class="coordinator-inner screen-container">

      <div class="coordinator-header">
        <button class="back-btn" onclick="navigate('landing')" aria-label="Back">${icon('arrow_left', 20)}</button>
        <span class="coordinator-title">Coordinator Panel</span>
      </div>

      <div class="tab-bar">
        <button class="tab-btn active" id="tab-scan"   onclick="switchCoordTab('scan')">${icon('camera', 14)}&nbsp;Scan QR</button>
        <button class="tab-btn"        id="tab-manual" onclick="switchCoordTab('manual')">${icon('hash', 14)}&nbsp;Manual</button>
        <button class="tab-btn"        id="tab-list"   onclick="switchCoordTab('list')">${icon('list', 14)}&nbsp;List</button>
      </div>

      <div id="tab-panel-scan">
        <div class="glass-card scan-card">
          <div class="scan-title">Scan QR Code</div>
          <p class="scan-desc">Point the camera at the participant's QR code to validate and mark attendance.</p>
          <div class="scan-area" id="scan-area">
            <video id="scan-video" playsinline autoplay muted></video>
            <div class="scan-overlay">
              <div class="scan-frame">
                <div class="scan-corner tl"></div><div class="scan-corner tr"></div>
                <div class="scan-corner bl"></div><div class="scan-corner br"></div>
                <div class="scan-line"></div>
              </div>
            </div>
            <div class="camera-fallback" id="cam-fallback" style="display:none;">
              ${icon('camera', 40)}
              <p>Camera not available. Use Manual entry below.</p>
            </div>
          </div>
          <p style="font-size:11px;color:var(--text-label);text-align:center;margin-top:8px;" id="scan-status-text">Initializing camera…</p>
        </div>
      </div>

      <div id="tab-panel-manual" style="display:none;">
        <div class="glass-card scan-card">
          <div class="scan-title">Manual Validation</div>
          <p class="scan-desc">Enter the registration ID from the participant's pass.</p>
          <div class="manual-input-group">
            <input id="manual-reg-id" class="manual-input" type="text" placeholder="e.g. REG-AX7K29" maxlength="14">
            <button class="btn-validate" onclick="manualValidate()">VALIDATE</button>
          </div>
        </div>
      </div>

      <div id="tab-panel-list" style="display:none;">
        <div class="glass-card scan-card">
          <div class="scan-title">All Registrations</div>
          <p class="scan-desc">${Object.keys(DB.getAll()).length} registered. Tap any to validate.</p>
          ${buildRegListInner()}
        </div>
      </div>

    </div>
  </div>`;
}

// ─── ATTENDANCE RESULT ───
function buildAttendanceResult(result) {
  let checkClass = '', checkIcon, titleHtml, detailsHtml;

  if (result.type === 'success') {
    checkIcon = icon('check', 36);
    titleHtml = `<div class="attendance-title">ATTENDANCE<br>MARKED</div>`;
    detailsHtml = `
      <div class="glass-card attendance-details">
        <div class="attendance-row">
          <div class="attendance-row-icon">${icon('user', 16)}</div>
          <div class="attendance-row-text">
            <span class="attendance-row-label">Participant</span>
            <span class="attendance-row-value">${escHtml(result.participant.name)}</span>
          </div>
        </div>
        <div class="attendance-row">
          <div class="attendance-row-icon">${icon('hash', 16)}</div>
          <div class="attendance-row-text">
            <span class="attendance-row-label">Registration ID</span>
            <span class="attendance-row-value mono">${escHtml(result.participant.id)}</span>
          </div>
        </div>
        <div class="attendance-row">
          <div class="attendance-row-icon">${icon('clock', 16)}</div>
          <div class="attendance-row-text">
            <span class="attendance-row-label">Check-in Time</span>
            <span class="attendance-row-value">${escHtml(result.participant.checkInTime)}</span>
          </div>
        </div>
        <div class="attendance-row">
          <div class="attendance-row-icon">${icon('android', 16)}</div>
          <div class="attendance-row-text">
            <span class="attendance-row-label">Workshop</span>
            <span class="attendance-row-value">${WORKSHOP.name}</span>
          </div>
        </div>
      </div>`;
  } else if (result.type === 'duplicate') {
    checkClass  = 'warning-state';
    checkIcon   = icon('check', 36);
    titleHtml   = `<div class="attendance-title" style="color:#ffb300;">ALREADY<br>CHECKED IN</div>`;
    detailsHtml = `
      <div class="glass-card attendance-details" style="border-color:rgba(255,179,0,0.2);">
        <div class="attendance-row">
          <div class="attendance-row-icon" style="border-color:rgba(255,179,0,0.2);background:rgba(255,179,0,0.08);">${icon('user', 16)}</div>
          <div class="attendance-row-text">
            <span class="attendance-row-label">Participant</span>
            <span class="attendance-row-value">${escHtml(result.participant.name)}</span>
          </div>
        </div>
        <div class="attendance-row">
          <div class="attendance-row-icon" style="border-color:rgba(255,179,0,0.2);background:rgba(255,179,0,0.08);">${icon('clock', 16)}</div>
          <div class="attendance-row-text">
            <span class="attendance-row-label">Originally checked in at</span>
            <span class="attendance-row-value" style="color:#ffb300;">${escHtml(result.participant.checkInTime)}</span>
          </div>
        </div>
      </div>
      <p style="font-size:12px;color:var(--text-secondary);text-align:center;">This participant has already been checked in.</p>`;
  } else {
    checkClass  = 'error-state';
    checkIcon   = icon('x', 36);
    titleHtml   = `<div class="attendance-title" style="color:var(--error);">INVALID<br>QR CODE</div>`;
    detailsHtml = `
      <div class="glass-card attendance-details" style="border-color:rgba(255,82,82,0.2);">
        <div style="text-align:center;color:var(--text-secondary);font-size:14px;padding:8px 0;">
          Registration not found.<br>
          <span class="mono" style="color:var(--error);font-size:12px;margin-top:6px;display:block;">${escHtml(result.id || '—')}</span>
        </div>
      </div>`;
  }

  return `
  <div id="screen-attendance" class="screen">
    <div class="aurora-bg">
      <div class="aurora-blob aurora-blob-1"></div>
      <div class="aurora-blob aurora-blob-2"></div>
    </div>
    <div class="attendance-inner screen-container">
      <div class="attendance-check ${checkClass}">${checkIcon}</div>
      ${titleHtml}
      ${detailsHtml}
      <div class="attendance-actions">
        <button class="btn-primary" onclick="returnToCoordinator()">✓&nbsp;&nbsp;DONE</button>
        <button class="btn-secondary" onclick="returnToCoordinator()">Scan Another</button>
      </div>
    </div>
  </div>`;
}

// ============================================================
//  COORDINATOR TAB SWITCHING
// ============================================================
function switchCoordTab(tab) {
  state.coordinatorTab = tab;
  ['scan', 'manual', 'list'].forEach(t => {
    const btn   = document.getElementById('tab-' + t);
    const panel = document.getElementById('tab-panel-' + t);
    if (btn)   btn.classList.toggle('active', t === tab);
    if (panel) panel.style.display = t === tab ? 'block' : 'none';
  });
  if (tab === 'scan') startCamera(); else stopCamera();
}

// ============================================================
//  CAMERA & QR SCANNING
// ============================================================
function startCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showCameraFallback('Camera API not supported.'); return;
  }
  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    .then(stream => {
      state.scanStream = stream;
      const video = document.getElementById('scan-video');
      if (!video) { stopCamera(); return; }
      video.srcObject = stream;
      video.play();
      updateScanStatus('Camera active — point at a QR code.');
      video.addEventListener('loadedmetadata', () => requestAnimationFrame(scanFrame));
    })
    .catch(() => showCameraFallback('Camera access denied. Use the Manual tab.'));
}

function stopCamera() {
  if (state.scanStream) { state.scanStream.getTracks().forEach(t => t.stop()); state.scanStream = null; }
  if (state.scanAnimFrame) { cancelAnimationFrame(state.scanAnimFrame); state.scanAnimFrame = null; }
}

function showCameraFallback(msg) {
  const fb = document.getElementById('cam-fallback');
  if (fb) { fb.style.display = 'flex'; const p = fb.querySelector('p'); if (p) p.textContent = msg; }
  updateScanStatus(msg);
}

function updateScanStatus(msg) {
  const el = document.getElementById('scan-status-text');
  if (el) el.textContent = msg;
}

function scanFrame() {
  const video = document.getElementById('scan-video');
  if (!video || !state.scanStream) return;
  if (video.readyState !== video.HAVE_ENOUGH_DATA) {
    state.scanAnimFrame = requestAnimationFrame(scanFrame); return;
  }
  const canvas = document.createElement('canvas');
  canvas.width  = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  try {
    const imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' });
    if (code && code.data) {
      stopCamera();
      processQrData(code.data.trim());
      return;
    }
  } catch (_) {}
  state.scanAnimFrame = requestAnimationFrame(scanFrame);
}

// ============================================================
//  VALIDATION LOGIC
// ============================================================

// Extract registration ID from either a raw ID or a verify URL
function extractRegId(raw) {
  raw = raw.trim();
  // Case 1: plain ID like REG-AX7K29
  if (/^REG-/i.test(raw)) return raw.toUpperCase();
  // Case 2: verify URL — extract hash fragment, decode base64
  try {
    const hashIdx = raw.indexOf('#');
    if (hashIdx !== -1) {
      const fragment = decodeURIComponent(raw.slice(hashIdx + 1));
      const parsed = JSON.parse(atob(fragment));
      if (parsed.id) return parsed.id.toUpperCase();
    }
  } catch (_) {}
  // Case 3: URL with ?id= or /verify/ID
  const m = raw.match(/[?&/]id=([A-Z0-9\-]+)/i) || raw.match(/\/([A-Z0-9\-]+)$/i);
  if (m) return m[1].toUpperCase();
  return raw.toUpperCase();
}

function processQrData(raw) {
  const id = extractRegId(raw);
  handleValidation(id);
}

function handleValidation(id) {
  const result = DB.markAttendance(id);
  let attendanceResult;
  if (result.ok) {
    attendanceResult = { type: 'success', participant: result.participant };
  } else if (result.reason === 'duplicate') {
    attendanceResult = { type: 'duplicate', participant: result.participant };
  } else {
    attendanceResult = { type: 'error', id: id };
  }
  _showAttendanceResult(attendanceResult);
}

function _showAttendanceResult(result) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const existing = document.getElementById('screen-attendance');
  if (existing) existing.remove();
  document.getElementById('app').insertAdjacentHTML('beforeend', buildAttendanceResult(result));
  document.getElementById('screen-attendance').classList.add('active');
  state.currentScreen = 'attendance';
  window.scrollTo({ top: 0 });
}

function manualValidate() {
  const input = document.getElementById('manual-reg-id');
  if (!input) return;
  const val = input.value.trim().toUpperCase();
  if (!val) { showToast('Please enter a registration ID'); return; }
  handleValidation(val);
}

function validateFromList(id) {
  handleValidation(id);
}

function returnToCoordinator() {
  stopCamera();
  const el = document.getElementById('screen-coordinator');
  if (el) el.remove();
  _showCoordinator();
}

// ============================================================
//  FORM VALIDATION
// ============================================================
const VALIDATORS = {
  'f-name':    v => v.trim().length >= 2,
  'f-email':   v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
  'f-phone':   v => /^[\+\d][\d\s\-\(\)]{6,14}$/.test(v.trim()),
  'f-college': v => v.trim().length >= 2,
  'f-dept':    v => v.trim().length >= 2,
  'f-year':    v => v.trim() !== '',
};

function validateField(input) {
  const test = VALIDATORS[input.id];
  if (!test) return true;
  const errId = 'err-' + input.id.replace('f-', '');
  const err   = document.getElementById(errId);
  const ok    = test(input.value);
  input.classList.toggle('error', !ok);
  if (err) err.classList.toggle('visible', !ok);
  return ok;
}

function validateForm() {
  let valid = true;
  Object.keys(VALIDATORS).forEach(id => {
    const input = document.getElementById(id);
    if (input && !validateField(input)) valid = false;
  });
  return valid;
}

// ============================================================
//  SHARE & CALENDAR
// ============================================================
function sharePass() {
  const reg = state.registration;
  if (!reg) return;
  const verifyUrl = buildVerifyUrl(reg);
  const text = `🤖 ${reg.name} is registered!\n📅 ${WORKSHOP.date} · ⏰ ${WORKSHOP.time}\n📍 ${WORKSHOP.venue}\n🆔 ${reg.id}\n\nVerify: ${verifyUrl}`;
  if (navigator.share) {
    navigator.share({ title: 'Android Workshop Pass', text }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text)
      .then(() => showToast('Pass details copied to clipboard!'))
      .catch(() => showToast('Could not copy. Please share manually.'));
  }
}

function addToCalendar() {
  window.open(
    'https://calendar.google.com/calendar/r/eventedit?text=Android+Development+Workshop&dates=20251018T100000/20251018T130000&location=Android+Lab+Block+A&details=Hosted+by+Android+Club',
    '_blank'
  );
}

// ============================================================
//  HTML ESCAPE
// ============================================================
function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ============================================================
//  INIT
// ============================================================
function init() {
  const app = document.getElementById('app');
  app.innerHTML = buildLanding() + buildForm();

  // Form submit
  document.getElementById('reg-form').addEventListener('submit', function(e) {
    e.preventDefault();
    if (!validateForm()) return;

    const btn = document.getElementById('btn-complete-reg');
    btn.innerHTML = `<span class="spinner"></span>&nbsp;Processing…`;
    btn.disabled = true;

    setTimeout(() => {
      const reg = {
        id:           generateRegId(),
        name:         document.getElementById('f-name').value.trim(),
        email:        document.getElementById('f-email').value.trim(),
        phone:        document.getElementById('f-phone').value.trim(),
        college:      document.getElementById('f-college').value.trim(),
        department:   document.getElementById('f-dept').value.trim(),
        year:         document.getElementById('f-year').value,
        checkedIn:    false,
        checkInTime:  null,
        registeredAt: new Date().toISOString(),
      };

      DB.register(reg);
      state.registration = reg;

      // Remove old screens if any
      ['screen-success', 'screen-pass'].forEach(id => {
        const old = document.getElementById(id);
        if (old) old.remove();
      });

      // Build fresh screens
      app.insertAdjacentHTML('beforeend', buildSuccess(reg));
      app.insertAdjacentHTML('beforeend', buildPass(reg));

      // Navigate to success
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      document.getElementById('screen-success').classList.add('active');
      state.currentScreen = 'success';
      window.scrollTo({ top: 0 });

      // Render QR
      setTimeout(() => {
        renderQR('qr-success', buildVerifyUrl(reg), 180);
      }, 100);

      btn.innerHTML = `${icon('android', 18)} COMPLETE REGISTRATION`;
      btn.disabled = false;
    }, 700);
  });

  // Live field validation — only after user touches the field
  Object.keys(VALIDATORS).forEach(id => {
    const input = document.getElementById(id);
    if (!input) return;
    input.addEventListener('focus', () => { input.dataset.touched = '1'; });
    input.addEventListener('blur',  () => { if (input.dataset.touched) validateField(input); });
    input.addEventListener('input', () => { if (input.dataset.touched || input.classList.contains('error')) validateField(input); });
    if (input.tagName === 'SELECT') {
      input.addEventListener('change', () => { input.dataset.touched = '1'; validateField(input); });
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
