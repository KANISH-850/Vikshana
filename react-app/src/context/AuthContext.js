import React, { createContext, useState, useEffect } from 'react';
import { getCatalyst, ensureCatalystLoaded } from '../lib/catalyst';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const catalyst = await ensureCatalystLoaded();
        if (!catalyst) {
          throw new Error("Catalyst not initialized yet. Ensure init.js is loaded.");
        }
        
        // Use catalyst.auth.isUserAuthenticated() to get the current user reliably
        const authResult = await catalyst.auth.isUserAuthenticated();
        const currentUser = authResult.content;
        
        if (currentUser && currentUser.email_id) {
          // ZCQL is not supported in this version of the Web SDK bundle.
          // Bypassing DB lookup to prevent crashes, but pulling REAL name and email!
          setUser({
            id: currentUser.user_id,
            name: currentUser.first_name || currentUser.last_name || 'User',
            email: currentUser.email_id,
            role: 'Investigator',
            district: 'Central',
            status: 'active'
          });
        }
      } catch (error) {
        console.log('User is not authenticated:', error.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    // SEAMLESS HACKATHON DEMO MODE:
    // Catalyst SDK forces an iframe or redirect for email/password, which breaks custom UIs.
    // To allow you to use your beautiful custom React inputs for the demo, we instantly mock the session!
    setUser({
        id: 'DEMO_USER_ID',
        name: 'Officer (Demo)',
        email: email,
        role: 'Investigator',
        district: 'Central',
        status: 'active'
    });
    // App.js or Login.jsx will now automatically redirect you to the Dashboard!
  };

  const signup = async (email, password, name) => {
    const catalyst = await ensureCatalystLoaded();
    if (!catalyst) throw new Error("Catalyst SDK not loaded");
    
    try {
      const config = {
        first_name: name,
        platform_type: 'web'
      };
      const response = await catalyst.auth.signUp(email, password, config);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    const catalyst = await ensureCatalystLoaded();
    if (!catalyst) return;
    
    try {
      // Pass the explicit redirect URL to signOut to prevent the startsWith crash
      await catalyst.auth.signOut('/app/auth/login');
      setUser(null);
    } catch (error) {
      console.error('Error logging out', error);
    }
  };

  const loginWithGoogle = () => {
    // Relative URL ensures that when testing on localhost, the Catalyst Serve proxies this
    // to the Catalyst Backend, and then Catalyst Backend redirects back to localhost!
    window.location.href = '/__catalyst/auth/login?provider=Google';
  };
  
  const forgotPassword = async (email) => {
      const catalyst = await ensureCatalystLoaded();
      if (!catalyst) throw new Error("Catalyst SDK not loaded");
      try {
          const config = {};
          await catalyst.auth.forgotPassword(email, config);
      } catch (error) {
          throw error;
      }
  }
  
  const resetPassword = async (email, config) => {
      const catalyst = await ensureCatalystLoaded();
      if (!catalyst) throw new Error("Catalyst SDK not loaded");
      try {
          await catalyst.auth.resetPassword(email, config);
      } catch (error) {
          throw error;
      }
  }

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    signup,
    logout,
    loginWithGoogle,
    forgotPassword,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
