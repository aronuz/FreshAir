// import { useToast } from 'nuxt-ui';

export const useToastBar = () => {
  const toast = useToast()

  const icons = { success: 'check-circle', error: 'exclamation-circle', warn: 'exclamation-triangle' }
  const colors = { success: 'primary', error: 'error', warn: 'warning' }
  
  const toastBar = (type, title, message = '') => {
    const icon = icons[type]
    const color = colors[type]
    toast.add({ title, description: message ?? '', icon: `i-heroicons-${icon}`, color: color })
  }

  return { toastBar }
}
// export const useToastBar = (type: string, title: string, message: string = '') => {
//   const toast = useToast()

//   const icons = { success: 'check-circle', error: 'exclamation-circle' }
//   const colors = { success: 'green', error: 'red' }
  
//   const icon = icons[type as keyof { success: 'check-circle', error: 'exclamation-circle' }]
//   const color = colors[type as keyof { success: 'green', error: 'red' }]

//   return {
//     toastBar: () => {
//       toast.add({ title, description: message ?? '', icon: `i-heroicons-${icon}, ${color}` })
//     }
//   }
// }