import { createContext, useState } from "react";
import { supabase } from "../lib/supabase";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const register = async (firstName, lastName, phoneNumber, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    const user = data.user;
 
    // save extra info
    const {error: profileError} = await supabase
        .from("profiles")
        .insert({
            id: user.id,
            first_name:firstName,
            last_name:lastName,
            phone:phoneNumber,
        });
        

    if (profileError) {
      alert(profileError.message);
      return;
    }



    setUser(user);
    setProfile({ first_name: firstName, last_name: lastName, phone: phoneNumber }); 
  };

  const value = {
    user,
    profile,
    register,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 