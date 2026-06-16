import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db, auth, isFirebaseEnabled } from './firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map((p: any) => ({
        providerId: p.providerId,
        email: p.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error Captured:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Initial Mock Seed Data
export interface Doctor {
  id: string;
  name: string;
  department: string;
  specialty: string;
  imageUrl: string;
  experience: string;
  availability: string[];
}

export interface Appointment {
  id: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: string;
  timeSlot: string;
  status: 'pending' | 'completed' | 'cancelled';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  id: string;
  userId: string;
  title: string;
  fileUrl: string;
  fileName: string;
  uploadDate: string;
  fileSize: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: 'patient' | 'doctor' | 'admin';
  createdAt: string;
}

const DEFAULT_DOCTORS: Doctor[] = [
  {
    id: "doc-1",
    name: "Dr. Sarah Jenkins",
    department: "Cardiology",
    specialty: "Interventional Cardiology",
    imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=250",
    experience: "14 Years",
    availability: ["09:00 AM - 10:00 AM", "10:30 AM - 11:30 AM", "02:00 PM - 03:00 PM"]
  },
  {
    id: "doc-2",
    name: "Dr. Marcus Vance",
    department: "Neurology",
    specialty: "Cognitive Neurology & Epilepsy",
    imageUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=250",
    experience: "18 Years",
    availability: ["11:00 AM - 12:00 PM", "01:30 PM - 02:30 PM", "04:00 PM - 05:00 PM"]
  },
  {
    id: "doc-3",
    name: "Dr. Elena Rostova",
    department: "Pediatrics",
    specialty: "Pediatric Endocrinology",
    imageUrl: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=250",
    experience: "10 Years",
    availability: ["08:30 AM - 09:30 AM", "10:00 AM - 11:00 AM", "03:00 PM - 04:00 PM"]
  },
  {
    id: "doc-4",
    name: "Dr. Aaron Patel",
    department: "Orthopedics",
    specialty: "Sports Medicine & Joint Reconstruction",
    imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=250",
    experience: "12 Years",
    availability: ["09:30 AM - 10:30 AM", "11:30 AM - 12:30 PM", "03:30 PM - 04:30 PM"]
  },
  {
    id: "doc-5",
    name: "Dr. Chloe Martinez",
    department: "Dermatology",
    specialty: "Cosmetic & Surgical Dermatology",
    imageUrl: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&q=80&w=250",
    experience: "8 Years",
    availability: ["10:00 AM - 11:00 AM", "01:00 PM - 02:00 PM", "02:30 PM - 03:30 PM"]
  },
  {
    id: "doc-6",
    name: "Dr. James Fletcher",
    department: "General Medicine",
    specialty: "Preventive Care & Family Health",
    imageUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=250",
    experience: "16 Years",
    availability: ["09:00 AM - 10:00 AM", "11:00 AM - 12:00 PM", "04:00 PM - 05:00 PM"]
  }
];

export interface Blog {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  authorName: string;
  authorId: string;
  category: string;
  imageUrl: string;
  publishedDate: string;
  readTime: string;
  updatedAt: string;
}

