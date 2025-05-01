<script setup lang="ts">
<<<<<<< HEAD
  import { ref } from "vue";
=======
  import { ref, computed, onMounted, watchEffect } from "vue";
>>>>>>> 0951af5 (profil Up)
  import { useRouter } from "vue-router";

  defineOptions({
    name: "Header",
  });

  const router = useRouter();
  const isDarkMode = ref(false);
<<<<<<< HEAD
=======
  const user = ref<any>(null);
  const isLoggedIn = ref(false);
>>>>>>> 0951af5 (profil Up)

  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value;
    document.body.classList.toggle("dark-mode");
  };

  const navigateToLogin = () => {
    router.push("/login");
  };
<<<<<<< HEAD
=======

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId || userId === 'undefined') {
      // Redirect to login or show an error
      router.push('/login');
      return;
    }
    isLoggedIn.value = true;
    // Example: fetch user info from API
    try {
      const res = await fetch(`/api/v1/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        user.value = await res.json();
        localStorage.setItem('userId', user.value.data._id);
      }
    } catch (e) { user.value = null; }
  };

  const checkLogin = () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    console.log('Header checkLogin:', { token, userId });
    isLoggedIn.value = !!token && !!userId && userId !== 'undefined';
  };

  onMounted(() => {
    checkLogin();
    fetchUser();
    window.addEventListener('storage', checkLogin);
    window.addEventListener('user-logged-in', () => {
      checkLogin();
      fetchUser();
    });
    console.log('Header mounted, isLoggedIn:', isLoggedIn.value);
  });

  watchEffect(() => {
    checkLogin();
  });
>>>>>>> 0951af5 (profil Up)
</script>

<template>
  <header class="header">
    <div class="container">
      <!-- Icons -->
      <div class="icons">
        <i
          class="fas fa-search cursor-pointer hover:text-primary transition-colors"></i>
<<<<<<< HEAD
        <i
          class="fas fa-user cursor-pointer hover:text-primary transition-colors"
          @click="navigateToLogin"></i>
=======
        <template v-if="isLoggedIn && user?.data?.personalPhoto">
          <img :src="user.data?.personalPhoto" alt="User Photo" class="user-photo cursor-pointer" @click="router.push('/account')" />
        </template>
        <template v-else>
          <i
            class="fas fa-user cursor-pointer hover:text-primary transition-colors"
            @click="navigateToLogin"></i>
        </template>
        <!-- Settings icon only when logged in -->
        <template v-if="isLoggedIn">
          <i
            class="fas fa-cog cursor-pointer hover:text-primary transition-colors"
            @click="router.push('/account')"
            title="إعدادات الحساب"
            style="font-size: 1.3rem; margin-right: 0.5rem;"
          ></i>
        </template>
>>>>>>> 0951af5 (profil Up)
        <i
          v-if="!isDarkMode"
          @click="toggleDarkMode"
          class="fa-solid fa-moon cursor-pointer hover:text-primary transition-colors"></i>
        <i
          v-else
          @click="toggleDarkMode"
          class="fa-solid fa-sun cursor-pointer hover:text-primary transition-colors"></i>
      </div>

      <!-- Navigation Menu -->
      <nav class="nav">
        <router-link to="/" class="nav-link">الرئيسية</router-link>
        <router-link to="/about" class="nav-link">حول</router-link>
        <router-link to="/services" class="nav-link">الخدمات</router-link>
        <router-link to="/contact" class="nav-link">اتصل بنا</router-link>
<<<<<<< HEAD
        <router-link to="/login" class="nav-link">تسجيل الدخول</router-link>
=======
        <router-link v-if="isLoggedIn" to="/account" class="nav-link text-[#007b8f]">ادارة الحساب</router-link>
        <router-link v-else to="/login" class="nav-link">تسجيل الدخول</router-link>
>>>>>>> 0951af5 (profil Up)
      </nav>

      <!-- Logo -->
      <div class="logo">
        <img src="/img/logo.png" alt="Logo" />
      </div>
    </div>
  </header>
</template>

<style scoped>
  .header {
    background-color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    direction: rtl;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .icons {
    display: flex;
    gap: 1.5rem;
    font-size: 1.25rem;
  }
  .icons i:hover {
    color: var(--primary-color, #1b7da5);
  }

  .nav {
    display: flex;
    gap: 2rem;
  }

  .nav-link {
    text-decoration: none;
    color: #333;
    font-weight: 500;
    transition: color 0.3s ease;
  }

  .nav-link:hover,
  .nav-link.router-link-active {
    color: var(--primary-color, #1b7da5);
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .logo img {
    height: 40px;
    width: auto;
  }

  /* Dark mode styles */
  :root {
    --primary-color: #1b7da5;
  }

  .dark-mode {
    background-color: #1a1a1a;
    color: #ffffff;
  }

  .dark-mode .header {
    background-color: #2d2d2d;
  }

  .dark-mode .nav-link {
    color: #ffffff;
  }

  .dark-mode .nav-link:hover,
  .dark-mode .nav-link.router-link-active {
    color: var(--primary-color);
  }

  /* Responsive styles */
  @media (max-width: 768px) {
    .container {
      padding: 1rem;
    }

    .nav {
      display: none;
      position: absolute;
      top: 100%;
      right: 0;
      left: 0;
      background-color: white;
      padding: 1rem;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .nav.active {
      display: flex;
    }

    .dark-mode .nav {
      background-color: #2d2d2d;
    }
  }
<<<<<<< HEAD
=======

  .user-photo {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #007b8f;
  }
>>>>>>> 0951af5 (profil Up)
</style>
