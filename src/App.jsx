import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './index.tsx';
import RegisterLocalPage from './RegisterLocalPage';
import LocalPage from './LocalPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/registro" element={<RegisterLocalPage />} />
        <Route path="/local" element={<LocalPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;