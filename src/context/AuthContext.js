import { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({children}) =>{
    const [user, setUser] = useState (null);

    const login =(email, password)=>{
        //fake login
        const fakeUser = { email };
        setUser(fakeUser);
    };

    const register = (firstName, lastName, phoneNumber, email, password) => {
    const fakeUser = {
        name: `${firstName} ${lastName}`,
        phoneNumber,
        email,
    };

    setUser(fakeUser);
};
    const logout = ()=> {
        setUser(null); 
    };

    return (
        <AuthContext.Provider value= {{user, login, register, logout}}>
            {children}
        </AuthContext.Provider>
    );
};