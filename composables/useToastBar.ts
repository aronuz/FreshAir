import { useToast } from "@nuxt/ui/dist/runtime/composables/useToast"

export const useToastBar = (type: string, title: string, message: string = '') => {
  const toast = useToast()

  const icons = { success: 'check-circle', error: 'exclamation-circle' }
  const colors = { success: 'green', error: 'red' }
  
  const icon = icons[type as keyof { success: 'check-circle', error: 'exclamation-circle' }]
  const color = colors[type as keyof { success: 'green', error: 'red' }]

  return {
    toastBar: () => {
      toast.add({ title, description: message ?? '', icon: `i-heroicons-${icon}, ${color}` })
    }
  }
}
