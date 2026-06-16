import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  X, 
  ShieldAlert, 
  Users, 
  Sparkles, 
  Activity,
  HeartHandshake
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginWithGoogle, loginAsDemo, loading } = useAuth();
  const [errorMess, setErrorMess] = useState('');
  const [sigLoading, setSigLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMess('');
    setSigLoading(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMess("We could not complete Google Authentication. Please confirm your internet connection.");
    } finally {
      setSigLoading(false);
    }
  };

  const handleDemoSignIn = async (role: 'patient' | 'admin') => {
    setErrorMess('');
    setSigLoading(true);
    try {
      await loginAsDemo(role);
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMess("Failed to initialize demo credential profile state.");
    } finally {
      setSigLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl border border-gray-150 w-full max-w-md overflow-hidden shadow-2xl relative text-left">
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute right-5 top-5 text-gray-400 hover:text-gray-700 p-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-all z-10"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        {/* Modal Hero Banner */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 px-6 py-10 text-white relative text-center">
          <div className="absolute top-4 left-4 text-emerald-100 opacity-20">
            <Activity className="h-16 w-16" />
          </div>
          <div className="mx-auto mb-3 bg-white/10 p-3.5 rounded-full inline-block backdrop-blur-sm border border-white/10 text-emerald-50 shadow-inner">
            <HeartHandshake className="h-6 w-6" />
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Clinic Account Shield
          </h3>
          <p className="text-xs text-emerald-100 max-w-xs mx-auto mt-1 leading-relaxed font-semibold">
            Google authenticated hospital record security portal. Access patient directories, clinical schedules, and diagnostic cabinets securely.
          </p>
        </div>

        {/* Modal Actions */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {errorMess && (
            <div className="bg-red-50 border border-red-150 rounded-xl p-3 text-red-950 text-xs font-semibold flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-red-650 flex-shrink-0" />
              <span>{errorMess}</span>
            </div>
          )}

          {/* Primary Action: Google Auth */}
          <div className="space-y-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={sigLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl transition-all shadow-md hover:shadow-emerald-100 text-sm tracking-tight flex items-center justify-center gap-2.5 cursor-pointer disabled:bg-gray-300 border-none"
            >
              <svg className="h-4.5 w-4.5 fill-white" viewBox="0 0 24 24">
                <path d="M12.24 10.285V13.4h6.887C18.2 15.414 15.56 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.7 0 3.3.6 4.6 1.7l2.42-2.42C17.1 1.414 14.8.414 12.24.414.4 2.4.4.4.4c0 6.386.4 11.6 11.84 11.6 5.86 0 10.14-4 10.14-10H12.24z-1-.1l8.72 2.22" />
              </svg>
              <span>Sync with Google Account</span>
            </button>
            <p className="text-[10px] text-gray-400 text-center uppercase tracking-wider font-bold">
              OR EXPLORE THE APP INSTANTLY
            </p>
          </div>

          {/* Secondary Demo Roles Loggers */}
          <div className="space-y-3">
            <button
              onClick={() => handleDemoSignIn('patient')}
              disabled={sigLoading}
              className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-150 py-3 rounded-xl transition-all text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:bg-gray-100"
            >
              <Users className="h-4.5 w-4.5 text-emerald-650" />
              <span>Log In as Demo Patient</span>
            </button>

            <button
              onClick={() => handleDemoSignIn('admin')}
              disabled={sigLoading}
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 py-3 rounded-xl transition-all text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:bg-gray-100"
            >
              <ShieldAlert className="h-4.5 w-4.5 text-emerald-600" />
              <span>Log In as Demo Administrator</span>
            </button>
          </div>

          <p className="text-[10px] text-gray-400 text-center leading-relaxed">
            By connecting, you agree to secure clinical records maintenance. All user data is encrypted and partitioned strictly inside cloud databases.
          </p>

        </div>
      </div>
    </div>
  );
};

export default AuthModal;
