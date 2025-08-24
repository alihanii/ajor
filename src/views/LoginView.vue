<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>ورود ادمین</h1>
        <p>لطفاً اطلاعات ورود خود را وارد کنید</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">نام کاربری</label>
          <input
            id="username"
            v-model="formData.username"
            type="text"
            required
            placeholder="نام کاربری خود را وارد کنید"
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label for="password">رمز عبور</label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            required
            placeholder="رمز عبور خود را وارد کنید"
            :disabled="loading"
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" :disabled="loading" class="login-button">
          <span v-if="loading">در حال ورود...</span>
          <span v-else>ورود</span>
        </button>
      </form>

      <div class="login-footer">
        <p>سیستم مدیریت آجر ساختمانی</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'
import PocketBase from 'pocketbase'

const pb = new PocketBase('https://ajor-ahlr7djtx.liara.run')
const router = useRouter()
const authStore = useAuthStore()

const formData = reactive({
  username: '',
  password: '',
})

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  await pb
    .collection('users')
    .authWithPassword(formData.username, formData.password)
    .then(() => {
      const userData = { username: formData.username, role: 'admin' }
      const token = 'dummy_token_' + Date.now()
      authStore.login(userData, token)
      router.push('/admin')
    })
    .catch((err) => {
      error.value = 'خطا در ورود. لطفاً دوباره تلاش کنید'
    })
    .finally(() => {
      loading.value = false
    })
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.login-header h1 {
  color: #333;
  margin-bottom: 10px;
  font-size: 2rem;
  font-weight: 700;
}

.login-header p {
  color: #666;
  margin-bottom: 30px;
  font-size: 1rem;
}

.login-form {
  text-align: right;
}

.form-group {
  margin-bottom: 20px;
  text-align: right;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 600;
  font-size: 0.9rem;
}

.form-group input {
  width: 100%;
  padding: 15px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.error-message {
  background-color: #fee;
  color: #c53030;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 0.9rem;
  border: 1px solid #fecaca;
}

.login-button {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.login-footer {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e1e5e9;
}

.login-footer p {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

@media (max-width: 480px) {
  .login-card {
    padding: 30px 20px;
    margin: 20px;
  }

  .login-header h1 {
    font-size: 1.5rem;
  }
}
</style>
