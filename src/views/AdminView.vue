<template>
  <div class="admin-container">
    <header class="admin-header">
      <div class="header-content">
        <h1>پنل مدیریت</h1>
        <div class="user-info">
          <span>خوش آمدید، {{ authStore.user?.username }}</span>
          <button @click="handleLogout" class="logout-button">خروج</button>
        </div>
      </div>
    </header>

    <main class="admin-main">
      <div class="admin-sidebar">
        <nav class="sidebar-nav">
          <button class="nav-item active" @click="activeTab = 'posts'">مدیریت پست‌ها</button>
          <button class="nav-item" @click="activeTab = 'create'">ایجاد پست جدید</button>
          <button class="nav-item" @click="activeTab = 'about'">مدیریت درباره ما</button>
          <button class="nav-item" @click="activeTab = 'connected'">مدیریت اطلاعات تماس</button>
        </nav>
      </div>

      <div class="admin-content">
        <!-- Posts Management Tab -->
        <div v-if="activeTab === 'posts'" class="tab-content">
          <div class="tab-header">
            <h2>مدیریت پست‌ها</h2>
            <button @click="fetchPosts" class="refresh-button" :disabled="loading">
              {{ loading ? 'در حال بارگذاری...' : 'تازه‌سازی' }}
            </button>
          </div>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <div v-if="posts.length === 0 && !loading" class="empty-state">
            <p>هیچ پستی یافت نشد</p>
          </div>

          <div v-else class="posts-table">
            <table>
              <thead>
                <tr>
                  <th>عکس</th>
                  <th>نام</th>
                  <th>توضیحات</th>
                  <th>تاریخ ایجاد</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="post in posts" :key="post.id">
                  <td class="post-image-cell">
                    <div v-if="post.field" class="post-image">
                      <img
                        :src="pb.files.getUrl(post, post.field)"
                        :alt="post.name"
                        @click="openImageModal(pb.files.getUrl(post, post.field))"
                      />
                    </div>
                    <div v-else class="no-image">
                      <span>بدون عکس</span>
                    </div>
                  </td>
                  <td>{{ post.name }}</td>
                  <td>{{ post.dis }}</td>
                  <td>{{ formatDate(post.created) }}</td>
                  <td>
                    <button
                      @click="deletePost(post.id)"
                      class="action-button delete"
                      :disabled="deletingPost === post.id"
                    >
                      {{ deletingPost === post.id ? 'در حال حذف...' : 'حذف' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Create Post Tab -->
        <div v-if="activeTab === 'create'" class="tab-content">
          <h2>ایجاد پست جدید</h2>

          <form @submit.prevent="createPost" class="create-form">
            <div class="form-group">
              <label for="name">نام پست:</label>
              <input
                id="name"
                v-model="newPost.name"
                type="text"
                required
                placeholder="نام پست را وارد کنید"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="dis">توضیحات:</label>
              <textarea
                id="dis"
                v-model="newPost.dis"
                required
                placeholder="توضیحات پست را وارد کنید"
                rows="4"
                class="form-textarea"
              ></textarea>
            </div>

            <div class="form-group">
              <label for="image">عکس پست:</label>
              <div class="image-upload-container">
                <input
                  id="image"
                  type="file"
                  @change="handleImageChange"
                  accept="image/*"
                  class="image-input"
                />
                <label for="image" class="file-upload-label">
                  <div class="upload-hint" v-if="!imagePreview">
                    <span>برای انتخاب عکس کلیک کنید</span>
                    <small>فرمت‌های پشتیبانی شده: JPG, PNG, GIF</small>
                  </div>
                </label>
                <div class="image-preview" v-if="imagePreview">
                  <img :src="imagePreview" alt="پیش‌نمایش عکس" />
                  <button type="button" @click="removeImage" class="remove-image-btn">
                    حذف عکس
                  </button>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="submit-button" :disabled="creatingPost">
                {{ creatingPost ? 'در حال ایجاد...' : 'ایجاد پست' }}
              </button>
              <button type="button" @click="resetForm" class="reset-button">پاک کردن</button>
            </div>
          </form>
        </div>

        <!-- About Management Tab -->
        <div v-if="activeTab === 'about'" class="tab-content">
          <div class="tab-header">
            <h2>مدیریت درباره ما</h2>
            <div class="tab-actions">
              <button @click="fetchAbout" class="refresh-button" :disabled="loadingAbout">
                {{ loadingAbout ? 'در حال بارگذاری...' : 'تازه‌سازی' }}
              </button>
              <button @click="showAboutForm = true" class="add-button">افزودن آیتم جدید</button>
            </div>
          </div>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <div v-if="aboutItems.length === 0 && !loadingAbout" class="empty-state">
            <p>هیچ آیتمی یافت نشد</p>
          </div>

          <div v-else class="about-table">
            <table>
              <thead>
                <tr>
                  <th>آیکون</th>
                  <th>عنوان</th>
                  <th>توضیحات</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in aboutItems" :key="item.id">
                  <td class="about-icon-cell">
                    <div class="about-icon">
                      <span>{{ item.icon }}</span>
                    </div>
                  </td>
                  <td>{{ item.title }}</td>
                  <td>{{ item.dis }}</td>
                  <td>
                    <button
                      @click="deleteAbout(item.id)"
                      class="action-button delete"
                      :disabled="deletingAbout === item.id"
                    >
                      {{ deletingAbout === item.id ? 'در حال حذف...' : 'حذف' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Connected Management Tab -->
        <div v-if="activeTab === 'connected'" class="tab-content">
          <div class="tab-header">
            <h2>مدیریت اطلاعات تماس</h2>
            <button @click="fetchConnected" class="refresh-button" :disabled="loadingConnected">
              {{ loadingConnected ? 'در حال بارگذاری...' : 'تازه‌سازی' }}
            </button>
          </div>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <div v-if="connectedItems.length === 0 && !loadingConnected" class="empty-state">
            <p>هیچ اطلاعات تماسی یافت نشد</p>
          </div>

          <div v-else class="connected-grid">
            <div v-for="item in connectedItems" :key="item.id" class="connected-card">
              <div class="card-header">
                <h3>اطلاعات تماس</h3>
                <div class="card-actions">
                  <button @click="editConnected(item)" class="edit-button">ویرایش</button>
                </div>
              </div>
              <div class="card-content">
                <div class="info-row">
                  <span class="label">آدرس:</span>
                  <span class="value">{{ item.address }}</span>
                </div>
                <div class="info-row">
                  <span class="label">تلفن:</span>
                  <span class="value">{{ item.phone }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Image Modal -->
    <div v-if="showImageModal" class="image-modal" @click="closeImageModal">
      <div class="modal-content" @click.stop>
        <button class="close-modal-btn" @click="closeImageModal">&times;</button>
        <img :src="selectedImageUrl" alt="نمایش عکس" />
      </div>
    </div>

    <!-- About Form Modal -->
    <div v-if="showAboutForm" class="about-modal" @click="closeAboutForm">
      <div class="modal-content about-form-content" @click.stop>
        <button class="close-modal-btn" @click="closeAboutForm">&times;</button>
        <h2>افزودن آیتم جدید</h2>

        <form @submit.prevent="createAbout" class="about-create-form">
          <div class="form-group">
            <label for="about-title">عنوان:</label>
            <input
              id="about-title"
              v-model="newAbout.title"
              type="text"
              required
              placeholder="عنوان آیتم را وارد کنید"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="about-dis">توضیحات:</label>
            <textarea
              id="about-dis"
              v-model="newAbout.dis"
              required
              placeholder="توضیحات آیتم را وارد کنید"
              rows="4"
              class="form-textarea"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="about-icon">آیکون:</label>
            <input
              id="about-icon"
              v-model="newAbout.icon"
              type="text"
              required
              placeholder="نام آیکون را وارد کنید (مثل: star, heart, etc.)"
              class="form-input"
            />
          </div>

          <div class="form-actions">
            <button type="submit" class="submit-button" :disabled="creatingAbout">
              {{ creatingAbout ? 'در حال ایجاد...' : 'ایجاد آیتم' }}
            </button>
            <button type="button" @click="resetAboutForm" class="reset-button">پاک کردن</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Connected Form Modal -->
    <div v-if="showConnectedForm" class="connected-modal" @click="closeConnectedForm">
      <div class="modal-content connected-form-content" @click.stop>
        <button class="close-modal-btn" @click="closeConnectedForm">&times;</button>
        <h2>{{ editingConnectedItem ? 'ویرایش اطلاعات تماس' : 'افزودن اطلاعات تماس جدید' }}</h2>

        <form
          @submit.prevent="editingConnectedItem ? updateConnected() : createConnected()"
          class="connected-create-form"
        >
          <div class="form-group">
            <label for="connected-address">آدرس:</label>
            <input
              id="connected-address"
              v-model="newConnected.address"
              type="text"
              required
              placeholder="آدرس را وارد کنید"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="connected-phone">تلفن:</label>
            <input
              id="connected-phone"
              v-model="newConnected.phone"
              type="text"
              required
              placeholder="شماره تلفن را وارد کنید"
              class="form-input"
            />
          </div>

          <div class="form-actions">
            <button type="submit" class="submit-button" :disabled="creatingConnected">
              {{
                creatingConnected ? 'در حال ذخیره...' : editingConnectedItem ? 'ویرایش' : 'ایجاد'
              }}
            </button>
            <button type="button" @click="resetConnectedForm" class="reset-button">پاک کردن</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import PocketBase from 'pocketbase'

const router = useRouter()
const authStore = useAuthStore()

// PocketBase setup
const pb = new PocketBase('https://ajor-ahlr7djtx.liara.run')

// Reactive data
const activeTab = ref('posts')
const posts = ref([])
const loading = ref(false)
const error = ref('')
const deletingPost = ref(null)
const creatingPost = ref(false)

const newPost = ref({
  name: '',
  dis: '',
})

const imageFile = ref(null)
const imagePreview = ref('')

const showImageModal = ref(false)
const selectedImageUrl = ref('')

const showAboutForm = ref(false)
const aboutItems = ref([])
const loadingAbout = ref(false)
const creatingAbout = ref(false)
const deletingAbout = ref(null)

const newAbout = ref({
  title: '',
  dis: '',
  icon: '',
})

const showConnectedForm = ref(false)
const connectedItems = ref([])
const loadingConnected = ref(false)
const editingConnectedItem = ref(null)
const creatingConnected = ref(false)
const deletingConnected = ref(null)

const newConnected = ref({
  address: '',
  phone: '',
})

// Methods
const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const openImageModal = (imageUrl) => {
  selectedImageUrl.value = imageUrl
  showImageModal.value = true
}

const closeImageModal = () => {
  showImageModal.value = false
  selectedImageUrl.value = ''
}

const closeAboutForm = () => {
  showAboutForm.value = false
  resetAboutForm()
}

const closeConnectedForm = () => {
  showConnectedForm.value = false
  editingConnectedItem.value = null
  resetConnectedForm()
}

const handleImageChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      error.value = 'لطفاً فقط فایل عکس انتخاب کنید'
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      error.value = 'حجم فایل نباید بیشتر از 5 مگابایت باشد'
      return
    }

    imageFile.value = file
    imagePreview.value = URL.createObjectURL(file)
    error.value = ''
  }
}

const removeImage = () => {
  imageFile.value = null
  imagePreview.value = ''
  // Reset file input
  const fileInput = document.getElementById('image')
  if (fileInput) {
    fileInput.value = ''
  }
}

const fetchPosts = async () => {
  try {
    loading.value = true
    error.value = ''

    const records = await pb.collection('post').getFullList({
      sort: '-created',
    })

    posts.value = records
  } catch (err) {
    console.error('Error fetching posts:', err)
    error.value = 'خطا در بارگذاری پست‌ها: ' + err.message
  } finally {
    loading.value = false
  }
}

const createPost = async () => {
  try {
    creatingPost.value = true
    error.value = ''

    const formData = new FormData()
    formData.append('name', newPost.value.name)
    formData.append('dis', newPost.value.dis)

    // Add image if selected
    if (imageFile.value) {
      formData.append('field', imageFile.value)
    }

    await pb.collection('post').create(formData)

    // Reset form and fetch updated posts
    resetForm()
    await fetchPosts()

    // Switch to posts tab
    activeTab.value = 'posts'
  } catch (err) {
    console.error('Error creating post:', err)
    error.value = 'خطا در ایجاد پست: ' + err.message
  } finally {
    creatingPost.value = false
  }
}

const deletePost = async (postId) => {
  if (!confirm('آیا مطمئن هستید که می‌خواهید این پست را حذف کنید؟')) {
    return
  }

  try {
    deletingPost.value = postId
    error.value = ''

    await pb.collection('post').delete(postId)

    // Remove from local state
    posts.value = posts.value.filter((post) => post.id !== postId)
  } catch (err) {
    console.error('Error deleting post:', err)
    error.value = 'خطا در حذف پست: ' + err.message
  } finally {
    deletingPost.value = null
  }
}

const resetForm = () => {
  newPost.value = {
    name: '',
    dis: '',
  }
  removeImage()
  error.value = ''
}

const fetchAbout = async () => {
  try {
    loadingAbout.value = true
    error.value = ''

    const records = await pb.collection('about').getFullList({
      sort: '-created',
    })

    aboutItems.value = records
  } catch (err) {
    console.error('Error fetching about items:', err)
    error.value = 'خطا در بارگذاری آیتم‌ها: ' + err.message
  } finally {
    loadingAbout.value = false
  }
}

const createAbout = async () => {
  try {
    creatingAbout.value = true
    error.value = ''

    const data = {
      title: newAbout.value.title,
      dis: newAbout.value.dis,
      icon: newAbout.value.icon,
    }

    await pb.collection('about').create(data)

    // Reset form and fetch updated items
    resetAboutForm()
    await fetchAbout()

    // Close modal
    showAboutForm.value = false
  } catch (err) {
    console.error('Error creating about item:', err)
    error.value = 'خطا در ایجاد آیتم: ' + err.message
  } finally {
    creatingAbout.value = false
  }
}

const deleteAbout = async (itemId) => {
  if (!confirm('آیا مطمئن هستید که می‌خواهید این آیتم را حذف کنید؟')) {
    return
  }

  try {
    deletingAbout.value = itemId
    error.value = ''

    await pb.collection('about').delete(itemId)

    // Remove from local state
    aboutItems.value = aboutItems.value.filter((item) => item.id !== itemId)
  } catch (err) {
    console.error('Error deleting about item:', err)
    error.value = 'خطا در حذف آیتم: ' + err.message
  } finally {
    deletingAbout.value = null
  }
}

const resetAboutForm = () => {
  newAbout.value = {
    title: '',
    dis: '',
    icon: '',
  }
  error.value = ''
}

const fetchConnected = async () => {
  try {
    loadingConnected.value = true
    error.value = ''

    const records = await pb.collection('connected').getFullList({
      sort: '-created',
    })

    connectedItems.value = records
  } catch (err) {
    console.error('Error fetching connected items:', err)
    error.value = 'خطا در بارگذاری اطلاعات تماس: ' + err.message
  } finally {
    loadingConnected.value = false
  }
}

const editConnected = (item) => {
  editingConnectedItem.value = item
  newConnected.value = {
    address: item.address,
    phone: item.phone,
  }
  showConnectedForm.value = true
}

const createConnected = async () => {
  try {
    creatingConnected.value = true
    error.value = ''

    const data = {
      address: newConnected.value.address,
      phone: newConnected.value.phone,
    }

    await pb.collection('connected').create(data)

    // Reset form and fetch updated items
    resetConnectedForm()
    await fetchConnected()

    // Close modal
    showConnectedForm.value = false
  } catch (err) {
    console.error('Error creating connected item:', err)
    error.value = 'خطا در ایجاد اطلاعات تماس: ' + err.message
  } finally {
    creatingConnected.value = false
  }
}

const updateConnected = async () => {
  if (!editingConnectedItem.value) return

  try {
    error.value = ''

    const data = {
      address: newConnected.value.address,
      phone: newConnected.value.phone,
    }

    await pb.collection('connected').update(editingConnectedItem.value.id, data)

    // Reset form and fetch updated items
    resetConnectedForm()
    await fetchConnected()

    // Close modal
    showConnectedForm.value = false
  } catch (err) {
    console.error('Error updating connected item:', err)
    error.value = 'خطا در ویرایش اطلاعات تماس: ' + err.message
  } finally {
    editingConnectedItem.value = null
  }
}

const deleteConnected = async (itemId) => {
  if (!confirm('آیا مطمئن هستید که می‌خواهید این اطلاعات تماس را حذف کنید؟')) {
    return
  }

  try {
    deletingConnected.value = itemId
    error.value = ''

    await pb.collection('connected').delete(itemId)

    // Remove from local state
    connectedItems.value = connectedItems.value.filter((item) => item.id !== itemId)
  } catch (err) {
    console.error('Error deleting connected item:', err)
    error.value = 'خطا در حذف اطلاعات تماس: ' + err.message
  } finally {
    deletingConnected.value = null
  }
}

const resetConnectedForm = () => {
  newConnected.value = {
    address: '',
    phone: '',
  }
  error.value = ''
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fa-IR')
}

// Lifecycle
onMounted(() => {
  fetchPosts()
  fetchAbout()
  fetchConnected()
})
</script>

<style scoped>
.admin-container {
  min-height: 100vh;
  background-color: #f8fafc;
}

.admin-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #1f2937;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
  color: #1f2937;
}

.logout-button {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.admin-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  gap: 20px;
  color: #1f2937;
}

.admin-sidebar {
  width: 250px;
  flex-shrink: 0;
}

.sidebar-nav {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.nav-item {
  width: 100%;
  text-align: right;
  padding: 12px 16px;
  margin-bottom: 8px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.95rem;
  color: #1f2937;
}

.nav-item:hover {
  background-color: #f1f5f9;
}

.nav-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.admin-content {
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  color: #1f2937;
}

.tab-content h2 {
  margin-top: 0;
  margin-bottom: 25px;
  color: #1f2937;
  font-size: 1.5rem;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.refresh-button {
  background: #667eea;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.refresh-button:hover:not(:disabled) {
  background: #5a67d8;
}

.refresh-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 25px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-info h3 {
  margin: 0 0 8px 0;
  font-size: 1rem;
  opacity: 0.9;
}

.stat-number {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
}

.error-message {
  background-color: #fee;
  color: #c53030;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #fecaca;
}

.users-table {
  overflow-x: auto;
}

.users-table table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.users-table th,
.users-table td {
  padding: 12px;
  text-align: right;
  border-bottom: 1px solid #e2e8f0;
  color: #1f2937;
}

.users-table th {
  background-color: #f8fafc;
  font-weight: 600;
  color: #1f2937;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.active {
  background-color: #dcfce7;
  color: #166534;
}

.status-badge.inactive {
  background-color: #fee2e2;
  color: #991b1b;
}

.action-button {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  margin-left: 8px;
  transition: all 0.3s ease;
}

.action-button.edit {
  background-color: #3b82f6;
  color: white;
}

.action-button.edit:hover {
  background-color: #2563eb;
}

.action-button.delete {
  background-color: #ef4444;
  color: white;
}

.action-button.delete:hover {
  background-color: #dc2626;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #1f2937;
}

.posts-table {
  overflow-x: auto;
}

.posts-table table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.posts-table th,
.posts-table td {
  padding: 12px;
  text-align: right;
  border-bottom: 1px solid #e2e8f0;
  color: #1f2937;
}

.posts-table th {
  background-color: #f8fafc;
  font-weight: 600;
  color: #1f2937;
}

.create-form {
  max-width: 600px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #1f2937;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  color: #1f2937;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

.submit-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.reset-button {
  background: #f3f4f6;
  color: #1f2937;
  border: 2px solid #e5e7eb;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-button:hover {
  background: #e5e7eb;
  border-color: #d1d5db;
}

/* Image Upload Styles */
.image-upload-container {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  transition: border-color 0.3s ease;
  background: #f9fafb;
}

.image-upload-container:hover {
  border-color: #667eea;
}

.image-input {
  display: none;
}

.file-upload-label {
  display: block;
  width: 100%;
  text-align: center;
  cursor: pointer;
  padding: 10px 0;
  color: #667eea;
  font-weight: 600;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.file-upload-label:hover {
  background-color: #e0e7ff;
}

.upload-hint {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #1f2937;
}

.upload-hint span {
  font-weight: 500;
  color: #1f2937;
}

.upload-hint small {
  font-size: 0.875rem;
  color: #1f2937;
}

.image-preview {
  position: relative;
  display: inline-block;
  margin-top: 15px;
}

.image-preview img {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.remove-image-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.remove-image-btn:hover {
  background: #dc2626;
  transform: scale(1.1);
}

/* Post Image Styles */
.post-image-cell {
  width: 100px;
}

.post-image img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.post-image img:hover {
  transform: scale(1.1);
}

.no-image {
  color: #1f2937;
  font-size: 0.875rem;
  text-align: center;
}

/* Image Modal Styles */
.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
}

.modal-content img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

.close-modal-btn {
  position: absolute;
  top: -40px;
  right: 0;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-modal-btn:hover {
  background: #dc2626;
  transform: scale(1.1);
}

/* About Management Styles */
.tab-actions {
  display: flex;
  gap: 15px;
  align-items: center;
}

.add-button {
  background: #10b981;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
}

.add-button:hover {
  background: #059669;
  transform: translateY(-1px);
}

.about-table {
  overflow-x: auto;
}

.about-table table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.about-table th,
.about-table td {
  padding: 12px;
  text-align: right;
  border-bottom: 1px solid #e2e8f0;
  color: #1f2937;
}

.about-table th {
  background-color: #f8fafc;
  font-weight: 600;
  color: #1f2937;
}

.about-icon-cell {
  width: 80px;
}

.about-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  font-size: 1.2rem;
  margin: 0 auto;
}

/* About Modal Styles */
.about-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.about-form-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 90%;
  overflow-y: auto;
}

.about-form-content h2 {
  margin-top: 0;
  margin-bottom: 25px;
  color: #1f2937;
  text-align: center;
}

.about-create-form {
  width: 100%;
}

/* Connected Management Styles */
.connected-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.connected-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.card-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #1f2937;
}

.card-actions {
  display: flex;
  gap: 10px;
}

.edit-button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s ease;
}

.edit-button:hover {
  background: #2563eb;
}

.delete-button {
  background: #ef4444;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s ease;
}

.delete-button:hover {
  background: #dc2626;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.9rem;
}

.value {
  color: #1f2937;
  font-size: 0.9rem;
  font-weight: 500;
}

/* Connected Form Modal Styles */
.connected-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.connected-form-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 90%;
  overflow-y: auto;
}

.connected-form-content h2 {
  margin-top: 0;
  margin-bottom: 25px;
  color: #1f2937;
  text-align: center;
}

.connected-create-form {
  width: 100%;
}

@media (max-width: 768px) {
  .admin-main {
    flex-direction: column;
  }

  .admin-sidebar {
    width: 100%;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .header-content {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
}
</style>
