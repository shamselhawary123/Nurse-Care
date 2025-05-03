<script setup lang="ts">
  import { ref, onMounted, onUnmounted, computed } from "vue";
  import { useRoute } from "vue-router";
  import axios from "axios";

  interface Nurse {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    personalPhoto: string;
    role: string;
    specialty: {
      _id: string;
      name: string;
    } | null;
    isActive: boolean;
    address: string;
    aboutMe: string | null;
  }

  interface Review {
    _id: string;
    title: string;
    ratings: number;
    user: { name: string };
    nurse: { firstName: string; lastName: string };
    createdAt: string;
  }

  const route = useRoute();
  const nurse = ref<Nurse | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);
  const reviews = ref<Review[]>([]);
  const newReview = ref<{ title: string; ratings: number }>({
    title: "",
    ratings: 0,
  });
  const isSubmitting = ref(false);

  const isLoggedIn = computed(() => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("token");
    }
    return false;
  });

  const fetchNurseDetails = async () => {
    try {
      loading.value = true;
      const response = await axios.get(
        `/api/v1/users/nurses/${route.params.id}`
      );

      console.log("Response:", response.data);

      if (response.data.success) {
        nurse.value = response.data.data;
        console.log("Nurse Data:", nurse.value); // Debug log
      } else {
        error.value = "فشل في جلب بيانات الممرض";
      }
    } catch (err: any) {
      console.error("Error fetching nurse details:", err);
      error.value = "حدث خطأ أثناء جلب بيانات الممرض";
    } finally {
      loading.value = false;
    }
  };

  const fetchReviews = async () => {
    const res = await axios.get(`/api/v1/reviews/nurse/${route.params.id}`);
    reviews.value = res.data.data;
  };

  const submitReview = async () => {
    isSubmitting.value = true;
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `/api/v1/reviews/nurse/${route.params.id}`,
        newReview.value,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      newReview.value = { title: "", ratings: 0 };
      fetchReviews();
    } catch (e) {
      alert("حدث خطأ أثناء إرسال التقييم");
    }
    isSubmitting.value = false;
  };

  onMounted(() => {
    fetchNurseDetails();
    fetchReviews();

    // Listen for aboutMe updates
    window.addEventListener("aboutme-updated", ((event: CustomEvent) => {
      if (event.detail.userId === route.params.id) {
        if (nurse.value) {
          nurse.value.aboutMe = event.detail.aboutMe;
        }
      }
    }) as EventListener);
  });

  // Clean up event listener
  onUnmounted(() => {
    window.removeEventListener("aboutme-updated", ((event: CustomEvent) => {
      if (event.detail.userId === route.params.id) {
        if (nurse.value) {
          nurse.value.aboutMe = event.detail.aboutMe;
        }
      }
    }) as EventListener);
  });
</script>

