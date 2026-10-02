import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [react()],
  output: 'static',
  trailingSlash: 'never',
  site: process.env.SITE_URL || undefined,
});
