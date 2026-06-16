import React, { useState, useEffect } from 'react';
import { dbService, Doctor } from '../lib/dbService';
import { 
  Search, 
  Filter, 
  Clock, 
  Calendar, 
  Star, 
  Award, 
  GraduationCap 
} from 'lucide-react';

interface DoctorsProps {
  selectedDepartment: string;
  onBookDoctor: (doctor: Doctor) => void;
}

const Doctors: React.FC<DoctorsProps> = ({ selectedDepartment, onBookDoctor }) => {
  const [doctorsList, setDoctorsList] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState(selectedDepartment || 'all');

  const departments = ['all', 'Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Dermatology', 'General Medicine'];

  // Sync selectedDepartment prop
  useEffect(() => {
    if (selectedDepartment) {
      setDeptFilter(selectedDepartment);
    }
  }, [selectedDepartment]);

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const loaded = await dbService.getDoctors();
        setDoctorsList(loaded);
      } catch (err) {
        console.error("Failed to fetch doctors:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // Filter lists
  const filteredDoctors = doctorsList.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'all' || doc.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="bg-white py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-emerald-700 font-bold text-xs sm:text-sm tracking-widest uppercase bg-emerald-100/60 px-3 py-1.5 rounded-full inline-block mb-3">
            Our Staff Specialists
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight">
            Consult With Our Certified Medical Professionals
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed">
            All our resident physicians hold internationally recognized accredited fellowships and certifications. 
            Schedule secure consultations on our dynamic medical grid.
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-gray-50 border border-gray-150 rounded-2xl p-4 sm:p-6 mb-12 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
          
          {/* Search Box */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-3 h-5 w-5 text-gray-450" />
            <input
              type="text"
              placeholder="Search physicians by name or clinical specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 focus:border-emerald-500 rounded-xl text-sm font-medium text-gray-900 transition-colors shadow-inner"
            />
          </div>

          {/* Department Filter Pills */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto overflow-x-auto pb-1 sm:pb-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase mr-1">
              <Filter className="h-3.5 w-3.5" />
              <span>Filter:</span>
            </div>
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setDeptFilter(dept)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-tight whitespace-nowrap transition-colors border select-none cursor-pointer ${
                  deptFilter === dept
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-50'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
              >
                {dept === 'all' ? 'All Departments' : dept}
              </button>
            ))}
          </div>

        </div>

        {/* Display Physician Directory Grid */}
        {loading ? (
          <div className="text-center py-24 space-y-3">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-650 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="text-sm font-bold text-gray-500">Loading Clinical Directories...</p>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-250">
            <p className="text-base text-gray-600 font-bold">No clinical physicians match your query.</p>
            <button 
              onClick={() => { setSearchTerm(''); setDeptFilter('all'); }} 
              className="mt-4 text-xs font-extrabold text-emerald-700 bg-emerald-100 hover:bg-emerald-150 px-4 py-2.5 rounded-xl transition-all"
            >
              Reset Search Parameters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDoctors.map((doc) => (
              <div 
                key={doc.id}
                className="bg-white rounded-3xl border border-gray-150/70 hover:border-emerald-250 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
              >
                {/* Doctor Avatar Background */}
                <div className="relative h-64 bg-gray-100 overflow-hidden">
                  <img
                    src={doc.imageUrl}
                    alt={doc.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 bg-emerald-50/90 text-emerald-800 text-xs font-extrabold px-3 py-1.5 rounded-full backdrop-blur-sm border border-emerald-100">
                    {doc.department}
                  </div>
                  {/* Rating simulation */}
                  <div className="absolute bottom-4 right-4 bg-white/90 text-gray-800 text-xs font-bold px-2.5 py-1.5 rounded-full backdrop-blur-sm border border-gray-100 flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                    <span>4.9 / 5</span>
                  </div>
                </div>

                {/* Doctor Body details */}
                <div className="p-6 flex-grow flex flex-col justify-between text-left">
                  <div className="space-y-3.5">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-800 transition-colors leading-tight">
                        {doc.name}
                      </h3>
                      <p className="text-sm text-emerald-700 font-bold flex items-center gap-1.5 mt-1 leading-none">
                        <Award className="h-4 w-4" />
                        {doc.specialty}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-600 font-semibold bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                      <GraduationCap className="h-4 w-4 text-emerald-600" />
                      <span>Experience: <strong className="text-gray-800">{doc.experience}</strong></span>
                    </div>

                    {/* Show shift hours */}
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                        Available slots today:
                      </span>
                      <div className="space-y-1.5">
                        {doc.availability?.slice(0, 2).map((slot, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-gray-700 font-medium bg-emerald-50/30 px-2.5 py-1.5 rounded-lg border border-emerald-50">
                            <Clock className="h-3.5 w-3.5 text-emerald-600" />
                            <span>{slot}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Primary CTA Book */}
                  <div className="mt-8 pt-5 border-t border-gray-150">
                    <button
                      onClick={() => onBookDoctor(doc)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl transition-all shadow-md hover:shadow-emerald-100 cursor-pointer text-sm flex items-center justify-center gap-2 tracking-tight"
                    >
                      <Calendar className="h-4 w-4" />
                      Request Appointment Slot
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Doctors;
