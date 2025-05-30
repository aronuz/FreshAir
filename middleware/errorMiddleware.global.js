export default defineNuxtRouteMiddleware((to, from) => {
  const availableRoutes = [
    "index", // List your defined routes here
    "about",
    "booking",
    "contact",
    "gallery",
    "login",
    "registration"
  ]

  if (!availableRoutes.includes(to.name)) {
    throw createError({ statusCode: 404, message: `${to.name} Page not found` });
  }
})
