import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Upload from './pages/Upload';
import VideoPlayer from './pages/VideoPlayer';
import CampaignList from './pages/CampaignList';    // <--- IMPORTAR
import CampaignDetail from './pages/CampaignDetail'; // <--- IMPORTAR

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/upload" element={<Upload />} />
      <Route path="/watch/:id" element={<VideoPlayer />} />
      {/* NUEVAS RUTAS */}
      <Route path="/campaigns" element={<CampaignList />} />
      <Route path="/campaign/:id" element={<CampaignDetail />} />
    </Routes>
  );
}

export default App;