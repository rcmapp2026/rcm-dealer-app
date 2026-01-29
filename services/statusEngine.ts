import { walletService } from './walletService';
import { TransactionStatus } from '../types';

export interface StatusPollingConfig {
  interval: number; // Polling interval in milliseconds
  maxAttempts: number; // Maximum polling attempts
  timeout: number; // Total timeout in milliseconds
}

export interface StatusCallback {
  onStatusChange: (status: TransactionStatus) => void;
  onSuccess?: (status: TransactionStatus) => void;
  onFailed?: (status: TransactionStatus) => void;
  onTimeout?: () => void;
  onError?: (error: Error) => void;
}

class StatusEngine {
  private static instance: StatusEngine;
  private activePolling: Map<string, {
    intervalId: NodeJS.Timeout;
    attempts: number;
    startTime: number;
    config: StatusPollingConfig;
    callback: StatusCallback;
  }> = new Map();

  static getInstance(): StatusEngine {
    if (!StatusEngine.instance) {
      StatusEngine.instance = new StatusEngine();
    }
    return StatusEngine.instance;
  }

  /**
   * Start polling for transaction status
   */
  startPolling(
    transactionId: string,
    config: Partial<StatusPollingConfig> = {},
    callback: StatusCallback
  ): void {
    const defaultConfig: StatusPollingConfig = {
      interval: 5000, // 5 seconds
      maxAttempts: 360, // 30 minutes max
      timeout: 30 * 60 * 1000 // 30 minutes
    };

    const finalConfig = { ...defaultConfig, ...config };

    // Stop any existing polling for this transaction
    this.stopPolling(transactionId);

    const pollingData = {
      intervalId: setInterval(() => this.pollStatus(transactionId, callback), finalConfig.interval),
      attempts: 0,
      startTime: Date.now(),
      config: finalConfig,
      callback
    };

    this.activePolling.set(transactionId, pollingData);

    // Initial poll
    this.pollStatus(transactionId, callback);
  }

  /**
   * Stop polling for a transaction
   */
  stopPolling(transactionId: string): void {
    const pollingData = this.activePolling.get(transactionId);
    if (pollingData) {
      clearInterval(pollingData.intervalId);
      this.activePolling.delete(transactionId);
    }
  }

  /**
   * Stop all active polling
   */
  stopAllPolling(): void {
    for (const [transactionId] of this.activePolling) {
      this.stopPolling(transactionId);
    }
  }

  /**
   * Poll status for a single transaction
   */
  private async pollStatus(transactionId: string, callback: StatusCallback): Promise<void> {
    const pollingData = this.activePolling.get(transactionId);
    if (!pollingData) return;

    const { attempts, startTime, config } = pollingData;
    const currentTime = Date.now();
    const elapsedTime = currentTime - startTime;

    // Check timeout
    if (elapsedTime > config.timeout) {
      this.stopPolling(transactionId);
      if (callback.onTimeout) {
        callback.onTimeout();
      }
      return;
    }

    // Check max attempts
    if (attempts >= config.maxAttempts) {
      this.stopPolling(transactionId);
      if (callback.onTimeout) {
        callback.onTimeout();
      }
      return;
    }

    try {
      const status = await walletService.getTransactionStatus(transactionId);
      
      if (status) {
        pollingData.attempts++;
        
        // Always call onStatusChange
        callback.onStatusChange(status);

        // Check if we should stop polling
        if (status.status === 'SUCCESS') {
          this.stopPolling(transactionId);
          if (callback.onSuccess) {
            callback.onSuccess(status);
          }
        } else if (status.status === 'FAILED') {
          this.stopPolling(transactionId);
          if (callback.onFailed) {
            callback.onFailed(status);
          }
        }
      }
    } catch (error) {
      console.error('Error polling status:', error);
      pollingData.attempts++;
      
      if (callback.onError) {
        callback.onError(error as Error);
      }
    }
  }

  /**
   * Get active polling transactions
   */
  getActivePolling(): string[] {
    return Array.from(this.activePolling.keys());
  }

  /**
   * Check if a transaction is being polled
   */
  isPolling(transactionId: string): boolean {
    return this.activePolling.has(transactionId);
  }

  /**
   * Get polling status for a transaction
   */
  getPollingStatus(transactionId: string): {
    isPolling: boolean;
    attempts: number;
    elapsedTime: number;
    remainingTime: number;
  } | null {
    const pollingData = this.activePolling.get(transactionId);
    if (!pollingData) return null;

    const currentTime = Date.now();
    const elapsedTime = currentTime - pollingData.startTime;
    const remainingTime = Math.max(0, pollingData.config.timeout - elapsedTime);

    return {
      isPolling: true,
      attempts: pollingData.attempts,
      elapsedTime,
      remainingTime
    };
  }

  /**
   * Handle app background/foreground events
   */
  handleAppBackground(): void {
    // Pause polling when app goes to background
    for (const [transactionId, pollingData] of this.activePolling) {
      clearInterval(pollingData.intervalId);
    }
  }

  handleAppForeground(): void {
    // Resume polling when app comes to foreground
    for (const [transactionId, pollingData] of this.activePolling) {
      pollingData.intervalId = setInterval(
        () => this.pollStatus(transactionId, pollingData.callback),
        pollingData.config.interval
      );
    }
  }

  /**
   * Clean up old polling data
   */
  cleanup(): void {
    this.stopAllPolling();
    this.activePolling.clear();
  }
}

// Export singleton instance
export const statusEngine = StatusEngine.getInstance();

// App lifecycle management
if (typeof document !== 'undefined') {
  // Browser environment
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      statusEngine.handleAppBackground();
    } else {
      statusEngine.handleAppForeground();
    }
  });

  window.addEventListener('beforeunload', () => {
    statusEngine.cleanup();
  });
}

// React Hook for status polling
import { useEffect, useState, useCallback } from 'react';

export function useStatusPolling(
  transactionId: string | null,
  config: Partial<StatusPollingConfig> = {}
) {
  const [status, setStatus] = useState<TransactionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const startPolling = useCallback((tid: string, callback?: StatusCallback) => {
    setIsLoading(true);
    setError(null);

    const fullCallback: StatusCallback = {
      onStatusChange: (newStatus) => {
        setStatus(newStatus);
        callback?.onStatusChange?.(newStatus);
      },
      onSuccess: (newStatus) => {
        setIsLoading(false);
        callback?.onSuccess?.(newStatus);
      },
      onFailed: (newStatus) => {
        setIsLoading(false);
        callback?.onFailed?.(newStatus);
      },
      onTimeout: () => {
        setIsLoading(false);
        setError(new Error('Status check timed out'));
        callback?.onTimeout?.();
      },
      onError: (err) => {
        setError(err);
        callback?.onError?.(err);
      },
      ...callback
    };

    statusEngine.startPolling(tid, config, fullCallback);
  }, [config]);

  const stopPolling = useCallback((tid: string) => {
    statusEngine.stopPolling(tid);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (transactionId) {
      startPolling(transactionId);
    }

    return () => {
      if (transactionId) {
        stopPolling(transactionId);
      }
    };
  }, [transactionId, startPolling, stopPolling]);

  return {
    status,
    isLoading,
    error,
    startPolling,
    stopPolling,
    isPolling: transactionId ? statusEngine.isPolling(transactionId) : false,
  };
}
