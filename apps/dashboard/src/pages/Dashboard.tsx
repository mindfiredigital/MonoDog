import { Button } from '@/components/ui/button';
import { useState } from 'react';

const Dashboard = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="p-4">
      Dashboard Page
      <div className="card">
        <button onClick={() => setCount(count => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <Button>Click me shadcn</Button>
      <Button variant="outline">Button</Button>
    </div>
  );
};

export default Dashboard;
