import { supabase } from './supabase';

// Helper function to call Edge Functions
export const callEdgeFunction = async (functionName: string, payload: any) => {
  try {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: payload,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error calling Edge Function ${functionName}:`, error);
    throw error;
  }
};

// Password management functions using Edge Functions (plain text only)
export const updatePassword = async (admissionId: string, newPassword: string) => {
  const result = await callEdgeFunction('password-manager', {
    action: 'update-password',
    admission_id: admissionId,
    new_password: newPassword,
  });
  return result;
};

export const resetPasswordByAdmin = async (admissionId: string, newPassword: string, adminKey: string) => {
  const result = await callEdgeFunction('password-manager', {
    action: 'reset-password',
    admission_id: admissionId,
    new_password: newPassword,
    admin_key: adminKey,
  });
  return result;
};

export const verifyPassword = async (admissionId: string, password: string) => {
  const result = await callEdgeFunction('password-manager', {
    action: 'verify-password',
    admission_id: admissionId,
    password: password,
  });
  return result;
};

// Migrate bcrypt passwords to plain text (admin only)
export const migrateToPlainText = async (admissionId: string, adminKey: string, newPassword: string) => {
  const result = await callEdgeFunction('password-manager', {
    action: 'migrate-to-plain',
    admission_id: admissionId,
    admin_key: adminKey,
    new_password: newPassword,
  });
  return result;
};