import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <button onClick={() => setCount((count) => count + 1)} className="w-1/2 h-8 bg-amber-300 rounded-xl hover:bg-amber-500 hover:cursor-pointer sm:w-1/4">
        count is {count}
      </button>
    </div>
  );
}

export default App;
