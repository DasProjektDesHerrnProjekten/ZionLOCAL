// src/contexts/AdminAuthContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { isOfflineMode } from '../lib/offline-mode';

export interface Admin {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'superadmin' | 'overseer';
  email?: string;
  phone?: string;
  permissions?: string;
  is_active?: boolean;
}

interface AdminAuthContextType {
  admin: Admin | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  updateProfile: (updates: Partial<Admin>) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  loading: boolean;
  error: string | null;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        if (isOfflineMode()) {
          // Skip Supabase check in offline mode
          return;
        }
        const storedAdmin = localStorage.getItem('admin');
        if (storedAdmin) {
          const adminData = JSON.parse(storedAdmin);
          // Verify the admin still exists in Supabase
          const { data, error } = await supabase
            .from('portal_admins')
            .select('*')
            .eq('admin_id', adminData.username)
            .single();
          
          console.log('Session check - data:', data, 'error:', error);
          
          if (!error && data) {
            setAdmin({
              id: data.admin_id,
              username: data.admin_id,
              name: data.full_name,
              role: data.is_superadmin ? 'superadmin' : 'admin',
              permissions: data.permissions,
              is_active: data.is_active
            });
          } else {
            localStorage.removeItem('admin');
          }
        }
      } catch (err) {
        console.error('Error checking session:', err);
        localStorage.removeItem('admin');
      }
    };

    checkSession();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    console.log('Login attempt for:', username);
    setLoading(true);
    setError(null);
    
    try {
      // Query the portal_admins table in Supabase using correct column names
      const { data, error } = await supabase
        .from('portal_admins')
        .select('*')
        .eq('admin_id', username)
        .single();

      if (error) {
        console.error('Database error:', error);
        setError('Invalid username or password');
        return false;
      }

      if (!data) {
        console.warn('No admin found with admin_id:', username);
        setError('Invalid username or password');
        return false;
      }

      // Check if admin is active
      if (!data.is_active) {
        console.warn('Admin account is disabled:', username);
        setError('Account is disabled. Please contact administrator.');
        return false;
      }

      // Direct password comparison (for migration purposes)
      // In production, you should use bcrypt or similar password hashing
      if (data.password !== password) {
        console.warn('Invalid password for:', username);
        setError('Invalid username or password');
        return false;
      }

      // Login successful - map to our Admin interface
      const adminData: Admin = {
        id: data.admin_id,
        username: data.admin_id,
        name: data.full_name,
        role: data.is_superadmin ? 'superadmin' : 'admin',
        permissions: data.permissions,
        is_active: data.is_active
      };

      setAdmin(adminData);
      localStorage.setItem('admin', JSON.stringify(adminData));
      console.log('Login successful for:', username);
      return true;

    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('Logging out admin');
    setAdmin(null);
    localStorage.removeItem('admin');
    setError(null);
  };

  const updateProfile = async (updates: Partial<Admin>): Promise<boolean> => {
    if (!admin) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('portal_admins')
        .update({
          full_name: updates.name,
          permissions: updates.permissions
        })
        .eq('admin_id', admin.username);

      if (error) throw error;

      // Update local state
      const updatedAdmin = { ...admin, ...updates };
      setAdmin(updatedAdmin);
      localStorage.setItem('admin', JSON.stringify(updatedAdmin));
      
      return true;
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!admin) return { success: false, message: 'Not authenticated' };
    
    setLoading(true);
    setError(null);
    
    try {
      // First verify current password
      const { data: adminData, error: fetchError } = await supabase
        .from('portal_admins')
        .select('password')
        .eq('admin_id', admin.username)
        .single();

      if (fetchError) throw fetchError;

      if (adminData.password !== currentPassword) {
        return { success: false, message: 'Current password is incorrect' };
      }

      // Update password
      const { error: updateError } = await supabase
        .from('portal_admins')
        .update({ 
          password: newPassword
        })
        .eq('admin_id', admin.username);

      if (updateError) throw updateError;
      
      return { success: true, message: 'Password updated successfully' };
    } catch (err) {
      console.error('Error changing password:', err);
      setError('Failed to change password. Please try again.');
      return { success: false, message: 'Failed to change password. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    admin,
    login,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated: !!admin,
    loading,
    error
  };

  console.log('Auth context value:', value);

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