export const DEFAULT_BLOGS: Blog[] = [
  {
    id: "blog-1",
    title: "Preventive Cardiology: 5 Everyday Habits for a Healthier Heart",
    excerpt: "Discover simple yet critical dietary, lifestyle, and exercise adjustments verified by clinical cardiologists to lower vascular risk and support cardiovascular longevity.",
    content: `## Everyday Habits for a Healthier Heart

Cardiovascular health remains the cornerstone of overall physical well-being. According to leading research and our team at **GreenLife Hospital**, up to 80% of premature heart attacks and strokes are preventable through lifestyle modifications. Here are five daily habits you can build to protect your heart:

### 1. Engage in 30 Minutes of Moderate Activity
Regular aerobic exercise strengthens your heart muscle, improves circulation, and optimizes cholesterol levels. 
*   **Recommendation:** Aim for 150 minutes of moderate-intensity exercise, such as brisk walking, swimming, or cycling, every week.

### 2. Embrace a Heart-Healthy Nutrition Protocol
Transitioning your pantry toward whole foods can dramatically lower hypertension risks.
*   **What to add:** Leafy greens, whole grains, avocados, fatty fish (rich in Omega-3s like salmon), and nuts.
*   **What to limit:** Highly processed sugars, excess sodium, and saturated fats.

### 3. Commit to 7-8 Hours of Quality Rest
Chronic sleep deprivation triggers systemic inflammation and raises cortisol levels, putting continuous strain on your arteries.
*   **Habit:** Maintain a consistent sleep schedule and keep screens out of the bedroom at least 45 minutes before sleeping.

### 4. Practice Structured Stress Reduction
Long-term psychological stress causes arterial stiffness and elevates arterial pressure.
*   **Methods:** Dedicate 10 minutes daily to deep focus breathing, meditation, or light stretching.

### 5. Prevent Dehydration
Water supports optimal blood volume and makes it easier for your cardiac system to distribute oxygen-rich blood throughout your body.

*Remember: Consistency in small lifestyle parameters is far more powerful than sporadic habits. Discuss your personalized risks, lipid panels, and physical therapy options with a medical specialist.*`,
    authorName: "Dr. Sarah Jenkins",
    authorId: "doc-1",
    category: "Cardiology",
    imageUrl: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=600",
    publishedDate: "2026-06-10T10:00:00.000Z",
    readTime: "5 mins",
    updatedAt: "2026-06-10T10:00:00.000Z"
  },
  {
    id: "blog-2",
    title: "Understanding Sleep and Its Impact on Cognitive Neurology",
    excerpt: "Demystifying the restorative phases of sleep and how deep cycle rest clears neurotoxins, halts cognitive decline, and maintains neural synaptic health.",
    content: `## The Deep Link Between Sleep and Cognitive Health

For decades, sleep was viewed purely as a period of inactivity. Modern cognitive neurology has completely overturned this assumption. Today, we understand sleep as an active, highly structured neurological process essential for brain longevity and neuroprotection.

### The Brain's Drainage Pipeline: The Glymphatic System
One of the most remarkable discoveries in recent neurology is the **Glymphatic System**. This is a specialized waste clearance pathway that becomes highly active during slow-wave (deep) sleep.
*   **The Mechanism:** The brain literally shrinks its interstitial space to pump cerebrospinal fluid rapidly, washing away metabolic waste including **beta-amyloid**—a protein associated with cognitive decline.
*   **The Risk:** Chronic sleep disruption restricts this critical wash cycle, allowing amyloid plaques to gather.

### Synaptic Pruning and Memory Consolidation
During REM and deep sleep stages, your brain acts as an archiver:
1.  **Memory Consolidation:** Temporary information gathered during the day in the hippocampus is transferred to the neocortex for long-term storage.
2.  **Synaptic Scaling:** Your brain selectively weakens unimportant synaptic connections, making space for new learning when you wake.

### Tips for Optimizing Neurological Recovery Sleep
To support your glymphatic system and maintain cognitive flexibility:
*   **Ditch Blue Light:** Avoid LED displays before bed, as blue spectrum lighting suppresses melatonin release.
*   **Keep it Cool:** The brain needs a slight core body temperature drop to enter deep sleep cycles. Keep your room around 65-68°F (18°C).
*   **Avoid Late Caffeine:** Caffeine blocks adenosine receptors, preventing the build-up of healthy 'sleep pressure'.

*For complex sleep disorders, snoring, or persistent memory difficulties, schedule a comprehensive check-up with GreenLife's Neurology Department.*`,
    authorName: "Dr. Marcus Vance",
    authorId: "doc-2",
    category: "Neurology",
    imageUrl: "https://images.unsplash.com/photo-1511295742364-92767fa62d9f?auto=format&fit=crop&q=80&w=600",
    publishedDate: "2026-06-12T09:15:00.000Z",
    readTime: "4 mins",
    updatedAt: "2026-06-12T09:15:00.000Z"
  },
  {
    id: "blog-3",
    title: "The Parent's Guide to Children's Nutrition and Immunity",
    excerpt: "Expert pediatric nutritional strategies, micronutrient guide, and meal preparation directives designed to boost immune barriers in growing children.",
    content: `## Raising Healthy Eaters: Nutrition and Immunity in Childhood

As children grow, their bodies execute highly complex structural, endocrine, and neurological developments. Supporting this massive growth requires nutrient-dense fuel to bolster active immune barriers against seasonal pathogens.

### Fundamental Nutritional Pillars for Immunity

Immunity is built from the gut outward. Approximately 70% of a child's active immune cells live within their digestive tract. Here are the core nutrients required to build these cells:

1.  **Vitamin C & Diverse Bioflavonoids:** Essential for the production of infection-fighting white blood cells.
    *   *Sources:* Strawberries, oranges, kiwi, bell peppers.
2.  **Vitamin D (The Endocrine Key):** Optimizes macrophage response to infectious pathogens.
    *   *Sources:* Egg yolks, fortified milk, safe levels of natural sunlight.
3.  **Zinc (Cellular Integrity):** Essential for cell replication, mucosal health, and normal skin barrier function.
    *   *Sources:* Pumpkin seeds, legumes, grass-fed turkey, and eggs.
4.  **Prebiotics and Probiotics:** Feed the beneficial gut flora to fight unwanted microbes.
    *   *Sources:* Greek yogurt, bananas, garlic, and whole wheat oats.

### Healthy Habits to Prevent Picky Eating
*   **No Food Power Struggles:** Offer healthy foods consistently without forcing completion. It often takes children 10 to 15 exposures to accept a new taste.
*   **Cook Together:** Children are three times more likely to consume meals they helped prepare.
*   **Consistent Routines:** Structure sit-down dinners as an enjoyable family ritual rather than a chore.

*Every child has unique nutritional curves and developmental requirements. Consult with Elena Rostova in our Pediatrics Division for custom guidance.*`,
    authorName: "Dr. Elena Rostova",
    authorId: "doc-3",
    category: "Pediatrics",
    imageUrl: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&q=80&w=600",
    publishedDate: "2026-06-14T14:30:00.000Z",
    readTime: "6 mins",
    updatedAt: "2026-06-14T14:30:00.000Z"
  },
  {
    id: "blog-4",
    title: "Modern Hypertension Management: Navigating Risks and New Interventions",
    excerpt: "Hypertension remains the most prevalent cardiovascular challenge. Explore the latest drug-free interventions, early detection tech, and clinical therapy outlines.",
    content: `## Understanding & Managing Modern Hypertension

Hypertension, commonly referred to as the "silent killer," affects millions of adults worldwide. Because high blood pressure rarely exhibits early symptoms, proactive clinical screening and targeted lifestyle guidance are essential to avert long-term arterial stress, kidney disease, and stroke.

### The New Parameters of Healthy Pressure
The American Heart Association defines normal blood pressure as under **120/80 mmHg**. 
*   **Elevated:** Systolic between 120-129 and diastolic less than 80.
*   **Stage 1 Hypertension:** Systolic 130-139 or diastolic 80-89.
*   **Stage 2 Hypertension:** Systolic 140 or higher, or diastolic 90 or higher.

Identifying these shifts early with digital 24-hour ambulatory monitoring allows for timely, precise interventions before arterial walls undergo thickening or calcification.

### Clinical Strategies for Pressure Regulation

A successful modern protocol combines pharmaceutical precision with active lifestyle remodeling:

1.  **Strict Sodium Control & the DASH Protocol**
    *   Transition foods toward potassium-rich leafy greens, bananas, and sweet potatoes, which help the vascular system naturally dilate.
    *   **Goal:** Keep sodium levels beneath 1,500 mg per day for optimal vascular compliance.

2.  **Cardiovascular Interval Training**
    *   Sustained moderate exercise resets autonomic vascular tone. Dedicating 30 minutes to steady-state brisk walking or light jogging five days a week works as effectively as several single-agent medications.

3.  **Vascular Endothelial Support**
    *   Integrating antioxidant-dense foods, dark leafy berries, and beetroot juice promotes nitric oxide synthesis, preserving endothelial flexibility and enhancing blood flow.

4.  **Limiting Stimulants & Restoring Circadian Sleep**
    *   Excessive caffeine, chronic sleep deficiency, and smoking induce continuous sympathetic nervous system spikes, keeping blood vessels restricted throughout the day.

### Personalized Screening Plans
*At GreenLife Hospital, our Cardiology Department designs tailored vascular defense plans based on your genetic markers, metabolic rates, and daily stress parameters. Consult with Dr. Sarah Jenkins to complete a non-invasive screening profile.*`,
    authorName: "Dr. Sarah Jenkins",
    authorId: "doc-1",
    category: "Cardiology",
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600",
    publishedDate: "2026-06-15T08:00:00.000Z",
    readTime: "4 mins",
    updatedAt: "2026-06-15T08:00:00.000Z"
  }
];

