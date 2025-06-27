<template>
  <div v-if="visible" class="chatbot-container">
    <div class="chatbot-header">
      <img src="/img/logo (2).png" alt="Nurse Avatar" class="chatbot-avatar" />
      <span class="chatbot-title">تمريض - Tamreed</span>
      <button class="chatbot-close" @click="visible = false">×</button>
    </div>
    <div class="chatbot-body">
      <div class="chatbot-bubble chatbot-bubble-nurse">
        أخبار حضرتك إيه 😊، إزاي أقدر أساعدك؟
      </div>
      <form class="chatbot-form" @submit.prevent="handleSubmit">
        <div class="chatbot-bubble chatbot-bubble-form">
          <div class="chatbot-form-title">
            عشان نقدر نساعدك بشكل أفضل نستأذنك تملى البيانات <span style="color: #e2557b">♥</span>
          </div>
          <input
            v-model="name"
            type="text"
            placeholder="الاسم"
            class="chatbot-input"
            :class="{'chatbot-input-error': nameError}"
            required
          />
          <input
            v-model="phone"
            type="tel"
            placeholder="رقم الهاتف"
            class="chatbot-input"
            :class="{'chatbot-input-error': phoneError}"
            required
          />
          <button type="submit" class="chatbot-submit">إرسال</button>
        </div>
      </form>
      <div v-if="submitted" class="chatbot-bubble chatbot-bubble-nurse chatbot-thankyou">
        شكرًا لك! تم استلام بياناتك وسنتواصل معك قريبًا.
      </div>
    </div>
  </div>
  <button v-else class="chatbot-fab" @click="visible = true">
    <img src="/img/logo (2).png" alt="Nurse Avatar" class="chatbot-fab-avatar" />
  </button>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'ChatBot',
  setup() {
    const visible = ref(true);
    const name = ref('');
    const phone = ref('');
    const submitted = ref(false);
    const nameError = ref(false);
    const phoneError = ref(false);

    function handleSubmit() {
      nameError.value = !name.value.trim();
      phoneError.value = !/^\d{8,15}$/.test(phone.value.trim());
      if (!nameError.value && !phoneError.value) {
        // Here you can send data to backend or Google Sheets
        // For now, just log to console
        console.log('Chatbot submission:', { name: name.value, phone: phone.value });
        submitted.value = true;
        setTimeout(() => {
          visible.value = false;
          submitted.value = false;
          name.value = '';
          phone.value = '';
        }, 3000);
      }
    }

    return {
      visible,
      name,
      phone,
      submitted,
      nameError,
      phoneError,
      handleSubmit
    };
  }
};
</script>

<style scoped>
.chatbot-container {
  position: fixed;
  bottom: 24px;
  left: 24px;
  width: 340px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(30, 60, 90, 0.18);
  z-index: 9999;
  font-family: 'Tajawal', Arial, sans-serif;
  direction: rtl;
  animation: chatbot-pop 0.5s;
}
@keyframes chatbot-pop {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
.chatbot-header {
  display: flex;
  align-items: center;
  padding: 12px 16px 8px 16px;
  border-bottom: 1px solid #f0f0f0;
  background: #f7faff;
  border-radius: 20px 20px 0 0;
}
.chatbot-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-left: 12px;
  border: 2px solid #1b7da5;
  background: #fff;
}
.chatbot-title {
  font-weight: bold;
  color: #1b7da5;
  font-size: 1.1rem;
  flex: 1;
}
.chatbot-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #888;
  cursor: pointer;
  margin-right: 8px;
}
.chatbot-body {
  padding: 18px 16px 16px 16px;
}
.chatbot-bubble {
  background: #f0f4fa;
  border-radius: 16px;
  padding: 12px 16px;
  margin-bottom: 12px;
  font-size: 1.05rem;
  color: #222;
  max-width: 95%;
  word-break: break-word;
  box-shadow: 0 2px 8px rgba(30, 60, 90, 0.06);
}
.chatbot-bubble-nurse {
  background: #eaf6fb;
  color: #1b7da5;
  font-weight: 500;
  border-bottom-right-radius: 4px;
}
.chatbot-bubble-form {
  background: #fff;
  color: #222;
  border-bottom-left-radius: 4px;
  box-shadow: none;
}
.chatbot-form-title {
  font-size: 1rem;
  margin-bottom: 10px;
  color: #1b7da5;
  font-weight: 500;
}
.chatbot-input {
  width: 100%;
  padding: 10px 12px;
  margin-bottom: 10px;
  border: 1px solid #d0e2ef;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border 0.2s;
  background: #f7faff;
}
.chatbot-input-error {
  border-color: #e2557b;
  background: #fff0f3;
}
.chatbot-submit {
  width: 100%;
  background: #1b7da5;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 0;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.chatbot-submit:hover {
  background: #007b8f;
}
.chatbot-thankyou {
  background: #eaf6fb;
  color: #1b7da5;
  text-align: center;
  font-weight: 500;
}
.chatbot-fab {
  position: fixed;
  bottom: 24px;
  left: 24px;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #1b7da5;
  box-shadow: 0 4px 16px rgba(30, 60, 90, 0.18);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  cursor: pointer;
  transition: background 0.2s;
}
.chatbot-fab:hover {
  background: #007b8f;
}
.chatbot-fab-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid #fff;
  background: #fff;
}
</style> 