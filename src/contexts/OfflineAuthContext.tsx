// Offline authentication context for SEB environments
// Manages local student authentication without external dependencies
// Uses secure password hashing for offline authentication

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getOfflineDatabase, OfflineStudent } from '@/lib/offline-db';
import { isOfflineMode } from '@/lib/offline-mode';

// Simple hash function for offline password verification
// In production, consider using a more robust library like bcrypt
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

interface OfflineAuthContextType {
  student: OfflineStudent | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (studentId: string, password: string) => Promise<void>;
  logout: () => void;
  register: (studentData: Omit<OfflineStudent, 'id' | 'created_at'>, password: string) => Promise<void>;
}

const OfflineAuthContext = createContext<OfflineAuthContextType | undefined>(undefined);

export function OfflineAuthProvider({ children }: { children: ReactNode }) {
  const [student, setStudent] = useState<OfflineStudent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const savedStudentId = localStorage.getItem('offline-student-id');
        
        if (savedStudentId) {
          const db = await getOfflineDatabase();
          const savedStudent = await db.getStudent(savedStudentId);
          
          if (savedStudent) {
            setStudent(savedStudent);
          } else {
            localStorage.removeItem('offline-student-id');
          }
        }
      } catch (error) {
        console.error('Failed to check offline session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (studentId: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const db = await getOfflineDatabase();
      const foundStudent = await db.getStudent(studentId);

      if (!foundStudent) {
        setError('Student not found. Please contact your administrator.');
        throw new Error('Student not found');
      }

      // Hash the provided password and compare with stored hash
      const passwordHash = await hashPassword(password);
      const storedHash = (foundStudent as any).password_hash;

      // Security: Reject login if no password hash exists
      if (!storedHash) {
        setError('Account not properly configured. Please contact administrator.');
        throw new Error('No password hash found for student account');
      }

      // Compare hashed passwords
      if (passwordHash !== storedHash) {
        setError('Invalid password');
        throw new Error('Invalid password');
      }

      setStudent(foundStudent);
      localStorage.setItem('offline-student-id', studentId);
      console.log(`✅ Student ${foundStudent.name} logged in offline mode`);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setStudent(null);
    localStorage.removeItem('offline-student-id');
    console.log('👋 Student logged out');
  };

  const register = async (studentData: Omit<OfflineStudent, 'id' | 'created_at'>, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const db = await getOfflineDatabase();
      
      // Check if student_id already exists
      const existing = await db.getStudent(studentData.student_id);
      if (existing) {
        setError('Student ID already exists');
        throw new Error('Student ID already exists');
      }

      // Hash the password before storing
      const passwordHash = await hashPassword(password);

      const newStudent: OfflineStudent = {
        ...studentData,
        id: `student-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString()
      } as any;

      // Store the password hash
      (newStudent as any).password_hash = passwordHash;

      await db.addStudent(newStudent);
      setStudent(newStudent);
      localStorage.setItem('offline-student-id', studentData.student_id);
      
      console.log(`✅ Student ${newStudent.name} registered offline`);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <OfflineAuthContext.Provider
      value={{
        student,
        isAuthenticated: !!student,
        loading,
        error,
        login,
        logout,
        register
      }}
    >
      {children}
    </OfflineAuthContext.Provider>
  );
}

export function useOfflineAuth() {
  const context = useContext(OfflineAuthContext);
  if (context === undefined) {
    throw new Error('useOfflineAuth must be used within an OfflineAuthProvider');
  }
  return context;
}