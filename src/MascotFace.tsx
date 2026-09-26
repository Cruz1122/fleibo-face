import {
  CSSProperties,
  ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  DEFAULT_BLINK,
  DEFAULT_EMOTIONS,
  DEFAULT_TRACKING,
  DEFAULT_TRANSITION,
  EmotionMap,
  EasingName,
  FaceState,
  GradientStops,
  GRAPHITE,
  TrackingConfig,
  BlinkConfig,
  applyDeadzone,
  clamp,
  ease,
  formatNumber,
  interpolateFaceState,
  interpolateGradient,
  lerp,
  mouthPath,
  randomBlinkDelay,
  resolveBooleanConfig,
  roundedRectPath,
  rotationTransform,
} from './mascot-core';

export interface MascotFaceHandle {
  setEmotion(emotion: string): void;
  getEmotion(): string;
  blink(): void;
  resetTracking(): void;
}

export interface MascotFaceProps {
  /** Controlled emotion. When present, parent state owns the emotion. */
  emotion?: string;
  /** Initial emotion for uncontrolled mode. */
  defaultEmotion?: string;
  /** Replace or extend the built-in emotion map. */
  emotions?: EmotionMap;
  /** Merge custom emotions over the built-ins instead of replacing them. Default: true. */
  mergeDefaultEmotions?: boolean;

  transitionDuration?: number;
  easing?: EasingName;
  tracking?: boolean | Partial<TrackingConfig>;
  blink?: boolean | Partial<BlinkConfig>;

  /** Persist the active emotion. true uses the default key; a string becomes the key. */
  persistEmotion?: boolean | string;
  /** Automatically disables morph/tracking/blink for prefers-reduced-motion. Default: true. */
  respectReducedMotion?: boolean;
  /** Root element size. Number means px; string accepts CSS lengths. */
  size?: number | string;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;

  onEmotionChange?: (emotion: string) => void;
  onTransitionStart?: (from: string, to: string) => void;
  onTransitionEnd?: (emotion: string) => void;
  onBlink?: () => void;
}

interface MirrorEye {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  rotation: number;
}

const DEFAULT_PERSIST_KEY = 'mascot-face-emotion-v1';

function resolveSize(size: number | string | undefined): string {
  if (typeof size === 'number') return `${size}px`;
  return size ?? '100%';
}

function cloneGradient(gradient: GradientStops): GradientStops {
  return [gradient[0], gradient[1], gradient[2], gradient[3]];
}

function mergeEmotionMaps(
  custom: EmotionMap | undefined,
  mergeDefaults: boolean,
): EmotionMap {
  if (!custom) return DEFAULT_EMOTIONS;
  return mergeDefaults ? { ...DEFAULT_EMOTIONS, ...custom } : custom;
}

function eyePose(side: 'left' | 'right', state: FaceState): MirrorEye {
  const prefix = side === 'left' ? 'leftEye' : 'rightEye';
  return {
    x: state[`${prefix}X`],
    y: state[`${prefix}Y`],
    width: state[`${prefix}Width`],
    height: state[`${prefix}Height`],
    radius: state[`${prefix}Radius`],
    rotation: state[`${prefix}Rotation`],
  };
}

function mirroredEyeTarget(counterpart: MirrorEye, state: FaceState): MirrorEye {
  return {
    x: 2 * state.faceX - counterpart.x,
    y: counterpart.y,
    width: counterpart.width,
    height: counterpart.height,
    radius: counterpart.radius,
    rotation: -counterpart.rotation,
  };
}

function interpolateEye(from: MirrorEye, to: MirrorEye, t: number): MirrorEye {
  return {
    x: lerp(from.x, to.x, t),
    y: lerp(from.y, to.y, t),
    width: lerp(from.width, to.width, t),
    height: lerp(from.height, to.height, t),
    radius: lerp(from.radius, to.radius, t),
    rotation: lerp(from.rotation, to.rotation, t),
  };
}

