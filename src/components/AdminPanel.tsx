import React, { useState, useEffect } from 'react';
import { dbService, Doctor, Appointment, Report, UserProfile } from '../lib/dbService';
import { 
  Users, 
  Calendar, 
  FileText, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  X, 
  Search, 
  ShieldCheck, 
  AlertCircle,
  Filter,
  Stethoscope,
  Grid
} from 'lucide-react';

const AdminPanel: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  // Active sub-tab state inside Admin panel
  const [activeSubTab, setActiveSubTab] = useState<'appointments' | 'doctors' | 'reports'>('appointments');

  // Filter States
  const [appFilterStatus, setAppFilterStatus] = useState<string>('all');
  const [appSearchTerm, setAppSearchTerm] = useState('');
  
  // Create Doctor Form States
  const [doctorModalOpen, setDoctorModalOpen] = useState(false);
  const [docName, setDocName] = useState('');
  const [docDept, setDocDept] = useState('Cardiology');
  const [docSpecialty, setDocSpecialty] = useState('');
  const [docExperience, setDocExperience] = useState('5 Years');
  const [docImageUrl, setDocImageUrl] = useState('');
  const [docAvailability, setDocAvailability] = useState('09:00 AM - 10:00 AM, 02:00 PM - 03:00 PM');
  const [docError, setDocError] = useState('');

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const docList = await dbService.getDoctors();
      const appList = await dbService.getAppointments('__admin__', 'admin');
      const repList = await dbService.getReports('__admin__', 'admin');
      
      setDoctors(docList);
      setAppointments(appList);
      setReports(repList);
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Update Status Action
  const handleUpdateStatus = async (appId: string, status: 'completed' | 'cancelled') => {
    try {
      await dbService.updateAppointmentStatus(appId, status);
      setAppointments(prev => prev.map(app => 
        app.id === appId ? { ...app, status, updatedAt: new Date().toISOString() } : app
      ));
    } catch (err) {
      console.error(err);
      alert("Error updating appointment status.");
    }
  };

  // Delete Dr Action
  const handleDeleteDoctor = async (docId: string) => {
    if (!window.confirm("Are you sure you want to dismiss and purge this doctor from the roster?")) return;
    try {
      await dbService.deleteDoctor(docId);
      setDoctors(prev => prev.filter(d => d.id !== docId));
    } catch (err) {
      console.error(err);
      alert("Error deleting doctor.");
    }
  };

  // Delete Report Action
  const handleDeleteReport = async (repId: string) => {
    if (!window.confirm("Delete this diagnostic report from patient cabinet?")) return;
    try {
      await dbService.deleteReport(repId);
      setReports(prev => prev.filter(r => r.id !== repId));
    } catch (err) {
      console.error(err);
      alert("Error deleting report.");
    }
  };

  // Handle Save Doctor
  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setDocError('');

    if (!docName.trim()) {
      setDocError("Please input the physician's professional full name.");
      return;
    }
    if (!docSpecialty.trim()) {
      setDocError("Please specify the clinical specialty / credentials details.");
      return;
    }

    // fallback placeholder image matching the green credentials style
    const targetImg = docImageUrl.trim() || 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=250';

    try {
      const availSlots = docAvailability.split(',').map(s => s.trim()).filter(Boolean);
      const savedDoc = await dbService.addDoctor({
        name: docName,
        department: docDept,
        specialty: docSpecialty,
        imageUrl: targetImg,
        experience: docExperience,
        availability: availSlots.length > 0 ? availSlots : ["09:00 AM - 10:00 AM", "03:00 PM - 04:00 PM"]
      });

      setDoctors(prev => [...prev, savedDoc]);
      setDoctorModalOpen(false);
      
      // Reset Form
      setDocName('');
      setDocSpecialty('');
      setDocExperience('5 Years');
      setDocImageUrl('');
      setDocAvailability('09:00 AM - 10:00 AM, 02:00 PM - 03:00 PM');
    } catch (err) {
      console.error(err);
      setDocError("We could not create the doctor. Firebase database write failure.");
    }
  };

  const filteredAppointments = appointments.filter(app => {
    const matchesSearch = app.doctorName.toLowerCase().includes(appSearchTerm.toLowerCase()) || 
                          (app.userName && app.userName.toLowerCase().includes(appSearchTerm.toLowerCase())) ||
                          (app.userEmail && app.userEmail.toLowerCase().includes(appSearchTerm.toLowerCase())) ||
                          app.notes.toLowerCase().includes(appSearchTerm.toLowerCase());
    const matchesStatus = appFilterStatus === 'all' || app.status === appFilterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-gray-50 py-12 sm:py-16 min-h-screen text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Executive Banner */}
        <div className="bg-gradient-to-r from-emerald-700 to-emerald-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-emerald-100 text-xs font-semibold backdrop-blur-sm border border-white/5 uppercase tracking-wider">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
              <span>Administrative Console Mode</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hospital Operations Board
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-semibold">
              Manage clinicians roster, process patient bookings, and audit uploaded health records dynamically.
            </p>
          </div>

          {/* Quick Metrics Ribbon */}
          <div className="flex gap-4 sm:gap-6 bg-white/5 p-4 rounded-2xl border border-white/10 text-xs font-bold leading-tight self-stretch md:self-auto justify-around">
            <div className="text-center pr-4 sm:pr-6 border-r border-white/10">
              <span className="block text-emerald-300 font-semibold mb-1">Medics</span>
              <span className="text-xl sm:text-2xl font-extrabold">{doctors.length}</span>
            </div>
            <div className="text-center pr-4 sm:pr-6 border-r border-white/10">
              <span className="block text-emerald-300 font-semibold mb-1">Bookings</span>
              <span className="text-xl sm:text-2xl font-extrabold text-amber-350">
                {appointments.filter(a => a.status === 'pending').length}
              </span>
            </div>
            <div className="text-center">
              <span className="block text-emerald-300 font-semibold mb-1">Files Cabin</span>
              <span className="text-xl sm:text-2xl font-extrabold text-teal-300">{reports.length}</span>
            </div>
          </div>
        </div>

        {/* Administration Section Selectors */}
        <div className="border-b border-gray-200 mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveSubTab('appointments')}
            className={`px-5 py-3 rounded-t-xl text-xs sm:text-sm font-bold tracking-tight border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'appointments'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-gray-500 hover:text-emerald-600 hover:bg-gray-100'
            }`}
          >
            <Calendar className="h-4 w-4" />
            Manage Appointments ({appointments.length})
          </button>

          <button
            onClick={() => setActiveSubTab('doctors')}
            className={`px-5 py-3 rounded-t-xl text-xs sm:text-sm font-bold tracking-tight border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'doctors'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-gray-500 hover:text-emerald-600 hover:bg-gray-100'
            }`}
          >
            <Users className="h-4 w-4" />
            Staff Clinicians Roster ({doctors.length})
          </button>

          <button
            onClick={() => setActiveSubTab('reports')}
            className={`px-5 py-3 rounded-t-xl text-xs sm:text-sm font-bold tracking-tight border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'reports'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-gray-500 hover:text-emerald-600 hover:bg-gray-100'
            }`}
          >
            <FileText className="h-4 w-4" />
            Audit Case Reports ({reports.length})
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent align-[-0.125em]" />
            <p className="mt-3 text-sm text-gray-400 font-bold">Synchronizing administrative databases...</p>
          </div>
        ) : (
          <div>
            
            {/* SUBTAB 1: MANAGING APPOINTMENTS */}
            {activeSubTab === 'appointments' && (
              <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                
                {/* Filters Row */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-150">
                  <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search appointments by doctor, patient email, symptom notes..."
                      value={appSearchTerm}
                      onChange={(e) => setAppSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 focus:border-emerald-500 rounded-xl text-xs sm:text-sm font-medium text-gray-900 transition-colors"
                    />
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <span className="text-xs text-gray-400 font-bold uppercase whitespace-nowrap flex items-center gap-1">
                      <Filter className="h-3.w-3" /> Status:
                    </span>
                    <select
                      value={appFilterStatus}
                      onChange={(e) => setAppFilterStatus(e.target.value)}
                      className="w-full md:w-auto bg-white border border-gray-250 py-1.5 px-3 rounded-lg text-xs font-semibold text-gray-700"
                    >
                      <option value="all">All Booking States</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Table View */}
                {filteredAppointments.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 space-y-2 border-none">
                    <AlertCircle className="h-8 w-8 text-gray-300 mx-auto" />
                    <p className="text-sm font-semibold">No appointments records fit current filter limits.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-gray-150">
                    <table className="w-full text-xs sm:text-sm border-collapse text-left bg-white">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-150 text-gray-400 font-extrabold uppercase">
                          <th className="p-4">Patient Profile</th>
                          <th className="p-4">Physician Consultant</th>
                          <th className="p-4">Department / Specialty</th>
                          <th className="p-4">Calendar Shift</th>
                          <th className="p-4 text-center">Treatment Status</th>
                          <th className="p-4 text-center">Process Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
                        {filteredAppointments.map((app) => (
                          <tr key={app.id} className="hover:bg-emerald-50/15 transition-all">
                            <td className="p-4 space-y-1">
                              <p className="font-bold text-gray-950">{app.userName || 'Anonymous Patient'}</p>
                              <p className="text-xs font-mono text-gray-500 font-semibold">{app.userEmail}</p>
                            </td>
                            <td className="p-4 font-bold text-emerald-800">
                              {app.doctorName}
                            </td>
                            <td className="p-4">
                              <span className="bg-emerald-100/50 text-emerald-800 px-2 py-0.5 rounded text-xs font-extrabold">
                                {app.department}
                              </span>
                            </td>
                            <td className="p-4 space-y-0.5">
                              <p className="font-semibold text-gray-950">{app.date}</p>
                              <p className="text-xs font-mono text-gray-400 font-bold">{app.timeSlot}</p>
                            </td>
                            <td className="p-4 text-center">
                              {app.status === 'pending' && (
                                <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-xs font-bold leading-none inline-block">
                                  Pending
                                </span>
                              )}
                              {app.status === 'completed' && (
                                <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-bold leading-none inline-block">
                                  Completed
                                </span>
                              )}
                              {app.status === 'cancelled' && (
                                <span className="bg-rose-100 text-rose-700 px-2.5 py-1 rounded-full text-xs font-bold leading-none inline-block">
                                  Cancelled
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              {app.status === 'pending' ? (
                                <div className="flex gap-2 justify-center">
                                  <button
                                    onClick={() => handleUpdateStatus(app.id, 'completed')}
                                    className="p-1 px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
                                    title="Complete Visit"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(app.id, 'cancelled')}
                                    className="p-1 px-2 py-1 text-[11px] font-bold text-red-750 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                                    title="Cancel Session"
                                  >
                                    Dismiss
                                  </button>
                                </div>
                              ) : (
                                <span className="text-gray-400 italic text-xs">Concluded</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

              </div>
            )}

            {/* SUBTAB 2: LISTING & CREATING DOCTORS */}
            {activeSubTab === 'doctors' && (
              <div className="space-y-6">
                
                {/* Add Dr Action bar */}
                <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 flex items-center justify-between shadow-sm">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">Resident Medical Officers</h3>
                    <p className="text-xs text-gray-500 font-semibold mt-1">Configure clinicians rosters and appointment shifts</p>
                  </div>
                  <button
                    onClick={() => setDoctorModalOpen(true)}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow shadow-emerald-50 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    Enlist Physician
                  </button>
                </div>

                {/* Grid Roster cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {doctors.map((doc) => (
                    <div key={doc.id} className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4 text-left">
                      <div className="flex items-center gap-4">
                        <img
                          src={doc.imageUrl}
                          alt={doc.name}
                          className="w-12 h-12 rounded-full object-cover border border-emerald-500 flex-shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="truncate">
                          <h4 className="font-extrabold text-gray-900 text-sm truncate leading-tight">{doc.name}</h4>
                          <p className="text-xs text-emerald-800 font-bold mt-0.5 truncate">{doc.specialty}</p>
                          <p className="text-[10px] uppercase font-extrabold text-gray-400 font-semibold tracking-wider">{doc.department}</p>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-xs">
                        <span className="text-gray-400 font-semibold">Practice: <strong className="text-gray-700">{doc.experience}</strong></span>
                        <button
                          onClick={() => handleDeleteDoctor(doc.id)}
                          className="flex items-center gap-1 text-red-650 hover:text-red-750 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="text-[10px] font-bold">Dismiss</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* SUBTAB 3: REVIEW CASE REPORTS */}
            {activeSubTab === 'reports' && (
              <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 leading-tight">Patient Case Records Cabinet</h3>
                  <p className="text-xs text-gray-500 font-semibold mt-1">Supervise and audit diagnostic report file cards</p>
                </div>

                {reports.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 space-y-2 border-none">
                    <AlertCircle className="h-8 w-8 text-gray-300 mx-auto" />
                    <p className="text-sm font-semibold">No patient diagnostic reports currently filed in the system.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reports.map((rep) => (
                      <div 
                        key={rep.id}
                        className="border border-gray-150 rounded-2xl p-4 flex justify-between items-center bg-gray-50/50 hover:bg-white transition-all shadow-sm"
                      >
                        <div className="flex gap-3 text-left w-full truncate">
                          <div className="bg-emerald-50 text-emerald-700 p-2.5 rounded-xl flex-shrink-0">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="truncate space-y-1">
                            <h4 className="text-sm font-bold text-gray-950 truncate line-clamp-1">{rep.title}</h4>
                            <p className="text-[11px] text-gray-400 font-mono tracking-tight truncate uppercase leading-none font-semibold">
                              File: {rep.fileName}
                            </p>
                            <p className="text-[10px] text-gray-500 leading-none mt-1 font-semibold">
                              Patient ID: <span className="font-mono">{rep.userId?.substring(0, 8)}</span>
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteReport(rep.id)}
                          className="text-gray-450 hover:text-red-500 p-1.5 flex-shrink-0 cursor-pointer self-center"
                          title="Purge Clinical File"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </div>

      {/* Doctor enlist Modal */}
      {doctorModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-100 w-full max-w-md overflow-hidden shadow-2xl relative text-left">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-500 px-6 py-5 text-white flex justify-between items-center">
              <div>
                <h4 className="font-extrabold text-lg leading-tight">Enlist New Clinician</h4>
                <p className="text-[10px] text-emerald-100 uppercase tracking-widest mt-0.5">Staff Directory Database</p>
              </div>
              <button 
                onClick={() => setDoctorModalOpen(false)}
                className="text-emerald-100 hover:text-white p-1 rounded-full transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateDoctor} className="p-6 space-y-4">
              
              {docError && (
                <div className="bg-red-50 border border-red-150 rounded-xl p-3 text-red-900 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span>{docError}</span>
                </div>
              )}

              {/* Name */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-extrabold text-gray-505 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Dr. Allison Carter"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-250 focus:border-emerald-505 rounded-xl text-xs sm:text-sm font-semibold text-gray-800"
                />
              </div>

              {/* Department */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-extrabold text-gray-505 uppercase tracking-wider">
                  Department
                </label>
                <select
                  value={docDept}
                  onChange={(e) => setDocDept(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-250 focus:border-emerald-505 rounded-xl text-xs sm:text-sm font-semibold text-gray-800"
                >
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="General Medicine">General Medicine</option>
                </select>
              </div>

              {/* Specialty */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-extrabold text-gray-505 uppercase tracking-wider">
                  Specialty Credentials
                </label>
                <input
                  type="text"
                  placeholder="e.g., MD - Pediatric Care Specialist"
                  value={docSpecialty}
                  onChange={(e) => setDocSpecialty(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-250 focus:border-emerald-505 rounded-xl text-xs sm:text-sm font-semibold text-gray-800"
                />
              </div>

              {/* Experience */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-extrabold text-gray-505 uppercase tracking-wider">
                  Experience Period
                </label>
                <select
                  value={docExperience}
                  onChange={(e) => setDocExperience(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-250 focus:border-emerald-505 rounded-xl text-xs sm:text-sm font-semibold text-gray-800"
                >
                  <option value="3 Years">3 Years</option>
                  <option value="5 Years">5 Years</option>
                  <option value="8 Years">8 Years</option>
                  <option value="12 Years">12 Years</option>
                  <option value="15 Years">15 Years</option>
                  <option value="20+ Years">20+ Years</option>
                </select>
              </div>

              {/* Photo URL */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-extrabold text-gray-505 uppercase tracking-wider">
                  Avatar Photo URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="e.g., https://images.unsplash.com/..."
                  value={docImageUrl}
                  onChange={(e) => setDocImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-250 focus:border-emerald-505 rounded-xl text-xs sm:text-sm font-semibold text-gray-800"
                />
              </div>

              {/* Availabilities list */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-extrabold text-gray-505 uppercase tracking-wider">
                  Hourly Slots (Separated by comma)
                </label>
                <input
                  type="text"
                  placeholder="09:00 AM - 10:00 AM, 02:00 PM - 03:00 PM"
                  value={docAvailability}
                  onChange={(e) => setDocAvailability(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-250 focus:border-emerald-505 rounded-xl text-xs sm:text-sm font-semibold text-gray-800"
                />
              </div>

              {/* Submit btn */}
              <div className="pt-4 border-t border-gray-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setDoctorModalOpen(false)}
                  className="w-1/2 text-center text-xs font-bold text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 py-3 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 text-xs rounded-xl transition-all shadow-md tracking-tight uppercase"
                >
                  Save Doctor
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPanel;
