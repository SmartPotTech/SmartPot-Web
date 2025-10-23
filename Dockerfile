# ===============================
# Stage 1: Build de la app
# ===============================
FROM node:20-alpine AS build

# Establecer directorio de trabajo
WORKDIR /app

# Habilitar pnpm
RUN corepack enable && corepack prepare pnpm@10.12.4 --activate
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar todo el código
COPY . .

# Compilar el proyecto
RUN pnpm run build


# ===============================
# Stage 2: Imagen final para servir
# ===============================
FROM node:20-alpine

WORKDIR /app

# Instalar `serve` globalmente
RUN corepack enable && corepack prepare pnpm@10.12.4 --activate && pnpm add -g serve

# Copiar los archivos compilados desde el build stage
COPY --from=build /app/dist ./dist

# Copiar el entrypoint
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Exponer el puerto
EXPOSE 5173

# Definir variables por defecto (pueden ser sobreescritas en docker-compose o entorno)
ENV VITE_API_BASE_URL="http://localhost:8091"

# Usar el entrypoint
ENTRYPOINT ["/entrypoint.sh"]
