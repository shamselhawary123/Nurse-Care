<template>
  <div class="account-settings">
    <!-- Sidebar Overlay for mobile -->
    <div v-if="showSidebar && isMobile" class="sidebar-overlay" @click="showSidebar = false"></div>
    <!-- Sidebar Toggle Button (moved below header, before sidebar) -->
    <button class="sidebar-toggle" v-if="!showSidebar" @click="showSidebar = true">
      <i class="fas fa-bars"></i>
    </button>
    <!-- Sidebar -->
    <aside :class="['sidebar', { 'sidebar-hidden': !showSidebar }]">
      <button class="close-sidebar" v-if="showSidebar && isMobile" @click="showSidebar = false">
        <i class="fas fa-times"></i>
      </button>
      <h2 class="sidebar-title text-center">الاعدادات</h2>
      <ul class="sidebar-menu">
        <li class="active"><i class="fas fa-pen"></i> تعديل الملف الشخصي</li>
        <li>
          <router-link to="/notifications" class="flex items-center">
            <i class="fas fa-bell"></i> الاشعارات
          </router-link>
        </li>
        <li><i class="fas fa-lock"></i> الامان</li>
        <li><i class="fas fa-cog"></i> المظهر</li>
        <li><i class="fas fa-question-circle"></i> المساعدة</li>
      </ul>
    </aside>
    <main :class="['profile-main', { 'sidebar-open': showSidebar && isMobile }]">
      <div class="profile-header">
        <div class="header-content">
          <h1>تعديل الملف الشخصي</h1>
        </div>
        <div class="profile-photo-section">
          <div class="photo-container">
            <img 
              :src="photoPreview || form.personalPhoto || '/src/assets/default-avatar.png'" 
              class="profile-photo" 
              alt="Profile Photo" 
            />
            <div class="photo-upload-controls">
              <label class="upload-btn">
                <input 
                  type="file" 
                  accept="image/*" 
                  @change="handlePhotoUpload" 
                  class="hidden-input"
                />
                <i class="fas fa-camera"></i> Change Photo
              </label>
              <button 
                v-if="photoPreview || form.personalPhoto" 
                type="button" 
                class="remove-btn"
                @click="removePhoto"
              >
                <i class="fas fa-times"></i> Remove
              </button>
            </div>
          </div>
        </div>
      </div>
      <form class="profile-form" @submit.prevent="saveProfile">
        <div class="form-row">
          <div class="form-group">
            <label>الاسم الاول</label>
            <input v-model="form.firstName" type="text" />
          </div>
          <div class="form-group">
            <label>الاسم الاخير</label>
            <input v-model="form.lastName" type="text" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>النوع</label>
            <input :value="form.gender === 'male' ? 'ذكر' : form.gender === 'female' ? 'أنثى' : form.gender" type="text" disabled />
          </div>
          <div class="form-group">
            <label>العمر</label>
            <input :value="form.age ? form.age + ' سنة' : ''" type="text" disabled />
          </div>
        </div>
        <div class="form-group">
          <label>رقم الجوال</label>
          <input v-model="form.phoneNumber" type="text" />
        </div>
        <div class="form-group">
          <label>نبذة عني</label>
          <textarea 
            v-model="form.aboutMe" 
            class="w-full p-3 border rounded-lg resize-none"
            rows="4"
            placeholder="اكتب نبذة عنك هنا..."
          ></textarea>
        </div>
        <div class="form-group">
          <label>العنوان</label>
          <input v-model="form.address" type="text" />
        </div>
        <div class="form-group">
          <label>البريد الالكتروني</label>
          <input v-model="form.email" type="email" disabled/>
        </div>
        <!-- <div class="form-group">
          <label>كلمة المرور الجديدة</label>
          <input v-model="form.password" type="password" />
        </div> -->
        <div class="form-group" v-if="form.role">
          <label>الدور</label>
          <input :value="form.role" type="text" disabled />
        </div>
        <div class="form-group" v-if="form.specialty">
          <label>التخصص</label>
          <input :value="form.specialty" type="text" disabled />
        </div>
        <div class="form-group" v-if="form.isActive !== undefined">
          <label>الحالة</label>
          <input :value="form.isActive ? 'نشط' : 'غير نشط'" type="text" disabled />
        </div>
        <div class="form-actions">
          <button type="button" class="cancel-btn" @click="resetForm">الغاء</button>
          <button type="submit" class="save-btn">حفظ</button>
          <button type="button" class="logout-btn" @click="handleLogout">تسجيل الخروج</button>
        </div>
      </form>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const user = ref<any>(null);
const form = ref<any>({});
const photoPreview = ref<string | null>(null);
const photoFile = ref<File | null>(null);
const showSidebar = ref(window.innerWidth >= 900); // Sidebar is visible by default on desktop
const isMobile = ref(window.innerWidth < 900);

