<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from "vue";
  import { useRouter } from "vue-router";
  import { CountUp } from "countup.js";
  import { Swiper, SwiperSlide } from 'swiper/vue';
  import { Autoplay, EffectFade } from 'swiper/modules';
  import 'swiper/css';
  import 'swiper/css/effect-fade';
  import axios from 'axios';

  interface Nurse {
    _id: string;
    firstName: string;
    lastName: string;
    personalPhoto: string;
    address: string;
    averageRating: number;
    reviewsCount: number;
  }

  const router = useRouter();
  const currentSlide = ref(0);
  const maxSlides = ref(8); // Total number of slides
  const statsRef = ref<HTMLElement | null>(null);
  const statsVisible = ref(false);
  const audio = ref<HTMLAudioElement | null>(null);
  const audioPlayed = ref(false);

  defineOptions({
    name: "Home",
  });

  const contactForm = ref({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });

  const services = ref([
    {
      id: 1,
      title: "رعاية الأم والطفل حديث الولادة",
      description: "دعم للأمهات والأطفال حديثي الولادة",
      image: "/img/رعاية الام و الاطفال حديثى الولاده.png",
      link: "/services/رعاية-الأم-والطفل-حديث-الولادة",
    },
    {
      id: 2,
      title: "الخدمات التمريضية العامة",
      description: "إعطاء الحقن والعلاجات اليومية",
      image: "/img/الرعايه العامه.png",
      link: "/services/الخدمات-التمريضية-العامة",
    },
    {
      id: 4,
      title: "رعاية المسنين",
      description: "رعاية شاملة للمسنين",
      image: "/img/رعاية المسنين.png",
      link: "/services/رعاية-المسنين",
    },
    {
      id: 5,
      title: "التعافي بعد الجراحة",
      description: "دعم ما بعد العملية لضمان التعافي السريع",
      image: "/img/التعافي بعد الجراحه.png",
      link: "/services/التعافي-بعد-الجراحة",
    },
    {
      id: 6,
      title: "العلاج الطبيعي وإعادة التأهيل",
      description: "جلسات العلاج الطبيعي المنزلية",
      image: "/img/العلاج الطبيعي.png",
      link: "/services/العلاج-الطبيعي-وإعادة-التأهيل",
    },
    {
      id: 7,
      title: "سحب عينات",
      description: "خدمة سحب العينات المنزلية بأحدث الأساليب",
      image: "/img/سحب عينه.png",
      link: "/services/سحب-عينات",
    },
    {
      id: 8,
      title: "تمريض قرح",
      description: "رعاية متخصصة لقرح الفراش والقرح المزمنة",
      image: "/img/تمريض قرح.png",
      link: "/services/تمريض-قرح",
    },
    {
      id: 9,
      title: "تمريض الجروح",
      description: "عناية احترافية بالجروح وتغيير الضمادات",
      image: "/img/تمريض جروح صح.png",
      link: "/services/تمريض-الجروح",
    },
  ]);

  const topRatedNurses = ref<Nurse[]>([]);
  const featuredServices = ref<any[]>([]);
  const nursesLoading = ref(true);
  const nursesError = ref<string | null>(null);

  const fetchHomepageData = async () => {
    // Fetch featured services (still static)
    featuredServices.value = services.value.slice(0, 3);

    // Fetch top-rated nurses
    try {
      nursesLoading.value = true;
      nursesError.value = null;
      const response = await axios.get('/api/v1/users/nurses?sort=-averageRating&limit=3');
      if (response.data && response.data.status === 'success') {
        topRatedNurses.value = response.data.data;
      }
    } catch (err) {
      console.error("Failed to fetch top-rated nurses:", err);
      nursesError.value = 'لا يمكن تحميل الممرضين الأعلى تقييمًا.';
    } finally {
      nursesLoading.value = false;
    }
  };

  const navigateToNurseList = () => {
    router.push("/nurse-list");
  };

  const handleContactSubmit = (e: Event) => {
    e.preventDefault();
    console.log("Contact form submitted:", contactForm.value);
    // Reset form
    contactForm.value = {
      firstName: "",
      lastName: "",
      email: "",
      message: "",
    };
  };

  // Stats data
  const stats = ref([
    { value: 98, suffix: "%", label: "رضا العملاء", color: "bg-blue-500" },
    { value: 15, suffix: "+", label: "سنة من الخبرة", color: "bg-green-500" },
    { value: 500, suffix: "+", label: "ممرضون متاحون", color: "bg-purple-500" },
    {
      value: 10000,
      suffix: "+",
      label: "منازل تم خدمتهم",
      color: "bg-orange-500",
    },
  ]);

  // Get icon for each stat
  const getStatIcon = (label: string): string => {
    switch (label) {
      case "رضا العملاء":
        return "fa-smile";
      case "سنة من الخبرة":
        return "fa-clock";
      case "مرضوض متاحون":
        return "fa-user-nurse";
      case "منازل تم خدمتهم":
        return "fa-home";
      default:
        return "fa-chart-bar";
    }
  };

  // Initialize CountUp instances when stats become visible
  const initCounters = () => {
    if (!statsRef.value) return;

    const counters = stats.value.map((stat) => {
      const element = document.getElementById(`counter-${stat.label}`);
      if (!element) return null;

      return new CountUp(element, stat.value, {
        suffix: stat.suffix,
        duration: 2.5,
        enableScrollSpy: true,
        scrollSpyOnce: true,
      });
    });

    counters.forEach((counter) => counter?.start());
  };

  // --- Audio Playback Logic ---
  const playAudio = async () => {
    if (audio.value && !audioPlayed.value) {
      try {
        await audio.value.play();
        audioPlayed.value = true;
        removeInteractionListeners(); // Clean up listeners if autoplay is successful
      } catch (error) {
        console.warn(
          "Audio autoplay was blocked by the browser. Waiting for user interaction."
        );
        // If autoplay fails, set up listeners for the first user interaction
        addInteractionListeners();
      }
    }
  };

  const handleFirstInteraction = () => {
    if (audio.value && !audioPlayed.value) {
      playAudio();
    }
  };

  const addInteractionListeners = () => {
    window.addEventListener("click", handleFirstInteraction, { once: true });
    window.addEventListener("scroll", handleFirstInteraction, { once: true });
    window.addEventListener("keydown", handleFirstInteraction, { once: true });
  };

  const removeInteractionListeners = () => {
    window.removeEventListener("click", handleFirstInteraction);
    window.removeEventListener("scroll", handleFirstInteraction);
    window.removeEventListener("keydown", handleFirstInteraction);
  };

  let audioTimeout: number;

  // Intersection Observer setup
  onMounted(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            statsVisible.value = true;
            initCounters();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (statsRef.value) {
      observer.observe(statsRef.value);
    }

    fetchHomepageData();

    // Start the automatic slideshow
    const slideInterval = setInterval(() => {
      nextSlide();
    }, 5000);

    // --- Audio Setup ---
    // Note: Please create an `/public/audio/` directory and add your audio file.
    // I am using 'background-music.mp3' as a placeholder.
    audio.value = new Audio("/audio/the best.mp3");
    audio.value.volume = 0.35; // Set a low volume
    audio.value.loop = false; // Play only once

    // Wait 3 seconds before trying to play the audio
    audioTimeout = window.setTimeout(playAudio, 3000);

    // Clean up on component unmount
    onUnmounted(() => {
      clearInterval(slideInterval);
      observer.disconnect();

      // Audio cleanup
      clearTimeout(audioTimeout);
      if (audio.value) {
        audio.value.pause();
        audio.value.src = ""; // Release the audio resource
      }
      removeInteractionListeners(); // Clean up any interaction listeners
    });
  });

  const nextSlide = () => {
    currentSlide.value = (currentSlide.value + 1) % maxSlides.value;
  };

  const prevSlide = () => {
    currentSlide.value =
      (currentSlide.value - 1 + maxSlides.value) % maxSlides.value;
  };

  const goToSlide = (index: number) => {
    currentSlide.value = index;
  };

  const heroSlides = ref([
    {
      img: '/img/7g.jpg',
      title: 'رعاية صحية منزلية عالية الجودة',
      subtitle: 'نحن نقدم رعاية رحيمة وموثوقة في راحة منزلك.'
    },
    {
      img: '/img/hero5.jpg',
      title: 'ممرضون متخصصون في خدمتكم',
      subtitle: 'فريقنا من المهنيين المؤهلين متاح على مدار الساعة.'
    },
    {
      img: '/img/hero4.jpg',
      title: 'راحة البال لك ولأحبائك',
      subtitle: 'نضمن سلامة ورفاهية عملائنا فوق كل شيء.'
    },
    {
      img: '/img/hero1.jpg',
      title: 'راحة البال لك ولأحبائك',
      subtitle: 'نضمن سلامة ورفاهية عملائنا فوق كل شيء.'
    }
  ]);

  const featureCards = ref([
    {
      icon: 'fa-solid fa-users',
      title: 'طاقم طبي متكامل',
      description: 'تمتلك Nurs care أفضل الكوادر ذوي الخبرة والكفاءة من الجنسين، سواء أطباء أو تمريض أو أخصائي علاج طبيعي بالمنزل.',
      link: '#'
    },
    {
      icon: 'fa-solid fa-map-marked-alt',
      title: 'تغطية جغرافية واسعة',
      description: 'Nurs care لديها العديد من الممرضين والأخصائيين والأطباء المتمركزين في معظم محافظات مصر.',
      link: '#'
    },
    {
      icon: 'fa-solid fa-briefcase-medical',
      title: 'معدات طبية بالمنزل',
      description: 'توفر Nurs care أحدث الأجهزة والمعدات الطبية في المنزل، والتعامل معها من خلال كوادر مُدرّبة على أعلى مستوى.',
      link: '#'
    },
    {
      icon: 'fa-solid fa-hand-holding-dollar',
      title: 'أنسب أسعار في مصر',
      description: 'تقدم Nurs care كير أفضل الأسعار في مصر على جميع خدمات الرعاية الطبية المنزلية بما يتناسب مع كل حالة واحتياجاتها.',
      link: '#'
    }
  ]);

  const swiperModules = [Autoplay, EffectFade];
