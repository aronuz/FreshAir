import { ROUTE_CONFIG } from '~/config/routes'

import type { NavigationGuardReturn, RouteLocationNormalized } from 'vue-router'

interface RouteAccess {
  path: string
  allowed: boolean
  name: string
}

interface RouteLocation {
  [key: string]: any
}

let routeAccessMapCache: Map<string, RouteAccess> | null = null
let cacheTimestamp: number | null = null
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

const isCacheValid = () => {
  return routeAccessMapCache && 
         cacheTimestamp && 
         (Date.now() - cacheTimestamp) < CACHE_TTL
}

const normalizePageName = (name: string): string => {
  return name.includes(' ') ? name.slice(0, name.indexOf(' ')) : name
}

const buildRouteAccessMap = (pageData: any[], routeConfig: typeof ROUTE_CONFIG) => {
  const accessMap = new Map()
  
  for (const route of routeConfig) {
    const pageAccess = pageData.find(page => {
      const pageName = normalizePageName(page.name)
      return pageName === route.name
    })
    
    if (pageAccess) {
      accessMap.set(route.path, {
        path: pageAccess.to,
        allowed: pageAccess.allowed,
        name: route.name
      })
    }
  }
  
  return accessMap
}

const handleRouteAccess = async (
  to: RouteLocation, 
  from: RouteLocation | undefined, 
  routeAccess: RouteAccess | undefined
): Promise<NavigationGuardReturn> => {
  if (!routeAccess) {
    // Handle route not found in configuration
    throw createError({ 
      statusCode: 404,
      statusMessage: `Page '${to.path?.slice(1) as string}' not found`,
      data: {
        pageName: to.path?.slice(1) || 'Unknown',           // Used by getPageName()
        requestedPath: to.path,                   // Used by getRequestedPath()  
        errorType: 'page_not_found'              // Used by getErrorType()
      }
    })
  } else if (!routeAccess.allowed || (!from && to.name === 'construction')) {
    // Handle blocked routes
    throw createError({ 
      statusCode: 403, 
      statusMessage: `Page '${routeAccess.name}' is currently unavailable`,
      data: {
        pageName: routeAccess.name,              // Used by getPageName()
        requestedPath: to.path,                  // Used by getRequestedPath()
        targetPath: routeAccess.path,            // Used by getTargetPath() 
        errorType: 'page_unavailable'           // Used by getErrorType() and isTemporaryUnavailable()
      }
    })
  } else if (routeAccess.path !== to.path) {
    // Only navigate if the target path is different from current route
    console.log(`Redirecting from ${to.path} to ${routeAccess.path}`)
    return await navigateTo(routeAccess.path)
  }
}

export default defineNuxtRouteMiddleware(async (to: RouteLocationNormalized, from: RouteLocationNormalized | undefined): Promise<import('vue-router').NavigationGuardReturn> => {

  // Return cached version if still valid
  if (isCacheValid()) {
    const routeAccess: RouteAccess | undefined = (routeAccessMapCache as Map<string, RouteAccess>).get(to.name as string)
    // Handle route logic with cached data...
    return handleRouteAccess(to, from, routeAccess)
  }

  const { getPageAccess } = useFetchQueries()

    try {
    const { data: pageAccessData, error } = await getPageAccess()
    
    if (error || !pageAccessData) {
      throw createError({ 
        statusCode: 500, 
        statusMessage: 'Failed to load page configuration',
        data: {
          pageName: to.name || 'Unknown',
          requestedPath: to.path,
          errorType: 'server_error'
        } 
      })
    }

    // Rebuild cache
    routeAccessMapCache = buildRouteAccessMap(pageAccessData, ROUTE_CONFIG)
    cacheTimestamp = Date.now()

    const toName = to.name as string
    const routeAccess = routeAccessMapCache.get(toName)
    return handleRouteAccess(to, from, routeAccess)

  } catch (err) {
    if (typeof err === 'object' && err !== null && 'statusCode' in err) throw err
    
    console.error('Middleware error:', err)
    throw createError({ 
      statusCode: 500, 
      statusMessage: 'Internal server error',
      data: {
        pageName: to.name || 'Unknown',
        requestedPath: to.path,
        errorType: 'server_error'
      }
    })
  }
})

  // try {
  //   const { data: routeAccessMap } = await useLazyAsyncData(
  //     'route-access-map', async () => {
  //       // Fetch page access data
  //       const { data, error } = await getPageAccess()
  //       if (error || !data) {
  //         throw createError({ 
  //           statusCode: 500, 
  //           statusMessage: 'Failed to load page access configuration' 
  //         })
  //       }
  //       // Build route access map
  //       return {data: buildRouteAccessMap(data, ROUTE_CONFIG)}
  //     },
  //     { 
  //       default: () => new Map(),
  //       maxAge: 1000 * 60 * 5 // Cache for 5 minutes
  //     }
  //   )
  //   const toName = to.name as string
  //   const routeAccess = (routeAccessMap.value as Map<string, string>).get(toName)

  //   if (!routeAccess) {
  //     // Handle route not found in configuration
  //     throw createError({ 
  //       statusCode: 404, 
  //       statusMessage: `Page '${toName as string}' not found` 
  //     })
  //   } else if (!routeAccess.allowed || (!from && toName === 'construction')) {
  //     // Handle blocked routes
  //     throw createError({ 
  //       statusCode: 403, 
  //       statusMessage: `Page '${routeAccess.name}' is currently unavailable` 
  //     })
  //   } else if (routeAccess.path !== to.path) {
  //     // Only navigate if the target path is different from current route
  //     console.log(`Redirecting from ${to.path} to ${routeAccess.path}`)
  //     return navigateTo(routeAccess.path)
  //   }
  // } catch (err) {
  //   if (typeof err === 'object' && err !== null && 'statusCode' in err) {
  //     throw err
  //   }
    
  //   // Handle unexpected errors
  //   console.error('Middleware error:', err)
  //   throw createError({ 
  //     statusCode: 500, 
  //     statusMessage: 'Internal server error' 
  //   })
  // }
// })

//   let availableRoutes = []
//   allRoutes.forEach((route) => {
//     const page = data.find(({ name }) => {
//       const pageName = name.includes(' ') ? name.slice(0, name.indexOf(' ')) : name
//       console.log(pageName, name, name.includes(' '))
//       return pageName === route.name
//     })
//     if (page) {
//       availableRoutes.push({ route: route.path, path: page.to, allowed: page.allowed })
//     }
//   })

//   console.log('to Route:', availableRoutes)
//   // If route is not available, throw an error
//   const isRouteAvailable = availableRoutes.find(({ route }) => route === to.name)
//   if (!isRouteAvailable) {
//     throw createError({ statusCode: 404, message: `${to.name} Page not found` });
//   } else if (!isRouteAvailable.allowed) {
//     throw createError({ statusCode: 403, message: `${to.name} is currently unavailable` });
//   } else {
//     console.log('Navigating to:', isRouteAvailable.path)
//     return await navigateTo(isRouteAvailable.path)
//   }
// })

  // // If current route is blocked, throw error
  // if (data && data.some(page => {
  //     console.log(page.to, to.name)
  //     // const path = page.to === '/index' ? '/' : page.to
  //     return page.to === to.name && page.allowed === false
  //   })) {
  //   throw createError({ statusCode: 403, message: `${to.name} is currently unavailable` })
  // }
