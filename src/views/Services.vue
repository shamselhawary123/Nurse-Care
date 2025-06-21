<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import io, { Socket } from 'socket.io-client';
import { useToast } from 'vue-toastification';

const router = useRouter();
const toast = useToast();

const navigateToService = (title: string) => {
  const slug = title.replace(/ /g, '-');
  router.push(`/services/${slug}`);
};

const services = ref([
  {
    id: 1,
    title: 'رعاية الأم والطفل حديث الولادة',
    description: 'نوفر دعمًا شاملاً ورعاية متخصصة للأمهات والأطفال حديثي الولادة لضمان صحتهم وسلامتهم خلال الفترة الأولى الحاسمة.',
    image: '/img/رعاية الام و الاطفال حديثى الولاده.png',
    icon: '/img/1g.png'
  },
  {
    id: 2,
    title: 'الخدمات التمريضية العامة',
    description: 'نقدم خدمات تمريضية منزلية متنوعة تشمل إعطاء الحقن، ومتابعة العلامات الحيوية، والعناية اليومية بالمرضى.',
    image: '/img/الرعايه العامه.png',
    icon: '/img/2g.png'
  },
  {
    id: 4,
    title: 'رعاية المسنين بالمنزل',
    description: 'نُقدم خدمة رعاية كبار السن في المنزل من خلال نُخبة من المتخصصين (ذكور/إناث) في التعامل مع كبار السن الذين يوفرون الرعاية الصحية والنفسية لهم.',
    image: '/img/رعاية المسنين.png',
    icon: '/img/3g.png'
  },
  {
    id: 5,
    title: 'التعافي بعد الجراحة',
    description: 'نوفر رعاية متخصصة للمرضى بعد العمليات الجراحية، مع متابعة دقيقة للجروح وتقديم الدعم اللازم لتعافٍ سريع.',
    image: '/img/التعافي بعد الجراحه.png',
    icon: '/img/4g (1).png'
  },
  {
    id: 6,
    title: 'العلاج الطبيعي بالمنزل',
    description: 'نوفر جلسات علاج طبيعي في المنزل على يد أفضل أخصائيي العلاج الطبيعي في مصر (ذكور/إناث) الذين يستخدمون أحدث الأساليب والأجهزة في العلاج الطبيعي.',
    image: '/img/العلاج الطبيعي.png',
    icon: '/img/5g.png'
  },
  {
    id: 7,
    title: 'سحب العينات بالمنزل',
    description: 'نوفر خدمة سحب العينات المخبرية من المنزل بسهولة ويسر، مع ضمان دقة النتائج وسرعة توصيلها.',
    image: '/img/تمريض سحب عينات.png',
    icon: '/img/6g.png'
  },
  {
    id: 8,
    title: 'العناية بقرح الفراش',
    description: 'نقدم رعاية متقدمة ومتخصصة لعلاج قرح الفراش والوقاية منها، باستخدام أحدث المواد والتقنيات الطبية.',
    image: '/img/تمريض قرح.png',
    icon: '/img/7g.jpg'
  },
  {
    id: 9,
    title: 'العناية بالجروح',
    description: 'يقوم فريقنا من الممرضين المحترفين بالعناية بالجروح المختلفة، بما في ذلك تغيير الضمادات وتقييم حالة الجرح.',
    image: '/img/تمريض جروح صح.png',
    icon: '/img/a1.png'
  }
]);

const features = ref([
  {
    id: 1,
    title: 'ممرضون متقدمون - محترفون',
    description: 'مدربون تدريباً عالياً',
    icon: 'fa-solid fa-user-nurse'
  },
  {
    id: 2,
    title: 'جدولة مرنة',
    description: 'رعاية تناسب روتينك',
    icon: 'fa-solid fa-calendar-check'
  },
  {
    id: 3,
    title: 'تواجد على مدار الساعة',
    description: 'نحن هنا دائماً عندما تحتاج إلينا',
    icon: 'fa-solid fa-clock'
  },
  {
    id: 4,
    title: 'أسعار معقولة',
    description: 'خدمات بأسعار في متناول الجميع',
    icon: 'fa-solid fa-hand-holding-dollar'
  },
  {
    id: 5,
    title: 'مكافحة العدوى',
    description: 'بروتوكولات صارمة للنظافة والسلامة',
    icon: 'fa-solid fa-shield-virus'
  },
  {
    id: 6,
    title: 'موثوق به',
    description: 'موثوق به من قبل العائلات',
    icon: 'fa-solid fa-heart'
  }
]);

interface Patient {
  _id: string;
  name: string;
  personalPhoto: string;
}

interface Request {
  _id: string;
  patient: Patient;
  description: string;
  status: string;
}

