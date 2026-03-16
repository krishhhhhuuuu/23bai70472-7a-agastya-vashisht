# Experiment 1 – React Counter Application (useState)

## Objective

To build a simple React application that demonstrates the use of the **useState hook** for state management and **event handling** to update the UI dynamically.

## Description

This project implements a basic **Counter Application** using React functional components.
The application displays a number on the screen and provides two buttons: **Increment** and **Decrement**. When the user clicks a button, the counter value updates immediately without refreshing the page.

The counter value is stored using the **useState hook**, and React automatically re-renders the component whenever the state changes.

## Technologies Used

* React (with Vite)
* JavaScript
* CSS

## Folder Structure

```
src
 ├── components
 │     ├── Counter.jsx
 │     └── Counter.css
 ├── App.jsx
 ├── App.css
 └── main.jsx
```

## Working Principle

1. The **useState hook** is used to create a state variable `count`.
2. The initial value of the counter is set to **0**.
3. Clicking the **Increment button** increases the value by 1.
4. Clicking the **Decrement button** decreases the value by 1.
5. When the state changes, React automatically updates the UI.

## Functionalities

* Increment the counter value
* Decrement the counter value
* Dynamic UI updates without page reload

## Possible Improvements

* Add a **Reset button** to reset the counter to zero
* Add **minimum or maximum value validation**
* Improve **component reusability and modular structure**

## Conclusion

This experiment demonstrates the basic concept of **state management in React using the useState hook**. It also shows how React efficiently updates the UI when the state changes.
