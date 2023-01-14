import React, { useState } from 'react';
import './App.css';

function App() {

  let elemets: string[] = []
  const [count, setCount] = useState(0);


  return (
    <>
    <div className='count'>
        <button onClick={() => {
          setCount(count - 1);
          elemets.push("")
        }}>-</button>
      <p>{ count }</p>
      <button onClick={()=>{
          setCount(count + 1);
          elemets.slice(0);
        }}>+</button>
      </div>
    </>
  );
}

export default App;
