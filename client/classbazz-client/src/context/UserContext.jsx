import { createContext, useMemo, useState } from "react";

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    //trying to load user from sessionStorage
    const savedUser = sessionStorage.getItem('classbazz-user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const value = useMemo(() => ({ user, setUser }), [user]);


  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};