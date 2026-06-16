import React from 'react';
import { 
  Heart, 
  Smile, 
  Activity, 
  Sparkles, 
  Brain, 
  Baby, 
  Bone, 
  LucideIcon,
  ArrowRight,
  ClipboardList
} from 'lucide-react';

interface Department {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  services: string[];
  analytics: {
    specialists: number;
    successRate: string;
    avgWaitTime: string;
  };
}

const DEPARTMENTS_DATA: Department[] = [
  {
    id: 'Cardiology',
    name: 'Cardiology',
    description: 'Expert diagnostics and treatments for heart conditions, including advanced imaging, ECG, and pacemaker management.',
    icon: Heart,
    services: ['Electrocardiogram (ECG)', 'Echocardiography', 'Hypertension Clinic', 'Cardiac Rehab'],
    analytics: { specialists: 12, successRate: '98.5%', avgWaitTime: '15 mins' }
  },
  {
    id: 'Neurology',
    name: 'Neurology',
    description: 'Specialized clinical assessment of the nervous system, treating headaches, seizures, stroke, and neuromuscular diseases.',
    icon: Brain,
    services: ['EEG Monitoring', 'Stroke Response Unit', 'Nerve Testing', 'Migraine Care Program'],
    analytics: { specialists: 8, successRate: '92.0%', avgWaitTime: '20 mins' }
  },
  {
    id: 'Pediatrics',
    name: 'Pediatrics',
    description: 'Comprehensive compassionate care for children and young adults from infancy through late adolescence.',
    icon: Baby,
    services: ['General Pediatrics Check-ups', 'Immunization & Vaccines', 'Pediatric Growth Advisory', 'Child Nutrition'],
    analytics: { specialists: 15, successRate: '99.2%', avgWaitTime: '10 mins' }
  },
  {
    id: 'Orthopedics',
    name: 'Orthopedics',
    description: 'Advanced therapy and surgical options for bone, muscular, joint, and ligament rehabilitation and joint replacements.',
    icon: Bone,
    services: ['Joint Replacement Surgery', 'Sports Injury Rehabilitation', 'Spine Disorders Program', 'Fracture Splinting'],
    analytics: { specialists: 10, successRate: '96.4%', avgWaitTime: '18 mins' }
  },
  {
    id: 'Dermatology',
    name: 'Dermatology',
    description: 'Diagnosing and treating diseases of the skin, hair, and nails, alongside custom clinical cosmetic treatments.',
    icon: Activity,
    services: ['Skin Cancer Screening', 'Psoriasis Treatments', 'Clinical Acne Solutions', 'Cosmetic Laser Therapy'],
    analytics: { specialists: 6, successRate: '97.8%', avgWaitTime: '12 mins' }
  },
  {
    id: 'General Medicine',
    name: 'General Medicine',
    description: 'Primary preventive health counseling, comprehensive wellness scans, and expert multi-system health coordination.',
    icon: Smile,
    services: ['Preventive Wellness Scans', 'Chronic Illness Coordination', 'Annual Physical Audits', 'Travel Vaccinations'],
    analytics: { specialists: 18, successRate: '98.9%', avgWaitTime: '8 mins' }
  }
];

interface DepartmentsProps {
  onSelectDepartment: (deptName: string) => void;
}

const Departments: React.FC<DepartmentsProps> = ({ onSelectDepartment }) => {
  return (
    <div className="bg-gray-50 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Title */}
        <div className="max-w-3xl mx-auto text-center mb-16 animate-fadeIn">
          <span className="text-emerald-700 font-bold text-xs sm:text-sm tracking-widest uppercase bg-emerald-100/60 px-3 py-1.5 rounded-full inline-block mb-3">
            Our Specialties
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight">
            Comprehensive Medical Departments
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-650 leading-relaxed">
            From pediatric vaccines and annual wellness checkups to complicated cardiology treatments and orthopedic surgeries, 
            our clinical divisions offer compassionate care backed by top-class specialists.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {DEPARTMENTS_DATA.map((dept) => {
            const Icon = dept.icon;
            return (
              <div 
                key={dept.id}
                className="bg-white rounded-3xl border border-gray-100 hover:border-emerald-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group text-left hover:-translate-y-1"
              >
                {/* Accent Ribbon */}
                <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500" />
                
                <div className="p-6 sm:p-8 flex-grow">
                  {/* Icon Block */}
                  <div className="inline-flex p-3 bg-emerald-50 text-emerald-700 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all duration-350 shadow-md shadow-emerald-50 mb-6">
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-800 transition-colors">
                    {dept.name}
                  </h3>
                  
                  <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                    {dept.description}
                  </p>

                  {/* Services Checklist */}
                  <div className="mt-6 pt-5 border-t border-gray-100">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-3.5">
                      Core Procedures & Services:
                    </span>
                    <ul className="space-y-2.5">
                      {dept.services.map((srv, idx) => (
                        <li key={idx} className="flex items-center gap-2.5 text-xs text-gray-700 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 flex-shrink-0" />
                          {srv}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Foot Analytics Bar */}
                <div className="px-6 py-4 sm:px-8 sm:py-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-bold">
                  <div className="grid grid-cols-3 gap-4 w-full">
                    <div>
                      <span className="block text-[10px] font-semibold text-gray-400 capitalize">Specialists</span>
                      <span className="text-gray-800 font-extrabold">{dept.analytics.specialists}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-semibold text-gray-400 capitalize">Success</span>
                      <span className="text-emerald-700 font-extrabold">{dept.analytics.successRate}</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] font-semibold text-gray-400 capitalize">Wait Avg</span>
                      <span className="text-gray-800 font-extrabold">{dept.analytics.avgWaitTime}</span>
                    </div>
                  </div>
                </div>

                {/* Hover Quick Action */}
                <button
                  onClick={() => onSelectDepartment(dept.name)}
                  className="w-full bg-emerald-600 hover:bg-emerald-750 text-white font-bold py-3 text-xs tracking-wide transition-all uppercase cursor-pointer flex items-center justify-center gap-1.5 opacity-90 group-hover:opacity-100"
                >
                  Schedule Department Physician
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Bottom Hospital Notice banner */}
        <div className="mt-16 bg-emerald-50 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-emerald-150 max-w-5xl mx-auto text-left">
          <div className="flex gap-4 items-start">
            <div className="bg-emerald-600 text-white p-3.5 rounded-full">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">Need a custom diagnostics report?</h4>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                Log into your patient portal to upload and review your recent lab test files, scan charts, and notes with secure admin review.
              </p>
            </div>
          </div>
          <button 
            onClick={() => onSelectDepartment('General Medicine')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-xl shadow-md flex-shrink-0 transition-colors"
          >
            Start Checkup Now
          </button>
        </div>

      </div>
    </div>
  );
};

export default Departments;
