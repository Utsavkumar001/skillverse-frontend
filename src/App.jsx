import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
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
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AgentAnalytics from './pages/AgentAnalytics';
import EmbedChat from './pages/EmbedChat';
import ApiDocs from './pages/ApiDocs';
import Footer from './components/Footer';


export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Embed route — no navbar, no footer */}
          <Route path="/embed/:agentId" element={<EmbedChat />} />

          {/* Main app — with navbar + footer */}
          <Route path="/*" element={
            <>
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/agent/:id" element={<AgentDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/api-docs" element={<ApiDocs />} />
                <Route path="/chat/:agentId" element={
                  <ProtectedRoute><Chat /></ProtectedRoute>
                } />
                <Route path="/creator/dashboard" element={
                  <ProtectedRoute><CreatorDashboard /></ProtectedRoute>
                } />
                <Route path="/creator/build" element={
                  <ProtectedRoute><AgentBuilder /></ProtectedRoute>
                } />
                <Route path="/creator/edit/:id" element={
                  <ProtectedRoute><EditAgent /></ProtectedRoute>
                } />
                <Route path="/creator/analytics/:id" element={
                  <ProtectedRoute><AgentAnalytics /></ProtectedRoute>
                } />
                <Route path="/my-library" element={
                  <ProtectedRoute><MyLibrary /></ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute><Profile /></ProtectedRoute>
                } />
              </Routes>
              <Footer />
            </>
          } />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}