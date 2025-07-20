import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
   plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
   server: {
      host: '0.0.0.0', // Listen on all network interfaces
      port: 3223, // Set the port to 3223
   },
});
