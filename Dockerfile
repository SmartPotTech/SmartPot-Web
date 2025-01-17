# Usar la imagen oficial de Node.js 20
FROM node:20-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar los archivos de package.json y pnpm-lock.yaml al contenedor
COPY package.json pnpm-lock.yaml ./

# Instalar pnpm
RUN npm install -g pnpm

# Instalar las dependencias del proyecto usando pnpm
RUN pnpm install

# Copiar el resto de los archivos al contenedor
COPY . .

# Compilar TypeScript si es necesario
RUN pnpm run build

# Exponer el puerto en el que Vite corre (puerto por defecto 5173)
EXPOSE 5173

# Comando para arrancar el servidor de desarrollo de Vite
CMD ["pnpm", "run", "dev"]