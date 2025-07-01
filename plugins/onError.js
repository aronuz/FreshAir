export default defineNuxtPlugin((nuxtApp) => {
    
    const { toastBar } = useToastBar()
    const onError = (status, message = 'An unknown error has occured.') => {
    toastBar('error', `Error ${status}`, message)
    throw createError({ statusCode: status, message: message});
    }

  nuxtApp.provide('onError', onError);
});