const handleResize = () => {
  isMobile.value = window.innerWidth < 900;
  if (!isMobile.value) showSidebar.value = true;
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
  console.log('Component mounted, fetching user data...');
  fetchUser();
});

const fetchUser = async () => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  if (!token || !userId || userId === 'undefined') {
    router.push('/login');
    return;
  }
  try {
    console.log('Fetching user data...');
    const res = await axios.get(`/api/v1/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    console.log('Received user data:', res.data);
    
    if (res.data) {
      user.value = res.data;
      console.log('Updated user state:', user.value);
      initializeForm(res.data);
      console.log('Initialized form:', form.value);
    } else {
      console.error('Invalid user data received:', res.data);
      router.push('/login');
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    router.push('/login');
  }
};

const initializeForm = (userData: any) => {
  console.log('Initializing form with data:', userData);
  
  form.value = {
    firstName: userData.firstName || '',
    lastName: userData.lastName || '',
    email: userData.email || '',
    phoneNumber: userData.phoneNumber || '',
    address: userData.address || '',
    aboutMe: userData.aboutMe || '',
    role: userData.role || '',
    personalPhoto: userData.personalPhoto || null,
    gender: userData.gender || '',
    age: userData.age || '',
  };
  
  if (userData.personalPhoto) {
    photoPreview.value = userData.personalPhoto;
    console.log('Set photo preview:', photoPreview.value);
  }
  
  console.log('Form initialized:', form.value);
};

const handlePhotoUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الصورة يجب أن لا يتجاوز 5 ميجابايت');
      return;
    }
    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح');
      return;
    }
    photoFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      photoPreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const removePhoto = () => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  
  if (token && userId) {
    console.log('Removing photo...');
    const formData = new FormData();
    formData.append('personalPhoto', '');
    
    axios.put(`/api/v1/users/${userId}`, formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      },
    }).then(response => {
      console.log('Photo removal response:', response.data);
      if (response.data) {
        user.value = response.data;
        initializeForm(response.data);
        photoPreview.value = null;
        photoFile.value = null;
        window.dispatchEvent(new Event('profile-updated'));
      }
    }).catch(error => {
      console.error('Error removing photo:', error);
      console.error('Error response:', error.response?.data);
      alert('حدث خطأ أثناء حذف الصورة');
    });
  }
};

const saveProfile = async () => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  if (!token || !userId) return;

  try {
    const formData = new FormData();
    
    // Append form fields
    const fieldsToUpdate = [
      'firstName',
      'lastName',
      'phoneNumber',
      'address',
      'aboutMe'
    ];

    console.log('Current form data before save:', form.value);

    fieldsToUpdate.forEach(field => {
      if (form.value[field] !== undefined) {
        if (field === 'aboutMe') {
          formData.append(field, form.value[field] || '');
        } else {
          formData.append(field, form.value[field]);
        }
        console.log(`Appending ${field}:`, form.value[field]);
      }
    });

    // Handle photo upload
    if (photoFile.value) {
      formData.append('personalPhoto', photoFile.value);
      console.log('Appending photo file:', photoFile.value.name);
    }

    console.log('Sending update request...');
    const response = await axios.put(
      `/api/v1/users/${userId}`,
      formData,
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      }
    );

    console.log('Received update response:', response.data);

    if (response.data) {
      console.log('Updating local data with response:', response.data);
      user.value = response.data;
      initializeForm(response.data);
      
      photoFile.value = null;
      
      // Update the header and other components
      window.dispatchEvent(new Event('profile-updated'));
      
      // Emit a custom event for aboutMe updates
      window.dispatchEvent(new CustomEvent('aboutme-updated', {
        detail: {
          userId: userId,
          aboutMe: response.data.aboutMe
        }
      }));
      
      alert('تم تحديث الملف الشخصي بنجاح!');
    } else {
      throw new Error('Invalid response data');
    }
  } catch (error: any) {
    console.error('Error updating profile:', error);
    console.error('Error response:', error.response?.data);
    if (error.response?.data?.message) {
      alert(error.response.data.message);
    } else {
      alert('حدث خطأ أثناء تحديث الملف الشخصي');
    }
  }
};

const resetForm = () => {
  if (user.value) {
    initializeForm(user.value);
  }
};

const handleLogout = () => {
  // Clear local storage
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  
  // Redirect to login page
  router.push('/login');
};

// Watch for changes in user data
watch(user, (newValue) => {
  console.log('User data changed:', newValue);
}, { deep: true });

// Watch for changes in form data
watch(form, (newValue) => {
  console.log('Form data changed:', newValue);
}, { deep: true });
</script>

<style scoped>
.account-settings {
  display: flex;
  min-height: 100vh;
  background: #fff;
  direction: rtl;
  position: relative;
}
.sidebar-overlay {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  background: rgba(0,0,0,0.25);
  z-index: 999;
  transition: opacity 0.3s;
}
.sidebar-toggle {
  /* margin: 16px 0 16px 16px; */
  background: #007b8f;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 8px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background 0.2s;
  display: block;
}
.sidebar-toggle:hover {
  background: #006476;
}
.close-sidebar {
  background: transparent;
  color: #ff4444;
  border: none;
  font-size: 1.2rem;
  position: absolute;
  left: 12px;
  top: 12px;
  cursor: pointer;
  z-index: 1200;
}
.sidebar {
  width: 220px;
  background: #f8fafc;
  border-right: 1px solid #eee;
  padding: 32px 0 0 0;
  min-height: 100vh;
  position: relative;
  transition: transform 0.3s cubic-bezier(.4,0,.2,1), box-shadow 0.3s;
  box-shadow: 0 0 0 rgba(0,0,0,0);
  z-index: 1001;
}
.sidebar-hidden {
  transform: translateX(110%);
  box-shadow: none;
}
.sidebar-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 2rem;
  margin-left: 2rem;
  color: #333;
}
.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}
.sidebar-menu li {
  padding: 14px 32px;
  color: #333;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  border-right: 4px solid transparent;
  transition: background 0.2s, border 0.2s;
}
.sidebar-menu li.active, .sidebar-menu li:hover {
  background: #e6f7f9;
  color: #007b8f;
  border-right: 4px solid #007b8f;
}
.profile-main {
  flex: 1;
  padding: 48px 48px 0 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.profile-header {
 display: flex;
    gap: 30px;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: 40px;
    padding: 0 20px;
}
.header-content {
  flex: 1;
}
.header-content h1 {
  font-size: 2rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}
.profile-photo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.photo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.profile-photo {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #007b8f;
  background-color: #f8fafc;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.profile-form {
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.form-row {
  display: flex;
  gap: 18px;
}
.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.form-group label {
  font-size: 1rem;
  color: #333;
  font-weight: 500;
}
.form-group input {
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  background: #f9f9f9;
  outline: none;
  transition: border 0.2s;
}
.form-group textarea {
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  background: #f9f9f9;
}
.form-group input:focus {
  border-color: #007b8f;
  background: #fff;
}
.form-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 18px;
  margin-bottom: 20px;
}
.cancel-btn {
  background: #fff;
  color: #007b8f;
  border: 1px solid #007b8f;
  padding: 10px 32px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.cancel-btn:hover {
  background: #fff7e6;
}
.logout-btn {
  background: #dc3545;
  color: #fff;
  padding: 10px 32px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}
.logout-btn:hover {
  background: #c82333;
}
.save-btn {
  background: #007b8f;
  color: #fff;
  padding: 10px 32px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}
.save-btn:hover {
  background: #006476;
}
.photo-upload-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.upload-btn {
  background: #007b8f;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}
.upload-btn:hover {
  background: #006476;
  transform: translateY(-1px);
}
.remove-btn {
  background: transparent;
  color: #ff4444;
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid #ff4444;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}
.remove-btn:hover {
  background: #fff1f1;
  transform: translateY(-1px);
}
.hidden-input {
  display: none;
}
textarea {
  background: #f9f9f9;
  border: 1px solid #ccc;
  transition: all 0.2s ease;
  font-size: 1rem;
  direction: rtl;
}

textarea:focus {
  border-color: #007b8f;
  background: #fff;
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 123, 143, 0.1);
}

@media (max-width: 900px) {
  .sidebar {
    width: 80vw;
    min-width: 220px;
    max-width: 350px;
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    z-index: 1001;
    box-shadow: 0 0 20px rgba(0,0,0,0.1);
    background: #f8fafc;
    transition: transform 0.3s cubic-bezier(.4,0,.2,1), box-shadow 0.3s;
    transform: translateX(0);
  }
  .sidebar-hidden {
    transform: translateX(110%);
    box-shadow: none;
  }
  .profile-main {
    padding: 24px 8px 0 8px;
    transition: filter 0.3s;
  }
  .profile-main.sidebar-open {
    filter: blur(2px) grayscale(0.2) brightness(0.95);
    pointer-events: none;
    user-select: none;
  }
  .profile-header h1, .sidebar-title {
    font-size: 1.3rem;
  }
  .form-group label, .form-group input, .form-group textarea {
    font-size: 1.05rem;
  }
  .form-group input, .form-group textarea {
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }
  .form-actions button {
    width: 100%;
    margin-bottom: 8px;
  }
}
@media (min-width: 900px) {
  .sidebar-toggle {
    display: none;
  }
  .sidebar {
    transform: none !important;
    position: relative;
    box-shadow: none;
    width: 220px;
  }
  .close-sidebar {
    display: none;
  }
  .sidebar-overlay {
    display: none;
  }
  .profile-main.sidebar-open {
    filter: none;
    pointer-events: auto;
    user-select: auto;
  }
}
</style> 