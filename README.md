# Aura Skincare Website System

A responsive, accessible storefront recreated from the supplied Aura Skincare reference.

## Run

Open `index.html` directly in a browser. No build step or external packages are required.

## Files

- `index.html` — semantic storefront structure and accessible dialogs/drawer
- `styles.css` — complete UI system, responsive layouts, states and design tokens
- `app.js` — product filters, sorting, search, favorites, quick view, cart and newsletter UX
- `assets/` — locally bundled image assets derived from the supplied reference

## Included UX

- Responsive desktop/mobile navigation
- Category filtering and product sorting
- Search dialog with live results and popular searches
- Product quick-view modal with quantity control
- Favorites state and count
- Cart drawer with quantity updates, remove action, subtotal and free-shipping progress
- Newsletter validation and confirmation
- Empty states, toasts, hover/focus/active states
- Keyboard focus styles, Escape handling, semantic labels and reduced-motion support

## Design system

Core tokens are defined in `:root` inside `styles.css`: color, typography, spacing, radius and shadow. The interface uses Georgia for editorial headings and an Arial/system sans stack for controls and body copy.

## Backend integration

This is a frontend prototype. Connect the checkout, account, product, inventory and newsletter actions to your preferred backend or commerce platform before production deployment.
