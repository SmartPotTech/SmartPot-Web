import {defineConfig} from 'tailwindcss'

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
                'secondary-color': '#2D9CDB',
                'page-background': '#F3F2F7',
            }
        },
    },
    plugins: [],
})
