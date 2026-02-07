import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Upload from './pages/Upload';
import VideoPlayer from './pages/VideoPlayer';
import CampaignList from './pages/CampaignList';
import CampaignDetail from './pages/CampaignDetail';
import CreateCampaign from './pages/CreateCampaign'; // Importar nueva página

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/upload" element={<Upload />} />
      <Route path="/watch/:id" element={<VideoPlayer />} />
      <Route path="/campaigns" element={<CampaignList />} />
      <Route path="/campaign/:id" element={<CampaignDetail />} />
      
      {/* Nueva Ruta para Crear Campaña */}
      <Route path="/create-campaign" element={<CreateCampaign />} />
    </Routes>
  );
}

export default App;