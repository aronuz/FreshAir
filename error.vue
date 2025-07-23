<template>
  <div class="error-page">
    <div class="error-container">
      <h1>{{ getErrorTitle() }}</h1>
      
      <div class="error-details">
        <p v-if="error.statusCode === 404">
          The page <strong>"{{ getPageName() }}"</strong> could not be found.
        </p>
        
        <p v-else-if="error.statusCode === 403">
          The page <strong>"{{ getPageName() }}"</strong> is currently unavailable.
          <span v-if="isTemporaryUnavailable()">
            Please try again later or contact support.
          </span>
        </p>
        
        <p v-else>
          {{ error.statusMessage || 'An unexpected error occurred.' }}
        </p>
      </div>

      <div class="error-info" v-if="showDebugInfo">
        <h3>Debug Information:</h3>
        <ul>
          <li><strong>Status Code:</strong> {{ error.statusCode }}</li>
          <li><strong>Requested Path:</strong> {{ getRequestedPath() }}</li>
          <li><strong>Error Type:</strong> {{ getErrorType() }}</li>
          <li v-if="getTargetPath()"><strong>Target Path:</strong> {{ getTargetPath() }}</li>
        </ul>
      </div>

      <div class="error-actions">
        <button @click="handleRetry" class="retry-btn">
          {{ getRetryButtonText() }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
  // Get the error object passed by Nuxt
  const error = useError()
  const errorData = JSON.parse(error.value?.data)
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

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url('/images/FreshAirHero.png');
  background-repeat: no-repeat;
  background-size: cover;
  /* linear-gradient(135deg, #667eea 0%, #764ba2 100%); */
  color: white;
  font-family: 'Inter', -apple-system, sans-serif;
}

.error-container {
  text-align: center;
  max-width: 600px;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px) contrast(30%);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.error-container h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.error-details {
  margin-bottom: 2rem;
  font-size: 1.1rem;
  line-height: 1.6;
}

.error-details strong {
  color: #ffd700;
}

.error-info {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
  text-align: left;
}

.error-info h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.error-info ul {
  margin: 0;
  padding-left: 1.2rem;
}

.error-info li {
  margin-bottom: 0.3rem;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.retry-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-btn {
  background: #4CAF50;
  color: white;
}

.retry-btn:hover {
  background: #45a049;
  transform: translateY(-2px);
}

@media (max-width: 640px) {
  .error-container {
    margin: 1rem;
    padding: 1.5rem;
  }
  
  .error-container h1 {
    font-size: 2rem;
  }
  
  .error-actions {
    flex-direction: column;
  }
}
</style>