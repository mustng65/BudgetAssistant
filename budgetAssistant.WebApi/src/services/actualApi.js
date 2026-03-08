/**
 * Cherry picked from: https://github.com/ZoneMix/actual-budget-rest-api/blob/main/src/services/actualApi.js
 */

import logger from '../logging/logger.js';

export const DATA_DIR = 'dataCache'

let api = null;

/**
 * Initialize the Actual API client (idempotent).
 */
export const initActualApi = async () => {
  if (api) return api;

  const { default: actualApi } = await import('@actual-app/api');
  api = actualApi;

  logger.info('Initializing Actual Budget API client...');
  try {
    await api.init({
      dataDir: DATA_DIR,
      serverURL: process.env.ACTUAL_SERVER_URL,
      password: process.env.ACTUAL_PASSWORD,
    });

    logger.info('Downloading budget...', { syncId: process.env.ACTUAL_SYNC_ID });
    await api.downloadBudget(process.env.ACTUAL_SYNC_ID);
    logger.info('Actual API initialized and budget downloaded.');
  } catch (error) {
    logger.error('Failed to initialize Actual API', { 
      error: error.message,
      stack: error.stack 
    });
    api = null; // Reset on failure so retry can happen
    throw error;
  }

  return api;
};

/**
 * Get the initialized API instance.
 */
export const getActualApi = async () => {
  if (!api) await initActualApi();
  return api;
};

/**
 * Graceful shutdown.
 */
export const shutdownActualApi = async () => {
  if (api) {
    await api.shutdown();
    logger.info('Actual API shutdown complete.');
    api = null;
  }
};

const runWithApi = async (label, fn, { syncBefore = true, syncAfter = false } = {}) => {
  const instance = await getActualApi();
  const started = Date.now();

  // Sync before operation if requested
  if (syncBefore) {
    try {
      await instance.sync();
    } catch (error) {
      logger.error('[Actual] Sync failed before operation', { 
        label, 
        error: error.message,
        stack: error.stack 
      });
      
      // If sync fails with getPrefs null error, the budget might not be loaded
      // Try to re-download the budget and retry once
      if (error.message?.includes('getPrefs') || error.message?.includes('Cannot destructure')) {
        logger.warn('[Actual] Budget may not be loaded, attempting to re-download...');
        try {
          await instance.downloadBudget(process.env.ACTUAL_SYNC_ID);
          await instance.sync(); // Retry sync after re-download
          logger.info('[Actual] Budget re-downloaded and synced successfully');
        } catch (retryError) {
          logger.error('[Actual] Retry failed after re-download', { 
            error: retryError.message 
          });
          throw new Error(`Budget synchronization failed. The budget may not be properly initialized. Please verify ACTUAL_SYNC_ID (${process.env.ACTUAL_SYNC_ID}) is correct and the Actual Budget server is accessible. Original error: ${error.message}`);
        }
      } else {
        throw new Error(`Failed to sync with Actual Budget server: ${error.message}. Ensure the budget is properly initialized and ACTUAL_SYNC_ID is correct.`);
      }
    }
  }

  const result = await fn(instance);

  // Sync after operation if requested
  if (syncAfter) {
    try {
      await instance.sync();
    } catch (error) {
      logger.error('[Actual] Sync failed after operation', { 
        label, 
        error: error.message,
        stack: error.stack 
      });
      // Don't fail the operation if post-sync fails, but log it
      // The operation itself succeeded, so we don't want to lose that
    }
  }

  const duration = Date.now() - started;
  logger.info('[Actual] operation completed', { label, durationMs: duration });
  return result;
};


// ================ BUDGETS ================
export const budgetMonthsList = async () => {
  return runWithApi('budgetMonthsList', async (apiInstance) => {
    logger.debug('[Actual] Getting budget months list');
    const months = await apiInstance.getBudgetMonths();
    logger.info('[Actual] budgetMonthsList result', { count: months.length });
    return months;
  });
};

export const budgetMonthGet = async (month) => {
  return runWithApi('budgetMonthGet', async (apiInstance) => {
    logger.debug('[Actual] Getting budget month', { month });
    const budgetMonth = await apiInstance.getBudgetMonth(month);
    logger.info('[Actual] budgetMonthGet result', { month, toBudget: budgetMonth.toBudget });
    return budgetMonth;
  });
};