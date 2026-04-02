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

  const publicLinks = [
    { name: 'Roadmap', path: '/roadmap' },
    { name: 'Grades', path: '/grades' },
    { name: 'Contact', path: '/contact' },
  ];

  const adminLinks = token ? [{ name: 'Admin', path: '/admin' }] : [];
  const allLinks = [...publicLinks, ...adminLinks];

  return (
    <nav className="bg-charcoal border-b border-neon sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold neon-text">
          Academic Portal
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {allLinks.map((link) => (
            <Link key={link.path} to={link.path} className="text-gray-300 hover:text-neon transition-colors duration-200 font-medium">
              {link.name}
            </Link>
          ))}
          {token && (
            <button onClick={handleLogout} className="text-gray-300 hover:text-neon transition-colors duration-200 font-medium">
              Logout
            </button>
          )}
        </div>

        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/20 hover:border-neon transition-all duration-200 focus:outline-none">
          <div className="relative w-5 h-5">
            <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-5 h-0.5 bg-white rounded-full transition-all duration-300 ${isOpen ? 'rotate-45 opacity-0' : 'rotate-0 opacity-100'}`} />
            <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-5 h-0.5 bg-white rounded-full transition-all duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`} />
            <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-5 h-0.5 bg-white rounded-full transition-all duration-300 ${isOpen ? '-rotate-45' : 'rotate-0'}`} />
          </div>
        </button>
      </div>

      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-charcoal/95 backdrop-blur-sm border-t border-neon/30 px-4 py-4 flex flex-col gap-3">
          {allLinks.map((link) => (
            <Link key={link.path} to={link.path} onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-neon transition-colors duration-200 text-lg py-2 px-3 rounded-lg hover:bg-white/5">
              {link.name}
            </Link>
          ))}
          {token && (
            <button onClick={handleLogout} className="text-left text-gray-300 hover:text-neon transition-colors duration-200 text-lg py-2 px-3 rounded-lg hover:bg-white/5">
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;