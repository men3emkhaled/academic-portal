import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const links = [
    { name: 'Home', path: '/' },
    { name: 'Roadmap', path: '/roadmap' },
    { name: 'Grades', path: '/grades' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="bg-dark-card border-b border-primary/20 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary">
          Academic Portal
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link key={link.path} to={link.path} className="text-gray-300 hover:text-primary transition-colors">
              {link.name}
            </Link>
          ))}
          {token ? (
            <>
              <Link to="/admin" className="text-gray-300 hover:text-primary">Admin</Link>
              <button onClick={handleLogout} className="text-red-400 hover:text-red-300">Logout</button>
            </>
          ) : (
            <Link to="/admin" className="text-gray-300 hover:text-primary">Admin Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;