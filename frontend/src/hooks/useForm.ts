import { useState, useCallback, ChangeEvent, FormEvent } from 'react';

interface UseFormOptions<T> {
  initialValues: T;
  onSubmit: (values: T) => Promise<void>;
  validate?: (values: T) => Partial<Record<keyof T, string>> | null;
}

interface UseFormReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  loading: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  setFieldValue: (field: keyof T, value: T[keyof T]) => void;
  setFieldError: (field: keyof T, error: string) => void;
  setErrors: (errors: Partial<Record<keyof T, string>>) => void;
  resetForm: () => void;
  setGeneralError: (error: string | null) => void;
  generalError: string | null;
}

/**
 * A hook for managing form state, validation, and submission.
 *
 * @example
 * const { values, errors, loading, handleChange, handleSubmit } = useForm({
 *   initialValues: { username: '', password: '' },
 *   onSubmit: async (values) => {
 *     await login(values.username, values.password);
 *   },
 *   validate: (values) => {
 *     if (!values.username) return { username: 'Username is required' };
 *     return null;
 *   }
 * });
 */
export function useForm<T extends Record<string, unknown>>({
  initialValues,
  onSubmit,
  validate,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setValues((prev) => ({ ...prev, [name]: value }));
      // Clear field error when user starts typing
      if (errors[name as keyof T]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name as keyof T];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const setFieldValue = useCallback((field: keyof T, value: T[keyof T]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setGeneralError(null);
    setLoading(false);
  }, [initialValues]);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setGeneralError(null);
      setErrors({});

      // Run validation if provided
      if (validate) {
        const validationErrors = validate(values);
        if (validationErrors) {
          setErrors(validationErrors);
          return;
        }
      }

      setLoading(true);
      try {
        await onSubmit(values);
      } catch (err) {
        // Error handling is delegated to onSubmit
        // The caller can use setGeneralError or setErrors as needed
      } finally {
        setLoading(false);
      }
    },
    [values, onSubmit, validate]
  );

  return {
    values,
    errors,
    loading,
    handleChange,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setErrors,
    resetForm,
    setGeneralError,
    generalError,
  };
}

export default useForm;
