import tailwindcss from "tailwindcss";

export default {
  root: "./",
  build: {
    outDir: "dist",
  },
  plugins: [tailwindcss()],
};
