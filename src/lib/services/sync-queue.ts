"use client";

import {
  insertFoodLog,
  deleteFoodLog,
  insertWaterLog,
  deleteWaterLog,
  insertWeightLog,
  insertMeasurementLog,
  saveWorkoutSession,
  deleteWorkoutSession,
  upsertWorkoutRoutine,
  deleteWorkoutRoutine,
  upsertProfile,
  upsertFitnessGoal,
} from "@/lib/services/supabase-service";

export type SyncOperationType =
  | "INSERT_FOOD_LOG"
  | "DELETE_FOOD_LOG"
  | "INSERT_WATER_LOG"
  | "DELETE_WATER_LOG"
  | "INSERT_WEIGHT_LOG"
  | "INSERT_MEASUREMENT_LOG"
  | "SAVE_WORKOUT_SESSION"
  | "DELETE_WORKOUT_SESSION"
  | "UPSERT_ROUTINE"
  | "DELETE_ROUTINE"
  | "UPSERT_PROFILE"
  | "UPSERT_GOAL";

export interface SyncQueueItem {
  id: string;
  type: SyncOperationType;
  payload: any;
  createdAt: number;
  retryCount: number;
  lastAttemptAt?: number;
  error?: string;
}

export interface SyncQueueState {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
}

const STORAGE_QUEUE_KEY = "pft_offline_sync_queue_v1";

type Listener = (state: SyncQueueState) => void;

class OfflineSyncManager {
  private queue: SyncQueueItem[] = [];
  private isProcessing = false;
  private isOnline = true;
  private lastSyncedAt: Date | null = null;
  private listeners: Set<Listener> = new Set();
  private currentUser: any | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.isOnline = navigator.onLine;
      this.loadQueue();

      window.addEventListener("online", this.handleOnline);
      window.addEventListener("offline", this.handleOffline);

