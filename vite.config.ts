import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],

    resolve: {
        alias: {
            buffer: 'buffer/',
            stream: 'stream-browserify',
            assert: 'assert',
        },
    },
    define: {
        'process.env': {},
        'global': 'window',
    }
});