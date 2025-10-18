import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [idToken, setIdToken] = useState(null);

  useEffect(() => {
    // Set persistence to local storage
    setPersistence(auth, browserLocalPersistence).catch(console.error);

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get ID token for API calls
        const token = await user.getIdToken();
        setIdToken(token);
        setUser(user);
      } else {
        setIdToken(null);
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Refresh token periodically (every 50 minutes)
  useEffect(() => {
    if (user) {
      const interval = setInterval(async () => {
        try {
          const token = await user.getIdToken(true);
          setIdToken(token);
        } catch (error) {
          console.error('Error refreshing token:', error);
        }
      }, 50 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [user]);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    idToken,
    loading,
    signInWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