// In-Memory Fallbacks (synced with LocalStorage)
const loadLocal = <T>(key: string, backup: T[]): T[] => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(backup));
    return backup;
  }
  try {
    return JSON.parse(data);
  } catch {
    return backup;
  }
};

const saveLocal = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Local storage stores
let localDoctors = loadLocal<Doctor>('hospital_doctors', DEFAULT_DOCTORS);
let localAppointments = loadLocal<Appointment>('hospital_appointments', []);
let localReports = loadLocal<Report>('hospital_reports', []);
let localUsers = loadLocal<UserProfile>('hospital_users', []);
let localBlogs = loadLocal<Blog>('hospital_blogs', DEFAULT_BLOGS);

// Merge any missing default blogs into local storage store
(() => {
  const localIds = localBlogs.map(b => b.id);
  let needsSync = false;
  for (const b of DEFAULT_BLOGS) {
    if (!localIds.includes(b.id)) {
      localBlogs.push(b);
      needsSync = true;
    }
  }
  if (needsSync) {
    saveLocal('hospital_blogs', localBlogs);
  }
})();

export const dbService = {
  // --- Doctors API ---
  async getDoctors(): Promise<Doctor[]> {
    if (isFirebaseEnabled) {
      const path = 'doctors';
      try {
        const querySnapshot = await getDocs(collection(db, path));
        const docsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) })) as Doctor[];
        // If Firestore is empty, seed it with defaults
        if (docsList.length === 0) {
          console.log("Seeding doctors collection in Firestore...");
          try {
            for (const d of DEFAULT_DOCTORS) {
              await setDoc(doc(db, path, d.id), d);
            }
          } catch (writeErr) {
            console.warn("Could not seed default doctors to Firestore (likely not an admin):", writeErr);
          }
          return DEFAULT_DOCTORS;
        }
        return docsList;
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, path);
      }
    } else {
      return localDoctors;
    }
  },

  async addDoctor(doctor: Omit<Doctor, 'id'>): Promise<Doctor> {
    const id = `doc-${Date.now()}`;
    const newDoc: Doctor = { ...doctor, id };
    if (isFirebaseEnabled) {
      const path = 'doctors';
      try {
        await setDoc(doc(db, path, id), newDoc);
        return newDoc;
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `${path}/${id}`);
      }
    } else {
      localDoctors.push(newDoc);
      saveLocal('hospital_doctors', localDoctors);
      return newDoc;
    }
  },

  async updateDoctor(doctor: Doctor): Promise<Doctor> {
    if (isFirebaseEnabled) {
      const path = `doctors/${doctor.id}`;
      try {
        const docRef = doc(db, 'doctors', doctor.id);
        await setDoc(docRef, doctor);
        return doctor;
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    } else {
      localDoctors = localDoctors.map(d => d.id === doctor.id ? doctor : d);
      saveLocal('hospital_doctors', localDoctors);
      return doctor;
    }
  },

  async deleteDoctor(doctorId: string): Promise<void> {
    if (isFirebaseEnabled) {
      const path = `doctors/${doctorId}`;
      try {
        await deleteDoc(doc(db, 'doctors', doctorId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    } else {
      localDoctors = localDoctors.filter(d => d.id !== doctorId);
      saveLocal('hospital_doctors', localDoctors);
    }
  },

  // --- Profile / User API ---
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    if (isFirebaseEnabled) {
      const path = `users/${userId}`;
      try {
        const docSnap = await getDoc(doc(db, 'users', userId));
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as UserProfile;
        }
        return null;
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, path);
      }
    } else {
      const user = localUsers.find(u => u.id === userId);
      return user || null;
    }
  },

  async saveUserProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    if (isFirebaseEnabled) {
      const path = `users/${userId}`;
      try {
        const docRef = doc(db, 'users', userId);
        const existingSnap = await getDoc(docRef);
        let profile: UserProfile;

        if (existingSnap.exists()) {
          const current = existingSnap.data() as UserProfile;
          profile = { ...current, ...data, id: userId } as UserProfile;
          await updateDoc(docRef, data);
        } else {
          profile = {
            id: userId,
            email: data.email || '',
            displayName: data.displayName || 'Anonymous Patient',
            role: data.role || 'patient',
            createdAt: data.createdAt || new Date().toISOString()
          };
          await setDoc(docRef, profile);
        }
        return profile;
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    } else {
      const index = localUsers.findIndex(u => u.id === userId);
      let profile: UserProfile;
      if (index >= 0) {
        profile = { ...localUsers[index], ...data };
        localUsers[index] = profile;
      } else {
        profile = {
          id: userId,
          email: data.email || '',
          displayName: data.displayName || 'Anonymous Patient',
          role: data.role || 'patient',
          createdAt: data.createdAt || new Date().toISOString()
        };
        localUsers.push(profile);
      }
      saveLocal('hospital_users', localUsers);
      return profile;
    }
  },

  // --- Appointments API ---
  async getAppointments(userId: string, role: 'admin' | 'patient' | 'doctor'): Promise<Appointment[]> {
    if (isFirebaseEnabled) {
      const path = 'appointments';
      try {
        let q;
        if (role === 'admin') {
          q = query(collection(db, path), orderBy('createdAt', 'desc'));
        } else {
          q = query(collection(db, path), where('userId', '==', userId));
        }
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) })) as Appointment[];
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, path);
      }
    } else {
      if (role === 'admin') {
        return [...localAppointments].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      }
      return localAppointments.filter(app => app.userId === userId);
    }
  },

  async createAppointment(appointment: Omit<Appointment, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
    const id = `apt-${Date.now()}`;
    const newAppointment: Appointment = {
      ...appointment,
      id,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isFirebaseEnabled) {
      const path = 'appointments';
      try {
        await setDoc(doc(db, path, id), newAppointment);
        return newAppointment;
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `${path}/${id}`);
      }
    } else {
      localAppointments.push(newAppointment);
      saveLocal('hospital_appointments', localAppointments);
      return newAppointment;
    }
  },

  async updateAppointmentStatus(appointmentId: string, status: 'pending' | 'completed' | 'cancelled'): Promise<void> {
    if (isFirebaseEnabled) {
      const path = `appointments/${appointmentId}`;
      try {
        const docRef = doc(db, 'appointments', appointmentId);
        await updateDoc(docRef, {
          status,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    } else {
      localAppointments = localAppointments.map(app => 
        app.id === appointmentId ? { ...app, status, updatedAt: new Date().toISOString() } : app
      );
      saveLocal('hospital_appointments', localAppointments);
    }
  },

  async deleteAppointment(appointmentId: string): Promise<void> {
    if (isFirebaseEnabled) {
      const path = `appointments/${appointmentId}`;
      try {
        await deleteDoc(doc(db, 'appointments', appointmentId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    } else {
      localAppointments = localAppointments.filter(app => app.id !== appointmentId);
      saveLocal('hospital_appointments', localAppointments);
    }
  },

  // --- Reports API ---
  async getReports(userId: string, role: 'admin' | 'patient' | 'doctor'): Promise<Report[]> {
    if (isFirebaseEnabled) {
      const path = 'reports';
      try {
        let q;
        if (role === 'admin') {
          q = query(collection(db, path), orderBy('uploadDate', 'desc'));
        } else {
          q = query(collection(db, path), where('userId', '==', userId));
        }
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) })) as Report[];
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, path);
      }
    } else {
      if (role === 'admin') {
        return [...localReports].sort((a, b) => b.uploadDate.localeCompare(a.uploadDate));
      }
      return localReports.filter(rep => rep.userId === userId);
    }
  },

  async addReport(report: Omit<Report, 'id' | 'uploadDate'>): Promise<Report> {
    const id = `rep-${Date.now()}`;
    const newReport: Report = {
      ...report,
      id,
      uploadDate: new Date().toISOString()
    };

    if (isFirebaseEnabled) {
      const path = 'reports';
      try {
        await setDoc(doc(db, path, id), newReport);
        return newReport;
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `${path}/${id}`);
      }
    } else {
      localReports.push(newReport);
      saveLocal('hospital_reports', localReports);
      return newReport;
    }
  },

  async deleteReport(reportId: string): Promise<void> {
    if (isFirebaseEnabled) {
      const path = `reports/${reportId}`;
      try {
        await deleteDoc(doc(db, 'reports', reportId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    } else {
      localReports = localReports.filter(rep => rep.id !== reportId);
      saveLocal('hospital_reports', localReports);
    }
  },

  // --- Blogs API ---
  async getBlogs(): Promise<Blog[]> {
    if (isFirebaseEnabled) {
      const path = 'blogs';
      try {
        const querySnapshot = await getDocs(collection(db, path));
        const blogsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) })) as Blog[];
        // If Firestore is empty, seed it with defaults
        if (blogsList.length === 0) {
          console.log("Seeding blogs collection in Firestore...");
          try {
            for (const b of DEFAULT_BLOGS) {
              await setDoc(doc(db, path, b.id), b);
            }
          } catch (writeErr) {
            console.warn("Could not seed default blogs to Firestore (likely not an admin):", writeErr);
          }
          return DEFAULT_BLOGS;
        }

        // Auto-seed any newly added default blogs (e.g. Cardiology blog-4)
        const existingIds = new Set(blogsList.map(b => b.id));
        const missingBlogs = DEFAULT_BLOGS.filter(b => !existingIds.has(b.id));
        if (missingBlogs.length > 0) {
          try {
            for (const b of missingBlogs) {
              console.log(`Auto-seeding missing blog ${b.id} to Firestore...`);
              await setDoc(doc(db, path, b.id), b);
              blogsList.push(b);
            }
          } catch (writeErr) {
            console.warn("Could not auto-seed missing default blogs to Firestore (likely not an admin):", writeErr);
            // Append missing default blogs to returned state to keep them visible even if db write failed
            for (const b of missingBlogs) {
              blogsList.push(b);
            }
          }
        }

        // Return sorted by date order descending (newest first)
        return blogsList.sort((a, b) => b.publishedDate.localeCompare(a.publishedDate));
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, path);
      }
    } else {
      return [...localBlogs].sort((a, b) => b.publishedDate.localeCompare(a.publishedDate));
    }
  },

  async addBlog(blog: Omit<Blog, 'id' | 'publishedDate' | 'updatedAt'>): Promise<Blog> {
    const id = `blog-${Date.now()}`;
    const newBlog: Blog = {
      ...blog,
      id,
      publishedDate: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    if (isFirebaseEnabled) {
      const path = 'blogs';
      try {
        await setDoc(doc(db, path, id), newBlog);
        return newBlog;
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `${path}/${id}`);
      }
    } else {
      localBlogs.unshift(newBlog);
      saveLocal('hospital_blogs', localBlogs);
      return newBlog;
    }
  },

  async updateBlog(blog: Blog): Promise<Blog> {
    const updatedBlog = { ...blog, updatedAt: new Date().toISOString() };
    if (isFirebaseEnabled) {
      const path = `blogs/${blog.id}`;
      try {
        const docRef = doc(db, 'blogs', blog.id);
        await setDoc(docRef, updatedBlog);
        return updatedBlog;
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    } else {
      localBlogs = localBlogs.map(b => b.id === blog.id ? updatedBlog : b);
      saveLocal('hospital_blogs', localBlogs);
      return updatedBlog;
    }
  },

  async deleteBlog(blogId: string): Promise<void> {
    if (isFirebaseEnabled) {
      const path = `blogs/${blogId}`;
      try {
        await deleteDoc(doc(db, 'blogs', blogId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    } else {
      localBlogs = localBlogs.filter(b => b.id !== blogId);
      saveLocal('hospital_blogs', localBlogs);
    }
  }
};
