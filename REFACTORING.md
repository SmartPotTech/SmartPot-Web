# Refactorización a Feature-Based Architecture

## ✅ Completado

La API centralizada ha sido descompuesta en APIs específicas por feature siguiendo la arquitectura Feature-Based Structure.

## 📁 Nueva Estructura

```
src/
├── features/
│   ├── auth/
│   │   ├── api/
│   │   │   ├── endpoints.ts      ✅ Endpoints de autenticación
│   │   │   └── index.ts          ✅ Exports públicos
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx   ✅ Actualizado con nuevos tipos
│   │   ├── pages/
│   │   ├── types/
│   │   │   └── index.ts          ✅ UserData, authContextType, userDTO
│   │   └── index.ts              ✅ Exports públicos del feature
│   │
│   ├── dashboard/
│   │   ├── api/
│   │   │   ├── cropApi.ts        ✅ getCrop, getNumCrop
│   │   │   ├── endpoints.ts      ✅ Endpoints de crops
│   │   │   └── index.ts          ✅ Exports públicos
│   │   ├── pages/
│   │   │   └── statusPanel.tsx   ✅ Actualizado con nuevas importaciones
│   │   ├── types/
│   │   │   └── index.ts          ✅ Crop
│   │   └── index.ts              ✅ Exports públicos del feature
│   │
│   ├── historical-data/
│   │   ├── api/
│   │   │   ├── historyApi.ts     ✅ getHistoryFromCrop, getHistoryFromDateRange
│   │   │   ├── endpoints.ts      ✅ Endpoints de history
│   │   │   └── index.ts          ✅ Exports públicos
│   │   ├── pages/
│   │   │   └── historicalData.tsx ✅ Actualizado con nuevas importaciones
│   │   ├── types/
│   │   │   └── index.ts          ✅ History, Measures
│   │   └── index.ts              ✅ Exports públicos del feature
│   │
│   ├── notifications/
│   │   ├── api/
│   │   │   ├── notificationsApi.ts ✅ getNotifications
│   │   │   ├── endpoints.ts        ✅ Endpoints de notifications
│   │   │   └── index.ts            ✅ Exports públicos
│   │   ├── components/
│   │   │   └── NotificationBell.tsx ✅ Actualizado con nuevas importaciones
│   │   ├── types/
│   │   │   └── index.ts            ✅ Notifications
│   │   └── index.ts                ✅ Exports públicos del feature
│   │
│   └── profile/
│       ├── api/
│       │   ├── endpoints.ts        ✅ Endpoint de user update
│       │   └── index.ts            ✅ Exports públicos
│       └── index.ts                ✅ Exports públicos del feature
│
├── shared/
│   └── utils/
│       └── api.ts                  ✅ getAuthHeaders (utilidad compartida)
│
└── api/                            ⚠️ DEPRECADO - Para eliminar
    ├── Api.tsx                     ❌ Reemplazado por APIs específicas
    └── Endpoints.tsx               ❌ Reemplazado por endpoints por feature
```

## 🔄 Cambios Realizados

### 1. **Descomposición de API**
- ✅ Separada la API centralizada en módulos específicos por feature
- ✅ Cada feature tiene su propia carpeta `api/` con:
  - `endpoints.ts` - URLs específicas del feature
  - `*Api.ts` - Funciones de llamadas HTTP
  - `index.ts` - Exports públicos

### 2. **Separación de Tipos**
- ✅ Tipos movidos desde `/src/types/ApiResponses.tsx` a cada feature
- ✅ Cada feature tiene su carpeta `types/` con sus tipos específicos

### 3. **Utilidades Compartidas**
- ✅ Creada función `getAuthHeaders` en `/src/shared/utils/api.ts`
- ✅ Eliminada duplicación en cada API

### 4. **Exports Públicos**
- ✅ Cada feature tiene un `index.ts` que expone su API pública
- ✅ Facilita las importaciones: `import { getCrop } from '@features/dashboard'`

### 5. **Actualización de Importaciones**
- ✅ `statusPanel.tsx` - Usa nuevas APIs
- ✅ `historicalData.tsx` - Usa nuevas APIs
- ✅ `NotificationBell.tsx` - Usa nuevas APIs
- ✅ `AuthContext.tsx` - Usa nuevos tipos y endpoints

## 📝 Patrones Implementados

### Encapsulación por Feature
Cada feature es autónomo y encapsula:
- Su lógica de API
- Sus tipos TypeScript
- Sus componentes
- Su estado (contexts)

### Dependencias Claras
```typescript
// ✅ Correcto: Dashboard depende de Auth
import { UserData } from "../../auth/types";

// ✅ Correcto: Historical-data usa tipos de Dashboard
import { Crop } from "../../dashboard/types";
```

### Imports Limpios
```typescript
// ✅ En lugar de:
import { getCrop } from "../../../api/Api.tsx";

// ✅ Ahora:
import { getCrop } from "../api";
// o desde otro feature:
import { getCrop } from "../../dashboard/api";
```

## 🚨 Archivos Deprecados

Los siguientes archivos deben ser eliminados una vez verificado que todo funciona:

- ❌ `/src/api/Api.tsx`
- ❌ `/src/api/Endpoints.tsx`
- ❌ `/src/types/ApiResponses.tsx`

## 🎯 Próximos Pasos

### Fase 2: Componentes Específicos
- [ ] Mover `CropCard.tsx` a `/features/dashboard/components/`
- [ ] Evaluar si `PlotlyChart.tsx` debe estar en `shared/` o distribuirse

### Fase 3: Hooks Personalizados
- [ ] Crear `useCrop.ts` en dashboard
- [ ] Crear `useHistoryFilter.ts` en historical-data
- [ ] Crear `useNotifications.ts` en notifications

### Fase 4: Rutas por Feature
- [ ] Crear `routes/` en cada feature
- [ ] Descentralizar configuración de rutas

## 📚 Beneficios

1. **Mantenibilidad**: Código organizado por dominio de negocio
2. **Escalabilidad**: Fácil agregar nuevos features sin afectar otros
3. **Reusabilidad**: Cada feature puede ser reutilizado o extraído
4. **Testing**: Más fácil testear features de forma aislada
5. **Colaboración**: Equipos pueden trabajar en features diferentes sin conflictos

## 🔗 Referencias

- [Feature-Based Structure Best Practices](https://khalilstemmler.com/articles/software-design-architecture/feature-sliced/)
- [React Architecture Patterns](https://www.patterns.dev/posts/react-folder-structure)
