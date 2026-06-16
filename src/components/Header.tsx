import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Activity, 
  Menu, 
  X, 
  User, 
  LogOut, 
  Calendar, 
  ShieldCheck, 
  UserCheck 
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setTab: (tab: string) => void;
  openLoginModal: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentTab, setTab, openLoginModal }) => {
  const { user, profile, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', id: 'home' },
    { name: 'Departments', id: 'departments' },
    { name: 'Our Doctors', id: 'doctors' },
    { name: 'Health Blog', id: 'blog' },
  ];

  const handleNavClick = (tabId: string) => {
    setTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-sm transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <div 
            onClick={() => handleNavClick('home')} 
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="bg-emerald-600 group-hover:bg-emerald-500 text-white p-2 rounded-xl transition-all shadow-md shadow-emerald-200 duration-300">
              <Activity className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight block">
                GreenLife<span className="text-emerald-600">Hospital</span>
              </span>
              <span className="text-[10px] sm:text-xs text-emerald-600 font-mono tracking-widest uppercase block -mt-1 font-semibold">
                Clinical Excellence
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`py-2 text-sm font-semibold tracking-tight transition-all relative ${
                  currentTab === item.id 
                    ? 'text-emerald-700 font-bold' 
                    : 'text-gray-600 hover:text-emerald-600'
                }`}
              >
                {item.name}
                {currentTab === item.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
                )}
              </button>
            ))}

            {/* Logged in views - Dashboard links */}
            {user && (
              <>
                <button
                  onClick={() => handleNavClick('dashboard')}
                  className={`flex items-center gap-1.5 py-2 text-sm font-semibold tracking-tight transition-all relative ${
                    currentTab === 'dashboard' 
                      ? 'text-emerald-700 font-bold' 
                      : 'text-gray-600 hover:text-emerald-600'
                  }`}
                >
                  <UserCheck className="h-4 w-4" />
                  Patient Dashboard
                  {currentTab === 'dashboard' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
                  )}
                </button>

                {isAdmin && (
                  <button
                    onClick={() => handleNavClick('admin')}
                    className={`flex items-center gap-1.5 py-2 text-sm font-semibold tracking-tight transition-all relative ${
                      currentTab === 'admin' 
                        ? 'text-emerald-700 font-bold' 
                        : 'text-gray-600 hover:text-emerald-600'
                    }`}
                  >
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    Admin Panel
                    {currentTab === 'admin' && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
                    )}
                  </button>
                )}
              </>
            )}
          </nav>

          {/* User Account Controls (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3 bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100/50 rounded-full pl-3 pr-4 py-1.5 transition-all">
                <div className="bg-emerald-600 text-white p-1.5 rounded-full">
                  <User className="h-3.5 w-3.5" />
                </div>
                <div className="text-left select-none">
                  <p className="text-xs font-bold text-gray-800 leading-tight">
                    {profile?.displayName || 'User'}
                  </p>
                  <p className="text-[10px] text-emerald-700 hover:underline capitalize leading-none">
                    {profile?.role || 'Patient'}
                  </p>
                </div>
                <div className="h-4 w-px bg-emerald-200/60 mx-1" />
                <button 
                  onClick={logout}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={openLoginModal}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-emerald-100 text-sm tracking-tight"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            {!user && (
              <button
                onClick={openLoginModal}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-lg text-xs tracking-tight shadow"
              >
                Sign In
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-emerald-50 bg-white shadow-xl px-4 py-6 space-y-4 animate-fadeIn">
          <div className="space-y-1.5">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`block w-full text-left px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                  currentTab === item.id 
                    ? 'bg-emerald-50 text-emerald-800' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {item.name}
              </button>
            ))}

            {user && (
              <>
                <button
                  onClick={() => handleNavClick('dashboard')}
                  className={`block w-full text-left px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                    currentTab === 'dashboard' 
                      ? 'bg-emerald-50 text-emerald-800' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Patient Dashboard
                </button>

                {isAdmin && (
                  <button
                    onClick={() => handleNavClick('admin')}
                    className={`block w-full text-left px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                      currentTab === 'admin' 
                        ? 'bg-emerald-50 text-emerald-800' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Admin Panel
                  </button>
                )}
              </>
            )}
          </div>

          {user && (
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 text-emerald-800 p-2 rounded-full">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm leading-tight">
                    {profile?.displayName || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{profile?.role}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-1.5 text-xs text-red-650 font-semibold bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-lg transition-all"
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
