import { useState } from "react";
import "./Counter.css";

function Counter() {

  const [count, setCount] = useState(0);

  const increment = () => {
    setCount(count + 1);
  };

  const decrement = () => {
    setCount(count - 1);
  };

  return (
    <div className="counter-box">

      <h2 className="number">{count}</h2>

      <div className="buttons">
        <button className="btn inc" onClick={increment}>
          Increment
        </button>

        <button className="btn dec" onClick={decrement}>
          Decrement
        </button>
      </div>

    </div>
  );
}

export default Counter;