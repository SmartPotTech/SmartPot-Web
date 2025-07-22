# SmartPot-Web

[![Netlify Status](https://api.netlify.com/api/v1/badges/5d675e13-68c9-4d3d-a61d-da09db0574c4/deploy-status)](https://app.netlify.com/sites/smarpot/deploys)

## **Deployment**

[![Dockerization](https://github.com/SmartPotTech/SmartPot-Web/actions/workflows/dockerization.yml/badge.svg)](https://github.com/SmartPotTech/SmartPot-Web/actions/workflows/dockerization.yml)
[![CodeQL Advanced](https://github.com/SmartPotTech/SmartPot-Web/actions/workflows/codeql.yml/badge.svg)](https://github.com/SmartPotTech/SmartPot-Web/actions/workflows/codeql.yml)
[![Dependabot Updates](https://github.com/SmartPotTech/SmartPot-Web/actions/workflows/dependabot/dependabot-updates/badge.svg)](https://github.com/SmartPotTech/SmartPot-Web/actions/workflows/dependabot/dependabot-updates)
[![ESLint](https://github.com/SmartPotTech/SmartPot-Web/actions/workflows/eslint.yml/badge.svg)](https://github.com/SmartPotTech/SmartPot-Web/actions/workflows/eslint.yml)
[![Node.js CI](https://github.com/SmartPotTech/SmartPot-Web/actions/workflows/node.js.yml/badge.svg)](https://github.com/SmartPotTech/SmartPot-Web/actions/workflows/node.js.yml)

### 1. **Creación de la Imagen Docker**

2. **Ejecuta el siguiente comando** para construir la imagen Docker a partir del `Dockerfile`:

   ```bash
   docker build -t sebastian190030/web-smartpot .
   ```

    - Esto construirá la imagen **`web-smartpot`** con el tag `latest`.
    - Si necesitas especificar una plataforma (por ejemplo, para garantizar compatibilidad en diferentes arquitecturas),
      puedes agregar la opción `--platform linux/amd64` al comando.

   **Ejemplo con plataforma**:

   ```bash
   docker build --platform linux/amd64 -t sebastian190030/web-smartpot .
   ```

   Esto asegura que la imagen será compatible con la arquitectura `amd64` (común en servidores y equipos de desarrollo).

---

### 3. **Publicación de la Imagen en Docker Hub**

1. **Inicia sesión en Docker Hub** desde la terminal:

   ```bash
   docker login
   ```

    - Introduce tu usuario **Docker Hub** (`sebastian190030`) y la contraseña cuando se te solicite.

2. **Sube la imagen** a tu repositorio en Docker Hub:

   ```bash
   docker push sebastian190030/web-smartpot:latest
   ```

    - Este comando subirá la imagen al repositorio público en Docker Hub con el nombre `sebastian190030/web-smartpot` y
      el tag `latest`.
    - Si la imagen no tiene un tag explícito, Docker usará el tag `latest` por defecto.
