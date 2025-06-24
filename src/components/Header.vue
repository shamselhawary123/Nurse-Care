<script setup lang="ts">
  import { ref, onMounted, watchEffect } from "vue";
  import { useRouter } from "vue-router";

  interface Notification {
    _id: string;
    message: string;
    read: boolean;
    // Add other fields if needed
  }

  defineOptions({
    name: "Header",
  });

  const router = useRouter();
  const isDarkMode = ref(false);
  const user = ref<any>(null);
  const isLoggedIn = ref(false);
  const isNavOpen = ref(false);
  const notifications = ref<Notification[]>([]);
  const unreadCount = ref(0);
  const showDropdown = ref(false);

  const toggleDarkMode = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    isDarkMode.value = isDark;
    localStorage.setItem("theme", isDark ? "dark" : "light");
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

  const fetchNotifications = async () => {
    // Example: fetch notifications from your API
    const token = localStorage.getItem("token");
    const res = await fetch("/api/v1/notifications", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      notifications.value = data.notifications || [];
      unreadCount.value = notifications.value.filter((n) => !n.read).length;
      console.log("Fetched notifications:", notifications.value);
    }
  };

  const toggleDropdown = (e: MouseEvent) => {
    e.stopPropagation();
    showDropdown.value = !showDropdown.value;
  };

  const openNotification = async (notif: Notification) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/v1/notifications/${notif._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ read: true }),
      });

      if (res.ok) {
        // Refetch notifications to update the list and count
        await fetchNotifications();
      } else {
        const errorData = await res.json();
        console.error("Backend error:", errorData.message);
      }
    } catch (error) {
      console.error("Failed to send update request:", error);
    }

    // Redirect to notifications page
    router.push("/notifications");
    showDropdown.value = false;
  };

  const goToNotifications = () => {
    router.push("/notifications");
    showDropdown.value = false;
  };

  onMounted(() => {
    const savedTheme = localStorage.getItem("theme");
    if (
      savedTheme === "dark" ||
      (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
      isDarkMode.value = true;
    } else {
      document.documentElement.classList.remove("dark");
      isDarkMode.value = false;
    }

    checkLogin();
    fetchUser();
    fetchNotifications();
    window.addEventListener("storage", checkLogin);
    window.addEventListener("user-logged-in", () => {
      checkLogin();
      fetchUser();
    });
    console.log("Header mounted, isLoggedIn:", isLoggedIn.value);
    document.addEventListener("click", () => {
      showDropdown.value = false;
    });
    setInterval(fetchNotifications, 15000); // Poll every 15 seconds
  });

  watchEffect(() => {
    checkLogin();
  });
</script>

<template>
  <header class="header">
    <div class="container">
      <!-- Hamburger Icon (Mobile Only) -->
      <button
        class="hamburger"
        @click="toggleNav"
        aria-label="Toggle navigation">
        <span :class="{ open: isNavOpen }"></span>
        <span :class="{ open: isNavOpen }"></span>
        <span :class="{ open: isNavOpen }"></span>
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
        <div class="notification-wrapper" @click="toggleDropdown">
          <i
            :class="[
              'fa-solid',
              'fa-bell',
              'cursor-pointer',
              unreadCount > 0 ? 'has-unread' : '',
            ]"
            title="الإشعارات"></i>
          <span v-if="unreadCount > 0" class="notification-badge">{{
            unreadCount
          }}</span>
          <div v-if="showDropdown" class="notification-dropdown">
            <div v-if="notifications.length === 0" class="empty">
              لا توجد إشعارات جديدة
            </div>
            <div
              v-for="notif in notifications"
              :key="notif._id"
              class="notification-item"
              :class="{ unread: !notif.read }"
              @click="openNotification(notif)">
              {{ notif.message }}
            </div>
            <div class="see-all" @click="goToNotifications">
              عرض كل الإشعارات
            </div>
          </div>
        </div>
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
        <router-link to="/" class="nav-link" @click="closeNav"
          >الرئيسية</router-link
        >
        <router-link to="/about" class="nav-link" @click="closeNav"
          >حول</router-link
        >
        <router-link to="/services" class="nav-link" @click="closeNav"
          >الخدمات</router-link
        >
        <router-link to="/contact" class="nav-link" @click="closeNav"
          >اتصل بنا</router-link
        >
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
    background-color: var(--color-surface);
    color: var(--color-text-secondary);
    box-shadow: 0 2px 4px var(--shadow-color);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    direction: rtl;
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0.8rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 64px;
  }

  .icons {
    display: flex;
    gap: 1rem;
    align-items: center;
    color: black;
    font-size: 20px;
  }
  .icons .fa-solid:hover,
  .icons .fas:hover {
    color: var(--color-primary);
  }

  .nav {
    display: flex;
    gap: 1.5rem;
  }

  .nav-link {
    /* color: var(--color-text-primary); */
    color: black;
    font-weight: 600;
    transition: color 0.3s;
    font-size: 1rem;
    position: relative;
    padding-bottom: 4px;
  }
  .nav-link:hover {
    color: var(--color-primary);
  }
  .nav-link.router-link-exact-active {
    color: var(--color-primary);
    border-bottom: 2px solid var(--color-primary);
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .logo img {
    height: 66px;
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

  .notification-wrapper {
    position: relative;
    display: inline-block;
  }

  .fa-bell {
    font-size: 1.4rem;
    color: #000000e0;
    transition: color 0.2s;
  }
  .fa-bell.has-unread {
    color: black; /* Highlight color for new notifications */
  }

  .notification-badge {
    position: absolute;
    top: -6px;
    right: -8px;
    background: red;
    color: #fff;
    border-radius: 50%;
    font-size: 0.75rem;
    padding: 2px 6px;
    font-weight: bold;
  }

  .notification-dropdown {
    position: absolute;
    right: 0;
    top: 2.2rem;
    background: #fff;
    min-width: 220px;
    max-width: 320px;
    box-shadow: 0 2px 8px #0002;
    border-radius: 8px;
    z-index: 2000;
    padding: 0.5rem 0;
    max-height: 350px;
    overflow-y: auto;
  }
  .notification-item {
    padding: 0.5rem 1rem;
    cursor: pointer;
    transition: background 0.2s;
  }
  .notification-item.unread {
    background: #f5faff;
    font-weight: bold;
  }
  .notification-item:hover {
    background: #f0f0f0;
  }
  .see-all {
    text-align: center;
    color: #007b8f;
    padding: 0.5rem;
    cursor: pointer;
    border-top: 1px solid #eee;
  }
  .empty {
    text-align: center;
    color: #888;
    padding: 1rem 0;
  }

  @keyframes unreadPulse {
    0% {
      box-shadow: 0 0 0 0 #1b7da540;
    }
    70% {
      box-shadow: 0 0 0 10px #1b7da500;
    }
    100% {
      box-shadow: 0 0 0 0 #1b7da500;
    }
  }
  .notification-item.unread {
    background: #f5faff;
    font-weight: bold;
    animation: unreadPulse 1.2s;
  }
</style>

export default {};
