/**
 * Shared composable for managing async operation state (error, pending)
 * Provides a consistent pattern across all data-fetching composables
 */
export const useAsyncError = () => {
  const error = ref<string | null>(null)
  const isPending = ref(false)

  const setError = (err: string | null, status: string | null = null) => {
    error.value = err
    return { error: err, status }
  }

  const setLoading = (loading: boolean) => {
    isPending.value = loading
  }

  const reset = () => {
    error.value = null
    isPending.value = false
  }

  return {
    error,
    isPending,
    setError,
    setLoading,
    reset
  }
}
