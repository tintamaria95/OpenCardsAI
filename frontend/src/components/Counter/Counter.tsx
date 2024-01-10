import { useState, useEffect } from "react"
import io from 'socket.io-client';

const socket = io('localhost:3000')

const Counter = () => {
  const [count, setCount] = useState(0)

  const handleClickIncr = () => {
    socket.emit('increment')
  }

  const handleClickDecr = () => {
    socket.emit('decrement')
  }
  
  const increment = () => {
    setCount((prevCount) => prevCount + 1)
  };

  const decrement = () => {
    setCount((prevCount) => prevCount - 1)
  };

  useEffect(() => {
    socket.on('increment', () => {
      increment()
    });

    socket.on('decrement', () => {
      decrement()
    });

    return () => {
      socket.off('increment');
      socket.off('decrement');
    };
  }, []);

  return (
    <div>
      <h2>Counter</h2>
      <p>Count: {count}</p>
      <button onClick={handleClickIncr}>Increment</button>
      <button onClick={handleClickDecr}>Decrement</button>
    </div>
  );
}

export default Counter