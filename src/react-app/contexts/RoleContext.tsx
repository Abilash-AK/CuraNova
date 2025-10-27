import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from "@/react-app/contexts/AuthContext";
import { getUserRole, type UserRole } from '@/react-app/utils/roleUtils';

interface RoleContextType {
  role: UserRole;
  isDoctor: boolean;
  isNurse: boolean;
  isPatient: boolean;
  isAuthorized: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  const roleData = useMemo(() => {
    // Check for demo user first
    const demoUser = localStorage.getItem('demo-user');
    const demoSession = localStorage.getItem('demo-session');
    
    if (demoUser && demoSession) {
      const parsedDemoUser = JSON.parse(demoUser);
      const role: UserRole = parsedDemoUser.role === 'doctor' ? 'doctor' : 
                           parsedDemoUser.role === 'nurse' ? 'nurse' : 'patient';
      return {
        role,
        isDoctor: role === 'doctor',
        isNurse: role === 'nurse',
        isPatient: role === 'patient',
        isAuthorized: true,
      };
    }
    
    // Fall back to regular user email-based role detection
    const email = user?.email || '';
    const validServerRole = user?.role === 'doctor' || user?.role === 'nurse' || user?.role === 'patient'
      ? (user.role as UserRole)
      : undefined;
    const derivedRole = validServerRole ?? getUserRole(email);
    
    return {
      role: derivedRole,
      isDoctor: derivedRole === 'doctor',
      isNurse: derivedRole === 'nurse',
      isPatient: derivedRole === 'patient',
      isAuthorized: derivedRole !== 'unauthorized',
    };
  }, [user?.email, user?.role]);

  return (
    <RoleContext.Provider value={roleData}>
      {children}
    </RoleContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- Custom hook shares context from this module for convenience
export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
