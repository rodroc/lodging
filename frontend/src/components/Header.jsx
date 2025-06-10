import { Link, useNavigate } from 'react-router-dom';

function Header({ isAuthenticated, user, onLogout }) {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  // Check if current user is admin
  const isAdmin = user && user.email === 'admin@lodging.com';
  
  return (
    <header className="bg-teal-600 text-white shadow-lg">
      <div className="px-4 py-4 flex justify-between items-center max-w-6xl mx-auto md:px-8">
        <div className="logo">
          <Link 
            to={isAuthenticated && isAdmin ? "/dashboard" : "/"} 
            className="text-xl font-bold text-white hover:text-teal-100 transition-colors duration-200"
          >
            Lodging App
          </Link>
        </div>
        <nav className="flex items-center">
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <span className="hidden md:block text-teal-100">
                Welcome, {user?.name || 'User'}
              </span>
              <button 
                className="bg-transparent border border-white text-white px-4 py-2 rounded-lg hover:bg-white hover:text-teal-600 transition-colors duration-200"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-6">
              <Link 
                to="/login" 
                className="text-white hover:text-teal-100 transition-colors duration-200"
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="bg-white text-teal-600 px-4 py-2 rounded-lg hover:bg-teal-50 transition-colors duration-200 font-medium"
              >
                Sign Up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;