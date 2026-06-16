import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { dbService, Appointment, Report } from '../lib/dbService';
import { 
  Calendar, 
  FileText, 
  Trash2, 
  UploadCloud, 
  X, 
  AlertCircle, 
  UserCheck, 
  Clock, 
  Bookmark, 
  ArrowRight,
  Sparkles,
  Search
} from 'lucide-react';

const PatientDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload Modal or fields state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileSize, setUploadFileSize] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user || !profile) return;
      setLoading(true);
      try {
        const apps = await dbService.getAppointments(user.uid, profile.role);
        const reps = await dbService.getReports(user.uid, profile.role);
        setAppointments(apps);
        setReports(reps);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [user, profile]);

  const handleCancelAppointment = async (appId: string) => {
    if (!window.confirm("Are you sure you want to cancel this appointment slot booking?")) return;
    try {
      await dbService.updateAppointmentStatus(appId, 'cancelled');
      // Update local state
      setAppointments(prev => prev.map(app => 
        app.id === appId ? { ...app, status: 'cancelled', updatedAt: new Date().toISOString() } : app
      ));
    } catch (err) {
      console.error(err);
      alert("Error cancelling appointment.");
    }
  };

  const handleDeleteReport = async (repId: string) => {
    if (!window.confirm("Are you sure you want to delete this clinical report file card?")) return;
    try {
      await dbService.deleteReport(repId);
      setReports(prev => prev.filter(rep => rep.id !== repId));
    } catch (err) {
      console.error(err);
      alert("Error deleting report.");
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError('');

    if (!uploadTitle.trim()) {
      setUploadError("Please provide a descriptive title for this clinical card.");
      return;
    }
    if (!uploadFileName.trim()) {
      setUploadError("Please specify a document name or pick a local diagnostic file.");
      return;
    }

    setUploadLoading(true);
    try {
      const mockFileUrl = `https://clinical-records-storage.googleapis.com/patient-${user?.uid}/${Date.now()}_${encodeURIComponent(uploadFileName)}`;
      const saved = await dbService.addReport({
        userId: user!.uid,
        title: uploadTitle,
        fileName: uploadFileName,
        fileSize: uploadFileSize || '2.4 MB',
        fileUrl: mockFileUrl
      });
      setReports(prev => [saved, ...prev]);
      setUploadModalOpen(false);
      setUploadTitle('');
      setUploadFileName('');
      setUploadFileSize('');
    } catch (err) {
      console.error(err);
      setUploadError("Failed to register report. Cloud write failed.");
    } finally {
      setUploadLoading(false);
    }
  };

  // Pre-seed some dummy file pick
  const simulateFileAdd = () => {
    const simulatedFiles = [
      { name: "Blood_Chemistry_WBC_Counts.pdf", size: "1.8 MB" },
      { name: "Chest_XRay_Post_Anterior_Scan.jpeg", size: "4.2 MB" },
      { name: "Cardiac_Stress_Performance_ECG.png", size: "3.1 MB" },
      { name: "Lipid_Profile_Cholesterol_Sheet.pdf", size: "1.4 MB" }
    ];
    const picked = simulatedFiles[Math.floor(Math.random() * simulatedFiles.length)];
    setUploadFileName(picked.name);
    setUploadFileSize(picked.size);
    if (!uploadTitle) {
      setUploadTitle(picked.name.replace(/_/g, ' ').replace(/\.[^/.]+$/, ""));
    }
  };

  return (
    <div className="bg-gray-50 py-12 sm:py-16 min-h-screen text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-6 sm:p-10 text-white shadow-xl mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-emerald-100 text-xs font-semibold backdrop-blur-sm border border-white/5 uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-emerald-300 animate-pulse" />
              <span>Personal Health File Vault</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome Back, {profile?.displayName || 'Authorized Patient'}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-medium">
              Monitor diagnostic logs, view booked slots, and upload lab records. Verified only for email {profile?.email}.
            </p>
          </div>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-2 bg-white text-emerald-800 font-bold px-5 py-3 rounded-xl hover:bg-emerald-50 transition-all shadow-md text-sm cursor-pointer whitespace-nowrap self-stretch sm:self-auto text-center justify-center border-none"
          >
            <UploadCloud className="h-5 w-5 text-emerald-600" />
            Upload Diagnostic Report
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent align-[-0.125em]" />
            <p className="mt-3 text-sm text-gray-400 font-bold">Retrieving patient history registry...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Appointments Section (Left 7 Columns) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 sm:p-8">
                <div className="flex items-center justify-between pb-5 border-b border-gray-100 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-50 text-emerald-700 p-2.5 rounded-xl">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-gray-900 leading-tight">Your Scheduled Appointments</h3>
                      <p className="text-xs text-gray-500 font-semibold">{appointments.length} booked slots registered</p>
                    </div>
                  </div>
                </div>

                {appointments.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 space-y-3.5 border-none">
                    <AlertCircle className="h-10 w-10 text-gray-300 mx-auto" />
                    <p className="text-sm font-semibold max-w-sm mx-auto leading-relaxed">
                      You do not have any pending or completed appointment schedules configured currently.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((app) => (
                      <div 
                        key={app.id} 
                        className="bg-white border border-gray-150/70 hover:border-emerald-200 rounded-2xl p-4 sm:p-5 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md"
                      >
                        <div className="space-y-3 flex-grow text-left">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-bold text-gray-900">{app.doctorName}</span>
                            <span className="text-[10px] uppercase font-extrabold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-100">
                              {app.department}
                            </span>
                            
                            {/* Custom label states */}
                            {app.status === 'pending' && (
                              <span className="text-[10px] uppercase font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md border border-amber-100">
                                Pending
                              </span>
                            )}
                            {app.status === 'completed' && (
                              <span className="text-[10px] uppercase font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-100">
                                Completed
                              </span>
                            )}
                            {app.status === 'cancelled' && (
                              <span className="text-[10px] uppercase font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md border border-rose-100">
                                Cancelled
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-gray-600 font-semibold">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                              <span>{app.date}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                              <span>{app.timeSlot}</span>
                            </div>
                          </div>

                          <p className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg italic border border-gray-100 mt-1 max-w-lg leading-relaxed">
                            <strong>Note:</strong> {app.notes}
                          </p>
                        </div>

                        {app.status === 'pending' && (
                          <button
                            onClick={() => handleCancelAppointment(app.id)}
                            className="text-xs font-bold text-red-650 hover:text-red-750 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-transparent transition-colors cursor-pointer w-full sm:w-auto"
                          >
                            Cancel Slot
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Reports Section (Right 5 Columns) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 sm:p-8">
                
                <div className="flex items-center justify-between pb-5 border-b border-gray-100 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-50 text-emerald-700 p-2.5 rounded-xl">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-gray-900 leading-tight">Diagnostic Cabinet</h3>
                      <p className="text-xs text-gray-500 font-semibold">{reports.length} secure reports filed</p>
                    </div>
                  </div>
                </div>

                {reports.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 space-y-4 border-none">
                    <FileText className="h-10 w-10 text-gray-300 mx-auto" />
                    <p className="text-xs leading-relaxed max-w-xs mx-auto">
                      No clinical scan reports found. Click "Upload Diagnostic Report" to add test files to your cabinet.
                    </p>
                    <button
                      onClick={() => setUploadModalOpen(true)}
                      className="text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-150 px-4 py-2 rounded-xl transition-all"
                    >
                      Browse Local Document
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports.map((rep) => (
                      <div 
                        key={rep.id} 
                        className="bg-white border border-gray-150 rounded-2xl p-4 hover:border-emerald-100 transition-all hover:shadow-md flex items-start gap-3 justify-between"
                      >
                        <div className="flex gap-3 text-left">
                          <div className="bg-emerald-50 text-emerald-700 p-2.5 rounded-xl flex-shrink-0 self-start">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-gray-900 leading-tight line-clamp-1">{rep.title}</h4>
                            <p className="text-[11px] text-gray-400 font-bold font-mono truncate max-w-[180px] sm:max-w-xs uppercase">
                              {rep.fileName}
                            </p>
                            <div className="flex gap-3.5 text-[10px] text-gray-500 mt-1 uppercase font-semibold">
                              <span>Size: <strong className="text-gray-700">{rep.fileSize}</strong></span>
                              <span>•</span>
                              <span>Date: <strong className="text-gray-700">{rep.uploadDate?.split('T')[0]}</strong></span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteReport(rep.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1 flex-shrink-0 self-center"
                          title="Purge Document"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Upload Diagnostic Report Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-100 w-full max-w-md overflow-hidden shadow-2xl relative text-left">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-500 px-6 py-5 text-white flex justify-between items-center">
              <div>
                <h4 className="font-extrabold text-lg leading-tight">Archive Lab Report</h4>
                <p className="text-[10px] text-emerald-100 uppercase tracking-widest mt-0.5">Secure Patient Directory</p>
              </div>
              <button 
                onClick={() => setUploadModalOpen(false)}
                className="text-emerald-100 hover:text-white p-1 rounded-full transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUploadSubmit} className="p-6 space-y-5">
              
              {uploadError && (
                <div className="bg-red-50 border border-red-150 rounded-xl p-3 text-red-950 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Title Input */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-extrabold text-gray-500 uppercase tracking-widest">
                  1. Clinical Title
                </label>
                <input
                  type="text"
                  placeholder="e.g., Blood Chemistry WBC, Brain MRI Scan"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-250 focus:border-emerald-500 rounded-xl text-sm font-semibold text-gray-800 transition-colors"
                />
              </div>

              {/* Drag-and-drop / selector mock field */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-extrabold text-gray-500 uppercase tracking-widest block">
                  2. Select File
                </label>
                
                {uploadFileName ? (
                  <div className="border border-emerald-150 bg-emerald-50/50 rounded-2xl p-4 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2.5 font-semibold text-emerald-800 truncate">
                      <FileText className="h-5 w-5 text-emerald-600" />
                      <div>
                        <p className="font-bold truncate max-w-[180px]">{uploadFileName}</p>
                        <p className="text-[10px] text-emerald-500 uppercase font-bold">{uploadFileSize}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setUploadFileName(''); setUploadFileSize(''); }}
                      className="text-emerald-700 hover:text-red-500 p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={simulateFileAdd}
                    className="border-2 border-dashed border-gray-250 hover:border-emerald-500 rounded-2xl p-8 text-center cursor-pointer bg-gray-50/50 hover:bg-emerald-50/10 transition-all space-y-2.5 shadow-inner"
                  >
                    <UploadCloud className="h-8 w-8 text-emerald-600 mx-auto" />
                    <div>
                      <p className="text-xs font-bold text-gray-700">Click to pick a diagnostic lab document</p>
                      <p className="text-[10px] text-gray-400 mt-1">PDF, PNG, JPG, or DOC (Max 10MB limit)</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Fast simulator loader info */}
              {!uploadFileName && (
                <button
                  type="button"
                  onClick={simulateFileAdd}
                  className="w-full text-center text-xs font-bold text-emerald-700 bg-emerald-100/60 hover:bg-emerald-100 py-3 rounded-xl transition-all"
                >
                  ⚡ Simulate Random Lab Report (Simulate File Upload)
                </button>
              )}

              {/* Submit CTA */}
              <div className="pt-2 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={uploadLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-sm uppercase tracking-tight flex items-center justify-center gap-1.5 disabled:bg-gray-300"
                >
                  {uploadLoading ? "Saving File Records..." : "Save Report into Cabinet"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PatientDashboard;
