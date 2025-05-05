<!-- <script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useToast } from 'vue-toastification';

interface Nurse {
  _id: string;
  firstName: string;
  lastName: string;
  personalPhoto: string;
}

interface Request {
  _id: string;
  nurse: Nurse;
  description: string;
  status: string;
}

const requests = ref<Request[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const toast = useToast();

const fetchRequests = async () => {
  try {
    loading.value = true;
    const token = localStorage.getItem('token');
    const res = await axios.get('/api/v1/request/sent', {
      headers: { Authorization: `Bearer ${token}` },
    });
    requests.value = res.data.data;
  } catch (err: any) {
    error.value = 'حدث خطأ أثناء جلب الطلبات';
  } finally {
    loading.value = false;
  }
};

let notificationSocket: any = null;

onMounted(() => {
  fetchRequests();
  const patientId = localStorage.getItem('userId');
  notificationSocket = io('/notifications');
  if (patientId) {
    notificationSocket.emit('join', patientId);
    notificationSocket.on('request_rejected', (data: any) => {
      toast.error(data.message);
      fetchRequests();
    });
  }
});

onUnmounted(() => {
  if (notificationSocket) {
    notificationSocket.disconnect();
  }
});
</script>

<template>
  <div class="notifications-page">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold mb-6 text-primary">الاشعارات</h1>
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="loading-spinner"></div>
      </div>
      <div v-else-if="error" class="text-center py-12 text-red-500">
        {{ error }}
      </div>
      <div v-else>
        <div v-if="requests.length === 0" class="text-gray-500 text-center">لا توجد طلبات حالياً.</div>
        <div v-for="req in requests" :key="req._id" class="request-card bg-white rounded-lg shadow p-6 mb-6 flex items-center gap-6">
          <img :src="req.nurse?.personalPhoto || '/default-avatar.png'" :alt="`${req.nurse?.firstName || ''} ${req.nurse?.lastName || ''}`" class="w-16 h-16 rounded-full object-cover border" />
          <div class="flex-1">
            <div class="font-bold text-lg text-primary mb-2">
              {{ req.nurse ? req.nurse.firstName + ' ' + req.nurse.lastName : 'بدون ممرضة محددة' }}
            </div>
            <textarea class="input-field" :value="req.description" readonly rows="2"></textarea>
            <div class="status">
              <span v-if="req.status === 'Pending'">قيد الانتظار</span>
              <span v-else-if="req.status === 'Approved'">تم القبول</span>
              <span v-else-if="req.status === 'Rejected'">تم الرفض</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notifications-page {
  direction: rtl;
  background-color: #f8fafc;
  min-height: 100vh;
}
.request-card {
  align-items: flex-start;
}
.input-field {
  width: 100%;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: #f9f9f9;
  resize: none;
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> -->