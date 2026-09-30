// Stub for Supabase in offline mode
// This prevents Supabase from being included in the offline build

export const supabase = null;
export const getSupabaseClient = () => {
  throw new Error('Supabase is not available in offline mode');
};

// Export all other functions as no-ops or errors
export const getExamById = () => null;
export const queryWithRetry = () => Promise.reject(new Error('Not available in offline mode'));
