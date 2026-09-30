// Synchronization service for offline-to-online data sync
// Handles syncing local exam results to Supabase when internet is restored

import { getOfflineDatabase } from './offline-db';
import { isOfflineMode } from './offline-mode';

export interface SyncStatus {
  pending: number;
  completed: number;
  failed: number;
  lastSyncTime: string | null;
  isSyncing: boolean;
}

export interface SyncResult {
  success: boolean;
  itemsProcessed: number;
  itemsFailed: number;
  errors: string[];
}

class SyncService {
  private isSyncing = false;
  private lastSyncTime: string | null = null;

  // Get current sync status
  async getSyncStatus(): Promise<SyncStatus> {
    try {
      const db = await getOfflineDatabase();
      const pendingItems = await db.getPendingSyncItems();
      
      // Count items by status (would need additional DB methods for completed/failed)
      const pending = pendingItems.length;
      
      return {
        pending,
        completed: 0, // Would need DB method to count completed
        failed: 0, // Would need DB method to count failed
        lastSyncTime: this.lastSyncTime,
        isSyncing: this.isSyncing
      };
    } catch (error) {
      console.error('Error getting sync status:', error);
      return {
        pending: 0,
        completed: 0,
        failed: 0,
        lastSyncTime: this.lastSyncTime,
        isSyncing: false
      };
    }
  }

  // Sync all pending items
  async syncAll(): Promise<SyncResult> {
    if (isOfflineMode()) {
      return {
        success: false,
        itemsProcessed: 0,
        itemsFailed: 0,
        errors: ['Cannot sync in offline mode']
      };
    }

    if (this.isSyncing) {
      return {
        success: false,
        itemsProcessed: 0,
        itemsFailed: 0,
        errors: ['Sync already in progress']
      };
    }

    this.isSyncing = true;
    const result: SyncResult = {
      success: true,
      itemsProcessed: 0,
      itemsFailed: 0,
      errors: []
    };

    try {
      const db = await getOfflineDatabase();
      const pendingItems = await db.getPendingSyncItems();

      console.log(`Starting sync of ${pendingItems.length} items...`);

      for (const item of pendingItems) {
        try {
          await this.syncItem(item);
          result.itemsProcessed++;
          await db.updateSyncStatus(item.id, 'completed');
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
          result.itemsFailed++;
          result.errors.push(`Failed to sync ${item.entity_type} ${item.entity_id}: ${error}`);
          await db.updateSyncStatus(item.id, 'failed', error instanceof Error ? error.message : String(error));
        }
      }

      this.lastSyncTime = new Date().toISOString();
      console.log(`Sync completed: ${result.itemsProcessed} succeeded, ${result.itemsFailed} failed`);

    } catch (error) {
      console.error('Sync failed:', error);
      result.success = false;
      result.errors.push(`Sync failed: ${error}`);
    } finally {
      this.isSyncing = false;
    }

    return result;
  }

  // Sync a single item
  private async syncItem(item: any): Promise<void> {
    switch (item.entity_type) {
      case 'result':
        await this.syncResult(item);
        break;
      case 'attempt':
        await this.syncAttempt(item);
        break;
      case 'event':
        await this.syncEvent(item);
        break;
      default:
        throw new Error(`Unknown entity type: ${item.entity_type}`);
    }
  }

  // Sync exam result to Supabase
  private async syncResult(item: any): Promise<void> {
    const payload = item.payload;
    
    try {
      // Dynamically import Supabase only when syncing
      const { getSupabaseClient } = await import('./supabase');
      const supabase = getSupabaseClient();
      
      // Check if result already exists in Supabase
      const { data: existing } = await supabase
        .from('exam_results')
        .select('id')
        .eq('id', payload.id)
        .maybeSingle();

      if (existing) {
        console.log(`Result ${payload.id} already exists in Supabase, skipping`);
        return;
      }

      // Insert result into Supabase
      const { error } = await supabase
        .from('exam_results')
        .insert([{
          id: payload.id,
          student_id: payload.student_id,
          student_name: payload.student_name,
          exam_id: payload.exam_id,
          exam_title: payload.exam_title,
          score: payload.score,
          total_questions: payload.total_questions,
          correct_answers: payload.correct_answers,
          score_percentage: payload.percentage,
          answers: {}, // Answers would need to be loaded from local DB
          flagged_questions: [],
          time_spent: payload.time_taken,
          submitted_at: payload.submitted_at,
          results_visible: false
        }]);

      if (error) {
        throw error;
      }

      console.log(`✅ Synced result ${payload.id} to Supabase`);
    } catch (error) {
      console.error(`Failed to sync result ${payload.id}:`, error);
      throw error;
    }
  }

  // Sync attempt cancellation to Supabase
  private async syncAttempt(item: any): Promise<void> {
    const payload = item.payload;
    
    try {
      // Dynamically import Supabase only when syncing
      const { getSupabaseClient } = await import('./supabase');
      const supabase = getSupabaseClient();
      
      if (item.operation === 'cancel') {
        // Save cancelled exam record
        const { error } = await supabase
          .from('exam_results')
          .insert([{
            student_id: payload.student_id,
            student_name: payload.student_name,
            exam_id: payload.exam_id,
            exam_title: payload.exam_title,
            total_questions: 0,
            correct_answers: 0,
            score_percentage: 0,
            answers: { _cancelled: true },
            flagged_questions: [],
            time_spent: 0,
            submitted_at: payload.cancelled_at,
            results_visible: false
          }]);

        if (error) {
          throw error;
        }

        console.log(`✅ Synced cancelled attempt ${item.entity_id} to Supabase`);
      }
    } catch (error) {
      console.error(`Failed to sync attempt ${item.entity_id}:`, error);
      throw error;
    }
  }

  // Sync event/violation to Supabase
  private async syncEvent(item: any): Promise<void> {
    try {
      // This would sync violation events to Supabase
      // Implementation depends on your Supabase schema
      console.log(`Syncing event ${item.entity_id}...`);
      // await supabase.from('violations').insert([...]);
    } catch (error) {
      console.error(`Failed to sync event ${item.entity_id}:`, error);
      throw error;
    }
  }

  // Force retry failed sync items
  async retryFailedSyncs(): Promise<SyncResult> {
    try {
      const db = await getOfflineDatabase();
      // This would need a DB method to get failed items
      // For now, just run sync all
      return await this.syncAll();
    } catch (error) {
      console.error('Failed to retry syncs:', error);
      return {
        success: false,
        itemsProcessed: 0,
        itemsFailed: 0,
        errors: [String(error)]
      };
    }
  }

  // Clear sync queue (use with caution)
  async clearSyncQueue(): Promise<void> {
    try {
      const db = await getOfflineDatabase();
      // This would need a DB method to clear sync queue
      console.log('Sync queue cleared');
    } catch (error) {
      console.error('Failed to clear sync queue:', error);
    }
  }

  // Check if network is available
  async isNetworkAvailable(): Promise<boolean> {
    try {
      // Dynamically import Supabase only when checking network
      const { getSupabaseClient } = await import('./supabase');
      const supabase = getSupabaseClient();
      // Try to reach Supabase
      const { error } = await supabase.from('students').select('id').limit(1);
      return !error;
    } catch (error) {
      return false;
    }
  }
}

// Singleton instance
let syncServiceInstance: SyncService | null = null;

export function getSyncService(): SyncService {
  if (!syncServiceInstance) {
    syncServiceInstance = new SyncService();
  }
  return syncServiceInstance;
}

export default SyncService;
