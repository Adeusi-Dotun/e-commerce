import { createContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigation } from '@react-navigation/native';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔁 fetch profile helper
  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.log("Profile fetch error:", error.message);
      return null;
    }

    return data;
  };

  // 🚀 INIT AUTH (runs on app start)
  useEffect(() => {
    const initAuth = async () => {
      const { data } = await supabase.auth.getSession();

      console.log('Session:', data.session);  

      const sessionUser = data?.session?.user;

      if (sessionUser) {
        setUser(sessionUser);

        const profileData = await fetchProfile(sessionUser.id);
        setProfile(profileData);
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  // 🔁 LISTEN FOR LOGIN / LOGOUT CHANGES
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const sessionUser = session?.user;

        setUser(sessionUser || null);

        if (sessionUser) {
          const profileData = await fetchProfile(sessionUser.id);
          setProfile(profileData);
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // 🧾 REGISTER
  const register = async (firstName, lastName, phoneNumber, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    const newUser = data.user;

    if (!newUser) return;

    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: newUser.id,
        first_name: firstName,
        last_name: lastName,
        phone: phoneNumber,
      });

    if (profileError) {
      alert(profileError.message);
      return;
    }

    setUser(newUser);

    const newProfile = await fetchProfile(newUser.id);
    setProfile(newProfile);
  };

  // 🔐 LOGIN
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return false;
    }

    const loggedUser = data?.user;

    setUser(loggedUser);

    const profileData = await fetchProfile(loggedUser.id);
    setProfile(profileData);
    
    return true;
  };

  // 🚪 LOGOUT
  const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(error.message);
      return;
    }

    setUser(null);
    setProfile(null);
    
  };

  const requireAuth = (navigation, callback) => {
    if (user) {
      callback();
    } else {
      navigation.navigate("Signin");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        register,
        login,
        logout,
        requireAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};