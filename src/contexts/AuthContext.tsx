import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, isFirebaseEnabled } from '../lib/firebase';
import { dbService, UserProfile } from '../lib/dbService';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  loginWithGoogle: () => Promise<void>;
  loginAsDemo: (role: 'patient' | 'admin') => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = profile?.role === 'admin' || profile?.email === "ailogin.learn@gmail.com";

  // Load profile when user changes
  const fetchProfile = async (uid: string, email: string, displayName: string) => {
    try {
      let p = await dbService.getUserProfile(uid);
      if (!p) {
        // Enforce admin for the special bootstrap email, otherwise default to patient
        const role = email === "ailogin.learn@gmail.com" ? "admin" : "patient";
        p = await dbService.saveUserProfile(uid, {
          email,
          displayName,
          role,
          createdAt: new Date().toISOString()
        });
      }
      setProfile(p);
    } catch (err) {
      console.error("Error setting/getting user profile:", err);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.uid, user.email || '', user.displayName || 'Patient');
    }
  };

  useEffect(() => {
    if (isFirebaseEnabled && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        setUser(firebaseUser);
        if (firebaseUser) {
          await fetchProfile(
            firebaseUser.uid, 
            firebaseUser.email || '', 
            firebaseUser.displayName || 'Google User'
          );
        } else {
          setProfile(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // Local storage auth simulation
      const storedUser = localStorage.getItem('hospital_auth_user');
      const storedProfile = localStorage.getItem('hospital_auth_profile');
      if (storedUser && storedProfile) {
        setUser(JSON.parse(storedUser));
        setProfile(JSON.parse(storedProfile));
      }
      setLoading(false);
    }
  }, []);

  const loginWithGoogle = async () => {
    if (isFirebaseEnabled && auth) {
      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        setUser(result.user);
        await fetchProfile(
          result.user.uid, 
          result.user.email || '', 
          result.user.displayName || 'Google User'
        );
      } catch (err) {
        console.error("Popup Sign-in Error:", err);
        throw err;
      }
    } else {
      // Offline fallback Google Login simulator
      alert("Using Simulator: Logging in with a simulated Google Account.");
      const mockResult = {
        uid: "gmail-user-99",
        email: "ailogin.learn@gmail.com", // Trigger admin role!
        displayName: "Dr. Alexander Smith"
      };
      const mockUser = mockResult as any as FirebaseUser;
      setUser(mockUser);
      localStorage.setItem('hospital_auth_user', JSON.stringify(mockUser));
      await fetchProfile(mockResult.uid, mockResult.email, mockResult.displayName);
      localStorage.setItem('hospital_auth_profile', JSON.stringify({
        id: mockResult.uid,
        email: mockResult.email,
        displayName: mockResult.displayName,
        role: 'admin',
        createdAt: new Date().toISOString()
      }));
    }
  };

  const loginAsDemo = async (role: 'patient' | 'admin') => {
    const demoUser = {
      uid: role === 'admin' ? 'demo-admin-uid-101' : 'demo-patient-uid-202',
      email: role === 'admin' ? 'admin@greenlifehospital.org' : 'patient@gmail.com',
      displayName: role === 'admin' ? 'System Administrator' : 'John Doe (Demo)',
      emailVerified: true,
      isAnonymous: false
    };

    const mockUser = demoUser as any as FirebaseUser;
    setUser(mockUser);
    
    const demoProfile: UserProfile = {
      id: demoUser.uid,
      email: demoUser.email,
      displayName: demoUser.displayName,
      role: role,
      createdAt: new Date().toISOString()
    };

    // Save profile to dbService
    await dbService.saveUserProfile(demoUser.uid, demoProfile);
    setProfile(demoProfile);

    if (!isFirebaseEnabled) {
      localStorage.setItem('hospital_auth_user', JSON.stringify(mockUser));
      localStorage.setItem('hospital_auth_profile', JSON.stringify(demoProfile));
    }
  };

  const logout = async () => {
    if (isFirebaseEnabled && auth) {
      await signOut(auth);
    }
    setUser(null);
    setProfile(null);
    localStorage.removeItem('hospital_auth_user');
    localStorage.removeItem('hospital_auth_profile');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      isAdmin, 
      loginWithGoogle, 
      loginAsDemo, 
      logout,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
