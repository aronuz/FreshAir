export const ROUTE_CONFIG = [
  {name: "Home", path: "index"},
  {name: "About", path: "about"},
  {name: "Schedule", path: "booking"},
  {name: "Contact", path: "contact"},
  {name: "Services", path: "gallery"},
  {name: "Login", path: "loginLink"},
  {name: "Registration", path: "registration"},
  {name: "Site", path: "admin"},
  {name: "Construction", path: "construction"}
] as const

export const PAGES_CONFIG = [
  { name: 'Home', to: "/index", allowed: true, oldPath: null }, 
  { name: 'Services', to: '/gallery', allowed: true, oldPath: null }, 
  { name: 'Schedule Service', to: '/booking', allowed: true, oldPath: null }, 
  { name: 'Contact Us', to: '/contact', allowed: true, oldPath: null }, 
  { name: 'About Us', to: '/about', allowed: true, oldPath: null },
  { name: 'Site Settings', to: '/admin' }
]