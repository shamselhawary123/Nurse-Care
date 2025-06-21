import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import Toast, { type PluginOptions, POSITION } from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import AOS from 'aos';
import 'aos/dist/aos.css';

const options: PluginOptions = {
  position: POSITION.TOP_LEFT,
  timeout: 4000,
  rtl: true,
};

const app = createApp(App);
app.use(router);
app.use(Toast, options);

router.isReady().then(() => {
  app.mount('#app');
  AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true,
    mirror: false
  });
});