import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RoomsPage from './pages/RoomsPage';
import RequestFormPage from './pages/RequestFormPage';
import RequestsPage from './pages/RequestsPage';
import AdminRequestsPage from './pages/AdminRequestsPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import UserProfilePage from './pages/UserProfilePage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/rooms" element={<RoomsPage />} />

        <Route
          path="/rooms/:roomId/request"
          element={
            <ProtectedRoute>
              <RequestFormPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/requests"
          element={
            <ProtectedRoute>
              <RequestsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/requests"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminRequestsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminAnalyticsPage />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/rooms" replace />} />
      </Routes>
    </Router>
  );
}

export default App;