export type EasingName = 'linear' | 'easeInOutCubic' | 'easeOutCubic';

export type GradientStops = readonly [string, string, string, string];

export interface FaceState {
  faceX: number;
  faceY: number;
  faceWidth: number;
  faceHeight: number;
  faceRadius: number;
  faceRotation: number;

  leftEyeX: number;
  leftEyeY: number;
  leftEyeWidth: number;
  leftEyeHeight: number;
  leftEyeRadius: number;
  leftEyeRotation: number;

  rightEyeX: number;
  rightEyeY: number;
  rightEyeWidth: number;
  rightEyeHeight: number;
  rightEyeRadius: number;
  rightEyeRotation: number;

  mouthX: number;
  mouthY: number;
  mouthWidth: number;
  mouthCurve: number;
  mouthLeftOffset: number;
  mouthRightOffset: number;
  mouthControlSpread: number;
  mouthStroke: number;
  mouthRotation: number;
}

export interface EmotionDefinition {
  label: string;
  state: FaceState;
  gradient: GradientStops;
  /** Whether this emotion participates in automatic blinking. Defaults to true. */
  blink?: boolean;
}

export type EmotionMap = Record<string, EmotionDefinition>;

export interface TrackingConfig {
  enabled: boolean;
  mirrorEnabled: boolean;
  maxMoveX: number;
  maxMoveY: number;
  /** Multiplier applied only to the vertical displacement of the eyes. */
  eyeVerticalBoost: number;
  smoothing: number;
  deadzone: number;
  mirrorEnter: number;
  mirrorExit: number;
  mirrorDuration: number;
}

export interface BlinkConfig {
  enabled: boolean;
  duration: number;
  minInterval: number;
  maxInterval: number;
}

export interface TransitionConfig {
  duration: number;
  easing: EasingName;
}

export const GRAPHITE = '#414141';
export const AMBER = '#f7c974';

export const BASE_GRADIENT: GradientStops = [
  '#fde7b5',
  '#fad58c',
  AMBER,
  '#9f7b32',
];

/** Pale, but deliberately still warm. */
export const PALE_GRADIENT: GradientStops = [
  '#fff0cf',
  '#fde5b0',
  '#f6ce7b',
  '#b78a32',
];

/** Warmer/redder while staying in the same amber/orange family. */
export const ANGRY_GRADIENT: GradientStops = [
  '#fbd7b0',
  '#f2b57d',
  '#e88f58',
  '#915028',
];

export const DEFAULT_TRACKING: TrackingConfig = {
  enabled: true,
  mirrorEnabled: true,
  maxMoveX: 6,
  maxMoveY: 4,
  eyeVerticalBoost: 3,
  smoothing: 0.1,
  deadzone: 0.07,
  mirrorEnter: 0.38,
  mirrorExit: 0.1,
  mirrorDuration: 520,
};

export const DEFAULT_BLINK: BlinkConfig = {
  enabled: true,
  duration: 150,
  minInterval: 3000,
  maxInterval: 5000,
};

export const DEFAULT_TRANSITION: TransitionConfig = {
  duration: 360,
  easing: 'easeInOutCubic',
};