function getInitialEmotion(
  emotionMap: EmotionMap,
  requested: string | undefined,
): string {
  if (requested && emotionMap[requested]) return requested;
  if (emotionMap['default-happy']) return 'default-happy';
  return Object.keys(emotionMap)[0];
}

function MascotFaceInner(
  {
    emotion,
    defaultEmotion,
    emotions,
    mergeDefaultEmotions = true,
    transitionDuration = DEFAULT_TRANSITION.duration,
    easing = DEFAULT_TRANSITION.easing,
    tracking: trackingProp,
    blink: blinkProp,
    persistEmotion = false,
    respectReducedMotion = true,
    size,
    className,
    style,
    ariaLabel = 'Mascota emocional interactiva',
    onEmotionChange,
    onTransitionStart,
    onTransitionEnd,
    onBlink,
  }: MascotFaceProps,
  ref: ForwardedRef<MascotFaceHandle>,
) {
  const emotionMap = useMemo(
    () => mergeEmotionMaps(emotions, mergeDefaultEmotions),
    [emotions, mergeDefaultEmotions],
  );
  const persistenceKey = persistEmotion
    ? typeof persistEmotion === 'string'
      ? persistEmotion
      : DEFAULT_PERSIST_KEY
    : null;

  const initialEmotion = useMemo(
    () => getInitialEmotion(emotionMap, emotion ?? defaultEmotion),
    // Keep the first server/client render deterministic. Persistence is restored
    // after mount so SSR hydration cannot disagree with localStorage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [internalEmotion, setInternalEmotion] = useState(initialEmotion);
  const currentEmotion = emotion && emotionMap[emotion] ? emotion : internalEmotion;

  useEffect(() => {
    if (emotion !== undefined || !persistenceKey || typeof window === 'undefined') return;
    const saved = window.localStorage.getItem(persistenceKey);
    if (saved && emotionMap[saved] && saved !== internalEmotion) {
      setInternalEmotion(saved);
    }
    // This restoration is intentionally mount/config driven rather than render driven.
  }, [emotion, persistenceKey, emotionMap]);

  useEffect(() => {
    if (emotion === undefined || !persistenceKey || !emotionMap[emotion] || typeof window === 'undefined') return;
    window.localStorage.setItem(persistenceKey, emotion);
  }, [emotion, persistenceKey, emotionMap]);

  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (!respectReducedMotion || typeof window === 'undefined') {
      setReducedMotion(false);
      return;
    }
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener?.('change', sync);
    return () => query.removeEventListener?.('change', sync);
  }, [respectReducedMotion]);

  const tracking = useMemo(() => {
    const resolved = resolveBooleanConfig(trackingProp, DEFAULT_TRACKING);
    return reducedMotion ? { ...resolved, enabled: false } : resolved;
  }, [trackingProp, reducedMotion]);

  const blinkConfig = useMemo(() => {
    const resolved = resolveBooleanConfig(blinkProp, DEFAULT_BLINK);
    return reducedMotion ? { ...resolved, enabled: false } : resolved;
  }, [blinkProp, reducedMotion]);

  const effectiveTransitionDuration = reducedMotion ? 0 : transitionDuration;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const currentEmotionRef = useRef(currentEmotion);
  const displayStateRef = useRef<FaceState>({ ...emotionMap[currentEmotion].state });
  const displayGradientRef = useRef<GradientStops>(cloneGradient(emotionMap[currentEmotion].gradient));
  const [renderState, setRenderState] = useState<FaceState>(displayStateRef.current);
  const [renderGradient, setRenderGradient] = useState<GradientStops>(displayGradientRef.current);

  const motionRef = useRef({
    targetX: 0,
    targetY: 0,
    x: 0,
    y: 0,
    mirrored: false,
    mirrorChanging: false,
    mirrorProgress: 0,
    mirrorFrom: 0,
    mirrorTo: 0,
    mirrorStartedAt: 0,
    mirrorTransitionDuration: tracking.mirrorDuration,
  });

  const blinkRef = useRef({
    active: false,
    startedAt: 0,
    factor: 1,
    nextAt: typeof performance !== 'undefined'
      ? performance.now() + randomBlinkDelay(blinkConfig)
      : 0,
    forced: false,
  });

  const transitionRef = useRef({
    active: false,
    startedAt: 0,
    fromEmotion: currentEmotion,
    toEmotion: currentEmotion,
    fromState: { ...displayStateRef.current },
    toState: { ...displayStateRef.current },
    fromGradient: cloneGradient(displayGradientRef.current),
    toGradient: cloneGradient(displayGradientRef.current),
  });

  const setEmotionImperatively = useCallback((next: string) => {
    if (!emotionMap[next] || next === currentEmotionRef.current) return;
    if (emotion === undefined) setInternalEmotion(next);
    onEmotionChange?.(next);
  }, [emotion, emotionMap, onEmotionChange]);

  useImperativeHandle(ref, () => ({
    setEmotion: setEmotionImperatively,
    getEmotion: () => currentEmotionRef.current,
    blink: () => {
      if (!blinkConfig.enabled || emotionMap[currentEmotionRef.current]?.blink === false) return;
      const now = performance.now();
      blinkRef.current.active = true;
      blinkRef.current.forced = true;
      blinkRef.current.startedAt = now;
      onBlink?.();
    },
    resetTracking: () => {
      const motion = motionRef.current;
      motion.targetX = 0;
      motion.targetY = 0;
      motion.x = 0;
      motion.y = 0;
      motion.mirrored = false;
      motion.mirrorChanging = false;
      motion.mirrorProgress = 0;
    },
  }), [blinkConfig.enabled, emotionMap, onBlink, setEmotionImperatively]);

  useEffect(() => {
    if (!emotionMap[currentEmotion]) return;
    const previous = currentEmotionRef.current;
    currentEmotionRef.current = currentEmotion;

    if (previous === currentEmotion) return;

    if (persistenceKey && typeof window !== 'undefined') {
      window.localStorage.setItem(persistenceKey, currentEmotion);
    }

    const now = performance.now();
    transitionRef.current = {
      active: effectiveTransitionDuration > 0,
      startedAt: now,
      fromEmotion: previous,
      toEmotion: currentEmotion,
      fromState: { ...displayStateRef.current },
      toState: { ...emotionMap[currentEmotion].state },
      fromGradient: cloneGradient(displayGradientRef.current),
      toGradient: cloneGradient(emotionMap[currentEmotion].gradient),
    };

    if (effectiveTransitionDuration <= 0) {
      displayStateRef.current = { ...emotionMap[currentEmotion].state };
      displayGradientRef.current = cloneGradient(emotionMap[currentEmotion].gradient);
      setRenderState(displayStateRef.current);
      setRenderGradient(displayGradientRef.current);
      onTransitionEnd?.(currentEmotion);
    } else {
      onTransitionStart?.(previous, currentEmotion);
    }

    const blink = blinkRef.current;
    blink.active = false;
    blink.factor = 1;
    blink.nextAt = now + randomBlinkDelay(blinkConfig);
  }, [currentEmotion, emotionMap, effectiveTransitionDuration, easing, persistenceKey, blinkConfig, onTransitionStart, onTransitionEnd]);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      if (!tracking.enabled || !wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const spanX = event.clientX < cx ? Math.max(1, cx) : Math.max(1, window.innerWidth - cx);
      const spanY = event.clientY < cy ? Math.max(1, cy) : Math.max(1, window.innerHeight - cy);
      const x = clamp((event.clientX - cx) / spanX, -1, 1);
      const y = clamp((event.clientY - cy) / spanY, -1, 1);
      const motion = motionRef.current;

      if (tracking.mirrorEnabled) {
        if (!motion.mirrored && x <= -Math.abs(tracking.mirrorEnter)) {
          motion.mirrored = true;
          motion.mirrorFrom = motion.mirrorProgress;
          motion.mirrorTo = 1;
          motion.mirrorStartedAt = performance.now();
          motion.mirrorTransitionDuration = Math.max(80, tracking.mirrorDuration * Math.abs(1 - motion.mirrorProgress));
          motion.mirrorChanging = true;
        } else if (motion.mirrored && x >= -Math.abs(tracking.mirrorExit)) {
          motion.mirrored = false;
          motion.mirrorFrom = motion.mirrorProgress;
          motion.mirrorTo = 0;
          motion.mirrorStartedAt = performance.now();
          motion.mirrorTransitionDuration = Math.max(80, tracking.mirrorDuration * Math.abs(motion.mirrorProgress));
          motion.mirrorChanging = true;
        }
      }

      motion.targetX = applyDeadzone(x, clamp(tracking.deadzone, 0, 0.95));
      motion.targetY = applyDeadzone(y, clamp(tracking.deadzone, 0, 0.95));
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, [tracking]);

  useEffect(() => {
    const tick = (now: number) => {
      const transition = transitionRef.current;
      if (transition.active) {
        const raw = clamp((now - transition.startedAt) / Math.max(1, effectiveTransitionDuration), 0, 1);
        const t = ease(easing, raw);
        displayStateRef.current = interpolateFaceState(transition.fromState, transition.toState, t);
        displayGradientRef.current = interpolateGradient(transition.fromGradient, transition.toGradient, t);
        if (raw >= 1) {
          transition.active = false;
          displayStateRef.current = { ...transition.toState };
          displayGradientRef.current = cloneGradient(transition.toGradient);
          onTransitionEnd?.(transition.toEmotion);
        }
      }

      const motion = motionRef.current;
      const smoothing = clamp(tracking.smoothing, 0.001, 1);
      motion.x += (motion.targetX - motion.x) * smoothing;
      motion.y += (motion.targetY - motion.y) * smoothing;
      if (motion.mirrorChanging) {
        const raw = clamp((now - motion.mirrorStartedAt) / Math.max(1, motion.mirrorTransitionDuration), 0, 1);
        motion.mirrorProgress = lerp(motion.mirrorFrom, motion.mirrorTo, ease('easeInOutCubic', raw));
        if (raw >= 1) {
          motion.mirrorProgress = motion.mirrorTo;
          motion.mirrorChanging = false;
        }
      }

      const blinkState = blinkRef.current;
      const emotionAllowsBlink = emotionMap[currentEmotionRef.current]?.blink !== false;
      if (!blinkConfig.enabled || !emotionAllowsBlink) {
        blinkState.active = false;
        blinkState.factor = 1;
        blinkState.nextAt = now + randomBlinkDelay(blinkConfig);
      } else if (!blinkState.active && now >= blinkState.nextAt) {
        blinkState.active = true;
        blinkState.forced = false;
        blinkState.startedAt = now;
        onBlink?.();
      } else if (blinkState.active) {
        const raw = clamp((now - blinkState.startedAt) / Math.max(1, blinkConfig.duration), 0, 1);
        blinkState.factor = Math.abs(raw * 2 - 1);
        if (raw >= 1) {
          blinkState.active = false;
          blinkState.forced = false;
          blinkState.factor = 1;
          blinkState.nextAt = now + randomBlinkDelay(blinkConfig);
        }
      }

      setRenderState({ ...displayStateRef.current });
      setRenderGradient(cloneGradient(displayGradientRef.current));
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [blinkConfig, tracking, effectiveTransitionDuration, easing, emotionMap, onBlink, onTransitionEnd]);

  const gradientId = `mascot-gradient-${useId().replace(/:/g, '')}`;
  const motion = motionRef.current;
  const blinkFactor = blinkRef.current.factor;
  const leftBase = eyePose('left', renderState);
  const rightBase = eyePose('right', renderState);
  const left = interpolateEye(leftBase, mirroredEyeTarget(rightBase, renderState), motion.mirrorProgress);
  const right = interpolateEye(rightBase, mirroredEyeTarget(leftBase, renderState), motion.mirrorProgress);
  left.height = Math.max(0.001, left.height * blinkFactor);
  right.height = Math.max(0.001, right.height * blinkFactor);

  const mirroredMouthX = 2 * renderState.faceX - renderState.mouthX;
  const mouthState: FaceState = {
    ...renderState,
    mouthX: lerp(renderState.mouthX, mirroredMouthX, motion.mirrorProgress),
    mouthLeftOffset: lerp(renderState.mouthLeftOffset, renderState.mouthRightOffset, motion.mirrorProgress),
    mouthRightOffset: lerp(renderState.mouthRightOffset, renderState.mouthLeftOffset, motion.mirrorProgress),
    mouthRotation: lerp(renderState.mouthRotation, -renderState.mouthRotation, motion.mirrorProgress),
  };

  const gradientCx = renderState.faceX - renderState.faceWidth * 0.25;
  const gradientCy = renderState.faceY - renderState.faceHeight * 0.32;
  const gradientRadius = Math.max(renderState.faceWidth, renderState.faceHeight) * 1.22;
  const tx = tracking.enabled ? motion.x * tracking.maxMoveX : 0;
  const ty = tracking.enabled ? motion.y * tracking.maxMoveY : 0;
  const eyeVerticalExtra = tracking.enabled
    ? motion.y * tracking.maxMoveY * Math.max(0, tracking.eyeVerticalBoost - 1)
    : 0;

  return (
    <div
      ref={wrapperRef}
      className={className}
      style={{
        width: resolveSize(size),
        aspectRatio: '1',
        display: 'inline-grid',
        placeItems: 'center',
        ...style,
      }}
      data-emotion={currentEmotion}
    >
      <svg
        viewBox="-180 -180 360 360"
        width="100%"
        height="100%"
        role="img"
        aria-label={ariaLabel}
        style={{ overflow: 'visible', display: 'block' }}
      >
        <defs>
          <radialGradient
            id={gradientId}
            gradientUnits="userSpaceOnUse"
            cx={gradientCx}
            cy={gradientCy}
            r={gradientRadius}
            fx={gradientCx}
            fy={gradientCy}
            gradientTransform={rotationTransform(renderState.faceRotation, renderState.faceX, renderState.faceY)}
          >
            <stop offset="0%" stopColor={renderGradient[0]} />
            <stop offset="32%" stopColor={renderGradient[1]} />
            <stop offset="72%" stopColor={renderGradient[2]} />
            <stop offset="100%" stopColor={renderGradient[3]} />
          </radialGradient>
        </defs>

        <path
          d={roundedRectPath(renderState.faceX, renderState.faceY, renderState.faceWidth, renderState.faceHeight, renderState.faceRadius)}
          transform={rotationTransform(renderState.faceRotation, renderState.faceX, renderState.faceY)}
          fill={`url(#${gradientId})`}
        />

        <g transform={`translate(${formatNumber(tx)} ${formatNumber(ty)})`}>
          <g transform={`translate(0 ${formatNumber(eyeVerticalExtra)})`}>
            <path
              d={roundedRectPath(left.x, left.y, left.width, left.height, left.radius)}
              transform={rotationTransform(left.rotation, left.x, left.y)}
              fill={GRAPHITE}
            />
            <path
              d={roundedRectPath(right.x, right.y, right.width, right.height, right.radius)}
              transform={rotationTransform(right.rotation, right.x, right.y)}
              fill={GRAPHITE}
            />
          </g>

          <path
            d={mouthPath(mouthState)}
            transform={rotationTransform(mouthState.mouthRotation, mouthState.mouthX, mouthState.mouthY)}
            fill="none"
            stroke={GRAPHITE}
            strokeWidth={Math.max(0, mouthState.mouthStroke)}
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}

export const MascotFace = forwardRef(MascotFaceInner);
MascotFace.displayName = 'MascotFace';