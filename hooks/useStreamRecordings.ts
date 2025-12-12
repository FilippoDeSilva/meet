import { useEffect, useState, useCallback, useRef } from 'react';
import { useStreamVideoClient } from '@stream-io/video-react-sdk';

export interface StreamRecording {
  filename: string;
  url: string;
  start_time: string;
  end_time?: string;
}

const MAX_RETRIES = 1;
const INITIAL_RETRY_DELAY = 1000;
const MAX_CONCURRENT_REQUESTS = 5;
const FETCH_TIMEOUT = 4000;

// Exponential backoff with jitter
const getBackoffDelay = (attempt: number): number => {
  const baseDelay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
  const jitter = Math.random() * 500;
  return baseDelay + jitter;
};

// Concurrent request queue
class RequestQueue {
  private running = 0;
  private queue: Array<() => Promise<any>> = [];
  private maxConcurrent: number;

  constructor(maxConcurrent: number) {
    this.maxConcurrent = maxConcurrent;
  }

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.process();
    });
  }

  private async process() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.running++;
    const fn = this.queue.shift();
    
    if (fn) {
      try {
        await fn();
      } finally {
        this.running--;
        this.process();
      }
    }
  }
}

export const useStreamRecordings = () => {
  const client = useStreamVideoClient();
  const [recordings, setRecordings] = useState<StreamRecording[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecordingsWithRetry = useCallback(
    async (retries = 0): Promise<StreamRecording[]> => {
      if (!client) return [];

      try {
        // Get all calls for the current user (increased limit to capture more calls)
        const { calls } = await client.queryCalls({
          filter_conditions: {
            ended_at: { $exists: true },
          },
          sort: [{ field: 'ended_at', direction: -1 }],
          limit: 100,
        });

        const allRecordings: StreamRecording[] = [];
        const queue = new RequestQueue(MAX_CONCURRENT_REQUESTS);

        // Process calls with concurrent requests to avoid timeout
        const recordingPromises = calls.map(call =>
          queue.add(async () => {
            try {
              let recordingsResponse = null;
              let callRetries = 0;

              // Retry fetching recordings for this specific call with exponential backoff
              while (callRetries < MAX_RETRIES) {
                try {
                  recordingsResponse = await call.queryRecordings();
                  if (recordingsResponse?.recordings && recordingsResponse.recordings.length > 0) {
                    return recordingsResponse.recordings;
                  } else {
                    return [];
                  }
                } catch (err: any) {
                  callRetries++;
                  
                  // Check if it's a rate limit error
                  const isRateLimitError = err?.status === 429 || err?.message?.includes('429');
                  
                  if (callRetries < MAX_RETRIES) {
                    const delay = isRateLimitError 
                      ? getBackoffDelay(callRetries) 
                      : INITIAL_RETRY_DELAY;
                    await new Promise(resolve => setTimeout(resolve, delay));
                  } else {
                    console.warn(`Failed to fetch recordings for call ${call.id} after ${MAX_RETRIES} retries`);
                    return [];
                  }
                }
              }
              return [];
            } catch (err) {
              console.error(`Error processing call ${call.id}:`, err);
              return [];
            }
          })
        );

        // Wait for all requests with timeout
        const results = await Promise.race([
          Promise.all(recordingPromises),
          new Promise<StreamRecording[][]>((_, reject) =>
            setTimeout(() => reject(new Error('Recording fetch timeout')), FETCH_TIMEOUT)
          ),
        ]);

        results.forEach(recordingArray => {
          allRecordings.push(...recordingArray);
        });

        return allRecordings;
      } catch (err) {
        if (retries < MAX_RETRIES) {
          const delay = getBackoffDelay(retries);
          console.warn(`Retrying recordings fetch (attempt ${retries + 1}/${MAX_RETRIES}) after ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchRecordingsWithRetry(retries + 1);
        }
        throw err;
      }
    },
    [client]
  );

  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedRecordings = await fetchRecordingsWithRetry();
        setRecordings(fetchedRecordings);
      } catch (err) {
        console.error('Error fetching recordings:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch recordings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecordings();
  }, [fetchRecordingsWithRetry]);

  const deleteRecording = useCallback(
    async (filename: string) => {
      try {
        // Remove from local state immediately for better UX
        setRecordings(prev => prev.filter(r => r.filename !== filename));
        
        // Note: Stream.io doesn't provide a delete API for recordings
        // Recordings are managed through their dashboard
        // This removes it from the UI only
        return true;
      } catch (err) {
        console.error('Error deleting recording:', err);
        // Refresh recordings on error
        const fetchedRecordings = await fetchRecordingsWithRetry();
        setRecordings(fetchedRecordings);
        throw err;
      }
    },
    [fetchRecordingsWithRetry]
  );

  const refreshRecordings = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetchedRecordings = await fetchRecordingsWithRetry();
      setRecordings(fetchedRecordings);
    } catch (err) {
      console.error('Error refreshing recordings:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh recordings');
    } finally {
      setIsLoading(false);
    }
  }, [fetchRecordingsWithRetry]);

  return {
    recordings,
    isLoading,
    error,
    deleteRecording,
    refreshRecordings,
  };
};
