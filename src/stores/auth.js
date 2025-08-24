import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const user = ref(null)
  const token = ref(localStorage.getItem('admin_token') || null)

  // Check if user is authenticated on store initialization
  if (token.value) {
    isAuthenticated.value = true
  }

  const login = (userData, userToken) => {
    isAuthenticated.value = true
    user.value = userData
    token.value = userToken
    localStorage.setItem('admin_token', userToken)
  }

  const logout = () => {
    isAuthenticated.value = false
    user.value = null
    token.value = null
    localStorage.removeItem('admin_token')
  }

  const checkAuth = () => {
    return isAuthenticated.value && token.value !== null
  }

  return {
    isAuthenticated,
    user,
    token,
    login,
    logout,
    checkAuth,
  }
})
