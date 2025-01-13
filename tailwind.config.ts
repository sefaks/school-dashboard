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
      colors: {
        lamaSky2: "#A1D6F4", 
        lamaSky: "#C3EBFA",

        lamaSkyLight: "#C9F0FD", // Hafif bir koyulaşma, çok açık olmasın
        lamaPurple: "#C2A9F1", // Koyu mor tonunu kullanarak daha dikkat çekici hale getirildi
        lamaPurpleLight2: "#D4A9F6", // Mor tonunun hafif daha belirgin bir tonu
        lamaPurpleLight:"#E7E1FC",
        lamaYellow: "#FFB04E", // Sarı daha koyu ve göz alıcı
        lamaYellowLight: "#FFF2C2",
         // Sarının daha soft ve sıcak bir tonu
         lamaBlue: "#A8DADC",

        lamaBlue2: "#8CB6D2",
        lamaBlueLight: "#E6F0FF",
        // Mavi tonunu biraz daha belirgin ve koyu hale getirdik
        lamaBlueLight2: "#B8D4F2", // Daha fazla kontrast sağlamak için koyu bir mavi tonu
        lamaRed: "#FF5A5F", // Kırmızı tonunu biraz daha koyu ve dikkat çekici hale getirdik
    }
    },
  },
  plugins: [],
};
export default config;
