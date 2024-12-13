import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors:{
        lamaSky: "#C3EBFA",
        lamaSkyLight: "#EDF9FD",
        lamaPurple: "#E7E1FC",
        lamaPurpleLight: "#E7E1FC",
        lamaYellow: "#FFD166",
        lamaYellowLight: "#FFFBEA",
        lamaBlue: "#A8DADC",
        lamaBlueLight: "#E6F0FF",
      }
    },
  },
  plugins: [],
};
export default config;