</script>

<template>
  <div class="maincont">
    <section class="hero-container relative">
      <swiper
        :modules="swiperModules"
        :slides-per-view="1"
        :loop="true"
        :effect="'fade'"
        :autoplay="{
          delay: 5000,
          disableOnInteraction: false,
        }"
        class="hero-slider"
      >
        <swiper-slide v-for="(slide, index) in heroSlides" :key="index">
          <div class="slide-background" :style="{ backgroundImage: `url(${slide.img})` }"></div>
          <div class="slide-overlay"></div>
          <div class="slide-content" data-aos="fade-in">
            <h1 class="text-4xl md:text-6xl font-bold mb-4">{{ slide.title }}</h1>
            <p class="text-lg md:text-2xl max-w-3xl " style="color: white;">{{ slide.subtitle }}</p>
          </div>
        </swiper-slide>
      </swiper>

      <!-- Overlapping Feature Cards -->
      <div class="relative container mx-auto px-4">
        <div class="features-grid-container">
          <div
            v-for="(card, index) in featureCards"
            :key="index"
            class="feature-card"
            data-aos="fade-up"
            :data-aos-delay="100 * index"
          >
            <div>
              <div class="card-icon">
                <i :class="card.icon"></i>
              </div>
              <h3 class="card-title">{{ card.title }}</h3>
              <p class="card-description">{{ card.description }}</p>
            </div>
            <button class="card-link" @click="router.push('/contact')">
              تواصل معنا
              <i class="fas fa-chevron-left mr-2"></i>
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="services" data-aos="fade-up">
      <h2 class="section-title" data-aos="fade-up">خدماتنا المتميزة</h2>

      <div class="slider-container">
        <button class="nav-button prev" @click="prevSlide">
          <i class="fas fa-chevron-left"></i>
        </button>
        <div class="services-slider">
          <div
            class="slides-wrapper"
            :style="{
              transform: `translateX(${currentSlide * 12.5}%)`,
            }">
            <div
              v-for="(service, index) in services"
              :key="service.id"
              class="service-slide"
              data-aos="fade-up" :data-aos-delay="100 * index"
              >
              <div class="service-content" @click="router.push(service.link)">
                <div class="service-image">
                  <img :src="service.image" :alt="service.title" />
                </div>
                <h3>{{ service.title }}</h3>
                <p>{{ service.description }}</p>
                <button class="view-more">تعرف على المزيد</button>
              </div>
            </div>
          </div>
        </div>

        <button class="nav-button next" @click="nextSlide">
          <i class="fas fa-chevron-left"></i>
        </button>
      </div>

      <div class="slider-dots">
        <button
          v-for="index in maxSlides"
          :key="index - 1"
          :class="['dot', { active: currentSlide === index - 1 }]"
          @click="goToSlide(index - 1)"></button>
      </div>
    </section>

    <!-- Top Rated Section -->
    <section class="top-rated-section bg-background-soft py-16">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-text-primary">أبرز مقدمي الرعاية والخدمات</h2>
          <p class="text-text-secondary mt-2">استكشف خدماتنا الأكثر طلباً وممرضينا الأعلى تقييماً</p>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <!-- Services Column -->
          <div class="space-y-6" data-aos="fade-left">
            <div
              v-for="service in featuredServices"
              :key="service.id"
              class="bg-surface rounded-lg shadow-md overflow-hidden p-5 flex items-center gap-5 transition-transform duration-300 hover:-translate-y-1 border border-border"
              @click="router.push(service.link)"
              style="cursor: pointer;"
            >
              <img :src="service.image" :alt="service.title" class="w-32 h-32 object-cover rounded-md" />
              <div class="flex-grow">
                <h3 class="font-bold text-lg text-text-primary mb-2">{{ service.title }}</h3>
                <p class="text-sm text-text-secondary mb-4">{{ service.description }}</p>
                <button class="btn-primary text-sm" @click.stop="navigateToNurseList">احجز الآن</button>
              </div>
            </div>
          </div>

          <!-- Nurses Column -->
          <div class="space-y-6" data-aos="fade-right">
            <div v-if="nursesLoading" class="text-center text-text-secondary">جاري تحميل الممرضين...</div>
            <div v-else-if="nursesError" class="text-red-500 text-center">{{ nursesError }}</div>
            <div
              v-else
              v-for="nurse in topRatedNurses"
              :key="nurse._id"
              class="bg-surface rounded-lg shadow-sm p-4 flex items-center justify-between transition-all duration-300 hover:shadow-md border border-border cursor-pointer"
              @click="router.push(`/nurse/${nurse._id}`)"
            >
              <div class="text-right">
                <h3 class="font-bold text-lg text-text-primary">{{ nurse.firstName }} {{ nurse.lastName }}</h3>
                <p class="text-sm text-text-secondary mt-1">{{ nurse.address }}</p>
                <div class="flex items-center mt-2">
                  <span class="text-xs text-text-muted ml-2">({{ nurse.reviewsCount || 0 }} تقييم)</span>
                  <div class="stars flex text-yellow-400 gap-1" dir="ltr">
                    <i v-for="star in 5" :key="star" class="fas fa-star" :class="{ 'text-gray-300 dark:text-gray-600': star > nurse.averageRating }"></i>
                  </div>
                </div>
              </div>
              <img 
                :src="nurse.personalPhoto" 
                :alt="nurse.firstName" 
                class="w-20 h-20 rounded-full object-cover border-4 border-primary" 
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Video Section -->
    <div class="video-wrapper" data-aos="fade-up">
      <video
        src="/videos/test.mp4"
        controls
        poster=""
        style="width: 100%; border-radius: 1rem; box-shadow: 0 8px 24px rgba(0,0,0,0.1);"
      ></video>
    </div>

    <div class="contact-container" data-aos="fade-up">
      <div class="text">
        <h2>تحتاج إلى مساعدة؟ نحن هنا للمساعدة</h2>
        <p>اتصل بنا عبر الهاتف أو البريد الإلكتروني أو واتساب لأي استفسارات.</p>
      </div>
      <form class="contact-form" @submit="handleContactSubmit">
        <div class="input-group">
          <input
            type="text"
            v-model="contactForm.firstName"
            placeholder="الاسم الأول"
            required />
          <input
            type="text"
            v-model="contactForm.lastName"
            placeholder="اسم العائلة"
            required />
        </div>
        <input
          type="email"
          v-model="contactForm.email"
          placeholder="البريد الإلكتروني"
          required />
        <textarea
          v-model="contactForm.message"
          placeholder="نص توضيحي"
          required></textarea>
        <button type="submit">إرسال</button>
      </form>
    </div>

    <section
      ref="statsRef"
      class="stats-section py-16 bg-gradient-to-b from-white to-gray-50">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center text-gray-800 mb-12" data-aos="fade-up">
          إحصائياتنا
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div
            v-for="(stat, index) in stats"
            :key="stat.label"
            class="stat-card transform transition-all duration-300 hover:scale-105"
            data-aos="fade-up" :data-aos-delay="100 * (index+1)"
            >
            <div class="p-6 rounded-xl bg-white shadow-lg">
              <div class="flex items-center justify-center mb-4">
                <div
                  :class="[
                    stat.color,
                    'w-16 h-16 rounded-full flex items-center justify-center',
                  ]">
                  <span class="text-2xl text-white">
                    <i :class="getStatIcon(stat.label)" class="fas"></i>
                  </span>
                </div>
              </div>
              <div class="text-center">
                <div class="text-4xl font-bold text-gray-800 mb-2">
                  <span :id="'counter-' + stat.label">0</span>
                </div>
                <p class="text-gray-600">{{ stat.label }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
  /* General Reset */
  body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f8f9fa;
  }

  .maincont {
    direction: rtl;
  }

  /* Hero Section */
  .hero-container {
    height: 100vh;
    max-height: 800px;
    position: relative;
    overflow: hidden;
  }

  .hero-slider {
    height: 100%;
  }

  .slide-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
  }

  .slide-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
  }

  .slide-content {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    text-align: center;
    color: white;
    padding: 1rem;
  }

  .slide-content h1,
  .slide-content p {
    text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.7);
  }

  /* Overlapping Feature Cards */
  .features-grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translate(-50%, 50%);
    width: 90%;
    max-width: 1200px;
    z-index: 20;
  }
  .features-grid-container .feature-card:hover {
    transform: translateY(-160px);
    box-shadow: 0 6px 20px rgba(0, 123, 143, 0.15);
  
  }

  .feature-card {
    background: linear-gradient(145deg, #007b8f, #005f6b);
    color: white;
    border-radius: 0.75rem;
    padding: 2.5rem 1.5rem;
    text-align: center;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .feature-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 35px rgba(0, 0, 0, 0.15);
  }

  .card-icon {
    font-size: 3.5rem;
    color: white;
    margin-bottom: 1.5rem;
    line-height: 1;
  }

  .card-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: white;
  }

  .card-description {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.85);
    line-height: 1.7;
    margin-bottom: 1.5rem;
  }

  .card-link {
    color: white;
    font-weight: 600;
    text-decoration: none;
    transition: color 0.3s ease;
    align-self: center;
    display: inline-flex;
    align-items: center;
  }

  .card-link:hover {
    color: #cceeff;
  }

  /* Adjustments for Services section to account for overlapping cards */
  .services {
    padding-top: 220px; /* Adjust this value based on card height */
    padding-bottom: 50px;
    padding-left: 20px;
    padding-right: 20px;
  }

  .section-title {
    font-size: 2.5rem;
    font-weight: bold;
    text-align: center;
    color: #007b8f;
    margin-bottom: 3rem;
  }

  .slider-container {
    position: relative;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 60px;
    overflow: hidden;
  }

  .services-slider {
    overflow: hidden;
    position: relative;
    padding: 20px 0;
    margin: 0 -15px;
    width: 100%;
  }

  .slides-wrapper {
    display: flex;
    transition: transform 0.5s ease;
    width: 800%; /* 8 slides * 100% */
  }

  .service-slide {
    flex: 0 0 12.5%; /* 100% / 8 slides */
    min-width: 12.5%;
    padding: 0 15px;
    box-sizing: border-box;
  }

  .service-content {
    background: white;
    border-radius: 20px;
    padding: 30px;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
    cursor: pointer;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  /* .service-content:hover {
    transform: translateY(-10px);
  } */
  /* we are good men */
  .service-image {
    width: 150px;
    height: 150px;
    margin: 0 auto 20px;
    border-radius: 50%;
    overflow: hidden;
    border: 4px solid #007b8f;
  }

  .service-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .service-content h3 {
    font-size: 1.5rem;
    color: #007b8f;
    margin-bottom: 15px;
    min-height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .service-content p {
    color: #666;
    line-height: 1.6;
    margin-bottom: 20px;
    flex-grow: 1;
  }

  .view-more {
    background-color: #007b8f;
    color: white;
    padding: 10px 25px;
    border-radius: 25px;
    border: none;
    font-size: 1rem;
    transition: all 0.3s ease;
  }

  .view-more:hover {
    background-color: #49a8d3;
    transform: translateY(-2px);
  }

  .nav-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: #007b8f;
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    z-index: 2;
  }

  .nav-button:hover {
    background: #49a8d3;
    transform: translateY(-50%) scale(1.1);
  }

  .prev {
    left: 0;
  }

  .next {
    right: 0;
  }

  .slider-dots {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 30px;
  }

  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #ccc;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .dot.active {
    background: #007b8f;
    transform: scale(1.2);
  }

  /* BookService Section */
  .BookService {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .btn-primary {
    background-color: var(--color-primary);
    color: white;
    padding: 8px 16px;
    border-radius: 6px;
    font-weight: 500;
    transition: background-color 0.3s;
  }
  .btn-primary:hover {
    background-color: var(--color-primary-hover);
  }

  .BookService-card {
    display: flex;
    background-color: #e9f1f6;
    border-radius: 10px;
    overflow: hidden;
    width: 68%;
    align-items: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
  }

  .BookService-card:hover {
    transform: translateY(-5px);
  }

  .BookService-card .first-image {
    width: 150px;
    /* width: 100px; */
    /* height: 100px; */
    height: 100%;
    object-fit: cover;
    border-radius: 10px;
  }

  .BookService-info {
    padding: 15px;
    text-align: right;
    flex: 1;
  }

  .BookService-info h3 {
    margin: 0;
    font-size: 18px;
    font-weight: bold;
    color: #007b8f;
  }

  .BookService-info p {
    margin: 5px 0;
    color: #555;
    font-size: 14px;
  }

  .btn {
    background-color: #007b8f;
    color: white;
    padding: 8px 12px;
    border-radius: 16px;
    cursor: pointer;
    font-size: 14px;
    margin-top: 10px;
  }

  .btn:hover {
    transition: background 0.3s;
    background-color: #005f6b;
    color: white;
  }

  .rate {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    /* padding: 20px; */
    background-color: #ffffff;
    border-radius: 10%;
    /* border-radius: 50%; */
    width: 200px;
    height: 200px;
    box-shadow: 0 4px 15px rgba(0, 123, 143, 0.1);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .rate:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 20px rgba(0, 123, 143, 0.15);
  }

  .nurse-profile {
    display: flex;
    flex-direction: column;
    align-items: center;
    /* gap: 12px; */
    width: 100%;
  }

  .nurse-photo {
    width: 115px;
    height: 115px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid #007b8f;
    box-shadow: 0 2px 8px rgba(0, 123, 143, 0.2);
    transition: all 0.3s ease;
  }

  .nurse-photo:hover {
    transform: scale(1.05);
    border-color: #49a8d3;
  }

  .rating-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    /* gap: 6px; */
    text-align: center;
  }

  .rating-info h3 {
    color: #007b8f;
    /* font-size: 1.1rem; */
    font-weight: 600;
    margin: 0;
  }

  .rating-info p {
    color: #666;
    font-size: 0.9rem;
    margin: 0;
  }

  .stars {
    display: flex;
    gap: 4px;
    margin: 4px 0;
  }

  .stars i {
    font-size: 1rem;
    transition: all 0.3s ease;
  }

  .stars i:hover {
    transform: scale(1.2);
  }

  .rating-text {
    font-size: 0.85rem;
    color: #666;
    background-color: #f0f9fb;
    padding: 4px 8px;
    border-radius: 12px;
    margin-top: 4px;
  }

  /* Contact Section */
  .contact-container {
    width: 58%;
    margin: 50px auto;
    padding: 30px;
    border-radius: 10px;
  }

  .contact-container .text {
    text-align: center;
  }

  h2 {
    font-size: 24px;
    font-weight: bold;
  }

  p {
    font-size: 16px;
    color: #666;
    margin-bottom: 20px;
  }

  .contact-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .input-group {
    display: flex;
    gap: 10px;
  }

  .input-group input {
    width: 50%;
  }

  input,
  textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 16px;
    background-color: #f1f5f9;
    font-size: 16px;
  }

  textarea {
    height: 100px;
    resize: none;
  }

  .contact-form button {
    width: 100px;
    padding: 10px;
    background-color: #1b7da5;
    color: white;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    font-size: 18px;
    transition: background 0.3s;
    margin: auto;
  }

  .contact-form button:hover {
    background-color: #005f6b;
  }

  /* Stats Section */
  .stats-section {
    direction: rtl;
  }

  .stat-card {
    transition: all 0.3s ease;
  }

  .stat-card:hover {
    transform: translateY(-5px);
  }

  /* Video Section */
  .video-wrapper {
    max-width: 800px;
    margin: 3rem auto;
    padding: 0 1rem;
  }

  @media (max-width: 992px) {
    .features-grid-container {
      position: relative;
      transform: none;
      left: auto;
      bottom: auto;
      width: 100%;
      margin-top: -80px; /* Pulls it up slightly */
      padding: 1rem;
    }

    .services {
      padding-top: 2rem;
    }

    .hero-container {
      height: 70vh;
    }
  }

  @media (max-width: 768px) {
    .contact-container {
      width: 90%;
    }

    .input-group {
      flex-direction: column;
    }

    .input-group input {
      width: 100%;
    }

    .stats-section {
      padding: 3rem 1rem;
    }

    .slider-container {
      padding: 0 40px;
    }

    .service-content {
      padding: 20px;
    }

    .service-image {
      width: 120px;
      height: 120px;
    }

    .section-title {
      font-size: 2rem;
      margin-bottom: 2rem;
    }

    .service-content h3 {
      font-size: 1.2rem;
      min-height: 48px;
    }

    .slides-wrapper {
      width: 800%; /* Keep full width for all slides */
    }

    .service-slide {
      flex: 0 0 12.5%;
      min-width: 12.5%;
    }

    .BookService-card {
      flex-direction: column;
      width: 90%;
    }

    .BookService-card img {
      width: 100%;
      height: 200px;
      border-radius: 10px 10px 0 0;
    }

    .rate {
      width: 180px;
      height: 180px;
      padding: 15px;
    }

    .nurse-photo {
      width: 90px;
      height: 90px;
    }

    .rating-info h3 {
      font-size: 1rem;
    }

    .rating-info p {
      font-size: 0.8rem;
    }

    .stars i {
      font-size: 0.9rem;
    }
  }
</style>
