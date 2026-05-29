import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    server: {
      host: true,
      port: 8080,
      allowedHosts: ['opsirix.com', '82.29.164.112'],
    },
  },
});
