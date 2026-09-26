<p align="center">
  <img src="./assets/preview.svg" alt="Fleibo Face" width="190" />
</p>

<p align="center" style="font-size:2rem;"><strong>Fleibo Face</strong></p>
<p align="center"><em>Procedural expressive mascot for React and Astro</em></p>

<p align="center">
  Una cara SVG reactiva que cambia de emoción transformando su geometría, sigue el cursor, parpadea y conserva su estado sin depender de librerías de animación.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-component-555555?labelColor=20232a&logo=react&logoColor=61dafb" alt="React" />
  <img src="https://img.shields.io/badge/Astro-component-555555?labelColor=ff5d01&logo=astro&logoColor=white" alt="Astro" />
  <img src="https://img.shields.io/badge/TypeScript-typed-555555?labelColor=3178c6&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/SVG-procedural-555555?labelColor=f7c974&logo=svg&logoColor=414141" alt="SVG" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Transitions-path_morph-555555?labelColor=414141" alt="Path morph transitions" />
  <img src="https://img.shields.io/badge/Tracking-pointer-555555?labelColor=414141" alt="Pointer tracking" />
  <img src="https://img.shields.io/badge/Blink-3--5s-555555?labelColor=414141" alt="Blink every 3 to 5 seconds" />
</p>

## Qué incluye

Fleibo Face comparte un único motor geométrico entre React y Astro. Las expresiones no son SVGs separados: cada emoción es un estado numérico y el componente interpola posición, tamaño, rotación, curvatura y gradiente para transformar una expresión en otra de forma continua.

Emociones incluidas: `default-happy`, `surprised`, `intimidated`, `sad` y `angry`.

- `default-happy`, `surprised` e `intimidated` usan la misma tonalidad ámbar base.
- `sad` usa una versión más pálida manteniendo la misma temperatura cálida.
- `angry` desplaza el gradiente hacia un ámbar rojizo.
- Todas parpadean cada `3–5 s`, excepto `angry`.
- La sensibilidad vertical de los ojos es `3` por defecto.
- El tracking usa una pose espejo suave para evitar que la orientación base se vea incorrecta al mirar a la izquierda.

## Estructura

```text
fleibo-face/
├── assets/
│   └── preview.svg
└── src/
    ├── mascot-core.ts
    ├── MascotFace.tsx
    └── MascotFace.astro
```

## React

Copia `MascotFace.tsx` y `mascot-core.ts` en tu proyecto.

```tsx
import { MascotFace } from './MascotFace';

export function Example() {
  return (
    <MascotFace
      emotion="default-happy"
      size={220}
      persistEmotion
    />
  );
}
```

Para controlar la emoción desde React:

```tsx
const [emotion, setEmotion] = useState('default-happy');

<MascotFace
  emotion={emotion}
  transitionDuration={360}
  tracking={{ eyeVerticalBoost: 3 }}
/>
```

También expone un `ref` imperativo con `setEmotion()`, `getEmotion()`, `blink()` y `resetTracking()`.

## Astro

Copia `MascotFace.astro` y `mascot-core.ts` en la misma carpeta.

```astro
---
import MascotFace from './MascotFace.astro';
---

<MascotFace
  id="fleibo"
  emotion="default-happy"
  size={220}
  persistEmotion
/>
```

La instancia Astro expone métodos sobre el elemento raíz:

```js
const fleibo = document.querySelector('#fleibo');

fleibo.setEmotion('surprised');
fleibo.blink();
```

También acepta el evento `mascot:set-emotion` y emite `mascot:emotion-change`, `mascot:transition-start`, `mascot:transition-end` y `mascot:blink`.

## API principal

| Opción | Descripción | Default |
|---|---|---:|
| `emotion` | Emoción controlada | — |
| `defaultEmotion` | Emoción inicial | `default-happy` |
| `transitionDuration` | Duración del morph | `360 ms` |
| `easing` | Curva de interpolación | `easeInOutCubic` |
| `tracking` | Tracking del puntero o configuración parcial | `true` |
| `blink` | Parpadeo o configuración parcial | `true` |
| `persistEmotion` | Guarda la emoción en `localStorage` | `false` |
| `respectReducedMotion` | Respeta `prefers-reduced-motion` | `true` |
| `size` | Tamaño del SVG | `220` |

Configuración de tracking por defecto:

```ts
{
  maxMoveX: 6,
  maxMoveY: 4,
  eyeVerticalBoost: 3,
  smoothing: 0.1,
  deadzone: 0.07,
  mirrorEnter: 0.38,
  mirrorExit: 0.1,
  mirrorDuration: 520
}
```

Configuración de blink por defecto:

```ts
{
  duration: 150,
  minInterval: 3000,
  maxInterval: 5000
}
```

## Emociones personalizadas

Las emociones son datos. Puedes añadir una expresión sin tocar el motor pasando un `EmotionMap` propio con un `FaceState`, cuatro stops de gradiente y `blink` opcional.

```tsx
<MascotFace
  emotions={{
    sleepy: {
      label: 'Sleepy',
      blink: true,
      gradient: ['#fde7b5', '#fad58c', '#f7c974', '#9f7b32'],
      state: mySleepyState,
    },
  }}
/>
```

Consulta `src/mascot-core.ts` para los tipos y presets completos.