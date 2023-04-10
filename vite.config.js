import tailwindcss from "tailwindcss";

export default {
  root: "./",
  build: {
    outDir: "dist",
  },
  publicDir: "assets",
  plugins: [tailwindcss()],
};
