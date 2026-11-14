import { defineConfig, minimal2023Preset as preset } from '@vite-pwa/assets-generator/config';

export default defineConfig({
  preset: {
    ...preset,
    maskable: {
      ...preset.maskable,
      padding: 0,
      resizeOptions: {
        fit: 'contain',
        background: { r: 111, g: 78, b: 55, alpha: 1 },
      },
    },
  },
  images: ['public/icon.svg'],
});
