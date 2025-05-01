import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      "/api": {
<<<<<<< HEAD
        target: "https://health-care-coral-one.vercel.app/",
=======
        target: "https://health-care-ashy-five.vercel.app/",
>>>>>>> 0951af5 (profil Up)
        changeOrigin: true,
        secure: false,
        // rewrite: (path) => path.replace(/^\/api/, ""),
        rewrite: (path) => path.replace(/^\/api/, "/api"),
      },
    },
  },
});
