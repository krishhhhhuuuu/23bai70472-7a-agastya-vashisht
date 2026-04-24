# Experiment 5 — React Shopping App

**Student:** Agastya Vashisht
**UID:** 23BAI70472
**Deployment:** `23BAI70472-5-agastya-vashisht.vercel.app`

---

## Overview

This is **Experiment 5**, an extension of Experiment 4. It is a multi-page React shopping application that demonstrates global state management using **Redux Toolkit** and **Context API**, performance optimization using **useMemo**, and multi-page navigation using **React Router**.

---

## Experiment 5 Updates

- Replaced `useReducer` with **Redux Toolkit** (`configureStore` + `createSlice`)
- Cart slice has **4 actions**: `addItem`, `removeItem`, `updateQty`, `clearCart`
- Added **Reports page** — new page for Experiment 5 with analytics dashboard
- Used **useMemo** for total price, total quantity, average price, and category spend breakdown
- **Context API** provides global theme (light/dark toggle) used across all components
- Fully **responsive** design with Bootstrap 5

---

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Product grid — browse and add items to cart |
| About | `/about` | Project info, tech stack, and student details |
| Cart | `/cart` | Cart management with qty controls and order summary |
| Reports | `/reports` | Analytics dashboard — spend breakdown, stats, category chart |

---

## Key Concepts Implemented

### React Router
- 4 pages connected via `<Routes>` and `<Route>`
- Active link highlighting in Navbar
- Cart item count badge in Navbar

### Context API (`AppContext`)
- Global `theme` state (light / dark)
- `toggleTheme` function
- Used in: `Navbar`, `Footer`, `About`, `Cart`, `Reports`

### Redux Toolkit
- `store.js` — configured with `configureStore`
- `cartSlice.js` — created with `createSlice`
- **Actions:**
  - `addItem` — adds product or increments qty if already in cart
  - `removeItem` — removes product by id
  - `updateQty` — increments or decrements quantity
  - `clearCart` — empties the entire cart
- Used via `useDispatch` and `useSelector` in Home, Cart, and Reports

### useMemo
- **Cart page** — total price, total quantity, savings (5% discount)
- **Reports page** — average price per item, category-wise spend breakdown, most expensive item

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| React 19 | UI library |
| Redux Toolkit | Cart state management |
| React Router v7 | Client-side routing |
| Context API | Theme + global state |
| Bootstrap 5 | Responsive styling |
| Vite | Build tool |

---

## Folder Structure

```
src/
├── components/
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   └── ThemeToggle.jsx
├── context/
│   └── AppContext.jsx
├── redux/
│   ├── store.js
│   └── slices/
│       └── cartSlice.js
├── pages/
│   ├── Home.jsx
│   ├── About.jsx
│   ├── Cart.jsx
│   └── Reports.jsx
├── App.jsx
├── main.jsx
└── index.css
```

---

## Setup & Run

```bash
npm install
npm run dev
```

---

## Screenshots

| Home | Cart | Reports |
|------|------|---------|
| ![Home](screenshots/home.png) | ![Cart](screenshots/cart.png) | ![Reports](screenshots/reports.png) |