export const DEFAULT_EMOTIONS: EmotionMap = {
  'default-happy': {
    label: 'Happy',
    blink: true,
    gradient: BASE_GRADIENT,
    state: {
      faceX: 0,
      faceY: 0,
      faceWidth: 200,
      faceHeight: 200,
      faceRadius: 100,
      faceRotation: 0,
      leftEyeX: 24,
      leftEyeY: -34,
      leftEyeWidth: 11,
      leftEyeHeight: 34,
      leftEyeRadius: 9,
      leftEyeRotation: -12,
      rightEyeX: 63,
      rightEyeY: -33,
      rightEyeWidth: 11,
      rightEyeHeight: 34,
      rightEyeRadius: 9,
      rightEyeRotation: -12,
      mouthX: 39,
      mouthY: 10,
      mouthWidth: 92,
      mouthCurve: 30,
      mouthLeftOffset: 0,
      mouthRightOffset: 3,
      mouthControlSpread: 0.19,
      mouthStroke: 8,
      mouthRotation: 7,
    },
  },
  surprised: {
    label: 'Surprised',
    blink: true,
    gradient: BASE_GRADIENT,
    state: {
      faceX: 0,
      faceY: 0,
      faceWidth: 200,
      faceHeight: 200,
      faceRadius: 100,
      faceRotation: 0,
      leftEyeX: 24,
      leftEyeY: -34,
      leftEyeWidth: 13,
      leftEyeHeight: 38,
      leftEyeRadius: 9,
      leftEyeRotation: -12,
      rightEyeX: 63,
      rightEyeY: -33,
      rightEyeWidth: 13,
      rightEyeHeight: 38,
      rightEyeRadius: 9,
      rightEyeRotation: -12,
      mouthX: 50,
      mouthY: 10,
      mouthWidth: 0,
      mouthCurve: 0,
      mouthLeftOffset: 0,
      mouthRightOffset: 3,
      mouthControlSpread: 0.2,
      mouthStroke: 8,
      mouthRotation: 0,
    },
  },
  intimidated: {
    label: 'Intimidated',
    blink: true,
    gradient: BASE_GRADIENT,
    state: {
      faceX: 0,
      faceY: 0,
      faceWidth: 200,
      faceHeight: 200,
      faceRadius: 100,
      faceRotation: 0,
      leftEyeX: 11,
      leftEyeY: -27,
      leftEyeWidth: 10,
      leftEyeHeight: 10,
      leftEyeRadius: 9,
      leftEyeRotation: -12,
      rightEyeX: 63,
      rightEyeY: -24,
      rightEyeWidth: 10,
      rightEyeHeight: 10,
      rightEyeRadius: 9,
      rightEyeRotation: 20,
      mouthX: 36,
      mouthY: -2,
      mouthWidth: 20,
      mouthCurve: 8,
      mouthLeftOffset: 0,
      mouthRightOffset: 3,
      mouthControlSpread: 0.19,
      mouthStroke: 8,
      mouthRotation: 1,
    },
  },
  sad: {
    label: 'Sad',
    blink: true,
    gradient: PALE_GRADIENT,
    state: {
      faceX: 0,
      faceY: 0,
      faceWidth: 200,
      faceHeight: 200,
      faceRadius: 100,
      faceRotation: 0,
      leftEyeX: 24,
      leftEyeY: -34,
      leftEyeWidth: 11,
      leftEyeHeight: 26,
      leftEyeRadius: 9,
      leftEyeRotation: -12,
      rightEyeX: 63,
      rightEyeY: -33,
      rightEyeWidth: 11,
      rightEyeHeight: 26,
      rightEyeRadius: 9,
      rightEyeRotation: -12,
      mouthX: 39,
      mouthY: 26,
      mouthWidth: 92,
      mouthCurve: -30,
      mouthLeftOffset: 0,
      mouthRightOffset: 3,
      mouthControlSpread: 0.19,
      mouthStroke: 8,
      mouthRotation: 7,
    },
  },
  angry: {
    label: 'Angry',
    blink: false,
    gradient: ANGRY_GRADIENT,
    state: {
      faceX: 0,
      faceY: 0,
      faceWidth: 200,
      faceHeight: 200,
      faceRadius: 100,
      faceRotation: -6,
      leftEyeX: 19,
      leftEyeY: -15,
      leftEyeWidth: 8,
      leftEyeHeight: 25,
      leftEyeRadius: 11,
      leftEyeRotation: -73,
      rightEyeX: 65,
      rightEyeY: -22,
      rightEyeWidth: 8,
      rightEyeHeight: 23,
      rightEyeRadius: 9,
      rightEyeRotation: -128,
      mouthX: 45,
      mouthY: 12,
      mouthWidth: 33,
      mouthCurve: -7,
      mouthLeftOffset: 0,
      mouthRightOffset: 3,
      mouthControlSpread: 0.2,
      mouthStroke: 7,
      mouthRotation: -23,
    },
  },
};

export const FACE_STATE_KEYS = Object.keys(
  DEFAULT_EMOTIONS['default-happy'].state,
) as (keyof FaceState)[];

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function ease(name: EasingName, t: number): number {
  const x = clamp(t, 0, 1);
  switch (name) {
    case 'linear':
      return x;
    case 'easeOutCubic':
      return 1 - Math.pow(1 - x, 3);
    case 'easeInOutCubic':
    default:
      return x < 0.5
        ? 4 * x * x * x
        : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }
}

export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '0';
  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
}

