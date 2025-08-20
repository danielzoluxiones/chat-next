const config = {
  plugins: ["@tailwindcss/postcss"],
  server: {
    proxy:{
      '/socket.io': {
        target: 'http://localhost:3000/',
        ws: true,
      }
    }
  }
};

export default config;
