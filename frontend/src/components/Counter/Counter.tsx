import { useState } from "react"

const Counter = () => {
    const [count, setCount] = useState(0)
  // Function to increment the count
  const increment = () => {
    setCount(count + 1); // Updating the 'count' state
  };

  // Function to decrement the count
  const decrement = () => {
    setCount(count - 1); // Updating the 'count' state
  };

  return (
    <div>
      <h2>Counter</h2>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
      <button onClick={decrement}>Decrement</button>
    </div>
  );
}

export default Counter