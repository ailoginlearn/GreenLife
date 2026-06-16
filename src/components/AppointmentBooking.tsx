import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { dbService, Doctor, Appointment } from '../lib/dbService';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  User, 
  Stethoscope, 
  CheckCircle2, 
  X, 
  Lock, 
  ShieldAlert 
} from 'lucide-react';

interface AppointmentBookingProps {
  preSelectedDoctor: Doctor | null;
  onSuccessClose: () => void;
  openLoginModal: () => void;
}

const AppointmentBooking: React.FC<AppointmentBookingProps> = ({ 
  preSelectedDoctor, 
  onSuccessClose, 
  openLoginModal 
}) => {
  const { user, profile } = useAuth();
  
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMess, setErrorMess] = useState('');

  const departments = ['all', 'Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Dermatology', 'General Medicine'];

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const docList = await dbService.getDoctors();
        setDoctors(docList);
      } catch (err) {
        console.error("Error loading doctors for booking form:", err);
      }
    };
    fetchDoctors();
  }, []);

  // Pre-seed preSelectedDoctor values if any
  useEffect(() => {
    if (preSelectedDoctor) {
      setSelectedDept(preSelectedDoctor.department);
      setSelectedDoctorId(preSelectedDoctor.id);
      if (preSelectedDoctor.availability?.length > 0) {
        setSelectedTime(preSelectedDoctor.availability[0]);
      }
    }
  }, [preSelectedDoctor]);

  // Sync available doctors matching selected Department
  const filteredDoctors = doctors.filter(d => selectedDept === 'all' || d.department === selectedDept);
  const currentDoctorObj = doctors.find(d => d.id === selectedDoctorId);

  // Handle doctor change
  const handleDoctorChange = (docId: string) => {
    setSelectedDoctorId(docId);
    const docObj = doctors.find(d => d.id === docId);
    if (docObj && docObj.availability?.length > 0) {
      setSelectedTime(docObj.availability[0]);
    } else {
      setSelectedTime('');
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMess('');

    if (!user) {
      setErrorMess("Please sign in to your clinic profile first before securing a slot reservation.");
      openLoginModal();
      return;
    }

    if (!selectedDoctorId) {
      setErrorMess("Diagnostic Selection Error: Please choose a valid consulting physician.");
      return;
    }

    if (!selectedDate) {
      setErrorMess("Calendar Selection Error: Please choose your preferred calendar date on the picker.");
      return;
    }

    if (!selectedTime) {
      setErrorMess("Schedule Slot Selection Error: Please pick an open hourly session slot.");
      return;
    }

    setLoading(true);
    try {
      const activeDoc = doctors.find(d => d.id === selectedDoctorId)!;
      await dbService.createAppointment({
        userId: user.uid,
        userName: profile?.displayName || user.displayName || 'Authorized User',
        userEmail: user.email || '',
        doctorId: activeDoc.id,
        doctorName: activeDoc.name,
        department: activeDoc.department,
        date: selectedDate,
        timeSlot: selectedTime,
        notes: notes || 'General wellness monitoring consult.'
      });
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setErrorMess("We could not register your appointment details. Check your internet connectivity or Firebase configuration.");
    } finally {
      setLoading(false);
    }
  };

  // Get current date representation in YYYY-MM-DD
  const getTodayDateString = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  };

  if (success) {
    return (
      <div className="bg-white max-w-xl mx-auto px-6 py-12 sm:p-16 rounded-3xl border border-emerald-100 shadow-xl text-center space-y-6 animate-fadeIn">
        <div className="inline-flex bg-emerald-50 text-emerald-600 p-4 rounded-full shadow-inner">
          <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12" />
        </div>
        <div>
          <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">Appointment Booked Successfully!</h3>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            Your clinical consultation record has been logged in our cloud registry. You can check, monitor, and manage clinical progress on your secure patient dashboard.
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-150 rounded-2xl p-5 space-y-2.5 text-left text-sm text-gray-700">
          <div className="flex justify-between font-bold">
            <span className="text-gray-400 font-semibold">Physician:</span>
            <span>{currentDoctorObj?.name}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span className="text-gray-400 font-semibold">Specialty:</span>
            <span>{currentDoctorObj?.department} ({currentDoctorObj?.specialty})</span>
          </div>
          <div className="flex justify-between font-bold">
            <span className="text-gray-400 font-semibold">Scheduled Date:</span>
            <span>{selectedDate}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span className="text-gray-400 font-semibold">Consult Time:</span>
            <span>{selectedTime}</span>
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={onSuccessClose}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl transition-all shadow-md hover:shadow-emerald-100 cursor-pointer text-sm"
          >
            Review Patient Dashboard Queue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white max-w-3xl mx-auto rounded-3xl border border-gray-200 shadow-xl overflow-hidden text-left">
      {/* Title */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 px-6 py-8 sm:px-10 text-white relative">
        <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Clinical Appointment Scheduler
        </h3>
        <p className="text-xs sm:text-sm text-emerald-100 mt-1.5 leading-relaxed font-medium">
          Fill out the medical scheduling matrix below. Selected clinical departments will instantly update real-time physician rosters.
        </p>
      </div>

      <form onSubmit={handleBookingSubmit} className="p-6 sm:p-10 space-y-6 sm:space-y-8">
        
        {/* Sign In Guard Alert */}
        {!user && (
          <div className="bg-amber-50 border border-amber-150 rounded-2xl p-4 flex gap-3.5 items-start text-amber-900 text-sm">
            <Lock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Authentication Checkpoint Required</p>
              <p className="text-xs text-amber-700 mt-1">
                You must login to register details in our database. Click the button to sync your Google Account or access via instant demo patient.
              </p>
              <button
                type="button"
                onClick={openLoginModal}
                className="mt-3 bg-amber-600 hover:bg-amber-750 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg border border-transparent transition-all shadow-sm"
              >
                Sign In Patient Portal
              </button>
            </div>
          </div>
        )}

        {errorMess && (
          <div className="bg-red-50 border border-red-150 rounded-2xl p-4 flex gap-3 text-red-900 text-xs sm:text-sm">
            <ShieldAlert className="h-5 w-5 text-red-650 flex-shrink-0 mt-0.5" />
            <span>{errorMess}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Department Selection */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-gray-500 uppercase tracking-widest block">
              1. Hospital Department
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-emerald-700 font-bold">
                <MapPin className="h-4.5 w-4.5" />
              </span>
              <select
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  setSelectedDoctorId('');
                  setSelectedTime('');
                }}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-250 focus:border-emerald-500 rounded-2xl text-sm font-semibold text-gray-800 transition-colors"
                disabled={!!preSelectedDoctor}
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept === 'all' ? 'All Departments' : `${dept} Department`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Doctor Selection */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-gray-500 uppercase tracking-widest block">
              2. Consulting Physician
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-emerald-700 font-bold">
                <Stethoscope className="h-4.5 w-4.5" />
              </span>
              <select
                value={selectedDoctorId}
                onChange={(e) => handleDoctorChange(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-250 focus:border-emerald-500 rounded-2xl text-sm font-semibold text-gray-800 transition-colors"
                disabled={!!preSelectedDoctor}
              >
                <option value="">-- Choose Specialist --</option>
                {filteredDoctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} - ({doc.specialty})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Appointment Date Picker */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-gray-500 uppercase tracking-widest block">
              3. Scheduled Date
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-emerald-700 font-bold">
                <Calendar className="h-4.5 w-4.5" />
              </span>
              <input
                type="date"
                min={getTodayDateString()}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-250 focus:border-emerald-500 rounded-2xl text-sm font-semibold text-gray-800 transition-colors"
              />
            </div>
          </div>

          {/* Hourly Time Slot Selection */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-gray-500 uppercase tracking-widest block">
              4. Time Slot
            </label>
            {currentDoctorObj ? (
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-emerald-700 font-bold">
                  <Clock className="h-4.5 w-4.5" />
                </span>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-250 focus:border-emerald-500 rounded-2xl text-sm font-semibold text-gray-800 transition-colors"
                >
                  {currentDoctorObj.availability?.map((slot, idx) => (
                    <option key={idx} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="text-xs italic text-gray-400 bg-gray-50 p-3 rounded-2xl border border-gray-150">
                Please choose a doctor first to retrieve slot schedules.
              </div>
            )}
          </div>

        </div>

        {/* Notes/Chief Complaints */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold text-gray-500 uppercase tracking-widest block">
            5. Chief Complaints & Clinical Notes (Optional)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-3 text-emerald-700 font-bold">
              <User className="h-4.5 w-4.5" />
            </span>
            <textarea
              rows={3}
              placeholder="Describe symptoms, complaints, or physical checks required. This will be visible to clinical administrators..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-250 focus:border-emerald-500 rounded-2xl text-sm font-semibold text-gray-800 transition-colors"
            />
          </div>
        </div>

        {/* Book Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg hover:shadow-emerald-250 cursor-pointer text-sm sm:text-base flex items-center justify-center gap-2 tracking-tight disabled:bg-gray-300"
          >
            {loading ? (
              <>
                <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-white border-r-transparent mr-2" />
                Securing Reservation Record...
              </>
            ) : (
                <>
                  <Calendar className="h-5 w-5" />
                  Confirm and Book Appointment
                </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default AppointmentBooking;
