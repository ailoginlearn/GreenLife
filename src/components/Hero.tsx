import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  ShieldAlert, 
  ClipboardCheck, 
  Clock, 
  BookOpen, 
  Sparkles, 
  Users, 
  HeartHandshake, 
  Stethoscope 
} from 'lucide-react';

interface HeroProps {
  onBookClick: () => void;
  onBrowseDoctors: () => void;
  onBrowseDepartments: () => void;
}

const Hero: React.FC<HeroProps> = ({ onBookClick, onBrowseDoctors, onBrowseDepartments }) => {
  const { user, loginAsDemo } = useAuth();

  const handleQuickDemoPatient = () => {
    loginAsDemo('patient');
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-emerald-50/60 via-white to-white">
      {/* Visual background decorations */}
      <div className="absolute top-0 right-0 -z-10 w-[400px] h-[400px] bg-emerald-100/30 rounded-full blur-3xl opacity-80" />
      <div className="absolute bottom-20 left-10 -z-10 w-[300px] h-[300px] bg-mint-100/20 rounded-full blur-2xl opacity-75" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 items-center">
          
          {/* Left Text Detail */}
          <div className="lg:col-span-7 flex flex-col justify-center text-left">
            <div className="inline-flex items-center gap-1.5 self-start px-3.5 py-1.5 bg-emerald-50 rounded-full text-emerald-800 text-xs sm:text-sm font-semibold tracking-wide border border-emerald-100 mb-6 sm:mb-8 animate-pulse">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              <span>Pioneering Healthcare Innovation</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-950 tracking-tight leading-tight sm:leading-none">
              Your Health is Our <span className="text-emerald-600 block sm:inline">Absolute Priority</span>
            </h1>
            
            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-gray-650 max-w-2xl leading-relaxed">
              Experience the highest levels of professional clinical attention and cutting-edge medical treatments. 
              Book instant consultations, securely upload diagnostic files, and schedule appointments with 
              leading specialists in a green, safe, and technologically secure platform.
            </p>

            <div className="mt-8 sm:mt-10 flex flex-wrap gap-4 items-center">
              <button
                onClick={onBookClick}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-200/85 hover:shadow-emerald-250 cursor-pointer text-sm sm:text-base tracking-tight"
              >
                <Calendar className="h-5 w-5" />
                Book Appointment Only
              </button>

              <button
                onClick={onBrowseDoctors}
                className="bg-white hover:bg-gray-50 text-gray-800 font-bold px-6 py-3.5 rounded-xl border border-gray-200 transition-all text-sm sm:text-base tracking-tight shadow-sm hover:shadow-md"
              >
                View Doctors Listing
              </button>
            </div>

            {/* Quick Demo Sign Ins */}
            {!user && (
              <div className="mt-12 pt-8 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Quick Access Simulation (No Configuration Required):
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleQuickDemoPatient}
                    className="bg-emerald-50 hover:bg-emerald-100/90 text-emerald-800 text-xs font-bold px-4 py-2.5 rounded-lg border border-emerald-150 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <Users className="h-3.5 w-3.5" />
                    Enter as Demo Patient
                  </button>
                  <button
                    onClick={() => loginAsDemo('admin')}
                    className="bg-gray-50 hover:bg-gray-100 text-gray-800 text-xs font-bold px-4 py-2.5 rounded-lg border border-gray-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <ShieldAlert className="h-3.5 w-3.5 text-emerald-600" />
                    Enter as Demo Administrator
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Visual Graphical Panel */}
          <div className="lg:col-span-5 relative mt-8 lg:mt-0">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl blur opacity-25" />
              
              <div className="relative bg-white border border-emerald-50 rounded-3xl p-6 sm:p-8 shadow-2xl">
                {/* Visual Medical Card */}
                <div className="absolute -top-6 -right-6 bg-emerald-600 text-white p-4 rounded-2xl shadow-xl shadow-emerald-200/80 animate-bounce">
                  <HeartHandshake className="h-7 w-7" />
                </div>

                <div className="space-y-6">
                  {/* Doctor Info Card */}
                  <div className="flex items-center gap-4 border-b border-gray-100 pb-5">
                    <img
                      src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150"
                      alt="Doctor Cover"
                      className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500"
                    />
                    <div>
                      <h4 className="font-bold text-gray-900 text-base leading-tight">Dr. Sarah Jenkins</h4>
                      <p className="text-xs text-emerald-700 font-semibold mt-0.5">Chief Medical Director & Cardiologist</p>
                    </div>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 gap-4 pb-2">
                    <div className="bg-emerald-50/50 p-3 sm:p-4 rounded-2xl border border-emerald-100/40 text-left">
                      <p className="text-2xl sm:text-3xl font-extrabold text-emerald-800">100%</p>
                      <p className="text-[11px] sm:text-xs text-gray-600 font-semibold mt-1">Care & Success Rate</p>
                    </div>
                    <div className="bg-emerald-50/50 p-3 sm:p-4 rounded-2xl border border-emerald-100/40 text-left">
                      <p className="text-2xl sm:text-3xl font-extrabold text-emerald-800 font-sans">48h</p>
                      <p className="text-[11px] sm:text-xs text-gray-600 font-semibold mt-1">Diagnostic Turnaround</p>
                    </div>
                  </div>

                  {/* Trust Factors */}
                  <div className="space-y-3.5 pt-2">
                    <div className="flex items-center gap-3 text-left">
                      <div className="bg-emerald-100 text-emerald-800 p-1.5 rounded-lg">
                        <ClipboardCheck className="h-4 w-4" />
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 font-medium">Fully accredited clinical practices.</p>
                    </div>

                    <div className="flex items-center gap-3 text-left">
                      <div className="bg-emerald-100 text-emerald-800 p-1.5 rounded-lg">
                        <Clock className="h-4 w-4" />
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 font-medium">24/7 ER availability, call line on 1-800-GREEN.</p>
                    </div>

                    <div className="flex items-center gap-3 text-left">
                      <div className="bg-emerald-100 text-emerald-800 p-1.5 rounded-lg">
                        <Stethoscope className="h-4 w-4" />
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 font-medium">Expert medical consulting & video reviews.</p>
                    </div>
                  </div>

                  {/* Interactive Quick Stats Ribbon */}
                  <div className="pt-2">
                    <button
                      onClick={onBrowseDepartments}
                      className="w-full text-center text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      Browse Medical Specialties
                      <BookOpen className="h-3.5 w-3.5" />
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Hero;
