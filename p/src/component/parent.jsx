import { useState } from "react";
import Demo from "./demo";

function Parent() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
  }

  return (
    <div>
      <h2>Parent Component</h2>
      <button onClick={handleClick}>Click Me</button>

      {/* Passing count to child */}
      <Demo clicks={count} />
    </div>
  );
}

export default Parent;
