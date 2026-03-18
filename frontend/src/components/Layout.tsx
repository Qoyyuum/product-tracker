import { Link, useLocation } from 'react-router-dom';
import { QrCode, Home, User, LogOut, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <QrCode className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">Product Tracker</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-md"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>
              
              <Link
                to="/"
                className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium"
              >
                <Home className="h-5 w-5" />
                <span>Home</span>
              </Link>
              
              <Link
                to="/scan"
                className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium"
              >
                <QrCode className="h-5 w-5" />
                <span>Scan</span>
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link
                    to="/manufacturer"
                    className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    <User className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="bg-primary-600 dark:bg-primary-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 dark:hover:bg-primary-600"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
            © 2026 Product Tracker. Free and open source for everyone.
          </p>
        </div>
      </footer>
    </div>
  );
}
