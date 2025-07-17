import { useEffect, useState } from 'react'

/**
 * Custom hook to detect when component has mounted on client-side
 * Prevents hydration mismatches by ensuring client-only code runs only after hydration
 */
export function useIsClient() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient
}

/**
 * Custom hook for safe localStorage access that prevents SSR issues
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const isClient = useIsClient()
  
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (!isClient) return initialValue
    
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      
      if (isClient) {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }

  // Update stored value when client mounts
  useEffect(() => {
    if (isClient) {
      try {
        const item = window.localStorage.getItem(key)
        if (item) {
          setStoredValue(JSON.parse(item))
        }
      } catch (error) {
        console.warn(`Error reading localStorage key "${key}":`, error)
      }
    }
  }, [key, isClient])

  return [storedValue, setValue] as const
}

/**
 * Custom hook for safe geolocation access
 */
export function useGeolocation() {
  const isClient = useIsClient()
  const [location, setLocation] = useState<{
    latitude: number
    longitude: number
    error?: string
  } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isClient) return

    if (!navigator.geolocation) {
      setLocation({
        latitude: 6.9271, // Default to Colombo, Sri Lanka
        longitude: 79.8612,
        error: 'Geolocation not supported'
      })
      return
    }

    setLoading(true)
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
        setLoading(false)
      },
      (error) => {
        setLocation({
          latitude: 6.9271, // Default to Colombo, Sri Lanka
          longitude: 79.8612,
          error: error.message
        })
        setLoading(false)
      },
      {
        timeout: 10000,
        enableHighAccuracy: false
      }
    )
  }, [isClient])

  return { location, loading }
}

/**
 * Safe date formatting that prevents hydration issues
 */
export function useSafeDate(dateString: string) {
  const isClient = useIsClient()
  
  const formatDate = (date: string) => {
    if (!isClient) return ''
    
    try {
      return new Date(date).toISOString().split('T')[0]
    } catch (error) {
      return ''
    }
  }

  const getTimeAgo = (date: string) => {
    if (!isClient) return ''
    
    try {
      const now = new Date()
      const past = new Date(date)
      const diffInHours = Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60))
      
      if (diffInHours < 1) return 'Less than an hour ago'
      if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    } catch (error) {
      return ''
    }
  }

  return {
    formatDate: () => formatDate(dateString),
    getTimeAgo: () => getTimeAgo(dateString),
    isClient
  }
}
