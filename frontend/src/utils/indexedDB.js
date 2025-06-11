/**
 * IndexedDB utilities for offline data persistence
 * DentalERP - Offline data management
 */

const DB_NAME = 'DentalERP';
const DB_VERSION = 1;

// Object stores configuration
const STORES = {
  PATIENTS: 'patients',
  APPOINTMENTS: 'appointments',
  TREATMENTS: 'treatments',
  FORMS: 'offline_forms',
  CACHE: 'cache_metadata',
  SYNC_QUEUE: 'sync_queue'
};

/**
 * IndexedDB Manager Class
 */
export class IndexedDBManager {
  constructor() {
    this.db = null;
    this.isInitialized = false;
  }

  /**
   * Initialize IndexedDB
   */
  async init() {
    if (this.isInitialized) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('❌ IndexedDB failed to open:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        console.log('✅ IndexedDB initialized successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        console.log('🔄 IndexedDB upgrading...');

        // Create object stores
        this.createObjectStores(db);
      };
    });
  }

  /**
   * Create object stores
   */
  createObjectStores(db) {
    // Patients store
    if (!db.objectStoreNames.contains(STORES.PATIENTS)) {
      const patientsStore = db.createObjectStore(STORES.PATIENTS, { keyPath: 'id' });
      patientsStore.createIndex('name', 'name', { unique: false });
      patientsStore.createIndex('email', 'email', { unique: false });
      patientsStore.createIndex('lastModified', 'lastModified', { unique: false });
    }

    // Appointments store
    if (!db.objectStoreNames.contains(STORES.APPOINTMENTS)) {
      const appointmentsStore = db.createObjectStore(STORES.APPOINTMENTS, { keyPath: 'id' });
      appointmentsStore.createIndex('patientId', 'patientId', { unique: false });
      appointmentsStore.createIndex('date', 'date', { unique: false });
      appointmentsStore.createIndex('status', 'status', { unique: false });
    }

    // Treatments store
    if (!db.objectStoreNames.contains(STORES.TREATMENTS)) {
      const treatmentsStore = db.createObjectStore(STORES.TREATMENTS, { keyPath: 'id' });
      treatmentsStore.createIndex('patientId', 'patientId', { unique: false });
      treatmentsStore.createIndex('type', 'type', { unique: false });
    }

    // Offline forms store
    if (!db.objectStoreNames.contains(STORES.FORMS)) {
      const formsStore = db.createObjectStore(STORES.FORMS, { keyPath: 'id', autoIncrement: true });
      formsStore.createIndex('type', 'type', { unique: false });
      formsStore.createIndex('timestamp', 'timestamp', { unique: false });
      formsStore.createIndex('synced', 'synced', { unique: false });
    }

    // Cache metadata store
    if (!db.objectStoreNames.contains(STORES.CACHE)) {
      const cacheStore = db.createObjectStore(STORES.CACHE, { keyPath: 'url' });
      cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
      cacheStore.createIndex('expires', 'expires', { unique: false });
    }

    // Sync queue store
    if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
      const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id', autoIncrement: true });
      syncStore.createIndex('priority', 'priority', { unique: false });
      syncStore.createIndex('timestamp', 'timestamp', { unique: false });
      syncStore.createIndex('retries', 'retries', { unique: false });
    }
  }

  /**
   * Generic method to perform transactions
   */
  async performTransaction(storeName, mode, operation) {
    if (!this.isInitialized) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], mode);
      const store = transaction.objectStore(storeName);

      transaction.oncomplete = () => {
        resolve();
      };

      transaction.onerror = () => {
        console.error(`❌ Transaction failed for ${storeName}:`, transaction.error);
        reject(transaction.error);
      };

      try {
        const result = operation(store);
        if (result && result.onsuccess) {
          result.onsuccess = (event) => {
            resolve(event.target.result);
          };
          result.onerror = () => {
            reject(result.error);
          };
        } else {
          resolve(result);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Save data to store
   */
  async save(storeName, data) {
    const dataWithTimestamp = {
      ...data,
      lastModified: new Date().toISOString()
    };

    return this.performTransaction(storeName, 'readwrite', (store) => {
      return store.put(dataWithTimestamp);
    });
  }

  /**
   * Get data by key
   */
  async get(storeName, key) {
    return this.performTransaction(storeName, 'readonly', (store) => {
      return store.get(key);
    });
  }

  /**
   * Get all data from store
   */
  async getAll(storeName, indexName = null, query = null) {
    return this.performTransaction(storeName, 'readonly', (store) => {
      if (indexName) {
        const index = store.index(indexName);
        return query ? index.getAll(query) : index.getAll();
      }
      return store.getAll();
    });
  }

  /**
   * Delete data by key
   */
  async delete(storeName, key) {
    return this.performTransaction(storeName, 'readwrite', (store) => {
      return store.delete(key);
    });
  }

  /**
   * Clear entire store
   */
  async clear(storeName) {
    return this.performTransaction(storeName, 'readwrite', (store) => {
      return store.clear();
    });
  }

  /**
   * Count items in store
   */
  async count(storeName, indexName = null, query = null) {
    return this.performTransaction(storeName, 'readonly', (store) => {
      if (indexName) {
        const index = store.index(indexName);
        return query ? index.count(query) : index.count();
      }
      return store.count();
    });
  }

  /**
   * Search with filters
   */
  async search(storeName, indexName, range, limit = null) {
    return this.performTransaction(storeName, 'readonly', (store) => {
      const index = store.index(indexName);
      const results = [];
      let count = 0;

      return new Promise((resolve) => {
        const cursor = index.openCursor(range);
        cursor.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor && (!limit || count < limit)) {
            results.push(cursor.value);
            count++;
            cursor.continue();
          } else {
            resolve(results);
          }
        };
      });
    });
  }
}

