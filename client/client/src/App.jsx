import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register'; // Nuevo
import ForgotPassword from './pages/ForgotPassword'; // Nuevo
import ResetPassword from './pages/ResetPassword'; // Nuevo
import Upload from './pages/Upload';
import VideoPlayer from './pages/VideoPlayer';
import CampaignList from './pages/CampaignList';
import CampaignDetail from './pages/CampaignDetail';

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
    </Routes>
  );
}

export default App;