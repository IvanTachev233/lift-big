import { useState, useCallback, useRef } from 'react';
import { AxiosResponse, AxiosError } from 'axios';

interface UseApiCallState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiCallOptions<T> {
  errorMessage?: string;
  onSuccess?: (data: T) => void;
  onError?: (error: AxiosError) => void;
}

interface UseApiCallReturn<T, Args extends unknown[]> extends UseApiCallState<T> {
  execute: (...args: Args) => Promise<T | null>;
  reset: () => void;
}

/**
 * A hook for making API calls with loading, error, and data state management.
 *
 * @param apiFunction - The async function that makes the API call
 * @param options - Configuration options
 * @returns Object with data, loading, error states and execute function
 *
 * @example
 * // Basic usage
 * const { data, loading, error, execute } = useApiCall(
 *   () => apiClient.get<User[]>('/users/')
 * );
 *
 * // With parameters
 * const { execute: deleteUser } = useApiCall(
 *   (id: number) => apiClient.delete(`/users/${id}/`)
 * );
 *
 * // With custom error message
 * const { data, loading, error, execute } = useApiCall(
 *   () => apiClient.get('/workouts/'),
 *   { errorMessage: 'Failed to load workouts' }
 * );
 */
export function useApiCall<T, Args extends unknown[] = []>(
  apiFunction: (...args: Args) => Promise<AxiosResponse<T>>,
  options: UseApiCallOptions<T> = {}
): UseApiCallReturn<T, Args> {
  const [state, setState] = useState<UseApiCallState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  // Use refs for callbacks to avoid dependency issues while keeping them up-to-date
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const execute = useCallback(
    async (...args: Args): Promise<T | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await apiFunction(...args);
        setState({ data: response.data, loading: false, error: null });
        optionsRef.current.onSuccess?.(response.data);
        return response.data;
      } catch (err) {
        const axiosError = err as AxiosError;
        const errorMessage = optionsRef.current.errorMessage || 'An error occurred';
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
        optionsRef.current.onError?.(axiosError);
        return null;
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

export default useApiCall;
