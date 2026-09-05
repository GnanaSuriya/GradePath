# Android Club Workshop Registration App

A fully functional mobile-first web application for Android Club workshop registration.

## Features
- 🎨 Aurora Glass / Glassmorphism design matching Figma reference
- 📋 Workshop registration form with live validation
- 🆔 Unique registration ID generation
- 📱 Real QR code generation (unique per participant)
- 🎫 Digital QR pass (premium ticket design)
- ✅ Coordinator attendance marking panel
- 🚫 Duplicate check-in prevention
- 💾 localStorage persistence

## Screens
1. **Landing** – Workshop info & Register Now CTA
2. **Registration Form** – Full Name, Email, Phone, College, Department, Year
3. **Registration Success** – Confirmation + QR pass preview
4. **Digital QR Pass** – Premium ticket card with scannable QR
5. **Coordinator Panel** – Scan QR / Manual entry / Registration list → Attendance Marked

## Tech Stack
- Vanilla HTML, CSS, JavaScript
- [qrcodejs](https://github.com/davidshimjs/qrcodejs) for QR generation
- [jsQR](https://github.com/cozmo/jsQR) for camera QR scanning
- Google Fonts (Inter + Space Grotesk)

## Files
| File | Purpose |
|------|---------|
| `index.html` | Main SPA entry point |
| `styles.css` | Aurora Glass design system |
| `app.js` | Full application logic |
| `verify.html` | Standalone QR verification page |
| `vercel.json` | Vercel deployment config |

## Usage
Open `index.html` in any modern browser — no build step required.

### Coordinator Note
For camera QR scanning, the page must be served over HTTPS (Vercel provides this automatically).  
When testing locally, use the **Manual** tab in the Coordinator Panel to enter Registration IDs.
