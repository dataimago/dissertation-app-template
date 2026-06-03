const neutralPreset = require('@dataimago/css-neutral/tailwind-preset');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [neutralPreset],
  content: ['./src/**/*.{ts,tsx,js,jsx,mdx}'],
};
