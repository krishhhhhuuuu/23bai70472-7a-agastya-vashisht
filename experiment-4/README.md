# 🧪 Experiment 4 – React State Management & Performance Optimization

## 📌 Project Title

**Experiment-4 – Multi-Page React Application using Context API, useReducer and useMemo**

---

## 🎯 Objective

This experiment extends Experiment 3 by implementing:

* Global state management using **useContext**
* Structured state updates using **useReducer**
* Performance optimization using **useMemo**
* Addition of one new page integrated with React Router

The goal is to understand advanced React concepts while maintaining clean UI and proper folder structure.

---

## 🛠️ Tech Stack Used

* React (Vite)
* Bootstrap & React-Bootstrap
* React Router DOM
* Context API
* useReducer
* useMemo

---

## 📁 Folder Structure

```
src/
│
├── components/
│   ├── Navbar.jsx
│   └── Footer.jsx
│
├── context/
│   └── AppContext.jsx
│
├── reducer/
│   └── appReducer.js
│
├── pages/
│   ├── Home.jsx
│   ├── About.jsx
│   └── Cart.jsx
│
├── App.jsx
├── main.jsx
└── index.css
```

---

## 🔁 Routing Structure

The application uses **React Router** to manage navigation between:

* Home Page (`/`)
* About Page (`/about`)
* Cart Page (`/cart`) – New page added in Experiment 4

Routing is defined inside `App.jsx` using:

```
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/about" element={<About />} />
  <Route path="/cart" element={<Cart />} />
</Routes>
```

---

## 🌍 Global State – Context API

A global context provider is created inside:

```
context/AppContext.jsx
```

It wraps the entire application inside `main.jsx`:

```
<AppProvider>
  <BrowserRouter>
    <App />
  </BrowserRouter>
</AppProvider>
```

Global state includes:

* Cart items
* Theme (light/dark)

Context is used in:

* Navbar component
* Cart page

---

## ⚙️ State Management – useReducer

Reducer file:

```
reducer/appReducer.js
```

Implemented Actions:

* ADD_ITEM
* REMOVE_ITEM
* CLEAR_CART
* TOGGLE_THEME

This ensures structured and predictable state updates.

---

## 🚀 Performance Optimization – useMemo

In `Cart.jsx`, the total cart price is calculated using:

```
const total = useMemo(() => {
  return state.cart.reduce((sum, item) => sum + item.price, 0);
}, [state.cart]);
```

This prevents unnecessary recalculations during re-renders.

---

## 🧩 Features Implemented

* Multi-page navigation
* Global cart management
* Add item to cart
* Remove item from cart
* Clear cart functionality
* Total price calculation
* Clean responsive layout using Bootstrap

---

## ⚙️ Installation & Setup

Create project:

```
npm create vite@latest experiment-4
cd experiment-4
npm install
```

Install dependencies:

```
npm install react-bootstrap bootstrap
npm install react-router-dom
```

Run project:

```
npm run dev
```

---

## 🌐 Deployment

Deployment platform: **Vercel**

```
23BAI70472-4-agastya-vashisht.vercel.app
```

---

## 👩‍💻 Submitted By

Name: Agastya Vashisht
UID: 23BAI70472
Course: CSE (AIML)
Subject: Full Stack Development II

---

## ✅ Conclusion

This experiment successfully demonstrates advanced React concepts including global state management using Context API, structured state handling using useReducer, and performance optimization using useMemo. The application maintains consistent UI/UX while extending functionality through meaningful interactivity.
