import React, { createContext, useContext, useState, useCallback } from "react";
import { BookingApplication } from "@/types/application";

interface ApplicationContextType {
  currentUser: BookingApplication | null;
  submitApplication: (app: Omit<BookingApplication, "id" | "submittedAt">) => void;
  logout: () => void;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export function ApplicationProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<BookingApplication | null>(() => {
    const stored = localStorage.getItem("current_user");
    return stored ? JSON.parse(stored) : null;
  });

  const handleSubmitApplication = useCallback(
    (app: Omit<BookingApplication, "id" | "submittedAt">) => {
      const newApp: BookingApplication = {
        ...app,
        id: Math.random().toString(36).substr(2, 9),
        submittedAt: Date.now(),
      };
      setCurrentUser(newApp);
      localStorage.setItem("current_user", JSON.stringify(newApp));
    },
    []
  );

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem("current_user");
  }, []);

  return (
    <ApplicationContext.Provider
      value={{
        currentUser,
        submitApplication: handleSubmitApplication,
        logout: handleLogout,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
}

export function useApplication(): ApplicationContextType {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error("useApplication must be used within ApplicationProvider");
  }
  return context;
}
