import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import HomePage from './pages/HomePage'
import DashboardPage from './pages/DashboardPage'
import { authAPI } from './api/api'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Function to check current auth state via API
  const checkCurrentAuthState = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      setIsAuthenticated(true);
      setUser(response.data);
      console.log('User authenticated:', response.data);
    } catch (error) {
      console.log('No authenticated user:', error.message);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Check auth state on app load
    checkCurrentAuthState();
  }, []);
  
  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };
  
  const handleLogout = async () => {
    try {
      await authAPI.logout();
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  // Helper function to check if current user is admin
  const isAdminUser = () => {
    return user && user.email === 'admin@lodging.com';
  };

  const isLoggedIn = isAuthenticated;
  const isAdmin = isAdminUser();
  
  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header isAuthenticated={isLoggedIn} user={user} onLogout={handleLogout} />
      <main className="flex-1 p-8 max-w-6xl mx-auto w-full">
        <Routes>
          <Route 
            path="/" 
            element={isLoggedIn && isAdmin ? <Navigate to="/dashboard" /> : <HomePage user={user} />} 
          />
          <Route 
            path="/dashboard" 
            element={isLoggedIn && isAdmin ? <DashboardPage /> : <Navigate to="/" />} 
          />
          <Route 
            path="/login" 
            element={!isLoggedIn ? <LoginPage onLogin={handleLogin} /> : (isAdmin ? <Navigate to="/dashboard" /> : <Navigate to="/" />)} 
          />
          <Route 
            path="/signup" 
            element={!isLoggedIn ? <SignupPage /> : (isAdmin ? <Navigate to="/dashboard" /> : <Navigate to="/" />)} 
          />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App