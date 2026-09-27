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

/**
 * Reshape a sphere into an oval head: taller than wide, tapering smoothly
 * to a rounded chin, with a softly defined jaw. Applied to the head, hair
 * cap and beard so the shells stay fitted to each other.
 */
function ovalHead(geo: THREE.BufferGeometry, radius: number) {
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).divideScalar(radius);
    const lower = THREE.MathUtils.clamp((0.05 - v.y) / 1.05, 0, 1); // 0 at cheekbones → 1 at chin
    const upper = Math.max(0, v.y - 0.4);
    const taper = 1 - 0.16 * lower * lower - 0.05 * upper; // narrower toward the chin
    pos.setXYZ(i, v.x * taper * radius, v.y * 1.16 * radius, v.z * (1 - 0.05 * lower) * radius);
  }
  geo.computeVertexNormals();
  return geo;
}

type V3 = [number, number, number];
/**
 * Hair locks (ellipsoids, head-local coords) modelled on the reference photos:
 * textured, medium-length top swept up and back from a side part, a lifted
 * front, medium sides, and loose strands falling onto the forehead.
 */
const HAIR_LOCKS: { p: V3; r: V3; s: V3 }[] = [
  // Crown / back volume
  { p: [0, 0.26, -0.14], r: [0.2, 0, 0], s: [1.45, 0.75, 1.3] },
  { p: [-0.12, 0.22, -0.2], r: [0.5, -0.3, 0.2], s: [0.9, 0.6, 1.2] },
  { p: [0.12, 0.22, -0.2], r: [0.5, 0.3, -0.2], s: [0.9, 0.6, 1.2] },
  // Swept-back top locks, fanning away from a part on one side
  { p: [-0.19, 0.27, 0.02], r: [-0.25, -0.25, 0.55], s: [0.6, 0.5, 1.9] },
  { p: [-0.1, 0.32, 0.04], r: [-0.3, 0.1, 0.15], s: [0.75, 0.55, 2.0] },
  { p: [0.0, 0.35, 0.05], r: [-0.32, 0.2, -0.05], s: [0.8, 0.55, 2.05] },
  { p: [0.1, 0.34, 0.04], r: [-0.3, 0.3, -0.25], s: [0.8, 0.55, 2.0] },
  { p: [0.19, 0.29, 0.02], r: [-0.25, 0.4, -0.5], s: [0.65, 0.5, 1.9] },
  // Lifted front (the quiff) — front ends turn up and over
  { p: [-0.08, 0.34, 0.19], r: [-0.75, 0.1, 0.1], s: [1.0, 0.5, 0.85] },
  { p: [0.04, 0.36, 0.2], r: [-0.8, 0, -0.1], s: [1.15, 0.52, 0.85] },
  { p: [0.14, 0.32, 0.2], r: [-0.7, -0.1, -0.35], s: [0.95, 0.5, 0.8] },
  // Medium sides, swept back over the ears
  { p: [-0.25, 0.15, -0.03], r: [0.25, 0, 0.05], s: [0.42, 0.6, 1.55] },
  { p: [0.25, 0.15, -0.03], r: [0.25, 0, -0.05], s: [0.42, 0.6, 1.55] },
  // Loose strands falling across the forehead
  { p: [0.07, 0.215, 0.27], r: [0.35, 0, 0.5], s: [0.3, 0.95, 0.26] },
  { p: [0.14, 0.205, 0.25], r: [0.3, 0.1, 0.75], s: [0.26, 0.85, 0.24] },
  { p: [-0.02, 0.23, 0.275], r: [0.35, 0, 0.3], s: [0.24, 0.7, 0.22] },
];

/** A thin strap between two points (used for the lanyard). */
function Strap({
  from,
  to,
  material,
  radius = 0.009,
}: {
  from: [number, number, number];
  to: [number, number, number];
  material: THREE.Material;
  radius?: number;
}) {
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
      <cylinderGeometry args={[radius, radius, length, 6]} />
    </mesh>
  );
}

