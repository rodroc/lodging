import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { authAPI } from '../api/api';

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await authAPI.login({
        email,
        password
      });
      
      // No need to store tokens in localStorage - cookies handle this
      if (onLogin) {
        onLogin(response.data.user);
      }
      
      // Check if user is admin and redirect accordingly
      const userEmail = response.data.user.email;
      const isAdmin = userEmail === 'admin@lodging.com';
      
      if (isAdmin) {
        // Only admin can access dashboard
        navigate('/dashboard', { replace: true });
      } else {
        // Non-admin users redirect to home
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Login</h1>
        {error && <div className="error-message">{error}</div>}
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
        
        <p className="mt-6 text-center text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 hover:text-blue-500 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;