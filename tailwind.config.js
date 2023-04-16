/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/_app.js",
    "./pages/index.js",
    "./pages/createNft.js",
    "./pages/dashboard.js",
    "./pages/myNfts/index.js",
    "./pages/myNfts/[tokenId].js",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
