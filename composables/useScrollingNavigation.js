import { PAGES_CONFIG } from '~/config/routes'
const userRole = useState('userRole')

export const useScrollingNavigation = () => {
  const router = useRouter()
  const route = useRoute()
  const isNavigating = ref(false)
  let timeoutId = null
  let scrollTop = 0
  let isAtBottom = false
  let scrollAmount = 0

  // Prepare list of pages for navigation
  let pageList = PAGES_CONFIG
  if (userRole.value !== 'admin') {
    pageList = pageList.filter(page => page.to !== '/admin')
  }
  pageList = pageList.map(page => page.to === '/index' ? '/' : page.to)

  const getCurrentPageIndex = () => {
    return pageList.findIndex(page => route.path === page)
  }

  const getNextPage = () => {
    const currentIndex = getCurrentPageIndex()
    console.log('Current page index:', currentIndex, pageList.length)
    if (currentIndex === -1) {
      return null
    } else if (currentIndex === pageList.length - 1) {
      console.log('Already at last page, cannot navigate further.')
      return pageList[0]
    }
    return pageList[currentIndex + 1]
  }

  const handleScroll = () => {
    if (isNavigating.value) return

    clearTimeout(timeoutId)
    
    timeoutId = setTimeout(() => {
      if(scrollAmount == 1 && scrollTop >= window.scrollY) {
        scrollTop = 0
        scrollAmount = 0
        isAtBottom = false
        console.log('Scroll event detected. Current scrollTop:', window.scrollY)
        const nextPage = getNextPage()
        
        if (nextPage) {
          isNavigating.value = true
          
          router.push(nextPage).then(() => {
            // Reset flags after navigation completes
            setTimeout(() => {
              isNavigating.value = false
            }, 500)
          })
        }
      } else if (isAtBottom) {
        if (scrollTop >= window.scrollY) scrollAmount += 1
        else isAtBottom = false
        // console.log('window.scrollY:', window.scrollY)
        // console.log('At bottom, waiting for more scrolls. Count:', scrollAmount)
      } else {
        scrollTop = window.scrollY
        const windowHeight = window.innerHeight
        const documentHeight = document.documentElement.scrollHeight
        isAtBottom = scrollTop + windowHeight == documentHeight
        // console.log('Scroll position:', {
        //   scrollTop,
        //   windowHeight,
        //   documentHeight,
        //   isAtBottom
        // })
        // Check if scrolled to bottom
        if (isAtBottom) {  
          // console.log('Scrolled to bottom. Preparing to navigate.')
          window.scrollTo({ top: window.scrollY - 5, behavior: 'smooth' })
        }
      }
    }, 150)
  }

  const initScrollNavigation = () => {
    window.addEventListener('scroll', handleScroll, { passive: true })
  }

  const destroyScrollNavigation = () => {
    clearTimeout(timeoutId)
    window.removeEventListener('scroll', handleScroll)
  }

  return {
    initScrollNavigation,
    destroyScrollNavigation,
  }
}