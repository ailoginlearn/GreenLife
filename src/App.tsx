import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Hero from './components/Hero';
import Departments from './components/Departments';
import Doctors from './components/Doctors';
import AppointmentBooking from './components/AppointmentBooking';
import PatientDashboard from './components/PatientDashboard';
import AdminPanel from './components/AdminPanel';
import AuthModal from './components/AuthModal';
import MockNotice from './components/MockNotice';
import BlogSection from './components/BlogSection';
import BlogCMS from './components/BlogCMS';
import { Doctor } from './lib/dbService';
import { 
  Heart, 
  MapPin, 
  Phone, 
  Mail, 
  HelpCircle, 
  Activity, 
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Award,
  ChevronDown
} from 'lucide-react';

function AppInner() {
  const { user, isAdmin } = useAuth();
  
  // Check if CMS search queries or hash is loaded
  const [isCMS] = useState(() => {
    const search = window.location.search;
    const hash = window.location.hash;
    return search.includes('page=cms') || search.includes('cms=') || hash === '#cms';
  });
  
  const [currentTab, setTab] = useState('home');
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<Doctor | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  if (isCMS) {
    return <BlogCMS />;
  }

  const handleBookDoctor = (doc: Doctor) => {
    setSelectedDoctorForBooking(doc);
    setTab('booking');
  };

  const handleSelectDepartment = (deptName: string) => {
    // Scroll to doctors search and filter
    setTab('doctors');
  };

  const bookingRedirectClose = () => {
    setSelectedDoctorForBooking(null);
    setTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      
      {/* Mock Sandbox Notification Banner */}
      <MockNotice />

      {/* Main Standard Clinic Header */}
      <Header 
        currentTab={currentTab} 
        setTab={(tabId) => {
          setSelectedDoctorForBooking(null);
          setTab(tabId);
        }} 
        openLoginModal={() => setAuthModalOpen(true)} 
      />

      {/* Page Routing Engine */}
      <main className="flex-grow">
        {currentTab === 'home' && (
          <div className="space-y-4">
            
            {/* 1. Hero Landing Block */}
            <Hero 
              onBookClick={() => setTab('booking')}
              onBrowseDoctors={() => setTab('doctors')}
              onBrowseDepartments={() => setTab('departments')}
            />

            {/* 2. Visual Clinic Stats Segment */}
            <section className="bg-emerald-900 text-white py-12 sm:py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                  <div className="space-y-2">
                    <p className="text-3xl sm:text-4xl font-extrabold text-emerald-300">25,000+</p>
                    <p className="text-xs sm:text-sm text-emerald-100 font-medium">Patients Managed</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-3xl sm:text-4xl font-extrabold text-emerald-300">65+</p>
                    <p className="text-xs sm:text-sm text-emerald-100 font-medium">Certified Medics</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-3xl sm:text-4xl font-extrabold text-emerald-300">12+</p>
                    <p className="text-xs sm:text-sm text-emerald-100 font-medium">Clinical Departments</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-3xl sm:text-4xl font-extrabold text-emerald-300">15 Mins</p>
                    <p className="text-xs sm:text-sm text-emerald-100 font-medium">Average Wait Period</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Core Features Bento */}
            <section className="py-16 bg-white border-y border-slate-100 text-left">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                  <span className="text-emerald-700 font-bold text-xs uppercase bg-emerald-50 px-3.5 py-1.5 rounded-full inline-block border border-emerald-100">
                    Clinic Infrastructure
                  </span>
                  <h3 className="text-2xl sm:text-4xl font-extrabold text-gray-950 mt-3 tracking-tight">
                    Engineered for Precision Medical Care
                  </h3>
                  <p className="mt-3 text-sm sm:text-base text-gray-500 leading-relaxed font-semibold">
                    Our web portal fully connects patients, clinicians, and medical records securely.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Card 1 */}
                  <div className="bg-slate-50 border border-slate-150 p-6 sm:p-8 rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="inline-flex bg-emerald-600 text-white p-3 rounded-2xl shadow-md">
                      <Activity className="h-5 w-5" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">Virtual Slot Reservation</h4>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
                      Select physician calendars, choose open hourly ranges, and schedule clinical sessions in 3 steps. Re-schedule or cancel anytime.
                    </p>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-slate-50 border border-slate-150 p-6 sm:p-8 rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="inline-flex bg-emerald-600 text-white p-3 rounded-2xl shadow-md">
                      <HelpCircle className="h-5 w-5" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">Personal File Cabin</h4>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
                      Securely upload diagnostic sheets, blood lab logs, and scanned records into your encrypted profile. Only you and admins retain access.
                    </p>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-slate-50 border border-slate-150 p-6 sm:p-8 rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="inline-flex bg-emerald-600 text-white p-3 rounded-2xl shadow-md">
                      <Award className="h-5 w-5" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">Operations Control</h4>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
                      Admin panel features allow clinical managers to enlist working physicians, audit case files, control active queues, and track patients.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. Quick FAQ Accordion */}
            <section className="py-16 sm:py-24 bg-slate-50 text-left">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight">
                    Frequently Answered Questions
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 font-bold">Answers to general clinical system queries</p>
                </div>

                <div className="space-y-4">
                  {[
                    { q: "How do I book a consultation with a specialist?", a: "Navigate to the 'Our Doctors' or 'Departments' tab, choose a physician, and click 'Schedule Slot'. If you are not signed in, you will be prompted to login safely." },
                    { q: "Is the documentation storage secure?", a: "Extremely secure. All uploaded clinic files, appointment requests, and patient diagnostic summaries are managed on Google Firestore databases partitioned strictly by rule sets." },
                    { q: "How do I administrative rosters?", a: "Administrators can log in with authorised profiles to create or dismiss doctors, adjust status listings to completed/cancelled, and audit diagnostic case files." }
                  ].map((faq, idx) => (
                    <div 
                      key={idx} 
                      className="bg-white border border-gray-150 rounded-2xl overflow-hidden transition-all shadow-sm"
                    >
                      <button
                        onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                        className="w-full flex items-center justify-between p-5 text-gray-900 hover:text-emerald-800 font-bold text-sm sm:text-base text-left transition-colors cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${faqOpen === idx ? 'transform rotate-180 text-emerald-600' : ''}`} />
                      </button>
                      {faqOpen === idx && (
                        <div className="p-5 pt-0 border-t border-gray-50 text-xs sm:text-sm text-gray-600 leading-relaxed font-semibold">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>

          </div>
        )}

        {currentTab === 'departments' && (
          <Departments onSelectDepartment={handleSelectDepartment} />
        )}

        {currentTab === 'doctors' && (
          <Doctors selectedDepartment="" onBookDoctor={handleBookDoctor} />
        )}

        {currentTab === 'blog' && (
          <BlogSection />
        )}

        {currentTab === 'booking' && (
          <div className="py-12 sm:py-20 bg-slate-50 px-4">
            <AppointmentBooking 
              preSelectedDoctor={selectedDoctorForBooking} 
              onSuccessClose={bookingRedirectClose} 
              openLoginModal={() => setAuthModalOpen(true)}
            />
          </div>
        )}

        {currentTab === 'dashboard' && (
          user ? (
            <PatientDashboard />
          ) : (
            <div className="py-24 sm:py-32 bg-slate-50 px-4 text-center max-w-lg mx-auto space-y-6">
              <div className="inline-flex bg-amber-50 text-amber-600 p-4 rounded-full border border-amber-100 shadow-inner">
                <ShieldAlert className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-gray-950 tracking-tight">Patient Shield Locked</h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed font-semibold">
                  To protect medical records and HIPAA compliance, patient dashboards require secure authentication credentials.
                </p>
              </div>
              <div>
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="bg-emerald-650 hover:bg-emerald-700 text-white font-bold px-6 py-3.5 rounded-2xl shadow transition-colors text-sm"
                >
                  Sign In Your Hospital Account
                </button>
              </div>
            </div>
          )
        )}

        {currentTab === 'admin' && (
          user && isAdmin ? (
            <AdminPanel />
          ) : (
            <div className="py-24 sm:py-32 bg-slate-50 px-4 text-center max-w-lg mx-auto space-y-6">
              <div className="inline-flex bg-red-50 text-red-650 p-4 rounded-full border border-red-100 shadow-inner">
                <ShieldAlert className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-gray-950 tracking-tight">Access Control Denied</h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed font-semibold">
                  You are signed in as a patient profile. Changing operations dashboard credentials requires elevated administrator clearance privileges.
                </p>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="bg-gray-800 hover:bg-gray-900 text-white font-bold px-5 py-3 rounded-xl shadow transition-colors text-xs inline-block"
                >
                  Switch Profiles / Log In Demo Admin
                </button>
              </div>
            </div>
          )
        )}
      </main>

      {/* Main Standard Clinic Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800 text-left text-xs sm:text-sm font-medium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-600 text-white p-2 rounded-lg">
                <Activity className="h-5 w-5" />
              </div>
              <span className="text-white font-bold text-lg">GreenLife Hospital</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed font-semibold">
              Premium medical treatments, accredited procedures, and secure documentation cloud architectures.
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-3.5">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs">Medical Services</h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li><button onClick={() => setTab('departments')} className="hover:text-emerald-400 transition-colors">Cardiology Center</button></li>
              <li><button onClick={() => setTab('departments')} className="hover:text-emerald-400 transition-colors">Clinical Neurology</button></li>
              <li><button onClick={() => setTab('departments')} className="hover:text-emerald-400 transition-colors">Pediatric Care</button></li>
              <li><button onClick={() => setTab('departments')} className="hover:text-emerald-400 transition-colors">Dermatology Skin Unit</button></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-3.5">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs">Patient Access</h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li><button onClick={() => setTab('booking')} className="hover:text-emerald-400 transition-colors">Appointment Booking</button></li>
              <li><button onClick={() => setTab('dashboard')} className="hover:text-emerald-400 transition-colors">Review Personal Reports</button></li>
              <li><button onClick={() => setAuthModalOpen(true)} className="hover:text-emerald-400 transition-colors">Credential Onboarding</button></li>
              <li><button onClick={() => setTab('blog')} className="hover:text-emerald-400 transition-colors">Wellness Newsroom</button></li>
              <li><button onClick={() => setTab('admin')} className="hover:text-emerald-400 transition-colors">Operator Registry</button></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-3.5">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs">Clinic Contacts</h4>
            <ul className="space-y-2.5 text-xs text-gray-400 font-semibold">
              <li className="flex items-center gap-2">
                <MapPin className="h-4.5 w-4.5 text-emerald-500 flex-shrink-0" />
                <span>100 Health Way, Emerald Hills</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4.5 w-4.5 text-emerald-500 flex-shrink-0" />
                <span>1-800-GREENLIFE</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4.5 w-4.5 text-emerald-500 flex-shrink-0" />
                <span>registry@greenlifehospital.org</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} GreenLife Hospital Inc. All Rights Reserved.</p>
          <div className="flex gap-4">
            <span className="hover:underline cursor-pointer select-none">HIPAA Security Guard</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer select-none">Terms of Care</span>
          </div>
        </div>
      </footer>

      {/* Main Single Onboarding Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
