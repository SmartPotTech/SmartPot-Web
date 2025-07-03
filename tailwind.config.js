import { defineConfig } from 'tailwindcss'

export default defineConfig({
    darkMode: "class",
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./node_modules/react-tailwindcss-datepicker/dist/index.esm.js"
    ],
    theme: {
        extend: {
            colors: {
                'main-colour': '#00B074',
                'hover-main-colour': '#D9F3EA',
                'secondary-color': '#2D9CDB',
                'hover-secondary-color': '#DFF0FA',
                'page-background': '#F3F2F7',
            }
        },
    },
    plugins: [],
})
