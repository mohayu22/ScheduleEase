import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getUser, updateUser as updateStorageUser } from "@/lib/storage";

interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  profileImage?: string;
}

interface UserContextType {
  user: User | null;
  updateUser: (userData: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage on initial render
  useEffect(() => {
    const storedUser = getUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  // Update user function
  const updateUser = (userData: Partial<User>) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      ...userData
    };

    // Update in localStorage
    updateStorageUser(updatedUser);
    
    // Update state
    setUser(updatedUser);
  };

  const value = {
    user,
    updateUser
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
