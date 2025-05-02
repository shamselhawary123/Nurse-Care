<script setup lang="ts">
  import { ref, computed, onMounted, watchEffect } from "vue";
  import { useRouter } from "vue-router";

  defineOptions({
    name: "Header",
  });

  const router = useRouter();
  const isDarkMode = ref(false);
  const user = ref<any>(null);
  const isLoggedIn = ref(false);
  const isNavOpen = ref(false);

  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value;
    document.body.classList.toggle("dark-mode");
  };

  const navigateToLogin = () => {
    router.push("/login");
  };

  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (!token || !userId || userId === "undefined") {
      // Redirect to login or show an error
      router.push("/login");
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
        localStorage.setItem("userId", user.value.data._id);
      }
    } catch (e) {
      user.value = null;
    }
  };

  const checkLogin = () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    console.log("Header checkLogin:", { token, userId });
    isLoggedIn.value = !!token && !!userId && userId !== "undefined";
  };

  const toggleNav = () => {
    isNavOpen.value = !isNavOpen.value;
  };

  const closeNav = () => {
    isNavOpen.value = false;
  };

  onMounted(() => {
    checkLogin();
    fetchUser();
    window.addEventListener("storage", checkLogin);
    window.addEventListener("user-logged-in", () => {
      checkLogin();
      fetchUser();
    });
    console.log("Header mounted, isLoggedIn:", isLoggedIn.value);
  });

  watchEffect(() => {
    checkLogin();
  });
</script>

<template>
  <header class="header">
    <div class="container">
      <!-- Hamburger Icon (Mobile Only) -->
      <button class="hamburger" @click="toggleNav" aria-label="Toggle navigation">
        <span :class="{'open': isNavOpen}"></span>
        <span :class="{'open': isNavOpen}"></span>
        <span :class="{'open': isNavOpen}"></span>
      </button>
      <!-- Icons -->
      <div class="icons">
        <i
          class="fas fa-search cursor-pointer hover:text-primary transition-colors"></i>
        <template v-if="isLoggedIn && user?.data?.personalPhoto">
          <img
            :src="user.data?.personalPhoto"
            alt="User Photo"
            class="user-photo cursor-pointer"
            @click="router.push('/account')" />
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
            style="font-size: 1.3rem; margin-right: 0.5rem"></i>
        </template>
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
      <nav class="nav" :class="{ active: isNavOpen }">
        <router-link to="/" class="nav-link" @click="closeNav">الرئيسية</router-link>
        <router-link to="/about" class="nav-link" @click="closeNav">حول</router-link>
        <router-link to="/services" class="nav-link" @click="closeNav">الخدمات</router-link>
        <router-link to="/contact" class="nav-link" @click="closeNav">اتصل بنا</router-link>
        <router-link
          v-if="isLoggedIn"
          to="/account"
          class="nav-link text-[#007b8f]"
          @click="closeNav"
          >ادارة الحساب</router-link
        >
        <router-link v-else to="/login" class="nav-link" @click="closeNav"
          >تسجيل الدخول</router-link
        >
      </nav>

      <!-- Logo -->
      <div class="logo">
        <img src="/img/logo (3).png" alt="Logo" />
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
    height: 60px;
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

    .hamburger {
      display: flex;
    }
    .icons {
      margin-left: auto;
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
      z-index: 1050;
    }
    .nav.active {
      display: flex;
    }
    .dark-mode .nav {
      background-color: #2d2d2d;
    }
  }

  .user-photo {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #007b8f;
  }

  .hamburger {
    display: none;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
    background: none;
    border: none;
    cursor: pointer;
    z-index: 1100;
    position: absolute;
    right: 1rem;
    top: 1.2rem;
  }
  .hamburger span {
    display: block;
    width: 28px;
    height: 3px;
    margin: 4px 0;
    background: #333;
    border-radius: 2px;
    transition: 0.3s;
  }
  .hamburger span.open:nth-child(1) {
    transform: translateY(7px) rotate(45deg);
  }
  .hamburger span.open:nth-child(2) {
    opacity: 0;
  }
  .hamburger span.open:nth-child(3) {
    transform: translateY(-7px) rotate(-45deg);
  }
</style>