      // Periodic retry heartbeat every 20s if pending items exist
      setInterval(() => {
        if (this.queue.length > 0 && this.isOnline && this.currentUser && !this.isProcessing) {
          this.processQueue();
        }
      }, 20000);
    }
  }

  private handleOnline = () => {
    this.isOnline = true;
    this.notify();
    if (this.queue.length > 0 && this.currentUser) {
      this.processQueue();
    }
  };

  private handleOffline = () => {
    this.isOnline = false;
    this.notify();
  };

  private loadQueue() {
    try {
      const stored = localStorage.getItem(STORAGE_QUEUE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (e) {
      console.error("[SyncQueue] Failed to load offline queue:", e);
      this.queue = [];
    }
  }

  private saveQueue() {
    try {
      localStorage.setItem(STORAGE_QUEUE_KEY, JSON.stringify(this.queue));
    } catch (e) {
      console.error("[SyncQueue] Failed to persist offline queue:", e);
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((fn) => {
      try {
        fn(state);
      } catch (err) {
        console.error("[SyncQueue] Error notifying listener:", err);
      }
    });
  }

  public getState(): SyncQueueState {
    return {
      isOnline: this.isOnline,
      pendingCount: this.queue.length,
      isSyncing: this.isProcessing,
      lastSyncedAt: this.lastSyncedAt,
    };
  }

  public setUser(user: any | null) {
    this.currentUser = user;
    if (user && this.queue.length > 0 && this.isOnline && !this.isProcessing) {
      this.processQueue();
    }
  }

  /**
   * Enqueues a sync operation. If online and user is authenticated, immediately attempts processing.
   */
  public enqueue(type: SyncOperationType, payload: any) {
    const item: SyncQueueItem = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type,
      payload,
      createdAt: Date.now(),
      retryCount: 0,
    };

    // Optimization: if deleting an item that was inserted offline and not yet synced, prune both
    if (type === "DELETE_FOOD_LOG") {
      const existingInsertIdx = this.queue.findIndex(
        (q) => q.type === "INSERT_FOOD_LOG" && q.payload.id === payload.id
      );
      if (existingInsertIdx !== -1) {
        this.queue.splice(existingInsertIdx, 1);
        this.saveQueue();
        this.notify();
        return;
      }
    }

    if (type === "DELETE_WATER_LOG") {
      const existingInsertIdx = this.queue.findIndex(
        (q) => q.type === "INSERT_WATER_LOG" && q.payload.id === payload.id
      );
      if (existingInsertIdx !== -1) {
        this.queue.splice(existingInsertIdx, 1);
        this.saveQueue();
        this.notify();
        return;
      }
    }

    this.queue.push(item);
    this.saveQueue();
    this.notify();

    if (this.isOnline && this.currentUser && !this.isProcessing) {
      this.processQueue();
    }
  }

  /**
   * Processes the pending sync queue in FIFO order.
   */
  public async processQueue(): Promise<void> {
    if (this.isProcessing || !this.currentUser || this.queue.length === 0) {
      return;
    }

    if (!navigator.onLine) {
      this.isOnline = false;
      this.notify();
      return;
    }

    this.isProcessing = true;
    this.notify();

    try {
      while (this.queue.length > 0) {
        const item = this.queue[0];

        try {
          await this.executeOperation(item);
          // Success: remove head item
          this.queue.shift();
          this.saveQueue();
          this.lastSyncedAt = new Date();
          this.notify();
        } catch (error: any) {
          console.error(`[SyncQueue] Failed to execute ${item.type}:`, error);
          item.retryCount += 1;
          item.lastAttemptAt = Date.now();
          item.error = error?.message || "Unknown sync error";

          // If offline error or network abort, halt queue execution until reconnected
          if (!navigator.onLine || error?.message?.includes("Failed to fetch") || error?.name === "AbortError") {
            this.isOnline = false;
            this.saveQueue();
            break;
          }

          // If maximum retry threshold exceeded (e.g. invalid foreign key or corrupted payload)
          if (item.retryCount >= 8) {
            console.warn(`[SyncQueue] Max retries reached for ${item.type}. Dropping item:`, item);
            this.queue.shift();
            this.saveQueue();
          } else {
            // Push to back of queue to avoid blocking other operations
            const failed = this.queue.shift();
            if (failed) this.queue.push(failed);
            this.saveQueue();
            break;
          }
        }
      }
    } finally {
      this.isProcessing = false;
      this.notify();
    }
  }

  private async executeOperation(item: SyncQueueItem): Promise<void> {
    const { type, payload } = item;

    switch (type) {
      case "INSERT_FOOD_LOG":
        await insertFoodLog(payload);
        break;

      case "DELETE_FOOD_LOG":
        await deleteFoodLog(payload.id);
        break;

      case "INSERT_WATER_LOG":
        await insertWaterLog(payload);
        break;

      case "DELETE_WATER_LOG":
        await deleteWaterLog(payload.id);
        break;

      case "INSERT_WEIGHT_LOG":
        await insertWeightLog(payload);
        break;

      case "INSERT_MEASUREMENT_LOG":
        await insertMeasurementLog(payload);
        break;

      case "SAVE_WORKOUT_SESSION":
        await saveWorkoutSession(payload.session, payload.sets);
        break;

      case "DELETE_WORKOUT_SESSION":
        await deleteWorkoutSession(payload.id);
        break;

      case "UPSERT_ROUTINE":
        await upsertWorkoutRoutine(payload);
        break;

      case "DELETE_ROUTINE":
        await deleteWorkoutRoutine(payload.id);
        break;

      case "UPSERT_PROFILE":
        await upsertProfile(payload);
        break;

      case "UPSERT_GOAL":
        await upsertFitnessGoal(payload);
        break;

      default:
        console.warn(`[SyncQueue] Unrecognized operation type: ${type}`);
    }
  }

  public clearQueue() {
    this.queue = [];
    this.saveQueue();
    this.notify();
  }

  public getPendingItems(): SyncQueueItem[] {
    return [...this.queue];
  }
}

// Export singleton instance
export const syncQueue = new OfflineSyncManager();