/**
 * Offline Form Manager
 */
export class OfflineFormManager extends IndexedDBManager {
  /**
   * Save form data for offline submission
   */
  async saveOfflineForm(formType, formData) {
    const offlineForm = {
      type: formType,
      data: formData,
      timestamp: new Date().toISOString(),
      synced: false,
      retries: 0
    };

    await this.save(STORES.FORMS, offlineForm);
    console.log('💾 Form saved for offline submission:', formType);
    
    return offlineForm;
  }

  /**
   * Get pending offline forms
   */
  async getPendingForms() {
    return this.getAll(STORES.FORMS, 'synced', false);
  }

  /**
   * Mark form as synced
   */
  async markFormSynced(formId) {
    const form = await this.get(STORES.FORMS, formId);
    if (form) {
      form.synced = true;
      form.syncedAt = new Date().toISOString();
      await this.save(STORES.FORMS, form);
    }
  }

  /**
   * Retry failed form submission
   */
  async retryForm(formId) {
    const form = await this.get(STORES.FORMS, formId);
    if (form) {
      form.retries = (form.retries || 0) + 1;
      form.lastRetry = new Date().toISOString();
      await this.save(STORES.FORMS, form);
    }
  }

  /**
   * Clean up old synced forms
   */
  async cleanupSyncedForms(olderThanDays = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    
    const syncedForms = await this.getAll(STORES.FORMS, 'synced', true);
    
    for (const form of syncedForms) {
      const syncDate = new Date(form.syncedAt);
      if (syncDate < cutoffDate) {
        await this.delete(STORES.FORMS, form.id);
      }
    }
  }
}

/**
 * Sync Queue Manager
 */
export class SyncQueueManager extends IndexedDBManager {
  /**
   * Add item to sync queue
   */
  async addToQueue(type, data, priority = 'normal') {
    const queueItem = {
      type,
      data,
      priority,
      timestamp: new Date().toISOString(),
      retries: 0,
      status: 'pending'
    };

    await this.save(STORES.SYNC_QUEUE, queueItem);
    console.log('📋 Item added to sync queue:', type);
    
    return queueItem;
  }

  /**
   * Get pending sync items
   */
  async getPendingItems() {
    return this.search(STORES.SYNC_QUEUE, 'priority', null);
  }

