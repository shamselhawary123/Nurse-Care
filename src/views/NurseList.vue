<script setup lang="ts">
  import { ref, onMounted, watch } from "vue";
  import axios from "axios";

  interface Nurse {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    personalPhoto: string;
    role: string;
    departmentId: {
      name: string;
      _id: string;
    };
    specialties: Array<{
      name: string;
      _id: string;
    }>;
    isActive: boolean;
    address: string;
    averageRating?: number;
    reviewsCount?: number;
  }

  const nurses = ref<Nurse[]>([]);
  const loading = ref(true);
  const error = ref<string | null>(null);
  const currentPage = ref(1);
  const totalPages = ref(1);
  const totalNurses = ref(0);
  const limit = 6;

  // Fetch nurses with pagination and sorting
  const fetchNurses = async () => {
    try {
      loading.value = true;
      error.value = null;
      let url = `/api/v1/users/nurses?page=${currentPage.value}&limit=${limit}`;
      // For the first page, sort by averageRating desc
      if (currentPage.value === 1) {
        url += `&sort=-averageRating`;
      }
      const response = await axios.get(url);
      if (response.data.status === "success") {
        nurses.value = response.data.data;
        totalNurses.value = response.data.total || 0;
        totalPages.value = Math.ceil(totalNurses.value / limit);
      }
    } catch (err: any) {
      console.error("Error fetching nurses:", err);
      error.value = "حدث خطأ أثناء جلب بيانات الممرضين";
    } finally {
      loading.value = false;
    }
  };

  // Handle page change
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages.value) return;
    currentPage.value = page;
  };

  // Watch for page changes
  watch(currentPage, () => {
    fetchNurses();
  });

  onMounted(() => {
    fetchNurses();
  });

  const sendRequest = async (nurseId: string) => {
    try {
      // Here you would implement the logic to send a request to the nurse
      console.log("Sending request to nurse:", nurseId);
      // You can add API call here
    } catch (err) {
      console.error("Error sending request:", err);
    }
  };

  const getRatingStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, index) => index < Math.floor(rating));
  };
</script>

<template>
  <div class="nurse-list-page">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-center mb-8 text-primary">
        قائمة الممرضين المتاحين
      </h1>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="loading-spinner"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12 text-red-500">
        {{ error }}
      </div>

      <!-- Empty State -->
      <div v-else-if="!nurses.length" class="text-center py-12 text-gray-500">
        لا يوجد ممرضين متاحين حالياً
      </div>

      <!-- Nurses Grid -->
      <div v-else class="grid gap-6">
        <div
          v-for="nurse in nurses"
          :key="nurse._id"
          class="nurse-card"
          @click="$router.push(`/nurse/${nurse._id}`)"
          style="cursor: pointer">
          <div class="flex items-center gap-6">
            <!-- Nurse Image -->
            <div class="nurse-image">
              <img
                :src="nurse.personalPhoto"
                :alt="nurse.firstName + ' ' + nurse.lastName"
                class="rounded-full border-4 border-primary" />
            </div>

            <!-- Nurse Info -->
            <div class="flex-grow">
              <div class="flex justify-between items-start">
                <div>
                  <h2 class="text-2xl font-bold text-primary mb-2">
                    {{ nurse.firstName }} {{ nurse.lastName }}
                  </h2>
                  
                  <div class="specialization mb-2">
                  <span
                  
                      v-for="(spec, index) in nurse.specialties"
                      :key="index"
                      class="specialization-tag">
                      {{ spec.name }}
                    </span>
                    <i class="fa-solid fa-stethoscope"></i>  
                    <span
                      v-if="nurse.departmentId?.name"
                      class="specialization-tag">
                      {{ nurse.departmentId.name }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Details -->
              <div class="details-grid mt-4">
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
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col gap-3">
              <button
                @click.stop="sendRequest(nurse._id)"
                class="request-btn"
                :disabled="!nurse.isActive">
                <i class="fas fa-paper-plane ml-2"></i>
                {{ nurse.isActive ? "إرسال طلب" : "غير متاح" }}
              </button>
              <a :href="'tel:' + nurse.phoneNumber" class="call-btn" @click.stop>
                <i class="fas fa-phone-alt ml-2"></i>
                اتصال
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination Bar -->
      <div v-if="totalPages > 1" class="pagination-bar flex flex-wrap justify-center items-center mt-10 gap-2">
        <button
          v-for="page in Math.min(totalPages, 7)"
          :key="page"
          :class="['pagination-btn', { active: currentPage === page }]"
          @click="goToPage(page)">
          {{ page }}
        </button>
        <span v-if="totalPages > 7 && currentPage < totalPages - 3">...</span>
        <button
          v-if="totalPages > 7 && currentPage < totalPages - 3"
          class="pagination-btn"
          @click="goToPage(totalPages)">
          {{ totalPages }}
        </button>
        <button
          class="pagination-btn next"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)">
          <i class="fas fa-chevron-left"></i>
        </button>
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

  .nurse-card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
  }

  .nurse-card:hover {
    transform: translateY(-2px);
  }

  .nurse-image img {
    width: 120px;
    height: 120px;
    object-fit: cover;
  }

  .text-primary {
    color: #007b8f;
  }

  .specialization-tag {
    display: inline-block;
    background-color: #e6f7f9;
    color: #007b8f;
    padding: 4px 12px;
    border-radius: 20px;
    margin-left: 8px;
    font-size: 0.9rem;
  }
  .specialization i{
    color: #007b8f;
  }
  .details-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
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

  .call-btn {
    background-color: #e6f7f9;
    color: #007b8f;
  }

  .call-btn:hover {
    background-color: #d0f0f4;
  }

  @media (max-width: 768px) {
    .nurse-card > div {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .details-grid {
      grid-template-columns: 1fr;
    }

    .nurse-image img {
      width: 100px;
      height: 100px;
    }
  }

  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 5px solid #f3f3f3;
    border-top: 5px solid #007b8f;
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

  .request-btn:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }

  .pagination-bar {
    gap: 0.5rem;
    margin-top: 2rem;
  }
  .pagination-btn {
    background: white;
    border: 1px solid #e5e7eb;
    color: #007b8f;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    font-weight: 500;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s, color 0.2s;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0,0,0,0.04);
  }
  .pagination-btn.active {
    background: #007b8f;
    color: white;
    border-color: #007b8f;
  }
  .pagination-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .pagination-btn.next {
    border-radius: 50%;
    font-size: 1.2rem;
  }
  @media (max-width: 600px) {
    .pagination-bar {
      gap: 0.25rem;
    }
    .pagination-btn {
      width: 32px;
      height: 32px;
      font-size: 1rem;
    }
  }
</style>
