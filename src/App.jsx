import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './index.tsx';
import RegisterLocalPage from './RegisterLocalPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/registro" element={<RegisterLocalPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;