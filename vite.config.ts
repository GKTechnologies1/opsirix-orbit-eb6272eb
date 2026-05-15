import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig((config) => {
  return {
    ...config,
    server: {
      ...config.server,
      host: true,
      port: 8080,
      allowedHosts: ['opsirix.com', '82.29.164.112']
    }
  };
});
