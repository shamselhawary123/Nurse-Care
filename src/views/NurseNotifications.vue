<!-- <script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useToast } from 'vue-toastification';

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
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

const toast = useToast();

const fetchRequests = async () => {
  try {
    loading.value = true;
    const token = localStorage.getItem('token');
    const res = await axios.get('/api/v1/request/received', {
      headers: { Authorization: `Bearer ${token}` },
    });
    // Only show pending requests
    requests.value = res.data.data.filter((req: Request) => req.status === 'Pending');
  } catch (err: any) {
    error.value = 'حدث خطأ أثناء جلب الطلبات';
  } finally {
    loading.value = false;
  }
};

const handleAction = async (requestId: string, action: 'Approved' | 'Rejected') => {
  try {
    const token = localStorage.getItem('token');
    await axios.put(`/api/v1/request/${requestId}/${action}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (action === 'Rejected') {
      requests.value = requests.value.filter(req => req._id !== requestId);
    } else {
      fetchRequests();
    }
  } catch (err) {
    alert('حدث خطأ أثناء تحديث الطلب');
  }
};

let notificationSocket: any = null;

onMounted(() => {
  fetchRequests();
  const nurseId = localStorage.getItem('userId');
  notificationSocket = io('/notifications');
  if (nurseId) {
    notificationSocket.emit('join', nurseId);
    notificationSocket.on('new_request', (data: any) => {
      toast.info(`طلب جديد من المريض: ${data.patientInfo.firstName} ${data.patientInfo.lastName}`);
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
          <img :src="req.patient.personalPhoto || '/default-avatar.png'" :alt="`${req.patient.firstName} ${req.patient.lastName}`" class="w-16 h-16 rounded-full object-cover border" />
          <div class="flex-1">
            <div class="font-bold text-lg text-primary mb-2">{{ req.patient.firstName }} {{ req.patient.lastName }}</div>
            <textarea class="input-field" :value="req.description" readonly rows="2"></textarea>
          </div>
          <div class="flex flex-col gap-2">
            <button class="accept-btn" @click="handleAction(req._id, 'Approved')">قبول</button>
            <button class="reject-btn" @click="handleAction(req._id, 'Rejected')">رفض</button>
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
.accept-btn {
  background: #007b8f;
  color: #fff;
  padding: 8px 20px;
  border-radius: 8px;
  font-weight: 500;
  transition: background 0.3s;
}
.accept-btn:hover {
  background: #006272;
}
.reject-btn {
  background: #f8d7da;
  color: #c82333;
  padding: 8px 20px;
  border-radius: 8px;
  font-weight: 500;
  transition: background 0.3s;
}
.reject-btn:hover {
  background: #f5c6cb;
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