<template>
  <!-- <pre>{{ nurse }}</pre> -->

  <div class="nurse-list-page">
    <div class="container mx-auto px-4 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="loading-spinner"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12 text-red-500">
        {{ error }}
      </div>

      <!-- Nurse Profile -->
      <div
        v-else-if="nurse"
        class="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div class="flex flex-col md:flex-row gap-8">
          <!-- Nurse Image -->
          <div class="flex-shrink-0">
            <img
              :src="nurse.personalPhoto"
              :alt="nurse.firstName + ' ' + nurse.lastName"
              class="w-48 h-48 rounded-full border-4 border-primary object-cover" />
          </div>

          <!-- Nurse Info -->
          <div class="flex-grow">
            <h1 class="text-3xl font-bold text-primary mb-4">
              {{ nurse.firstName }} {{ nurse.lastName }}
            </h1>

            <div class="specialties mb-6">
              <h2 class="text-xl font-semibold mb-2">التخصص:</h2>
              <div class="flex flex-wrap gap-2">
                <span v-if="nurse?.specialty?.name" class="specialization-tag">
                  {{ nurse.specialty.name || nurse.specialty._id }}
                </span>
                <span v-else class="text-gray-500">لا يوجد تخصص محدد</span>
              </div>
            </div>

            <div class="aboutMe mb-6">
              <h2 class="text-xl font-semibold mb-2">
                المعلومات الشخصية عن الممرض :
              </h2>
              <p v-if="nurse?.aboutMe" class="text-gray-600 leading-relaxed">
                {{ nurse.aboutMe }}
              </p>
              <p v-else class="text-gray-500">لا يوجد وصف شخصي</p>
            </div>

            <div class="contact-info space-y-4">
              <div class="detail-item">
                <i class="fas fa-map-marker-alt text-primary"></i>
                <span>{{ nurse.address }}</span>
              </div>
              <div class="detail-item">
                <i class="fas fa-envelope text-primary"></i>
                <span>{{ nurse.email }}</span>
              </div>
              <div class="detail-item">
                <i class="fas fa-phone text-primary"></i>
                <span>{{ nurse.phoneNumber }}</span>
              </div>
              <div class="detail-item">
                <i class="fas fa-check-circle text-primary"></i>
                <span>{{ nurse.isActive ? "متاح" : "غير متاح" }}</span>
              </div>
            </div>

            <div class="mt-8 flex gap-4">
              <button
                @click="$router.push(`/book-nurse/${nurse._id}`)"
                class="request-btn"
                :disabled="!nurse.isActive">
                <i class="fas fa-calendar-plus ml-2"></i>
                حجز موعد
              </button>
              <a :href="'tel:' + nurse.phoneNumber" class="call-btn">
                <i class="fas fa-phone-alt ml-2"></i>
                اتصال
              </a>
              <button @click="$router.back()" class="back-btn">
                رجوع
                <!-- <i class="fas fa-arrow-left ml-2"> </i> -->
              </button>
            </div>
            <!-- Reviews Section -->
            <div class="reviews-section mt-10">
              <h2 class="text-2xl font-bold mb-4 text-primary">
                التقييمات والتعليقات
              </h2>
              <div v-if="reviews.length === 0" class="text-gray-500 mb-4">
                لا توجد تقييمات بعد.
              </div>
              <div
                v-for="review in reviews"
                :key="review._id"
                class="review-card mb-4 p-4 bg-gray-50 rounded-lg shadow">
                <div class="flex items-center mb-2">
                  <span class="font-semibold text-primary ml-2">{{
                    review.user?.name
                  }}</span>
                  <span class="stars ml-2">
                    <i
                      v-for="n in 5"
                      :key="n"
                      :class="[
                        'fa-star',
                        n <= review.ratings
                          ? 'fas text-yellow-400'
                          : 'far text-gray-300',
                      ]"></i>
                  </span>
                  <span class="text-xs text-gray-400">{{
                    new Date(review.createdAt).toLocaleDateString()
                  }}</span>
                </div>
                <div class="text-gray-700">{{ review.title }}</div>
              </div>
              <!-- Add Review Form -->
              <div
                v-if="isLoggedIn"
                class="add-review-form mt-6 p-4 bg-white rounded-lg shadow">
                <h3 class="font-semibold mb-2">أضف تقييمك</h3>
                <div class="star-input mb-2">
                  <i
                    v-for="n in 5"
                    :key="n"
                    :class="[
                      'fa-star',
                      n <= newReview.ratings
                        ? 'fas text-yellow-400'
                        : 'far text-gray-300',
                      'cursor-pointer',
                      'text-xl',
                    ]"
                    @click="newReview.ratings = n"></i>
                </div>
                <input
                  v-model="newReview.title"
                  class="input-field mb-2"
                  placeholder="اكتب تعليقك هنا..." />
                <button
                  class="request-btn"
                  :disabled="
                    isSubmitting || newReview.ratings === 0 || !newReview.title
                  "
                  @click="submitReview">
                  إرسال
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .nurse-list-page {
    direction: rtl;
    background-color: #f8fafc;
    min-height: 100vh;
  }

  .specialization-tag {
    display: inline-block;
    background-color: #e6f7f9;
    color: #007b8f;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.9rem;
  }

  .detail-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #666;
  }

  .request-btn,
  .call-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 20px;
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.3s ease;
  }

  .request-btn {
    background-color: #007b8f;
    color: white;
  }

  .request-btn:hover {
    background-color: #006272;
  }

  .request-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .call-btn {
    background-color: #e6f7f9;
    color: #007b8f;
  }

  .call-btn:hover {
    background-color: #d0f0f4;
  }

  .back-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 20px;
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.3s ease;
    background-color: #f8f9fa;
    color: #6c757d;
    border: 1px solid #dee2e6;
  }

  .back-btn:hover {
    background-color: #e9ecef;
    color: #495057;
  }

  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #007b8f;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .stars {
    display: flex;
    gap: 2px;
  }
  .fa-star {
    font-size: 1.2rem;
  }
  .input-field {
    width: 100%;
    padding: 8px;
    border-radius: 8px;
    border: 1px solid #ddd;
    margin-bottom: 8px;
  }
  .add-review-form button[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .review-card {
    border-bottom: 1px solid #eee;
  }
</style>
