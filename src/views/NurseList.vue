<script setup lang="ts">
  import { ref, onMounted, watch, onUnmounted } from "vue";
  import api from "@/api/axios";
  import { getSpecialties, Specialty } from "../api/specialty";
  import FilterForm from "../components/FilterForm.vue";
  import { useToast } from "vue-toastification";
  import { useRouter } from "vue-router";

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
    gender: "male" | "female";
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

  // Filter state
  const specialties = ref<Specialty[]>([]);
  const locations = ref<string[]>([]);
  // const genders = ref<string[]>(['male', 'female']);

  const selectedSpecialties = ref<string[]>([]);
  const selectedGender = ref<string | null>(null);
  const selectedLocation = ref<string | null>(null);

  const toast = useToast();
  const router = useRouter();

  // Mobile filter panel state
  const isFilterPanelVisible = ref(false);
  const isMobileView = ref(window.innerWidth < 768);

  const fetchFilterOptions = async () => {
    try {
      // Fetch specialties
      const fetchedSpecialties = await getSpecialties();
      specialties.value = fetchedSpecialties;

      // Fetch all nurses to extract unique locations
      const response = await api.get(`/v1/users/nurses?limit=1000`);
      if (response.data.status === "success") {
        const allNurses: Nurse[] = response.data.data;
        const uniqueLocations = [...new Set(allNurses.map((n) => n.address))];
        locations.value = uniqueLocations;
      }
    } catch (err) {
      console.error("Error fetching filter options:", err);
    }
  };

  // Fetch nurses with pagination, sorting, and filtering
  const fetchNurses = async () => {
    try {
      loading.value = true;
      error.value = null;
      let url = `/v1/users/nurses?page=${currentPage.value}&limit=${limit}&populate=specialties,departmentId`;

      // Add sorting for the first page
      if (
        currentPage.value === 1 &&
        !selectedSpecialties.value.length &&
        !selectedGender.value &&
        !selectedLocation.value
      ) {
        url += `&sort=-averageRating`;
      }

      // Add filters
      if (selectedSpecialties.value.length > 0) {
        url += `&specialty=${selectedSpecialties.value.join(",")}`;
      }
      if (selectedGender.value) {
        url += `&gender=${selectedGender.value}`;
      }
      if (selectedLocation.value) {
        url += `&address=${selectedLocation.value}`;
      }

      const response = await api.get(url);
      if (response.data.status === "success") {
        nurses.value = response.data.data;
        totalNurses.value = response.data.total;
        totalPages.value = response.data.numberOfPages;
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

  const applyFilters = () => {
    currentPage.value = 1;
    fetchNurses();
  };

  // Watch for filter changes to refetch nurses
  watch(
    [selectedSpecialties, selectedGender, selectedLocation],
    () => {
      if (!isMobileView.value) {
        applyFilters();
      }
    },
    { deep: true }
  );

  // Watch for page changes
  watch(currentPage, () => {
    fetchNurses();
  });

  onMounted(async () => {
    const onResize = () => {
      isMobileView.value = window.innerWidth < 768;
    };
    window.addEventListener("resize", onResize);

    onUnmounted(() => {
      window.removeEventListener("resize", onResize);
    });

    await fetchFilterOptions();
    await fetchNurses();
  });

  const sendRequest = (nurseId: string) => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("يجب عليك تسجيل الدخول أولاً للحجز.");
      router.push("/login");
      return;
    }
    router.push(`/book-nurse/${nurseId}`);
  };

  // const getRatingStars = (rating: number) => {
  //   return Array(5)
  //     .fill(0)
  //     .map((_, index) => index < Math.floor(rating));
  // };

  const resetFilters = () => {
    selectedSpecialties.value = [];
    selectedGender.value = null;
    selectedLocation.value = null;
  };

  const applyMobileFilters = () => {
    isFilterPanelVisible.value = false;
    applyFilters();
  };

  const closePanelAndReset = () => {
    isFilterPanelVisible.value = false;
    resetFilters();
    if (isMobileView.value) {
      applyFilters();
    }
  };
</script>

<template>
  <div class="nurse-list-page">
    <!-- Mobile Filter Button -->
    <div class="md:hidden fixed bottom-6 right-6 z-20">
      <button
        @click="isFilterPanelVisible = true"
        class="w-16 h-16 text-white rounded-full shadow-lg flex items-center justify-center"
        style="background-color: #007b8f"
        aria-label="Open filters">
        <i class="fas fa-filter text-xl"></i>
      </button>
    </div>

    <!-- Mobile Filter Panel -->
    <transition name="slide-down">
      <div
        v-if="isFilterPanelVisible"
        class="fixed inset-0 bg-white z-30 p-4 flex flex-col md:hidden">
        <div class="flex justify-between items-center mb-4 pb-4 border-b">
          <h3 class="text-xl font-bold text-primary">
            <i class="fas fa-filter ml-2"></i>
            حدد بحثك
          </h3>
          <button
            @click="isFilterPanelVisible = false"
            aria-label="Close filters">
            <i class="fas fa-times text-2xl text-gray-500"></i>
          </button>
        </div>

        <div class="flex-grow overflow-y-auto">
          <FilterForm
            :specialties="specialties"
            :locations="locations"
            v-model:selectedSpecialties="selectedSpecialties"
            v-model:selectedGender="selectedGender"
            v-model:selectedLocation="selectedLocation" />
        </div>

        <div class="mt-auto pt-4 border-t space-y-2">
          <button
            @click="applyMobileFilters"
            class="w-full text-white py-3 rounded-lg font-semibold"
            style="background-color: #007b8f">
            تطبيق الفلاتر
          </button>
          <button
            @click="closePanelAndReset"
            class="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold">
            إعادة تعيين
          </button>
        </div>
      </div>
    </transition>

    <div class="container mx-auto px-4 py-8">
      <div class="flex flex-col md:flex-row gap-8">
        <!-- Filters Sidebar -->
        <aside class="w-full md:w-1/4 lg:w-1/5 hidden md:block">
          <div class="filter-sidebar">
            <h3 class="filter-title">
              <i class="fas fa-filter ml-2"></i>
              حدد بحثك
            </h3>

            <FilterForm
              :specialties="specialties"
              :locations="locations"
              v-model:selectedSpecialties="selectedSpecialties"
              v-model:selectedGender="selectedGender"
              v-model:selectedLocation="selectedLocation" />

            <button @click="resetFilters" class="reset-btn mt-4">
              إعادة تعيين الفلاتر
            </button>
          </div>
        </aside>

        <!-- Nurses List -->
        <main class="w-full md:w-3/4 lg:w-4/5">
          <h1 class="text-3xl font-bold text-center mb-8 text-primary">
            قائمة الممرضين المتاحين
          </h1>

          <!-- Loading State -->
          <div v-if="loading" class="text-center py-16">
            <div class="loader"></div>
            <p class="mt-4 text-gray-600">جاري تحميل بيانات الممرضين...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="text-center py-16">
            <p class="text-red-500">{{ error }}</p>
          </div>

          <!-- Empty State -->
          <div
            v-else-if="!nurses.length"
            class="text-center py-12 text-gray-500">
            لا يوجد ممرضين يطابقون خيارات البحث
          </div>

          <!-- Nurses Grid -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div
              v-for="(nurse, index) in nurses"
              :key="nurse._id"
              class="bg-surface rounded-2xl shadow-lg overflow-hidden transition-transform duration-300 hover:-translate-y-1 border border-border"
              data-aos="fade-up"
              :data-aos-delay="50 * (index % limit)">
              <div
                class="p-6"
                @click="$router.push(`/nurse/${nurse._id}`)"
                style="cursor: pointer">
                <div class="flex flex-col items-center text-center">
                  <!-- Image -->
                  <div class="relative mb-4">
                    <img
                      :src="nurse.personalPhoto || '/img/a1.png'"
                      :alt="nurse.firstName + ' ' + nurse.lastName"
                      class="w-28 h-28 rounded-full object-cover border-4 border-primary" />
                    <span
                      v-if="nurse.isActive"
                      class="absolute bottom-1 right-1 block h-5 w-5 rounded-full bg-green-500 border-2 border-surface"
                      title="متاح"></span>
                  </div>

                  <!-- Name & Department -->
                  <h2 class="text-xl font-bold text-text-primary">
                    {{ nurse.firstName }} {{ nurse.lastName }}
                  </h2>
                  <div
                    v-if="nurse.departmentId?.name"
                    class="flex items-center text-text-secondary mt-1">
                    <i
                      class="fa-solid fa-stethoscope text-sm mr-1 text-primary"></i>
                    <span class="text-sm font-medium">
                      {{ nurse.departmentId.name }}
                    </span>
                  </div>

                  <!-- Specialties -->
                  <div class="flex flex-wrap justify-center gap-2 mt-4">
                    <span
                      v-for="spec in nurse.specialties"
                      :key="spec._id"
                      class="bg-primary-soft-bg text-primary px-3 py-1 rounded-full text-xs font-semibold">
                      {{ spec.name }}
                    </span>
                  </div>

                  <!-- Contact Info -->
                  <div
                    class="mt-5 space-y-2 text-sm text-text-secondary w-full">
                    <div class="flex items-center justify-center">
                      <i
                        class="fas fa-map-marker-alt text-primary w-4 text-center mr-2"></i>
                      <span>{{ nurse.address }}</span>
                    </div>
                    <div class="flex items-center justify-center">
                      <i
                        class="fas fa-envelope text-primary w-4 text-center mr-2"></i>
                      <span>{{ nurse.email }}</span>
                    </div>
                    <div class="flex items-center justify-center">
                      <i
                        class="fas fa-phone text-primary w-4 text-center mr-2"></i>
                      <span>{{ nurse.phoneNumber }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div
                class="bg-background-soft p-4 flex flex-col sm:flex-row gap-3 border-t border-border">
                <button
                  @click.stop="sendRequest(nurse._id)"
                  class="flex-1 request-btn"
                  :disabled="!nurse.isActive">
                  <i class="fas fa-paper-plane ml-2"></i>
                  {{ nurse.isActive ? "إرسال طلب" : "غير متاح" }}
                </button>
                <a
                  :href="'tel:' + nurse.phoneNumber"
                  class="flex-1 call-btn text-center"
                  @click.stop>
                  <i class="fas fa-phone-alt ml-2"></i>
                  اتصال
                </a>
              </div>
            </div>
          </div>

          <!-- Pagination Bar -->
          <div
            v-if="totalPages > 1"
            class="pagination-bar flex flex-wrap justify-center items-center mt-10 gap-2">
            <button
              v-for="page in Math.min(totalPages, 7)"
              :key="page"
              :class="['pagination-btn', { active: currentPage === page }]"
              @click="goToPage(page)">
              {{ page }}
            </button>
            <span v-if="totalPages > 7 && currentPage < totalPages - 3"
              >...</span
            >
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
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .nurse-list-page {
    direction: rtl;
    background-color: var(--color-background);
    min-height: 100vh;
  }

  .text-primary {
    color: var(--color-primary);
  }
  .request-btn,
  .call-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.3s ease;
  }

  .request-btn {
    background-color: var(--color-primary);
    color: white;
  }

  .request-btn:hover {
    background-color: var(--color-primary-hover);
  }

  .call-btn {
    background-color: var(--color-primary-soft-bg);
    color: var(--color-primary);
    border: 1px solid var(--color-primary);
  }

  .call-btn:hover {
    opacity: 0.8;
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
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    color: var(--color-primary);
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
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  }
  .pagination-btn.active {
    background: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
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
