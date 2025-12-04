import { PAGES_CONFIG } from '~/config/routes'

export const useScrollingNavigation = () => {
  const router = useRouter()
  const route = useRoute()
  const userRole = useState('userRole')
  const isNavigating = ref(false)
  let scrollTimeout = null
  let scrollReady = false
  let isAtBottom = false
  let isAtTop = false
  let savedScrollY = 0

  // Prepare list of pages for navigation
  let pageList = PAGES_CONFIG
  if (userRole.value !== 'admin') {
    pageList = pageList.filter(page => page.to !== '/admin')
  }
  pageList = pageList.map(page => page.to === '/index' ? '/' : page.to)

  const getCurrentPageIndex = () => {
    let path = route.path
    if (['/loginLink', '/registration'].includes(route.path)) {
      path = '/booking'
    }
    return pageList.findIndex(page => path === page)
  }

  const getPrevPage = () => {
    const currentIndex = getCurrentPageIndex()
    //console.log('Current page index:', currentIndex, pageList.length)
    if (currentIndex === -1) {
      return null
    } else if (currentIndex === 0) {
      //console.log('Already at first page, cannot navigate further.')
      return pageList.at(-1)
    }
    return pageList[currentIndex - 1]
  }

  const getNextPage = () => {
    const currentIndex = getCurrentPageIndex()
    //console.log('Current page index:', currentIndex, pageList.length)
    if (currentIndex === -1) {
      return null
    } else if (currentIndex === pageList.length - 1) {
      //console.log('Already at last page, cannot navigate further.')
      return pageList[0]
    }
    return pageList[currentIndex + 1]
  }

  const handleScroll = () => {
    if (isNavigating.value) return

    clearTimeout(scrollTimeout)
    
    scrollTimeout = setTimeout(() => {
      const documentHeight = document.documentElement.scrollHeight
      const windowHeight = window.innerHeight
      const scrollTop = window.scrollY
      const scrollHeight = scrollTop + windowHeight
      isAtTop = scrollTop <= 5
      isAtBottom = scrollHeight >= (documentHeight - 50)
      if (scrollReady && (isAtBottom || isAtTop)) {
        navigateToPage(isAtBottom, isAtTop)        
      } else if (scrollHeight >= (documentHeight - 200)) {
        if (savedScrollY < window.scrollY) {
          if (scrollHeight >= (documentHeight - 50)) {
            navigateToPage(isAtBottom, isAtTop)
            return
          }
          scrollReady = true
          savedScrollY = window.scrollY
        } else {
          scrollReady = false
        }
      } else if (scrollTop <= 200) {
        if (scrollTop < 5) {
          navigateToPage(isAtBottom, isAtTop)
          return
        }
        if (scrollTop === 0 || (scrollTop != 5 && savedScrollY > window.scrollY)) {
          scrollReady = true
          savedScrollY = window.scrollY 
        }
        else {
          scrollReady = false
        }
      }
    }, 250)
  }

  const navigateToPage = (isAtBottom, isAtTop) => {
    scrollReady = false
    savedScrollY = 0
    //console.log('Scroll event detected. Current scrollTop:', window.scrollY)
    let nextPage = null

    if (isAtBottom) {
      isAtBottom = false
      nextPage = getNextPage()
    } else if (isAtTop) {
      isAtTop = false
      nextPage = getPrevPage()
    }
    
    if (nextPage) {
      isNavigating.value = true
      
      router.push(nextPage).then(() => {
        // Reset flags after navigation completes
        setTimeout(() => {
          isNavigating.value = false
        }, 500)
      })
    }
  }

  const initScrollNavigation = () => {
    window.addEventListener('scroll', handleScroll, { passive: true })
  }

  const destroyScrollNavigation = () => {
    clearTimeout(scrollTimeout)
    window.removeEventListener('scroll', handleScroll)
  }

  return {
    initScrollNavigation,
    destroyScrollNavigation,
  }
}