export function roundedRectPath(
  cx: number,
  cy: number,
  width: number,
  height: number,
  radius: number,
): string {
  const w = Math.max(0.001, Math.abs(width));
  const h = Math.max(0.001, Math.abs(height));
  const r = Math.max(0, Math.min(Math.abs(radius), w / 2, h / 2));
  const x = cx - w / 2;
  const y = cy - h / 2;
  const x2 = x + w;
  const y2 = y + h;

  if (r === 0) {
    return `M ${formatNumber(x)} ${formatNumber(y)} H ${formatNumber(x2)} V ${formatNumber(y2)} H ${formatNumber(x)} Z`;
  }

  return [
    `M ${formatNumber(x + r)} ${formatNumber(y)}`,
    `H ${formatNumber(x2 - r)}`,
    `A ${formatNumber(r)} ${formatNumber(r)} 0 0 1 ${formatNumber(x2)} ${formatNumber(y + r)}`,
    `V ${formatNumber(y2 - r)}`,
    `A ${formatNumber(r)} ${formatNumber(r)} 0 0 1 ${formatNumber(x2 - r)} ${formatNumber(y2)}`,
    `H ${formatNumber(x + r)}`,
    `A ${formatNumber(r)} ${formatNumber(r)} 0 0 1 ${formatNumber(x)} ${formatNumber(y2 - r)}`,
    `V ${formatNumber(y + r)}`,
    `A ${formatNumber(r)} ${formatNumber(r)} 0 0 1 ${formatNumber(x + r)} ${formatNumber(y)}`,
    'Z',
  ].join(' ');
}

export function rotationTransform(angle: number, cx: number, cy: number): string {
  return `rotate(${formatNumber(angle)} ${formatNumber(cx)} ${formatNumber(cy)})`;
}

export function mouthPath(state: FaceState): string {
  const half = state.mouthWidth / 2;
  const leftY = state.mouthY + state.mouthLeftOffset;
  const rightY = state.mouthY + state.mouthRightOffset;
  const x1 = state.mouthX - half;
  const x2 = state.mouthX + half;
  const spread = state.mouthWidth * state.mouthControlSpread;
  const c1x = x1 + spread;
  const c2x = x2 - spread;
  const c1y = leftY + state.mouthCurve;
  const c2y = rightY + state.mouthCurve;

  return `M ${formatNumber(x1)} ${formatNumber(leftY)} C ${formatNumber(c1x)} ${formatNumber(c1y)} ${formatNumber(c2x)} ${formatNumber(c2y)} ${formatNumber(x2)} ${formatNumber(rightY)}`;
}

export function interpolateFaceState(
  from: FaceState,
  to: FaceState,
  t: number,
): FaceState {
  const out = {} as FaceState;
  for (const key of FACE_STATE_KEYS) {
    out[key] = lerp(from[key], to[key], t) as never;
  }
  return out;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  const full = clean.length === 3
    ? clean.split('').map((char) => char + char).join('')
    : clean;
  const value = Number.parseInt(full, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function rgbToHex({ r, g, b }: { r: number; g: number; b: number }): string {
  const channel = (value: number) =>
    Math.round(clamp(value, 0, 255)).toString(16).padStart(2, '0');
  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

export function interpolateColor(a: string, b: string, t: number): string {
  const from = hexToRgb(a);
  const to = hexToRgb(b);
  return rgbToHex({
    r: lerp(from.r, to.r, t),
    g: lerp(from.g, to.g, t),
    b: lerp(from.b, to.b, t),
  });
}

export function interpolateGradient(
  from: GradientStops,
  to: GradientStops,
  t: number,
): GradientStops {
  return [
    interpolateColor(from[0], to[0], t),
    interpolateColor(from[1], to[1], t),
    interpolateColor(from[2], to[2], t),
    interpolateColor(from[3], to[3], t),
  ];
}

export function applyDeadzone(value: number, deadzone: number): number {
  const absolute = Math.abs(value);
  if (absolute <= deadzone) return 0;
  const scaled = (absolute - deadzone) / Math.max(0.0001, 1 - deadzone);
  return Math.sign(value) * clamp(scaled, 0, 1);
}

export function randomBlinkDelay(config: BlinkConfig): number {
  const min = Math.max(0, Math.min(config.minInterval, config.maxInterval));
  const max = Math.max(min, config.maxInterval);
  return min + Math.random() * (max - min);
}

export function resolveBooleanConfig<T extends { enabled: boolean }>(
  value: false | true | Partial<T> | undefined,
  defaults: T,
): T {
  if (value === false) return { ...defaults, enabled: false };
  if (value === true || value === undefined) return { ...defaults, enabled: true };
  return { ...defaults, ...value, enabled: value.enabled ?? true };
}