export default function LittleMe({ waveKey, reducedMotion, pointer, onReady, onWave }: Props) {
  const look = site.character.look;
  const { camera, gl } = useThree();

  const skin = useMat(look.skin, 0.65);
  const hair = useMat(look.hair, 0.95);
  const shirt = useMat(look.shirt, 0.85);
  const collar = useMat(new THREE.Color(look.shirt).offsetHSL(0, 0, 0.05).getStyle(), 0.8);
  const button = useMat("#34343a", 0.4);
  const pants = useMat(look.pants, 0.9);
  const pocket = useMat(new THREE.Color(look.pants).multiplyScalar(0.85).getStyle(), 0.9);
  const shoes = useMat(look.shoes, 0.45);
  const sole = useMat("#e5b842", 0.5);
  const dark = useMat("#121114", 0.35);
  const mouthIn = useMat("#3a1414", 0.6);
  const teeth = useMat("#f4f1ea", 0.3);
  const eyeWhite = useMat("#f7f3ee", 0.3);
  const strap = useMat("#e5b842", 0.6);
  const gold = useMat("#e5b842", 0.25, { metalness: 0.85 });
  const silver = useMat("#c9ccd1", 0.25, { metalness: 0.9 });
  const frame = useMat(look.glassesFrame, 0.3, { metalness: 0.8 });
  const lens = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.05, transparent: true, opacity: 0.08 }),
    [],
  );

  const badge = useCanvasTexture(
    160,
    224,
    (g) => {
      g.fillStyle = "#f7f3ee";
      g.beginPath();
      g.roundRect(0, 0, 160, 224, 18);
      g.fill();
      g.fillStyle = "#e5b842";
      g.fillRect(0, 0, 160, 46);
      g.fillStyle = "#141416";
      g.textAlign = "center";
      g.font = "700 40px system-ui, -apple-system, Segoe UI, sans-serif";
      g.fillText(look.badge, 80, 128);
      g.font = "500 20px system-ui, -apple-system, Segoe UI, sans-serif";
      g.fillStyle = "#6b7280";
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
      g.fillStyle = "#9ca3af";
      g.fillText("RELEASE", 22, 40);
      for (let i = 0; i < 5; i++) {
        const y = 80 + i * 44;
        g.fillStyle = "#e5b842";
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
  // Divine-style golden aura: pure light (radial glow), no rings or symbols.
  const auraTex = useCanvasTexture(
    512,
    512,
    (g) => {
      const grad = g.createRadialGradient(256, 256, 0, 256, 256, 256);
      grad.addColorStop(0, "rgba(255, 230, 160, 1)");
      grad.addColorStop(0.3, "rgba(248, 206, 100, 0.85)");
      grad.addColorStop(0.5, "rgba(229, 184, 66, 0.42)");
      grad.addColorStop(0.72, "rgba(229, 184, 66, 0.13)");
      grad.addColorStop(1, "rgba(229, 184, 66, 0)");
      g.fillStyle = grad;
      g.fillRect(0, 0, 512, 512);
    },
    [],
  );
  const auraMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: auraTex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    [auraTex],
  );
  const bodyAuraMat = useMemo(() => {
    const m = auraMat.clone();
    m.opacity = 0.45;
    return m;
  }, [auraMat]);
  const aura = useRef<THREE.Group>(null);

  const headGeo = useMemo(() => ovalHead(new THREE.SphereGeometry(0.3, 56, 44), 0.3), []);
  const hairCapGeo = useMemo(
    () => ovalHead(new THREE.SphereGeometry(0.31, 48, 28, 0, Math.PI * 2, 0, Math.PI * 0.5), 0.31),
    [],
  );
  const beardGeo = useMemo(
    () =>
      ovalHead(
        new THREE.SphereGeometry(0.306, 44, 24, Math.PI * 0.02, Math.PI * 0.96, Math.PI * 0.62, Math.PI * (look.beard === "full" ? 0.38 : 0.24)),
        0.306,
      ),
    [look.beard],
  );

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

    // Aura always faces the viewer so it reads as light, not a disc.
    if (aura.current) {
      aura.current.quaternion.copy(camera.quaternion);
      if (!reducedMotion) {
        const pulse = 1 + Math.sin(t * 0.9) * 0.05;
        aura.current.scale.setScalar(pulse);
        auraMat.opacity = 0.85 + Math.sin(t * 0.9) * 0.1;
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

  // Upper arm: short black sleeve over a bare arm.
  const sleeveArm = () => (
    <>
      {/* Short sleeve */}
      <mesh material={shirt} position={[0, -0.07, 0]}>
        <capsuleGeometry args={[0.098, 0.09, 6, 16]} />
      </mesh>
      <mesh material={skin} position={[0, -0.18, 0]}>
        <capsuleGeometry args={[0.076, 0.18, 6, 16]} />
      </mesh>
    </>
  );

  return (
    <group ref={root} scale={0.9} position={[0, -0.1, 0]} onPointerOver={onHover} onPointerOut={onOut}>
      {/* Golden aura from behind — light only */}
      <group ref={aura} position={[0, 0.76, -0.45]}>
        <mesh material={auraMat} renderOrder={-1} raycast={() => null}>
          <planeGeometry args={[1.45, 1.45]} />
        </mesh>
        <mesh material={bodyAuraMat} position={[0, -0.8, -0.02]} renderOrder={-2} raycast={() => null}>
          <planeGeometry args={[1.8, 2.8]} />
        </mesh>
      </group>
      {/* Warm gold back-light: rim-lights hair and shoulders so they separate from the dark page */}
      <pointLight position={[0, 1.05, -0.45]} color="#ffcf6b" intensity={8} distance={2.4} decay={1.2} />
      <pointLight position={[0, 0.1, -0.6]} color="#e5b842" intensity={1.6} distance={2.2} decay={1.4} />
      {/* Baggy light-wash cargo jeans + sneakers */}
      {[-1, 1].map((s) => (
        <group key={s} position={[0.115 * s, 0, 0]}>
          <mesh material={pants} position={[0, -0.63, 0]}>
            <capsuleGeometry args={[0.118, 0.48, 6, 16]} />
          </mesh>
          <mesh material={pocket} position={[0.108 * s, -0.6, 0.01]} rotation={[0, 0, 0.04 * s]}>
            <boxGeometry args={[0.03, 0.13, 0.11]} />
          </mesh>
          <mesh material={shoes} position={[0, -0.985, 0.05]} scale={[1.05, 0.55, 1.6]}>
            <sphereGeometry args={[0.11, 20, 14]} />
          </mesh>
          <mesh material={sole} position={[0, -1.02, 0.05]} scale={[1.07, 0.18, 1.62]}>
            <sphereGeometry args={[0.11, 20, 10]} />
          </mesh>
        </group>
      ))}

      {/* Torso: black short-sleeve shirt, open collar, chain, lanyard badge */}
      <group ref={torso}>
        <mesh material={shirt} scale={[1.18, 1, 0.84]}>
          <capsuleGeometry args={[0.26, 0.34, 8, 24]} />
        </mesh>
        {[0.2, 0.08, -0.04, -0.16, -0.28].map((y) => (
          <mesh key={y} material={button} position={[0, y, 0.216]}>
            <sphereGeometry args={[0.011, 8, 6]} />
          </mesh>
        ))}
        {/* Open collar: skin V + collar points */}
        <mesh material={skin} position={[0, 0.37, 0.165]} rotation={[-0.35, 0, Math.PI / 4]}>
          <boxGeometry args={[0.1, 0.1, 0.02]} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} material={collar} position={[0.06 * s, 0.37, 0.19]} rotation={[-0.3, 0, 1.05 * s]}>
            <boxGeometry args={[0.1, 0.035, 0.02]} />
          </mesh>
        ))}
        {look.chain && (
          <mesh material={gold} position={[0, 0.39, 0.06]} rotation={[1.15, 0, 0]}>
            <torusGeometry args={[0.105, 0.005, 6, 40]} />
          </mesh>
        )}
        {look.lanyard && (
          <>
            <Strap from={[-0.085, 0.43, 0.1]} to={[0.04, 0.12, 0.225]} material={strap} />
            <Strap from={[0.085, 0.43, 0.1]} to={[0.04, 0.12, 0.225]} material={strap} />
            <mesh position={[0.04, 0.03, 0.226]} rotation={[-0.08, 0, 0]}>
              <planeGeometry args={[0.1, 0.14]} />
              <meshStandardMaterial map={badge} roughness={0.45} />
            </mesh>
          </>
        )}
      </group>

      {/* Right arm (waves) — bracelet on the wrist */}
      <group ref={shoulderR} position={[0.32, 0.3, 0]} rotation={[0, 0, 0.12]}>
        {sleeveArm()}
        <group ref={elbowR} position={[0, -0.32, 0]}>
          <mesh material={skin} position={[0, -0.12, 0]}>
            <capsuleGeometry args={[0.07, 0.16, 6, 16]} />
          </mesh>
          <mesh material={gold} position={[0, -0.215, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.071, 0.009, 8, 24]} />
          </mesh>
          <mesh material={skin} position={[0, -0.29, 0]} scale={[0.9, 1.1, 0.8]}>
            <sphereGeometry args={[0.07, 16, 12]} />
          </mesh>
        </group>
      </group>

      {/* Left arm holding a tablet — watch on the wrist */}
      <group position={[-0.32, 0.3, 0]} rotation={[-0.25, 0, -0.14]}>
        {sleeveArm()}
        <group position={[0, -0.32, 0]} rotation={[-1.25, 0, 0]}>
          <mesh material={skin} position={[0, -0.12, 0]}>
            <capsuleGeometry args={[0.07, 0.16, 6, 16]} />
          </mesh>
          {look.watch && (
            <group position={[0, -0.2, 0]}>
              <mesh material={silver} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.073, 0.014, 8, 24]} />
              </mesh>
              <mesh material={silver} position={[0.07, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.03, 0.03, 0.018, 20]} />
              </mesh>
            </group>
          )}
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
        <cylinderGeometry args={[0.08, 0.09, 0.16, 16]} />
      </mesh>
      <group ref={head} position={[0, 0.72, 0]}>
        <mesh material={skin} geometry={headGeo} scale={[0.9, 1, 0.95]} />
        {[-1, 1].map((s) => (
          <mesh key={s} material={skin} position={[0.278 * s, -0.02, -0.01]} scale={[0.5, 1, 0.8]}>
            <sphereGeometry args={[0.06, 14, 10]} />
          </mesh>
        ))}

        {/* Hair: short sides, voluminous swept-back top with a front lift */}
        <mesh material={hair} geometry={hairCapGeo} position={[0, 0.03, -0.02]} rotation={[-0.42, 0, 0]} scale={[0.96, 1, 1]} />
        {HAIR_LOCKS.map((l, i) => (
          <mesh key={i} material={hair} position={l.p} rotation={l.r} scale={l.s}>
            <sphereGeometry args={[0.1, 20, 14]} />
          </mesh>
        ))}

        {/* Full short beard + sideburns + mustache */}
        {look.beard !== "none" && (
          <group>
            <mesh material={hair} geometry={beardGeo} scale={[0.915, 1, 0.97]} />
            {/* Chin volume */}
            <mesh material={hair} position={[0, -0.27, 0.13]} scale={[1.25, 0.75, 1.05]}>
              <sphereGeometry args={[0.09, 18, 12]} />
            </mesh>
            <mesh material={hair} position={[0, -0.09, 0.27]} rotation={[-0.3, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.017, 0.08, 4, 10]} />
            </mesh>
          </group>
        )}

        {/* Eyes (whites + pupils that follow the cursor) */}
        <group ref={eyes}>
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
        {/* Thick brows, nose */}
        {[-1, 1].map((s) => (
          <mesh key={s} material={hair} position={[0.1 * s, 0.078, 0.262]} rotation={[0, 0, -0.1 * s]}>
            <boxGeometry args={[0.09, 0.022, 0.014]} />
          </mesh>
        ))}
        <mesh material={skin} position={[0, -0.04, 0.285]} scale={[0.85, 1.1, 0.95]}>
          <sphereGeometry args={[0.032, 12, 10]} />
        </mesh>
        {/* Big open smile with teeth, sitting in front of the beard */}
        <group position={[0, -0.125, 0.268]} rotation={[-0.42, 0, 0]}>
          <mesh material={mouthIn} scale={[1, 0.7, 1]}>
            <circleGeometry args={[0.062, 28, Math.PI, Math.PI]} />
          </mesh>
          <mesh material={teeth} position={[0, -0.009, 0.002]}>
            <boxGeometry args={[0.104, 0.02, 0.004]} />
          </mesh>
        </group>

        {/* Thin metal glasses with a browline top */}
        {look.glasses && (
          <group position={[0, 0, 0.3]}>
            {[-1, 1].map((s) => (
              <group key={s} position={[0.1 * s, 0, 0]}>
                <mesh material={frame} scale={[1.22, 0.86, 1]}>
                  <torusGeometry args={[0.056, 0.0055, 8, 32]} />
                </mesh>
                <mesh material={lens} scale={[1.22, 0.86, 1]}>
                  <circleGeometry args={[0.056, 24]} />
                </mesh>
                <mesh material={frame} position={[0, 0.043, 0.002]}>
                  <boxGeometry args={[0.13, 0.012, 0.008]} />
                </mesh>
              </group>
            ))}
            <mesh material={frame} position={[0, 0.03, 0]}>
              <boxGeometry args={[0.06, 0.007, 0.007]} />
            </mesh>
            {[-1, 1].map((s) => (
              <Strap key={s} from={[0.168 * s, 0.035, 0]} to={[0.284 * s, 0.01, -0.3]} material={frame} radius={0.004} />
            ))}
          </group>
        )}
      </group>
    </group>
  );
}
