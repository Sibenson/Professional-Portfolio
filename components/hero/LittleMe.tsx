"use client";

/**
 * "Little me" — a stylised, smart-casual character built from primitives,
 * used when no .glb model is provided. Appearance comes from data/site.ts
 * (character.look). Looks at the cursor, waves when `waveKey` changes
 * (hero enters view) and on hover.
 */
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { site } from "@/data/site";
import type { PointerState } from "./CharacterCanvas";

type Props = {
  waveKey: number;
  reducedMotion: boolean;
  pointer: PointerState;
  onReady: () => void;
  onWave: (waving: boolean) => void;
};

const WAVE_SECONDS = 2.6;
const smooth = (x: number) => x * x * (3 - 2 * x);
const clamp = THREE.MathUtils.clamp;
const damp = THREE.MathUtils.damp;

function useMat(color: string, roughness = 0.6, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => new THREE.MeshStandardMaterial({ color, roughness, metalness: 0, ...extra }), [color, roughness]);
}

function useCanvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, deps: unknown[]) {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    draw(c.getContext("2d")!);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/** A thin strap between two points (used for the lanyard). */
function Strap({ from, to, material }: { from: [number, number, number]; to: [number, number, number]; material: THREE.Material }) {
  const { position, quaternion, length } = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const dir = b.clone().sub(a);
    return {
      position: a.clone().add(b).multiplyScalar(0.5),
      quaternion: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize()),
      length: dir.length(),
    };
  }, [from, to]);
  return (
    <mesh position={position} quaternion={quaternion} material={material}>
      <cylinderGeometry args={[0.009, 0.009, length, 6]} />
    </mesh>
  );
}

