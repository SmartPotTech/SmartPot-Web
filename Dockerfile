# ===============================
# Stage 1: Build de la app
# ===============================
FROM node:22-alpine AS build

# Directorio de trabajo
WORKDIR /app

# Habilitar pnpm
RUN corepack enable && corepack prepare pnpm@11.0.9 --activate
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Copiar dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar el resto del código
COPY . .

# Compilar el proyecto
RUN pnpm run build


# ===============================
# Stage 2: Imagen final (serve)
# ===============================
FROM node:22-alpine

WORKDIR /app

# Definir entorno para PNPM global
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Instalar corepack y pnpm
RUN corepack enable && corepack prepare pnpm@11.0.9 --activate

# Crear el directorio global si no existe (previene error)
RUN mkdir -p $PNPM_HOME && chmod -R 777 $PNPM_HOME

# Instalar `serve` globalmente
RUN pnpm add -g serve

# Copiar los archivos compilados desde el build stage
COPY --from=build /app/dist ./dist

# Copiar el entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Exponer el puerto
EXPOSE 5173

# Usar el entrypoint
ENTRYPOINT ["/entrypoint.sh"]

CMD ["serve", "-s", "dist", "-l", "5173"]