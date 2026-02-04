🎯 Aim
To design and implement a React Single Page Application using `useState` for navigation without page reload.

🧠 Objective
* To understand how SPA works in React
* To use `useState` for conditional rendering
* To implement navigation without React Router
* To build a reusable navigation bar
* To improve component-based design understanding

🛠️ Tools & Technologies Used

* React (Vite)
* JavaScript (ES6)
* HTML5
* CSS3
* VS Code
* Git & GitHub

⚙️ Project Features

* Home, About, and Contact pages
* Navigation bar
* Page switching without reload
* No external routing library used
* Fast and lightweight SPA
* Beginner-friendly implementation

🧩 Methodology / Working

1. A state variable (`page`) is created using `useState`.
2. Navigation buttons update the state based on user clicks.
3. Conditional rendering is used to display the selected page component.
4. The navigation bar remains constant while page content changes dynamically.
5. Since React re-renders components without refreshing the browser, the application behaves as a Single Page Application.

📂 Project Structure

```
src/
 ├── Pages/
 │    ├── home.jsx
 │    ├── about.jsx
 │    └── contact.jsx
 ├── App.jsx
 ├── main.jsx
 └── App.css
```

 Result

A fully functional React Single Page Application was successfully created using `useState`. Navigation between pages occurs smoothly without reloading the browser, fulfilling the objectives of the experiment.

📌 Conclusion

This experiment helps in understanding the core concept of Single Page Applications in React. Using `useState` for navigation provides a simple and effective approach for small applications and helps beginners grasp the fundamentals of state management and conditional rendering.
