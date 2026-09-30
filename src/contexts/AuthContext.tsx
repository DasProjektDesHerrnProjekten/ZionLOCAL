import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import type { Subscription } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface Student {
  id: string;
  admission_id: string;
  name: string;
  class: string;
  section: string;
  roll_number: string;
}

interface AuthContextType {
  student: Student | null;
  login: (admissionId: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [student, setStudent] = useState<Student | null>(() => {
    // Initialize state from localStorage if available
    try {
      const storedStudent = localStorage.getItem('student');
      return storedStudent ? JSON.parse(storedStudent) : null;
    } catch (error) {
      console.error('Error parsing stored session:', error);
      localStorage.removeItem('student');
      return null;
    }
  });

  // Set loading to false after initial render
  useEffect(() => {
    setIsLoading(false);
  }, []);

  const login = useCallback(async (admissionId: string, password: string) => {
    console.log('Attempting login for admission ID:', admissionId);
    
    // Initialize result object with proper type
    let result: { success: boolean; error?: string } = { 
      success: false, 
      error: 'An unexpected error occurred' 
    };
    
    setIsLoading(true);
    
    try {
      // Query the students table directly (temporarily for bcrypt compatibility)
      console.log('Querying students table for admission ID:', admissionId);
      const { data: studentData, error, status } = await supabase
        .from('students')
        .select('*')
        .eq('admission_id', admissionId)
        .maybeSingle();

      console.log('Login query status:', status);
      console.log('Login response data:', studentData);
      console.log('Login response error:', error);

      if (error) {
        console.error('Database error:', error);
        throw new Error('Database error during login');
      }

      if (!studentData) {
        console.error('Login error: No student found with admission ID:', admissionId);
        throw new Error('Invalid Admission ID or Password');
      }

      // For now, use direct password comparison (will fail with bcrypt hashes)
      // This is temporary until we migrate passwords to plain text
      if (studentData.password !== password) {
        console.error('Login error: Invalid password');
        console.log('Note: Current passwords are bcrypt hashed. Need to migrate to plain text.');
        throw new Error('Invalid Admission ID or Password (Passwords need migration)');
      }
      
      // If we get here, login was successful
      // Update the student state directly since we're not using Supabase Auth
      const formattedStudentData: Student = {
        id: studentData.admission_id || '',
        admission_id: studentData.admission_id || admissionId,
        name: studentData.full_name || `${studentData.first_name || ''} ${studentData.last_name || ''}`.trim(),
        class: studentData.stream || studentData.class || studentData.class_name || '',
        section: studentData.section || studentData.section_name || '',
        roll_number: studentData.roll_number || studentData.rollNumber || studentData.roll_no || ''
      };
      
      // Store the student data in state and localStorage
      setStudent(formattedStudentData);
      localStorage.setItem('student', JSON.stringify(formattedStudentData));
      result = { success: true };
      
    } catch (error) {
      console.error('Login error:', error);
      result = { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
      // Ensure we clear the student state on login failure
      setStudent(null);
    } finally {
      setIsLoading(false);
    }
    
    return result;
  }, []);

  const logout = useCallback((navigate?: (path: string) => void) => {
    setStudent(null);
    localStorage.removeItem('student');
    if (navigate) {
      navigate('/login');
    } else if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    student,
    login,
    logout,
    isAuthenticated: !!student,
    isLoading,
  }), [student, isLoading, login, logout]);

  // Initialize analytics
  useEffect(() => {
    import('@/utils/analytics').then(({ default: trackEvent }) => {
      trackEvent('auth_state_change', { isAuthenticated: !!student });
    });
  }, [student]);

  // Return the provider with the authentication context
  return (
    <AuthContext.Provider value={value}>
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
