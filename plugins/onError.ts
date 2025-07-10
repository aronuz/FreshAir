export default defineNuxtPlugin((nuxtApp) => {
    
    const { toastBar } = useToastBar()
    const onError = (status: number | string | null, message = 'An unknown error has occured.'): void => {
      toastBar('error', `Error ${status}`, message)

      const errorObject = { message: message }
      if(typeof status === 'number') {
        Object.assign(errorObject, { statusCode: status })
      } else {
        Object.assign(errorObject, { statusText: status })
      }

      throw createError(errorObject);
    }

  nuxtApp.provide('onError', onError);
});