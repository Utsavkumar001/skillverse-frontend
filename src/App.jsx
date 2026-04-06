import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import AgentDetail from './pages/AgentDetail';
import Chat from './pages/Chat';
import Login from './pages/Login';
import Register from './pages/Register';
import CreatorDashboard from './pages/CreatorDashboard';
import AgentBuilder from './pages/AgentBuilder';
import MyLibrary from './pages/MyLibrary';
import EditAgent from './pages/EditAgent';



export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/agent/:id" element={<AgentDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/chat/:agentId" element={
            <ProtectedRoute><Chat /></ProtectedRoute>
          } />
          <Route path="/creator/dashboard" element={
            <ProtectedRoute><CreatorDashboard /></ProtectedRoute>
          } />
          <Route path="/creator/build" element={
            <ProtectedRoute><AgentBuilder /></ProtectedRoute>
          } />
          <Route path="/my-library" element={
            <ProtectedRoute><MyLibrary /></ProtectedRoute>
          } />
        </Routes>
        <Route path="/creator/edit/:id" element={
  <ProtectedRoute><EditAgent /></ProtectedRoute>
} />
      </BrowserRouter>
    </AuthProvider>
  );
}