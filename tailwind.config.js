/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta baseada nos seus cards
        dourado: '#C9A227',        // dourado do "Sabrina"
        douradoClaro: '#E5C76B',
        marrom: '#3D2817',         // marrom escuro da madeira
        marromClaro: '#6B4423',
        verdeEscuro: '#1E3A34',    // verde escuro do fundo
        verde: '#4A6B4F',          // verde das folhas
        creme: '#F5EFE0',          // fundo creme
        cremeClaro: '#FBF6EA',
        laranja: '#D97B4A',        // do rodapé
      },
      fontFamily: {
        titulo: ['"Playfair Display"', 'serif'],
        corpo: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}