const requests = ref<Request[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const fetchRequests = async () => {
  try {
    loading.value = true;
    const token = localStorage.getItem('token');
    const res = await axios.get('/api/v1/request/received', {
      headers: { Authorization: `Bearer ${token}` },
    });
    requests.value = res.data.data;
  } catch (err: any) {
    error.value = 'حدث خطأ أثناء جلب الطلبات';
  } finally {
    loading.value = false;
  }
};

const handleAction = async (requestId: string, action: 'accept' | 'reject') => {
  try {
    const token = localStorage.getItem('token');
    await axios.put(`/api/v1/request/${requestId}/${action}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (action === 'reject') {
      requests.value = requests.value.filter((req) => req._id !== requestId);
    } else {
      fetchRequests();
    }
  } catch (err) {
    alert('حدث خطأ أثناء تحديث الطلب');
  }
};

let notificationSocket: Socket | null = null;
const audio = ref<HTMLAudioElement | null>(null);
let audioTimeout: ReturnType<typeof setTimeout> | null = null;

onMounted(() => {
  fetchRequests();
  const userId = localStorage.getItem('userId');
  notificationSocket = io('/notifications');
  if (userId && notificationSocket) {
    notificationSocket.emit('join', userId);
    notificationSocket.on('request_rejected', (data: { requestId: string; message: string }) => {
      toast.error(data.message);
      // Optionally, update the UI to reflect the rejection
    });
  }

  audioTimeout = setTimeout(() => {
    audio.value = new Audio('/audio/الخدمات2.mp3');
    const playPromise = audio.value.play(); 

    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.error("Audio play was prevented:", error);
        // Autoplay was prevented. This is a common browser policy.
        // The sound will not play until the user interacts with the page.
      });
    }
  }, 1000);
});

onUnmounted(() => {
  if (notificationSocket) {
    notificationSocket.disconnect();
  }
  
  if (audioTimeout) {
    clearTimeout(audioTimeout);
  }

  if (audio.value) {
    audio.value.pause();
    audio.value.src = '';
  }
});
</script>

<template>
  <div class="services-page">
    <!-- Services Section -->
    <section class="services-section bg-gray-50 py-16">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-800" data-aos="fade-up">خدمات Nurse-Care</h1>
          <div class="w-24 h-1 bg-cyan-600 mx-auto mt-4"></div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <div v-for="(service, index) in services" :key="service.id" 
               class="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transition-transform duration-300 hover:-translate-y-2" 
               data-aos="fade-up" :data-aos-delay="100 * index">
            
            <div class="relative">
              <img :src="service.image" :alt="service.title" class="w-full h-56 object-cover">
              <div class="absolute top-4 left-4">
                <img src="/img/logo (3).png" alt="Logo" class="w-24 bg-white p-2 rounded-lg shadow-md">
              </div>
              <div class="absolute -bottom-8 left-1/2 -translate-x-1/2">
                <div class="bg-cyan-600 rounded-full border-4 border-white shadow-lg" style="padding: 0.3rem;">
                   <img :src="service.icon" :alt="service.title + ' icon'" class="w-16 h-16 object-cover rounded-full">
                </div>
              </div>
            </div>

            <div class="p-6 pt-12 flex-grow flex flex-col text-center">
              <h3 class="text-2xl font-bold text-gray-800 mb-3">{{ service.title }}</h3>
              <p class="text-gray-600 text-base leading-relaxed flex-grow">{{ service.description }}</p>
              
              <div class="mt-6 space-y-3">
                <button @click="$router.push('/nurse-list')" class="w-full bg-cyan-600 text-white py-3 rounded-lg font-semibold hover:bg-cyan-700 transition-colors text-lg">
                  اطلب/استفسر عن الخدمة
                </button>
                <button @click="navigateToService(service.title)" class="w-full text-cyan-600 font-semibold hover:text-cyan-800 transition-colors text-lg">
                  معلومات عن الخدمة
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Why Choose Us Section -->
    <section class="why-choose-us bg-gray-50">
      <div class="container mx-auto px-4 py-12">
        <h2 class="text-3xl font-bold text-center mb-12" data-aos="fade-up">لماذا تختار الرعاية المنزلية؟</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="(feature, index) in features" :key="feature.id" class="feature-card" data-aos="fade-up" :data-aos-delay="100 * index">
            <div class="text-center mb-4">
              <i :class="feature.icon" class="text-4xl text-primary"></i>
            </div>
            <h3 class="text-xl font-semibold text-center mb-2">{{ feature.title }}</h3>
            <p class="text-gray-600 text-center">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.services-page {
  direction: rtl;
}

.feature-card {
  background: white;
  border-radius: 0.5rem;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.text-primary {
  color: #007b8f;
}

@media (prefers-color-scheme: dark) {
  .services-page {
    background-color: #f8fafc;
  }

  .feature-card {
    background-color: white;
  }

  h1, h2, h3 {
    color: #333;
  }

  p {
    color: #666;
  }
}
</style> 