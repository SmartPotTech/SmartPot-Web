FROM oven/bun:1.4.4-alpine AS build

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# ngx_brotli se compila contra la misma versión y los mismos argumentos que el nginx de la imagen final.
FROM nginxinc/nginx-unprivileged:1.31.7-alpine AS brotli

USER root
RUN apk add --no-cache build-base cmake git brotli-dev zlib-dev openssl-dev pcre2-dev linux-headers curl \
 && curl -fsSL https://nginx.org/download/nginx-1.31.7.tar.gz | tar xz -C /tmp \
 && git clone --depth=1 --recurse-submodules --shallow-submodules https://github.com/google/ngx_brotli.git /tmp/ngx_brotli \
 && cd /tmp/nginx-1.31.7 \
 && eval "./configure --with-compat --add-dynamic-module=/tmp/ngx_brotli $(nginx -V 2>&1 | sed -n 's/^configure arguments: //p')" \
 && make -j"$(nproc)" modules

FROM nginxinc/nginx-unprivileged:1.31.7-alpine

LABEL org.opencontainers.image.title="SmartPot Web Solid" \
      org.opencontainers.image.description="PWA de SmartPot en SolidJS compilada con Bun y servida con nginx sin privilegios" \
      org.opencontainers.image.source="https://github.com/SmartPotTech/SmartPot-Web" \
      org.opencontainers.image.licenses="MIT"

ENV API_URL=http://localhost:8091 \
    NGINX_ENVSUBST_FILTER="^(API_ORIGIN|CSP_UPGRADE)$"

USER root
COPY --from=brotli /tmp/nginx-1.31.7/objs/ngx_http_brotli_static_module.so /usr/lib/nginx/modules/ngx_http_brotli_static_module.so
RUN apk add --no-cache brotli-libs \
 && sed -i '1i load_module /usr/lib/nginx/modules/ngx_http_brotli_static_module.so;' /etc/nginx/nginx.conf \
 && nginx -t \
 && rm -f /tmp/nginx.pid
USER 101

COPY nginx/default.conf.template nginx/security-headers.inc.template /etc/nginx/templates/
COPY --chmod=755 nginx/15-smartpot-config.envsh /docker-entrypoint.d/15-smartpot-config.envsh
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:8080/health || exit 1
