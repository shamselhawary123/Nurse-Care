<script lang="ts">
  import { defineComponent } from 'vue';

  export default defineComponent({
    name: 'FilterForm',
  });
</script>

<script setup lang="ts">
import { Specialty } from "../api/specialty";

defineProps<{
  specialties: Specialty[];
  locations: string[];
}>();

const selectedSpecialties = defineModel<string[]>('selectedSpecialties');
const selectedGender = defineModel<string | null>('selectedGender');
const selectedLocation = defineModel<string | null>('selectedLocation');

</script>

<template>
  <div>
    <!-- Specialty Filter -->
    <div class="filter-group">
      <h4 class="filter-group-title">
        التخصصات
        <i class="fa-solid fa-stethoscope"></i>
      </h4>
      <div v-for="spec in specialties" :key="spec._id" class="filter-option">
        <input type="checkbox" :id="`spec-${spec._id}`" :value="spec._id" v-model="selectedSpecialties">
        <label :for="`spec-${spec._id}`">{{ spec.name }}</label>
      </div>
    </div>

    <!-- Gender Filter -->
    <div class="filter-group">
      <h4 class="filter-group-title">النوع
        <i class="fa-solid fa-venus-mars"></i>
      </h4>
      <div class="filter-option">
        <input type="radio" id="male-filter" value="male" v-model="selectedGender">
        <label for="male-filter">ذكر</label>
      </div>
      <div class="filter-option">
        <input type="radio" id="female-filter" value="female" v-model="selectedGender">
        <label for="female-filter">أنثى</label>
      </div>
    </div>

    <!-- Location Filter -->
    <div class="filter-group">
      <h4 class="filter-group-title">الموقع
        <i class="fa-solid fa-location-dot"></i>
      </h4>
      <select v-model="selectedLocation" class="filter-select">
        <option :value="null">الكل</option>
        <option v-for="loc in locations" :key="loc" :value="loc">{{ loc }}</option>
      </select>
    </div>
  </div>
</template>

<style scoped>
.filter-group {
  margin-bottom: 24px;
}

.filter-group-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.filter-group-title i {
  font-size: 1.2rem;
  color: #007b8f;
}

.filter-option {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.filter-option input {
  margin-left: 8px;
  accent-color: #007b8f;
}

.filter-option label {
  color: #555;
}

.filter-select {
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background-color: #f9f9f9;
  color: #333;
}
</style> 