export default function LittleMe({ waveKey, reducedMotion, pointer, onReady, onWave }: Props) {
  const look = site.character.look;
  const { camera, gl } = useThree();

  const skin = useMat(look.skin, 0.65);
  const hair = useMat(look.hair, 0.9);
  const jacket = useMat(look.jacket, 0.8);
  const lapel = useMat(new THREE.Color(look.jacket).multiplyScalar(0.8).getStyle(), 0.8);
  const shirt = useMat(look.shirt, 0.9);
  const pants = useMat(look.pants, 0.85);
  const shoes = useMat(look.shoes, 0.45);
  const sole = useMat("#ff6a3d", 0.5);
  const dark = useMat("#121114", 0.35);
  const eyeWhite = useMat("#f7f3ee", 0.3);
  const strap = useMat("#ff6a3d", 0.6);
  const stubble = useMat(look.hair, 1, { transparent: true, opacity: 0.28 });

  const badge = useCanvasTexture(
    160,
    224,
    (g) => {
      g.fillStyle = "#f7f3ee";
      g.beginPath();
      g.roundRect(0, 0, 160, 224, 18);
      g.fill();
      g.fillStyle = "#ff6a3d";
      g.fillRect(0, 0, 160, 46);
      g.fillStyle = "#141416";
      g.textAlign = "center";
      g.font = "700 40px system-ui, -apple-system, Segoe UI, sans-serif";
      g.fillText(look.badge, 80, 128);
      g.font = "500 20px system-ui, -apple-system, Segoe UI, sans-serif";
      g.fillStyle = "#6f6c66";
      g.fillText(site.firstName, 80, 170);
    },
    [look.badge],
  );
  const screen = useCanvasTexture(
    240,
    320,
    (g) => {
      g.fillStyle = "#15161a";
      g.fillRect(0, 0, 240, 320);
      g.font = "600 18px ui-monospace, Menlo, monospace";
      g.fillStyle = "#a29e96";
      g.fillText("RELEASE", 22, 40);
      for (let i = 0; i < 5; i++) {
        const y = 80 + i * 44;
        g.fillStyle = "#7ed6a5";
        g.beginPath();
        g.arc(34, y, 10, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = "#3a3a40";
        g.fillRect(56, y - 5, 140 - i * 14, 10);
      }
    },
    [],
  );

  const root = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const eyes = useRef<THREE.Group>(null);
  const pupils = useRef<THREE.Group>(null);
  const shoulderR = useRef<THREE.Group>(null);
  const elbowR = useRef<THREE.Group>(null);

  const wave = useRef({ start: 0, pending: true, active: false });
  const blink = useRef({ next: 2.5 });
  const tmp = useMemo(
    () => ({
      ray: new THREE.Raycaster(),
      ndc: new THREE.Vector2(),
      plane: new THREE.Plane(new THREE.Vector3(0, 0, 1), -1.1), // z = 1.1, just in front of the character
      target: new THREE.Vector3(),
      headPos: new THREE.Vector3(),
    }),
    [],
  );

  useEffect(() => {
    onReady();
  }, [onReady]);

  useEffect(() => {
    wave.current.pending = true;
  }, [waveKey]);

  const onHover = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = "pointer";
    if (!wave.current.active) wave.current.pending = true;
  };
  const onOut = () => {
    document.body.style.cursor = "";
  };

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const w = wave.current;

    if (w.pending && !reducedMotion && !w.active) {
      w.pending = false;
      w.start = t;
      w.active = true;
      onWave(true);
    }
    let e = 0;
    let since = 0;
    if (w.active) {
      since = t - w.start;
      if (since >= WAVE_SECONDS) {
        w.active = false;
        onWave(false);
      } else {
        e = smooth(Math.min(1, since / 0.35, (WAVE_SECONDS - since) / 0.45));
      }
    }

    if (reducedMotion || !root.current || !head.current) return;

    // ── Gaze: cast a ray from the cursor into the scene and look at the hit point.
    // Measured against the canvas itself, so "on the character" means "straight ahead".
    head.current.getWorldPosition(tmp.headPos);
    if (pointer.active) {
      const rect = gl.domElement.getBoundingClientRect();
      tmp.ndc.set(((pointer.cx - rect.left) / rect.width) * 2 - 1, -((pointer.cy - rect.top) / rect.height) * 2 + 1);
      tmp.ray.setFromCamera(tmp.ndc, camera);
      if (!tmp.ray.ray.intersectPlane(tmp.plane, tmp.target)) tmp.target.copy(camera.position);
    } else {
      tmp.target.copy(camera.position); // no cursor (touch): eye contact with the viewer
    }
    const dx = tmp.target.x - tmp.headPos.x;
    const dy = tmp.target.y - tmp.headPos.y;
    const dz = Math.max(0.2, tmp.target.z - tmp.headPos.z);
    const yaw = clamp(Math.atan2(dx, dz), -1.0, 1.0);
    const pitch = clamp(Math.atan2(dy, Math.hypot(dx, dz)), -0.55, 0.5);

    // Body turns a little, head does most of the work, pupils lead.
    root.current.rotation.y = damp(root.current.rotation.y, yaw * 0.25, 3, delta);
    root.current.position.y = -0.1 + Math.sin(t * 1.4) * 0.02;
    head.current.rotation.y = damp(head.current.rotation.y, yaw * 0.62, 6, delta);
    head.current.rotation.x = damp(head.current.rotation.x, -pitch * 0.7, 6, delta);
    head.current.rotation.z = damp(head.current.rotation.z, -e * 0.12, 6, delta);
    if (pupils.current) {
      pupils.current.position.x = damp(pupils.current.position.x, yaw * 0.018, 12, delta);
      pupils.current.position.y = damp(pupils.current.position.y, pitch * 0.016, 12, delta);
    }
    if (torso.current) torso.current.scale.y = 1 + Math.sin(t * 2.2) * 0.01;

    // Blink.
    if (eyes.current) {
      if (t > blink.current.next) blink.current.next = t + 2.6 + Math.random() * 2.6;
      eyes.current.scale.y = damp(eyes.current.scale.y, blink.current.next - t < 0.11 ? 0.08 : 1, 30, delta);
    }

    // Wave: right arm raises, forearm swings.
    if (shoulderR.current && elbowR.current) {
      shoulderR.current.rotation.z = THREE.MathUtils.lerp(0.12, 2.65, e);
      shoulderR.current.rotation.x = -0.2 * e;
      elbowR.current.rotation.z = e * (0.3 + 0.45 * Math.sin(since * 12));
    }
  });

  return (
    <group ref={root} scale={0.9} position={[0, -0.1, 0]} onPointerOver={onHover} onPointerOut={onOut}>
      {/* Legs + sneakers */}
      {[-1, 1].map((s) => (
        <group key={s} position={[0.11 * s, 0, 0]}>
          <mesh material={pants} position={[0, -0.62, 0]}>
            <capsuleGeometry args={[0.1, 0.5, 6, 16]} />
          </mesh>
          <mesh material={shoes} position={[0, -0.985, 0.05]} scale={[1, 0.55, 1.6]}>
            <sphereGeometry args={[0.11, 20, 14]} />
          </mesh>
          <mesh material={sole} position={[0, -1.02, 0.05]} scale={[1.02, 0.18, 1.62]}>
            <sphereGeometry args={[0.11, 20, 10]} />
          </mesh>
        </group>
      ))}

      {/* Torso: open jacket over a tee, lanyard + badge */}
      <group ref={torso}>
        <mesh material={jacket} scale={[1.12, 1, 0.8]}>
          <capsuleGeometry args={[0.25, 0.34, 8, 24]} />
        </mesh>
        <mesh material={shirt} position={[0, 0.12, 0.186]}>
          <boxGeometry args={[0.15, 0.46, 0.03]} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} material={lapel} position={[0.1 * s, 0.22, 0.2]} rotation={[0.1, 0, 0.42 * s]}>
            <boxGeometry args={[0.06, 0.24, 0.02]} />
          </mesh>
        ))}
        <Strap from={[-0.08, 0.42, 0.12]} to={[0, 0.16, 0.215]} material={strap} />
        <Strap from={[0.08, 0.42, 0.12]} to={[0, 0.16, 0.215]} material={strap} />
        <mesh position={[0, 0.07, 0.218]} rotation={[-0.08, 0, 0]}>
          <planeGeometry args={[0.1, 0.14]} />
          <meshStandardMaterial map={badge} roughness={0.45} />
        </mesh>
      </group>

      {/* Right arm (waves) */}
      <group ref={shoulderR} position={[0.3, 0.3, 0]} rotation={[0, 0, 0.12]}>
        <mesh material={jacket} position={[0, -0.16, 0]}>
          <capsuleGeometry args={[0.075, 0.22, 6, 16]} />
        </mesh>
        <group ref={elbowR} position={[0, -0.32, 0]}>
          <mesh material={jacket} position={[0, -0.12, 0]}>
            <capsuleGeometry args={[0.07, 0.16, 6, 16]} />
          </mesh>
          <mesh material={skin} position={[0, -0.29, 0]} scale={[0.9, 1.1, 0.8]}>
            <sphereGeometry args={[0.07, 16, 12]} />
          </mesh>
        </group>
      </group>

      {/* Left arm holding a tablet */}
      <group position={[-0.3, 0.3, 0]} rotation={[-0.25, 0, -0.14]}>
        <mesh material={jacket} position={[0, -0.16, 0]}>
          <capsuleGeometry args={[0.075, 0.22, 6, 16]} />
        </mesh>
        <group position={[0, -0.32, 0]} rotation={[-1.25, 0, 0]}>
          <mesh material={jacket} position={[0, -0.12, 0]}>
            <capsuleGeometry args={[0.07, 0.16, 6, 16]} />
          </mesh>
          <mesh material={skin} position={[0, -0.28, 0.01]} scale={[0.9, 1.1, 0.8]}>
            <sphereGeometry args={[0.07, 16, 12]} />
          </mesh>
          <group position={[0.1, -0.24, 0.06]} rotation={[1.35, 0.35, 0.1]}>
            <mesh material={dark}>
              <boxGeometry args={[0.2, 0.27, 0.014]} />
            </mesh>
            <mesh position={[0, 0, 0.0075]}>
              <planeGeometry args={[0.18, 0.25]} />
              <meshStandardMaterial map={screen} emissive="#ffffff" emissiveMap={screen} emissiveIntensity={0.35} roughness={0.3} />
            </mesh>
          </group>
        </group>
      </group>

      {/* Neck + head */}
      <mesh material={skin} position={[0, 0.46, 0]}>
        <cylinderGeometry args={[0.075, 0.085, 0.16, 16]} />
      </mesh>
      <group ref={head} position={[0, 0.72, 0]}>
        <mesh material={skin} scale={[0.92, 1.05, 0.95]}>
          <sphereGeometry args={[0.3, 40, 32]} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} material={skin} position={[0.275 * s, -0.02, -0.01]} scale={[0.5, 1, 0.8]}>
            <sphereGeometry args={[0.06, 14, 10]} />
          </mesh>
        ))}

        {/* Hair: cap + swept quiff */}
        <mesh material={hair} position={[0, 0.03, -0.015]} rotation={[-0.42, 0, 0]} scale={[0.95, 1.05, 1]}>
          <sphereGeometry args={[0.305, 40, 24, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        </mesh>
        {[
          { p: [-0.1, 0.26, 0.13], r: [0.5, 0, 0.35], s: [1.3, 0.55, 1] },
          { p: [0.02, 0.29, 0.14], r: [0.55, 0, 0.1], s: [1.4, 0.6, 1.05] },
          { p: [0.14, 0.26, 0.11], r: [0.5, 0, -0.3], s: [1.2, 0.55, 1] },
        ].map((q, i) => (
          <mesh
            key={i}
            material={hair}
            position={q.p as [number, number, number]}
            rotation={q.r as [number, number, number]}
            scale={q.s as [number, number, number]}
          >
            <sphereGeometry args={[0.1, 18, 12]} />
          </mesh>
        ))}
        {look.beard === "stubble" && (
          <mesh material={stubble} rotation={[0.15, 0, 0]} scale={[0.93, 1.05, 0.96]}>
            <sphereGeometry args={[0.302, 32, 16, -Math.PI * 0.75, Math.PI * 1.5, Math.PI * 0.62, Math.PI * 0.3]} />
          </mesh>
        )}

        {/* Eyes (whites + pupils that follow the cursor) */}
        <group ref={eyes} position={[0, 0.0, 0]}>
          {[-1, 1].map((s) => (
            <mesh key={s} material={eyeWhite} position={[0.1 * s, 0, 0.258]} scale={[1.15, 0.9, 0.5]}>
              <sphereGeometry args={[0.042, 16, 12]} />
            </mesh>
          ))}
          <group ref={pupils}>
            {[-1, 1].map((s) => (
              <mesh key={s} material={dark} position={[0.1 * s, 0, 0.276]} scale={[1, 1, 0.5]}>
                <sphereGeometry args={[0.024, 14, 10]} />
              </mesh>
            ))}
          </group>
        </group>
        {/* Brows, nose, mouth */}
        {[-1, 1].map((s) => (
          <mesh key={s} material={hair} position={[0.1 * s, 0.075, 0.262]} rotation={[0, 0, -0.08 * s]}>
            <boxGeometry args={[0.08, 0.017, 0.012]} />
          </mesh>
        ))}
        <mesh material={skin} position={[0, -0.045, 0.28]} scale={[0.8, 1, 0.9]}>
          <sphereGeometry args={[0.028, 12, 10]} />
        </mesh>
        <mesh material={dark} position={[0, -0.12, 0.262]} rotation={[0.25, 0, Math.PI]}>
          <torusGeometry args={[0.045, 0.009, 8, 20, Math.PI * 0.8]} />
        </mesh>
        {look.glasses && (
          <group position={[0, 0, 0.29]}>
            {[-1, 1].map((s) => (
              <mesh key={s} material={dark} position={[0.1 * s, 0, 0]} scale={[1.15, 0.85, 1]}>
                <torusGeometry args={[0.055, 0.008, 8, 28]} />
              </mesh>
            ))}
            <mesh material={dark}>
              <boxGeometry args={[0.07, 0.008, 0.008]} />
            </mesh>
          </group>
        )}
      </group>
    </group>
  );
}
