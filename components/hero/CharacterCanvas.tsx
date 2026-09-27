"use client";

/**
 * The 3D character. Loaded lazily by HeroStage (never on the server, never
 * before first paint), so three.js stays out of the initial bundle.
 * Renders your .glb if one exists, otherwise the built-in "little me".
 */
import { Component, Suspense, useEffect, useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import LittleMe from "./LittleMe";

type Props = {
  /** A .glb URL, or null to use the built-in character. */
  url: string | null;
  /** Pause rendering when the hero is off-screen. */
  active: boolean;
  reducedMotion: boolean;
  compact: boolean;
  /** Changes whenever the character should wave (e.g. hero re-enters view). */
  waveKey: number;
  onReady: () => void;
  onError: () => void;
  onWave: (waving: boolean) => void;
};

/**
 * Last cursor position in client pixels, tracked on the window so the character
 * reacts anywhere on the page. Characters convert it relative to their own canvas.
 */
export type PointerState = { cx: number; cy: number; active: boolean };
const pointer: PointerState = { cx: 0, cy: 0, active: false };

function GltfCharacter({ url, reducedMotion, waveKey, onReady, onWave }: Pick<Props, "reducedMotion" | "waveKey" | "onReady" | "onWave"> & { url: string }) {
  const gltf = useLoader(GLTFLoader, url, (loader) => {
    loader.setMeshoptDecoder(MeshoptDecoder);
  });
  const group = useRef<THREE.Group>(null);
  const gl = useThree((s) => s.gl);

  // Normalise any model: fits a ~1.9 × 1.5 unit frame, centred, feet near the bottom.
  const model = useMemo(() => {
    const scene = gltf.scene;
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const scale = Math.min(1.9 / (size.y || 1), 1.5 / (size.x || 1));
    scene.scale.setScalar(scale);
    scene.position.set(-center.x * scale, -box.min.y * scale - 1.05, -center.z * scale);
    return scene;
  }, [gltf.scene]);

  // Clips: a "wave" clip plays on demand; an "idle" clip (or the first other clip) loops.
  const { mixer, idle, wave } = useMemo(() => {
    if (!gltf.animations.length) return { mixer: null, idle: null, wave: null };
    const m = new THREE.AnimationMixer(model);
    const waveClip = gltf.animations.find((c) => /wave|hello|greet/i.test(c.name));
    const idleClip =
      gltf.animations.find((c) => /idle/i.test(c.name)) ?? gltf.animations.find((c) => c !== waveClip) ?? null;
    return { mixer: m, idle: idleClip ? m.clipAction(idleClip) : null, wave: waveClip ? m.clipAction(waveClip) : null };
  }, [gltf.animations, model]);

  useEffect(() => {
    if (!reducedMotion) idle?.play();
    onReady();
    return () => {
      mixer?.stopAllAction();
    };
  }, [mixer, idle, reducedMotion, onReady]);

  useEffect(() => {
    if (!mixer || !wave || reducedMotion) return;
    wave.reset().setLoop(THREE.LoopOnce, 1);
    if (idle) wave.crossFadeFrom(idle, 0.3, false);
    wave.play();
    onWave(true);
    const done = () => {
      onWave(false);
      if (idle) {
        idle.reset().play();
        idle.crossFadeFrom(wave, 0.4, false);
      }
    };
    mixer.addEventListener("finished", done);
    return () => mixer.removeEventListener("finished", done);
  }, [waveKey, mixer, wave, idle, reducedMotion, onWave]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g || reducedMotion) return;
    mixer?.update(Math.min(delta, 0.05));
    // Turn toward the cursor relative to the character's own canvas (centre = straight ahead).
    const rect = gl.domElement.getBoundingClientRect();
    const nx = pointer.active ? THREE.MathUtils.clamp(((pointer.cx - rect.left) / rect.width) * 2 - 1, -2, 2) : 0;
    const ny = pointer.active ? THREE.MathUtils.clamp(((pointer.cy - rect.top) / rect.height) * 2 - 1, -2, 2) : 0;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, nx * 0.35, 3, delta);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, ny * 0.06, 3, delta);
    g.position.y = Math.sin(state.clock.elapsedTime * 1.1) * 0.035;
  });

  return (
    <group ref={group}>
      <primitive object={model} />
    </group>
  );
}

class LoadBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function CharacterCanvas({ url, active, reducedMotion, compact, waveKey, onReady, onError, onWave }: Props) {
  useEffect(() => {
    if (reducedMotion) return;
    const onMove = (e: PointerEvent) => {
      pointer.cx = e.clientX;
      pointer.cy = e.clientY;
      pointer.active = e.pointerType === "mouse" || e.pointerType === "pen";
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reducedMotion]);

  return (
    <Canvas
      dpr={compact ? [1, 1.5] : [1, 1.75]}
      camera={{ position: [0, 0.15, 4.4], fov: 32 }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      frameloop={active && !reducedMotion ? "always" : "demand"}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", onError, { once: true });
      }}
      aria-hidden
    >
      {/* Warm key, cool fill, ember rim — matches the site palette */}
      <hemisphereLight args={["#fff4ea", "#2a2320", 1.1]} />
      <directionalLight position={[-2.5, 3, 3]} intensity={2.2} color="#fff1e6" />
      <directionalLight position={[3, 1.5, -2.5]} intensity={3} color="#ff6a3d" />
      <directionalLight position={[2, -1, 3]} intensity={0.6} color="#b9c6ff" />
      <LoadBoundary onError={onError}>
        <Suspense fallback={null}>
          {url ? (
            <GltfCharacter url={url} reducedMotion={reducedMotion} waveKey={waveKey} onReady={onReady} onWave={onWave} />
          ) : (
            <LittleMe waveKey={waveKey} reducedMotion={reducedMotion} pointer={pointer} onReady={onReady} onWave={onWave} />
          )}
        </Suspense>
      </LoadBoundary>
    </Canvas>
  );
}
