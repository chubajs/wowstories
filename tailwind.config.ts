import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#fffdf0",
        foreground: "#171717",
      },
      fontFamily: {
        neucha: ['var(--font-neucha)', 'cursive'],
        'jetbrains-mono': ['var(--font-jetbrains-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
