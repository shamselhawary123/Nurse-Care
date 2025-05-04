import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import Toast, { type PluginOptions } from 'vue-toastification';
import 'vue-toastification/dist/index.css';

const options: PluginOptions = {
  position: 'top-left',
  timeout: 4000,
  rtl: true,
};

createApp(App)
  .use(router)
  .use(Toast, options)
  .mount('#app')