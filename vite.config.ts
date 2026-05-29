import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig((config) => {
  return {
    ...config,
    server: {
      // @ts-expect-error ConfigEnv type does not include server, but it merges correctly at runtime
      ...config.server,
      host: true,
      port: 8080,
      allowedHosts: ['opsirix.com', '82.29.164.112']
    }
  };
});
