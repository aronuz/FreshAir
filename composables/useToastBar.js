export const useToastBar = (type, title, message = null) => {
  const toast = useToast()

  const icons = { success: 'check-circle', error: 'exclamation-circle' }
  const colors = { success: 'green', error: 'red' }
  
  return {
    toastBar: () => {
      toast.add({ title, message, icon: `i-heroicons-${icons[type], colors[type]}` })
    }
  }
}