  /**
   * Mark item as synced
   */
  async markSynced(itemId) {
    const item = await this.get(STORES.SYNC_QUEUE, itemId);
    if (item) {
      item.status = 'synced';
      item.syncedAt = new Date().toISOString();
      await this.save(STORES.SYNC_QUEUE, item);
    }
  }

  /**
   * Mark item as failed
   */
  async markFailed(itemId, error) {
    const item = await this.get(STORES.SYNC_QUEUE, itemId);
    if (item) {
      item.status = 'failed';
      item.error = error;
      item.retries = (item.retries || 0) + 1;
      item.lastRetry = new Date().toISOString();
      await this.save(STORES.SYNC_QUEUE, item);
    }
  }
}

/**
 * Cache Manager
 */
export class CacheManager extends IndexedDBManager {
  /**
   * Cache API response
   */
  async cacheResponse(url, data, ttl = 3600000) { // 1 hour default
    const cacheItem = {
      url,
      data,
      timestamp: new Date().toISOString(),
      expires: new Date(Date.now() + ttl).toISOString()
    };

    await this.save(STORES.CACHE, cacheItem);
  }

  /**
   * Get cached response
   */
  async getCachedResponse(url) {
    const cacheItem = await this.get(STORES.CACHE, url);
    
    if (!cacheItem) return null;
    
    // Check if expired
    const now = new Date();
    const expires = new Date(cacheItem.expires);
    
    if (now > expires) {
      await this.delete(STORES.CACHE, url);
      return null;
    }
    
    return cacheItem.data;
  }

  /**
   * Clear expired cache
   */
  async clearExpiredCache() {
    const allCache = await this.getAll(STORES.CACHE);
    const now = new Date();
    
    for (const item of allCache) {
      const expires = new Date(item.expires);
      if (now > expires) {
        await this.delete(STORES.CACHE, item.url);
      }
    }
  }
}

// Create singleton instances
export const offlineFormManager = new OfflineFormManager();
export const syncQueueManager = new SyncQueueManager();
export const cacheManager = new CacheManager();

// Initialize all managers
export const initializeOfflineStorage = async () => {
  try {
    await Promise.all([
      offlineFormManager.init(),
      syncQueueManager.init(),
      cacheManager.init()
    ]);
    
    console.log('✅ All offline storage managers initialized');
    
    // Clean up old data periodically
    setInterval(() => {
      offlineFormManager.cleanupSyncedForms();
      cacheManager.clearExpiredCache();
    }, 24 * 60 * 60 * 1000); // Daily cleanup
    
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize offline storage:', error);
    return false;
  }
};

/**
 * Background sync utilities
 */
export const BackgroundSync = {
  /**
   * Register background sync
   */
  async register(tag = 'background-sync') {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register(tag);
      console.log('📡 Background sync registered:', tag);
    }
  },

  /**
   * Sync pending forms
   */
  async syncPendingForms() {
    const pendingForms = await offlineFormManager.getPendingForms();
    
    for (const form of pendingForms) {
      try {
        // Simulate API call
        console.log('🔄 Syncing form:', form.type);
        
        // In a real app, you would make the actual API call here
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await offlineFormManager.markFormSynced(form.id);
        console.log('✅ Form synced successfully:', form.id);
      } catch (error) {
        console.error('❌ Failed to sync form:', form.id, error);
        await offlineFormManager.retryForm(form.id);
      }
    }
  },

  /**
   * Sync queue items
   */
  async syncQueueItems() {
    const pendingItems = await syncQueueManager.getPendingItems();
    
    for (const item of pendingItems) {
      try {
        console.log('🔄 Syncing queue item:', item.type);
        
        // Simulate API sync
        await new Promise(resolve => setTimeout(resolve, 500));
        
        await syncQueueManager.markSynced(item.id);
        console.log('✅ Queue item synced:', item.id);
      } catch (error) {
        console.error('❌ Failed to sync queue item:', item.id, error);
        await syncQueueManager.markFailed(item.id, error.message);
      }
    }
  }
};

export default IndexedDBManager;
