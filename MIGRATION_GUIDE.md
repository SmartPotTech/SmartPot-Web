# 🚀 Guía de Migración - API Descompuesta

## ✅ Cambios Completados

### 1. APIs Descompuestas por Feature

| Feature | API Original | Nueva Ubicación |
|---------|--------------|-----------------|
| **Auth** | `auth, verifyToken, authRegister` | `features/auth/api/endpoints.ts` |
| **Dashboard** | `getCrop, getNumCrop` | `features/dashboard/api/cropApi.ts` |
| **Historical Data** | `getHistoryFromCrop, getHistoryFromDateRange` | `features/historical-data/api/historyApi.ts` |
| **Notifications** | `getNotifications` | `features/notifications/api/notificationsApi.ts` |
| **Profile** | `userUpdate` | `features/profile/api/endpoints.ts` |

### 2. Tipos Migrados

| Tipo Original | Nueva Ubicación |
|---------------|-----------------|
| `UserData, authContextType, userDTO` | `features/auth/types/index.ts` |
| `Crop` | `features/dashboard/types/index.ts` |
| `History, Measures` | `features/historical-data/types/index.ts` |
| `Notifications` | `features/notifications/types/index.ts` |

### 3. Archivos Actualizados

- ✅ `features/auth/contexts/AuthContext.tsx`
- ✅ `features/dashboard/pages/statusPanel.tsx`
- ✅ `features/historical-data/pages/historicalData.tsx`
- ✅ `features/notifications/components/NotificationBell.tsx`

## 📋 Guía de Importación

### Antes (Centralizado)
```typescript
// ❌ Viejo estilo
import { getCrop, getHistoryFromCrop } from "../../../api/Api.tsx";
import { Crop, History } from "../../../types/ApiResponses.tsx";
```

### Después (Por Feature)
```typescript
// ✅ Nuevo estilo
import { getCrop } from "../../dashboard/api";
import { getHistoryFromCrop } from "../../historical-data/api";
import { Crop } from "../../dashboard/types";
import { History } from "../../historical-data/types";

// O usando el barrel export:
import { getCrop } from "@features/dashboard";
```

## 🔧 Cómo usar las nuevas APIs

### Dashboard API
```typescript
import { getCrop, getNumCrop } from "@/features/dashboard/api";
import { Crop } from "@/features/dashboard/types";

// En tu componente:
const crop = await getCrop(user);
const numCrops = await getNumCrop(user);
```

### Historical Data API
```typescript
import { getHistoryFromCrop, getHistoryFromDateRange } from "@/features/historical-data/api";
import { History, Measures } from "@/features/historical-data/types";

// En tu componente:
const history = await getHistoryFromCrop(user, crop);
const filteredHistory = await getHistoryFromDateRange(user, crop, {
  startDate: "2024-01-01",
  endDate: "2024-12-31"
});
```

### Notifications API
```typescript
import { getNotifications } from "@/features/notifications/api";
import { Notifications } from "@/features/notifications/types";

// En tu componente:
const notifications = await getNotifications(user);
```

### Auth Types
```typescript
import { UserData, authContextType, userDTO } from "@/features/auth/types";
import { useAuthContext } from "@/features/auth";

// En tu componente:
const { user, login, logout } = useAuthContext();
```

## 🧪 Verificación

### 1. Compilación
```bash
npm run build
```

### 2. Desarrollo
```bash
npm run dev
```

### 3. Linter
```bash
npm run lint
```

## 🐛 Troubleshooting

### Error: "Cannot find module"
**Solución**: Verifica que estés importando desde la ubicación correcta:
```typescript
// ✅ Correcto
import { getCrop } from "../../dashboard/api";

// ❌ Incorrecto
import { getCrop } from "../../../api/Api.tsx";
```

### Error: "Module has no exported member"
**Solución**: Asegúrate de que el módulo exporte el miembro:
```typescript
// En api/index.ts
export * from './cropApi';
export * from './endpoints';
```

### Error: "Circular dependency detected"
**Solución**: Revisa las dependencias entre features. La estructura debe ser:
- `auth` → No depende de nadie
- `dashboard` → Depende de `auth`
- `historical-data` → Depende de `auth` y `dashboard`
- `notifications` → Depende de `auth`
- `profile` → Depende de `auth`

## 📦 Path Aliases (Opcional)

Para importaciones más limpias, puedes configurar path aliases en `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@features/*": ["src/features/*"],
      "@shared/*": ["src/shared/*"]
    }
  }
}
```

Luego usa:
```typescript
import { getCrop } from "@features/dashboard/api";
import { Card } from "@shared/components/Card";
```

## 🗑️ Limpieza

Una vez verificado que todo funciona, elimina los archivos deprecados:

```bash
# ⚠️ Solo después de verificar que todo funciona
rm src/api/Api.tsx
rm src/api/Endpoints.tsx
rm src/types/ApiResponses.tsx
```

## 🎯 Beneficios de la Nueva Estructura

1. **Cohesión**: Código relacionado está junto
2. **Desacoplamiento**: Features independientes
3. **Mantenibilidad**: Fácil encontrar y modificar código
4. **Escalabilidad**: Agregar features es más simple
5. **Testing**: Tests más enfocados por feature

## 📞 Soporte

Si encuentras algún problema durante la migración:
1. Revisa esta guía
2. Verifica los ejemplos en `REFACTORING.md`
3. Consulta la estructura de archivos creada
