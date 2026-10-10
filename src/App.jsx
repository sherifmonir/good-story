import { Outlet } from 'react-router-dom';
import './index.css';

function App() {
  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <Outlet />
      </div>
    </main>
  );
}

export default App;




