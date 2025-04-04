export default defineNuxtRouteMiddleware((to, from) => {
    if (to.name === 'some-specific-route') {
      throw createError({ statusCode: 404, message: 'Page not found' });
    }
  });
  