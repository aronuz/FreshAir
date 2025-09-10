<template>
  <div class="min-h-screen flex items-center justify-center bg-cover bg-no-repeat font-sans text-white" style="background-image: url('/images/FreshAirHero.png');">
    <div class="dialog-container max-w-xl p-8 bg-black/20 rounded-lg sm:m-4 sm:p-6">
      <h1 class="text-3xl font-bold mb-4 sm:text-lg">{{ getErrorTitle() }}</h1>
      
      <div class="dialog-details">
        <p v-if="error.statusCode === 404">
          The page <strong class="text-yellow-400">"{{ getPageName() }}"</strong> could not be found.
        </p>
        
        <p v-else-if="error.statusCode === 403">
          The page <strong class="text-yellow-400">"{{ getPageName() }}"</strong> is currently unavailable.
          <span v-if="isTemporaryUnavailable()">
            Please try again later or contact support.
          </span>
        </p>
        
        <p v-else>
          {{ error.statusMessage || 'An unexpected error occurred.' }}
        </p>
      </div>

      <div class="bg-black/20 rounded-lg p-4 mb-8 text-left" v-if="showDebugInfo">
        <h3 class="m-0 pl-5">Debug Information:</h3>
        <ul>
          <li class="mb-1"><strong>Status Code:</strong> {{ error.statusCode }}</li>
          <li class="mb-1"><strong>Requested Path:</strong> {{ getRequestedPath() }}</li>
          <li class="mb-1"><strong>Error Type:</strong> {{ getErrorType() }}</li>
          <li v-if="getTargetPath()" class="mb-1"><strong>Target Path:</strong> {{ getTargetPath() }}</li>
        </ul>
      </div>

      <div class="flex gap-4 justify-center flex-wrap sm:flex-col">
        <button @click="handleRetry" class="px-6 py-3 rounded-lg text-base font-semibold transition-all duration-300 bg-green-600 text-white hover:bg-green-700 hover:-translate-y-0.5 cursor-pointer">
          {{ getRetryButtonText() }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
  // Get the error object passed by Nuxt
  const error = useError()
  const errorMessage = error.value?.data && JSON.parse(error.value?.data) || 'An unexpected error occurred.'
  const errorData = errorMessage
  // Check if in dev mode
  const showDebugInfo = import.meta.dev

  // Helper functions to extract custom data
  const getPageName = () => {
    return errorData.pageName || 'Unknown Page'
  }

  const getRequestedPath = () => {
    return errorData.requestedPath || useRoute().path
  }

  const getTargetPath = () => {
    return errorData.targetPath || null
  }

  const getErrorType = () => {
    return errorData.errorType || 'unknown'
  }

  const isTemporaryUnavailable = () => {
    return getErrorType() === 'page_unavailable'
  }

  const getErrorTitle = () => {
    if(error.value?.statusCode) {
      switch (error.value?.statusCode) {
        case 404:
          return 'Page Not Found'
        case 403:
          return 'Page Unavailable'
        case 500:
          return 'Server Error'
        default:
          return 'Error'
      }
    }
    return 'Error'
  }

  const getRetryButtonText = () => {
    return isTemporaryUnavailable() ? 'Try Again' : 'Go Back'
  }

  // Action handlers
  const handleRetry = () => {
    if (isTemporaryUnavailable()) {
      // Refresh the page to retry
      window.location.reload()
    } else {
      // Go back to previous page
      window.history.back()
    }
  }
</script>