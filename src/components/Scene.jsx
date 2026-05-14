import React, { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Water } from 'three-stdlib';
import * as TWEEN from '@tweenjs/tween.js';

extend({ Water });

const WATER_NORMALS_URL =
  'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/waternormals.jpg';

/* ─────────────────────────────────────────
   OCEAN
───────────────────────────────────────── */
const Ocean = () => {
  const ref = useRef();
  const gl = useThree((s) => s.gl);
  const waterNormals = useMemo(
    () =>
      new THREE.TextureLoader().load(WATER_NORMALS_URL, (t) => {
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
      }),
    []
  );
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.material.uniforms.time.value += delta * 0.6;
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.02) * 0.002;
    }
  });
  return (
    <water
      ref={ref}
      args={[
        new THREE.PlaneGeometry(12000, 12000, 256, 256),
        {
          textureWidth: 1024,
          textureHeight: 1024,
          waterNormals,
          sunDirection: new THREE.Vector3(250, 350, 150).normalize(),
          sunColor: 0xfff2e0,
          waterColor: 0x001a2b,
          distortionScale: 4.2,
          fog: true,
          alpha: 0.85,
          format: gl.encoding,
        },
      ]}
      rotation-x={-Math.PI / 2}
    />
  );
};

const concreteTexture = new THREE.TextureLoader().load('/textures/concrete.jpg');
concreteTexture.wrapS = concreteTexture.wrapT = THREE.RepeatWrapping;
concreteTexture.repeat.set(8, 8);

/* ─────────────────────────────────────────
   QUAY / CAIS
───────────────────────────────────────── */
const Quay = () => {
  // Gera marcações de segurança no cais (listras amarelas)
  const stripes = useMemo(() => {
    const s = [];
    for (let x = -1400; x < 1400; x += 40) s.push(x);
    return s;
  }, []);

  return (
    <group>
      {/* Plataforma principal */}
      <mesh position={[0, -7, -1010]} receiveShadow>
        <boxGeometry args={[3200, 30, 2000]} />
        <meshStandardMaterial map={concreteTexture} color={0x888888} roughness={0.95} metalness={0.1} />
      </mesh>

      {/* Borda frontal do cais */}
      <mesh position={[0, 8, -14]} receiveShadow>
        <boxGeometry args={[3200, 2, 4]} />
        <meshStandardMaterial color={0x111418} roughness={0.9} />
      </mesh>

      {/* Linha de segurança amarela */}
      <mesh position={[0, 8.6, -22]} receiveShadow>
        <boxGeometry args={[3200, 0.3, 0.8]} />
        <meshStandardMaterial color={0xf59e0b} roughness={0.5} emissive={0xf59e0b} emissiveIntensity={0.15} />
      </mesh>

      {/* Listras de perigo */}
      {stripes.map((x) => (
        <mesh key={x} position={[x, 8.55, -15]} receiveShadow>
          <boxGeometry args={[1.2, 0.2, 3]} />
          <meshStandardMaterial color={0xf59e0b} roughness={0.5} />
        </mesh>
      ))}

      {/* Trilhos de grua no cais — 2 pistas */}
      {[-8, 8].map((dz) => (
        <mesh key={dz} position={[0, 8.5, -40 + dz]} receiveShadow>
          <boxGeometry args={[3200, 1, 1.5]} />
          <meshStandardMaterial color={0x475569} roughness={0.4} metalness={0.8} />
        </mesh>
      ))}

      {/* Edifício de armazém ao fundo */}
      <mesh position={[0, 30, -900]} receiveShadow castShadow>
        <boxGeometry args={[800, 60, 200]} />
        <meshStandardMaterial color={0x1e293b} roughness={0.8} metalness={0.1} />
      </mesh>
      <mesh position={[0, 61, -900]}>
        <boxGeometry args={[800, 2, 200]} />
        <meshStandardMaterial color={0x334155} roughness={0.7} />
      </mesh>

      {/* Silos de armazenamento */}
      {[-300, -100, 100, 300].map((sx) => (
        <group key={sx} position={[sx, 0, -950]}>
          <mesh position={[0, 55, 0]} castShadow>
            <cylinderGeometry args={[22, 22, 110, 24]} />
            <meshStandardMaterial color={0x94a3b8} roughness={0.5} metalness={0.3} />
          </mesh>
          <mesh position={[0, 115, 0]} castShadow>
            <coneGeometry args={[22, 20, 24]} />
            <meshStandardMaterial color={0x64748b} roughness={0.5} metalness={0.3} />
          </mesh>
        </group>
      ))}

      {/* Correia transportadora ligando funis aos silos */}
      <mesh position={[0, 20, -500]} castShadow>
        <boxGeometry args={[8, 4, 900]} />
        <meshStandardMaterial color={0x334155} roughness={0.7} metalness={0.2} />
      </mesh>
    </group>
  );
};

/* ─────────────────────────────────────────
   FUNIL DE DESCARGA (HOPPER)
   Fixo no cais — posição absoluta no mundo
   worldX = shipData.x + craneLocalX
   Z fixo junto à borda do cais (-10)
   Y=0 = nível do cais (surface y≈8)
───────────────────────────────────────── */
const DischargeHopper = ({ worldX }) => {
  const quaySurfaceY = 8;
  const hopperZ = -18; // Posicionado corretamente sob a grua no cais

  return (
    <group position={[worldX, quaySurfaceY, hopperZ]}>
      {/* Estrutura de suporte — 4 pernas */}
      {[[-5, -5], [5, -5], [-5, 5], [5, 5]].map(([px, pz], i) => (
        <mesh key={i} position={[px, 8, pz]} castShadow>
          <boxGeometry args={[1.2, 16, 1.2]} />
          <meshStandardMaterial color={0xca8a04} roughness={0.5} metalness={0.4} />
        </mesh>
      ))}

      {/* Aro superior do funil */}
      <mesh position={[0, 17, 0]} castShadow>
        <boxGeometry args={[14, 1, 12]} />
        <meshStandardMaterial color={0xca8a04} roughness={0.5} metalness={0.4} />
      </mesh>

      {/* Paredes inclinadas do funil */}
      <mesh position={[0, 12, 5]} rotation={[0.55, 0, 0]} castShadow>
        <boxGeometry args={[13, 1, 10]} />
        <meshStandardMaterial color={0xeab308} roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[0, 12, -5]} rotation={[-0.55, 0, 0]} castShadow>
        <boxGeometry args={[13, 1, 10]} />
        <meshStandardMaterial color={0xeab308} roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[-5.5, 12, 0]} rotation={[0, 0, 0.55]} castShadow>
        <boxGeometry args={[9, 1, 10]} />
        <meshStandardMaterial color={0xd97706} roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[5.5, 12, 0]} rotation={[0, 0, -0.55]} castShadow>
        <boxGeometry args={[9, 1, 10]} />
        <meshStandardMaterial color={0xd97706} roughness={0.4} metalness={0.3} />
      </mesh>

      {/* Chute de descarga (tubo vertical) */}
      <mesh position={[0, 5, 0]} castShadow>
        <boxGeometry args={[4, 12, 4]} />
        <meshStandardMaterial color={0x92400e} roughness={0.5} metalness={0.3} />
      </mesh>

      {/* Plataforma de acesso */}
      <mesh position={[0, 16.5, 0]}>
        <boxGeometry args={[16, 0.3, 13]} />
        <meshStandardMaterial color={0x78716c} roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Guarda-corpos */}
      {[-7, 7].map((dx) => (
        <mesh key={dx} position={[dx, 18.5, 0]}>
          <boxGeometry args={[0.3, 4, 13]} />
          <meshStandardMaterial color={0xca8a04} roughness={0.5} />
        </mesh>
      ))}

      {/* Caminhão de carga embaixo */}
      <TruckBelow x={0} />
    </group>
  );
};

/* ─────────────────────────────────────────
   CAMINHÃO
───────────────────────────────────────── */
const TruckBelow = ({ x }) => (
  <group position={[x, 1.8, 0]}>
    {/* Cabine */}
    <mesh position={[-9, 4.5, 0]} castShadow>
      <boxGeometry args={[5, 6, 8]} />
      <meshStandardMaterial color={0xf8fafc} roughness={0.4} />
    </mesh>
    {/* Carroceria (graneleiro) */}
    <mesh position={[2, 4, 0]} castShadow>
      <boxGeometry args={[18, 5, 8]} />
      <meshStandardMaterial color={0x94a3b8} roughness={0.6} metalness={0.3} />
    </mesh>
    {/* Chassis */}
    <mesh position={[0, 1.2, 0]}>
      <boxGeometry args={[25, 1, 7]} />
      <meshStandardMaterial color={0x1e293b} roughness={0.8} />
    </mesh>
    {/* Rodas */}
    {[-9, -4, 3, 8].map((wx) =>
      [-4, 4].map((wz) => (
        <mesh key={`${wx}-${wz}`} position={[wx, 0, wz]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.8, 1.8, 1, 16]} />
          <meshStandardMaterial color={0x0f172a} roughness={0.9} />
        </mesh>
      ))
    )}
  </group>
);

/* ─────────────────────────────────────────
   GARRA CLAMSHELL
───────────────────────────────────────── */
const ClamshellGrab = ({ grabRef, isOpenRef, hasLoadRef }) => {
  const leftRef = useRef();
  const rightRef = useRef();
  const loadRef = useRef();

  useFrame(() => {
    if (!leftRef.current || !rightRef.current) return;
    const targetAngle = isOpenRef.current ? 0.65 : 0.05;
    leftRef.current.rotation.z += (targetAngle - leftRef.current.rotation.z) * 0.12;
    rightRef.current.rotation.z += (-targetAngle - rightRef.current.rotation.z) * 0.12;
    
    if (loadRef.current) {
      loadRef.current.visible = hasLoadRef.current && !isOpenRef.current;
    }
  });

  return (
    <group ref={grabRef}>
      {/* Estrutura superior da garra */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[3, 2, 8]} />
        <meshStandardMaterial color={0xb45309} roughness={0.5} metalness={0.5} />
      </mesh>

      {/* Braço esquerdo */}
      <group ref={leftRef} position={[-1.5, -1, 0]}>
        <mesh position={[-2, -3, 0]} castShadow>
          <boxGeometry args={[1.2, 7, 7.5]} />
          <meshStandardMaterial color={0xc2410c} roughness={0.4} metalness={0.6} />
        </mesh>
        {/* Dente inferior esquerdo */}
        <mesh position={[-2.5, -7.5, 0]} castShadow>
          <boxGeometry args={[2.5, 2, 7.5]} />
          <meshStandardMaterial color={0x9a3412} roughness={0.3} metalness={0.7} />
        </mesh>
      </group>

      {/* Braço direito */}
      <group ref={rightRef} position={[1.5, -1, 0]}>
        <mesh position={[2, -3, 0]} castShadow>
          <boxGeometry args={[1.2, 7, 7.5]} />
          <meshStandardMaterial color={0xc2410c} roughness={0.4} metalness={0.6} />
        </mesh>
        {/* Dente inferior direito */}
        <mesh position={[2.5, -7.5, 0]} castShadow>
          <boxGeometry args={[2.5, 2, 7.5]} />
          <meshStandardMaterial color={0x9a3412} roughness={0.3} metalness={0.7} />
        </mesh>
      </group>

      {/* Carga de granéis (visível quando fechada) */}
      <mesh ref={loadRef} position={[0, -7, 0]} visible={false}>
        <boxGeometry args={[5, 3, 7]} />
        <meshStandardMaterial color={0xd4a96a} roughness={0.9} />
      </mesh>
    </group>
  );
};

/* ─────────────────────────────────────────
   GUINDASTE DE CONVÉS (DECK CRANE)
   Montado no navio, com lança articulada
   e garra clamshell
───────────────────────────────────────── */
const PHASES = {
  DESCER_PORAO: [0.00, 0.15],
  PEGAR: [0.15, 0.25],
  SUBIR: [0.25, 0.40],
  GIRAR: [0.40, 0.60],
  DESCER_FUNIL: [0.60, 0.75],
  DESCARREGAR: [0.75, 0.85],
  VOLTAR: [0.85, 1.00],
};
const inPhase = (p, phase) => p >= phase[0] && p < phase[1];
const lerpPhase = (p, phase) => (p - phase[0]) / (phase[1] - phase[0]);

const DeckCrane = ({ localX, localZ, phase, active }) => {
  const slewGroupRef = useRef();
  const boomRef = useRef();
  const cableRef = useRef();
  const grabGroupRef = useRef();
  const grabRef = useRef();

  const progressRef = useRef(phase); // 0..1 ciclo completo
  const isOpenRef = useRef(false);
  const hasLoadRef = useRef(false);

  const SLEW_HOLD = Math.PI;
  const SLEW_QUAY = 0;
  
  const BOOM_HOLD = 1.08;
  const BOOM_QUAY = 0.63;
  
  const CABLE_UP = -12;
  const CABLE_DOWN_HOLD = -44;
  const CABLE_DOWN_QUAY = -20.2;

  useFrame((state, delta) => {
    if (!active) return;
    progressRef.current = (progressRef.current + delta * 0.18) % 1;
    const p = progressRef.current;

    if (!boomRef.current || !grabGroupRef.current || !slewGroupRef.current || !cableRef.current) return;

    if (inPhase(p, PHASES.DESCER_PORAO)) {
      const t = lerpPhase(p, PHASES.DESCER_PORAO);
      slewGroupRef.current.rotation.y = SLEW_HOLD;
      boomRef.current.rotation.x = BOOM_HOLD;
      grabGroupRef.current.position.y = THREE.MathUtils.lerp(CABLE_UP, CABLE_DOWN_HOLD, t);
      isOpenRef.current = true; hasLoadRef.current = false;
    } else if (inPhase(p, PHASES.PEGAR)) {
      slewGroupRef.current.rotation.y = SLEW_HOLD;
      boomRef.current.rotation.x = BOOM_HOLD;
      grabGroupRef.current.position.y = CABLE_DOWN_HOLD;
      const t = lerpPhase(p, PHASES.PEGAR);
      if (t < 0.5) { isOpenRef.current = true; hasLoadRef.current = false; }
      else { isOpenRef.current = false; hasLoadRef.current = true; }
    } else if (inPhase(p, PHASES.SUBIR)) {
      const t = lerpPhase(p, PHASES.SUBIR);
      slewGroupRef.current.rotation.y = SLEW_HOLD;
      boomRef.current.rotation.x = BOOM_HOLD;
      grabGroupRef.current.position.y = THREE.MathUtils.lerp(CABLE_DOWN_HOLD, CABLE_UP, t);
      isOpenRef.current = false; hasLoadRef.current = true;
    } else if (inPhase(p, PHASES.GIRAR)) {
      const t = lerpPhase(p, PHASES.GIRAR);
      const smoothT = t * t * (3 - 2 * t);
      slewGroupRef.current.rotation.y = THREE.MathUtils.lerp(SLEW_HOLD, SLEW_QUAY, smoothT);
      boomRef.current.rotation.x = THREE.MathUtils.lerp(BOOM_HOLD, BOOM_QUAY, smoothT);
      grabGroupRef.current.position.y = CABLE_UP;
      hasLoadRef.current = true;
    } else if (inPhase(p, PHASES.DESCER_FUNIL)) {
      const t = lerpPhase(p, PHASES.DESCER_FUNIL);
      slewGroupRef.current.rotation.y = SLEW_QUAY;
      boomRef.current.rotation.x = BOOM_QUAY;
      grabGroupRef.current.position.y = THREE.MathUtils.lerp(CABLE_UP, CABLE_DOWN_QUAY, t);
      hasLoadRef.current = true; isOpenRef.current = false;
    } else if (inPhase(p, PHASES.DESCARREGAR)) {
      slewGroupRef.current.rotation.y = SLEW_QUAY;
      boomRef.current.rotation.x = BOOM_QUAY;
      grabGroupRef.current.position.y = CABLE_DOWN_QUAY;
      isOpenRef.current = true; hasLoadRef.current = false;
      const shakeAmt = 0.5 * (1 - lerpPhase(p, PHASES.DESCARREGAR));
      state.camera.position.x += (Math.random() - 0.5) * shakeAmt;
      state.camera.position.y += (Math.random() - 0.5) * shakeAmt;
    } else { // VOLTAR
      const t = lerpPhase(p, PHASES.VOLTAR);
      const smoothT = t * t * (3 - 2 * t);
      slewGroupRef.current.rotation.y = THREE.MathUtils.lerp(SLEW_QUAY, SLEW_HOLD, smoothT);
      boomRef.current.rotation.x = THREE.MathUtils.lerp(BOOM_QUAY, BOOM_HOLD, smoothT);
      grabGroupRef.current.position.y = THREE.MathUtils.lerp(CABLE_DOWN_QUAY, CABLE_UP, t);
      isOpenRef.current = true; hasLoadRef.current = false;
    }

    // Esticar o cabo visualmente
    const drop = grabGroupRef.current.position.y;
    cableRef.current.scale.y = Math.max(0.01, Math.abs(drop));
    cableRef.current.position.y = drop / 2;
  });

  return (
    <group position={[localX, 0, localZ]}>
      {/* Base rotativa fixa */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[3.5, 4, 3, 16]} />
        <meshStandardMaterial color={0x475569} roughness={0.5} metalness={0.6} />
      </mesh>

      {/* Secção superior que roda (slew) */}
      <group ref={slewGroupRef}>
        {/* Torre */}
        <mesh position={[0, 10, 0]} castShadow>
          <boxGeometry args={[3, 20, 3]} />
          <meshStandardMaterial color={0x334155} roughness={0.5} metalness={0.5} />
        </mesh>

        {/* Cabine do operador */}
        <mesh position={[2, 16, 0]} castShadow>
          <boxGeometry args={[4, 4, 4]} />
          <meshStandardMaterial color={0x1e3a8a} roughness={0.4} />
        </mesh>
        <mesh position={[3.2, 16, 0]}>
          <boxGeometry args={[0.1, 3, 3]} />
          <meshStandardMaterial color={0x7dd3fc} roughness={0.1} metalness={0.0} transparent opacity={0.7} />
        </mesh>

        {/* Contrapeso */}
        <mesh position={[-3.5, 19, 0]} castShadow>
          <boxGeometry args={[5, 3, 4]} />
          <meshStandardMaterial color={0x64748b} roughness={0.5} metalness={0.4} />
        </mesh>

        {/* Lança principal articulada */}
        <group ref={boomRef} position={[0, 20, 0]} rotation={[0, 0, 0]}>
          {/* Corpo da lança */}
          <mesh position={[0, 0, -15]} castShadow>
            <boxGeometry args={[2.5, 2.5, 30]} />
            <meshStandardMaterial color={0xf97316} roughness={0.4} metalness={0.4} />
          </mesh>
          {/* Extensão da lança */}
          <mesh position={[0, 0, -32]} castShadow>
            <boxGeometry args={[1.8, 1.8, 8]} />
            <meshStandardMaterial color={0xf97316} roughness={0.4} metalness={0.4} />
          </mesh>

          {/* Polia na ponta da lança */}
          <mesh position={[0, 0, -36]} castShadow>
            <sphereGeometry args={[1.5, 8, 8]} />
            <meshStandardMaterial color={0x94a3b8} metalness={0.8} roughness={0.2} />
          </mesh>

          {/* Sistema de cabos e moitão originado na ponta */}
          <group position={[0, 0, -36]}>
            {/* Cabo de aço que estica */}
            <mesh ref={cableRef}>
              <cylinderGeometry args={[0.18, 0.18, 1, 6]} />
              <meshStandardMaterial color={0x1e293b} roughness={0.9} />
            </mesh>
            
            {/* Moitão e Garra (movem-se no eixo Y local) */}
            <group ref={grabGroupRef} position={[0, CABLE_UP, 0]}>
              {/* Bloco de moitão */}
              <mesh position={[0, 0, 0]} castShadow>
                <boxGeometry args={[2.5, 2, 2.5]} />
                <meshStandardMaterial color={0x78716c} metalness={0.6} roughness={0.3} />
              </mesh>
              {/* Garra clamshell */}
              <group position={[0, -2, 0]}>
                <ClamshellGrab grabRef={grabRef} isOpenRef={isOpenRef} hasLoadRef={hasLoadRef} />
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};

/* ─────────────────────────────────────────
   PORÃO DO NAVIO (hatch cover)
───────────────────────────────────────── */
const CargoHold = ({ x, width = 38, length = 55, fillLevel = 0.7 }) => {
  return (
    <group position={[x, 0, 0]}>
      {/* Tampa do porão (hatch cover) - aberta */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (width / 2 + 3), 3, 0]} castShadow>
          <boxGeometry args={[6, 1, length]} />
          <meshStandardMaterial color={0x475569} roughness={0.6} metalness={0.3} />
        </mesh>
      ))}

      {/* Interior do porão */}
      <mesh position={[0, -5, 0]} receiveShadow>
        <boxGeometry args={[width, 14, length]} />
        <meshStandardMaterial color={0xb45309} roughness={0.9} side={THREE.BackSide} />
      </mesh>

      {/* Grãos/fertilizante no porão */}
      <mesh position={[0, -6 + fillLevel * 6, 0]} receiveShadow>
        <boxGeometry args={[width - 1, 1, length - 1]} />
        <meshStandardMaterial color={0xd4a96a} roughness={0.95} />
      </mesh>
    </group>
  );
};

// Posições X locais dos guindastes (relativas ao centro do navio)
const CRANE_LOCAL_X = [-80, 0, 80];

/* ─────────────────────────────────────────
   NAVIO BULK CARRIER
   Sem contentores, com 3 guindastes de
   convés e 3 porões abertos
───────────────────────────────────────── */
const BulkCarrierShip = ({ shipData, index, active }) => {
  const groupRef = useRef();
  const length = 280;
  const width = 42;
  const draft = 18; // calado

  // Casco com forma de proa
  const hullGeo = useMemo(() => {
    const shape = new THREE.Shape();
    const hw = width / 2;
    const hl = length / 2;
    shape.moveTo(-hl, -hw);
    // Popa arredondada
    shape.quadraticCurveTo(-hl - 8, 0, -hl, hw);
    // Lateral de ré
    shape.lineTo(hl - 45, hw);
    // Proa em V
    shape.lineTo(hl + 5, 0);
    shape.lineTo(hl - 45, -hw);
    shape.lineTo(-hl, -hw);

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: draft,
      bevelEnabled: true,
      bevelSegments: 6,
      bevelSize: 3,
      bevelThickness: 3,
    });
    geo.rotateX(Math.PI / 2);
    geo.translate(0, draft - 5, 0);
    return geo;
  }, []);

  // Superestrutura (ponte de comando) na popa
  const superstructure = [
    { y: 6,  w: 36, h: 12, d: 38 },
    { y: 19, w: 30, h: 11, d: 34 },
    { y: 31, w: 24, h: 10, d: 30 },
  ];

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 1.1 + index * 1.6) * 0.5;
      groupRef.current.rotation.z = Math.sin(t * 0.75 + index) * 0.008;
      groupRef.current.rotation.x = Math.cos(t * 0.55 + index) * 0.004;
    }
  });

  // Posições dos 3 guindastes de convés e porões
  // lx é relativo ao centro do navio (shipData.x)
  const cranePositions = CRANE_LOCAL_X.map((lx, i) => ({
    lx,
    lz: 0,
    phase: [0.0, 0.33, 0.66][i],
  }));

  const holdPositions = [-80, 0, 80];

  // Altura do convés
  const deckY = draft - 5;

  return (
    <group position={[shipData.x, 0, 28]}>
      <group ref={groupRef} userData={{ type: 'ship', index }}>

        {/* ── CASCO ── */}
        <mesh geometry={hullGeo} castShadow receiveShadow>
          <meshStandardMaterial color={shipData.color} roughness={0.55} metalness={0.35} envMapIntensity={0.6} />
        </mesh>

        {/* ── LINHA D'ÁGUA (faixa bege/Plimsoll) ── */}
        <mesh position={[0, 4, 0]} castShadow>
          <boxGeometry args={[length - 20, 1.5, width + 0.5]} />
          <meshStandardMaterial color={0xd4a96a} roughness={0.5} />
        </mesh>

        {/* ── CONVÉS ── */}
        <mesh position={[0, deckY, 0]} receiveShadow castShadow>
          <boxGeometry args={[length - 8, 1.5, width]} />
          <meshStandardMaterial color={0x374151} roughness={0.8} metalness={0.1} />
        </mesh>

        {/* ── PORÕES ABERTOS ── */}
        {holdPositions.map((hx, i) => (
          <group key={i} position={[hx, deckY + 0.5, 0]}>
            <CargoHold x={0} fillLevel={active ? 0.4 : 0.75} />
          </group>
        ))}

        {/* ── SUPERESTRUTURA (POPA) ── */}
        <group position={[-length / 2 + 30, deckY, 0]}>
          {superstructure.map((s, i) => (
            <mesh key={i} position={[0, s.y, 0]} castShadow>
              <boxGeometry args={[s.w, s.h, s.d]} />
              <meshStandardMaterial color={0xf1f5f9} roughness={0.4} />
            </mesh>
          ))}
          {/* Janelas da ponte */}
          <mesh position={[13, 35, 0]}>
            <boxGeometry args={[0.2, 6, 28]} />
            <meshStandardMaterial color={0x0ea5e9} roughness={0.05} metalness={0.0} transparent opacity={0.6} />
          </mesh>
          {/* Chaminé */}
          <mesh position={[-5, 50, 0]} castShadow>
            <cylinderGeometry args={[4, 5, 20, 16]} />
            <meshStandardMaterial color={0x1e293b} roughness={0.5} />
          </mesh>
          <mesh position={[-5, 61, 0]}>
            <cylinderGeometry args={[4.2, 4.2, 2, 16]} />
            <meshStandardMaterial color={0x0f172a} roughness={0.5} />
          </mesh>
        </group>

        {/* ── MASTRO DE PROA ── */}
        <mesh position={[length / 2 - 20, deckY + 18, 0]} castShadow>
          <cylinderGeometry args={[0.5, 0.8, 36, 8]} />
          <meshStandardMaterial color={0xf8fafc} roughness={0.4} />
        </mesh>

        {/* ── CORRIMÕES DO CONVÉS ── */}
        {[-width / 2 + 1, width / 2 - 1].map((dz) => (
          <mesh key={dz} position={[0, deckY + 3, dz]} castShadow>
            <boxGeometry args={[length - 10, 0.4, 0.4]} />
            <meshStandardMaterial color={0xffffff} roughness={0.5} />
          </mesh>
        ))}

        {/* ── 3 GUINDASTES DE CONVÉS ── */}
        {cranePositions.map((cp, i) => (
          <group key={i} position={[cp.lx, deckY + 1, -width / 2 + 4]}>
            <DeckCrane localX={0} localZ={0} phase={cp.phase} active={active} />
          </group>
        ))}

        {/* ── ÂNCORAS ── */}
        {[-8, 8].map((dz) => (
          <mesh key={dz} position={[length / 2 - 30, deckY - 3, dz]} castShadow>
            <boxGeometry args={[3, 4, 3]} />
            <meshStandardMaterial color={0x374151} roughness={0.6} metalness={0.5} />
          </mesh>
        ))}

        {/* ── BOLARDOS DE AMARRAÇÃO ── */}
        {[-90, -30, 30, 90].map((bx) =>
          [-width / 2 + 2, width / 2 - 2].map((bz) => (
            <mesh key={`${bx}-${bz}`} position={[bx, deckY + 3, bz]} castShadow>
              <cylinderGeometry args={[1, 1.3, 6, 8]} />
              <meshStandardMaterial color={0x1e293b} roughness={0.5} metalness={0.5} />
            </mesh>
          ))
        )}
      </group>

    </group>
  );
};

/* ─────────────────────────────────────────
   ANIMADOR DE CÂMERA
───────────────────────────────────────── */
const CameraAnimator = ({ focusedShipIndex, shipsData }) => {
  const { camera, controls } = useThree();
  const baseTargetRef = useRef(new THREE.Vector3(0, 0, -60));

  useEffect(() => {
    if (!controls) return;
    let targetPos, camPos;
    if (focusedShipIndex === -1) {
      targetPos = new THREE.Vector3(0, 0, -60);
      camPos = new THREE.Vector3(0, 600, 1100);
    } else {
      const ship = shipsData[focusedShipIndex];
      targetPos = new THREE.Vector3(ship.x, 20, 28);
      camPos = new THREE.Vector3(ship.x - 120, 130, 280);
    }
    new TWEEN.Tween(camera.position).to(camPos, 2000).easing(TWEEN.Easing.Quartic.InOut).start();
    new TWEEN.Tween(baseTargetRef.current).to(targetPos, 2000).easing(TWEEN.Easing.Quartic.InOut).start();
  }, [focusedShipIndex, camera, controls, shipsData]);

  useFrame(() => {
    TWEEN.update();
    if (controls) {
      controls.target.copy(baseTargetRef.current);
      controls.target.y += Math.sin(Date.now() * 0.001) * 2;
    }
  });
  return null;
};

/* ─────────────────────────────────────────
   CENA PRINCIPAL
───────────────────────────────────────── */
const Scene3D = ({ focusedShipIndex, onShipSelect, shipsData }) => {
  const handlePointerDown = (e) => {
    e.stopPropagation();
    let obj = e.object;
    while (obj && !obj.userData.type) obj = obj.parent;
    if (obj?.userData.type === 'ship') onShipSelect(obj.userData.index);
    else onShipSelect(-1);
  };

  return (
    <Canvas
      shadows
      onPointerDown={handlePointerDown}
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
      }}
    >
      <color attach="background" args={['#020c1b']} />
      <fogExp2 attach="fog" args={['#020c1b', 0.0008]} />

      <PerspectiveCamera makeDefault position={[0, 600, 1100]} fov={32} near={10} far={9000} />
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.05}
        maxPolarAngle={Math.PI / 2 - 0.03}
        minDistance={60}
        maxDistance={2500}
        target={[0, 0, -80]}
      />
      <CameraAnimator focusedShipIndex={focusedShipIndex} shipsData={shipsData} />

      {/* Iluminação */}
      <hemisphereLight args={[0xd4e8ff, 0x0a1628, 0.5]} />
      <directionalLight
        position={[300, 400, 200]}
        intensity={2.0}
        color={0xfff8f0}
        castShadow
        shadow-bias={-0.0004}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-700}
        shadow-camera-right={700}
        shadow-camera-top={350}
        shadow-camera-bottom={-350}
      />
      {/* Luz de preenchimento lateral */}
      <directionalLight position={[-200, 200, -100]} intensity={0.4} color={0x4488cc} />
      {/* Luz ambiente quente nas docas */}
      <pointLight position={[0, 50, -200]} intensity={0.8} color={0xffcc88} distance={600} />

      <Ocean />
      <Quay />

      {shipsData.map((data, idx) => (
        <BulkCarrierShip
          key={idx}
          shipData={data}
          index={idx}
          active={focusedShipIndex === idx}
        />
      ))}

      {/* ── FUNIS FIXOS NO CAIS — fora do grupo do navio para não oscilar ── */}
      {shipsData.map((data) =>
        CRANE_LOCAL_X.map((lx, ci) => (
          <DischargeHopper
            key={`${data.x}-${ci}`}
            worldX={data.x + lx}
          />
        ))
      )}
    </Canvas>
  );
};

/* ─────────────────────────────────────────
   COMPONENTE RAIZ EXPORTADO
   (inclui UI de controlo sobre o canvas)
───────────────────────────────────────── */
const shipsData = [
  { x: -630, color: 0x7f1d1d, name: 'MV BEIRA STAR',   cargo: 'Fertilizante',  status: 'A descarregar', progress: 62 },
  { x: -210, color: 0x1e3a5f, name: 'MV MAPUTO BAY',   cargo: 'Soja',          status: 'A descarregar', progress: 38 },
  { x:  210, color: 0x14532d, name: 'MV NACALA WIND',  cargo: 'Granéis Secos', status: 'A aguardar',    progress:  0 },
  { x:  630, color: 0x4c1d95, name: 'MV SOFALA PRIDE', cargo: 'Clínquer',      status: 'A descarregar', progress: 81 },
];

export default function Scene() {
  const [focusedShipIndex, setFocusedShipIndex] = useState(-1);
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('pt-PT'));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const handleShipSelect = useCallback((idx) => {
    setFocusedShipIndex((prev) => (prev === idx ? -1 : idx));
  }, []);

  const selectedShip = focusedShipIndex >= 0 ? shipsData[focusedShipIndex] : null;

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#020c1b', fontFamily: "'Courier New', monospace" }}>
      {/* Canvas 3D */}
      <Scene3D
        focusedShipIndex={focusedShipIndex}
        onShipSelect={handleShipSelect}
        shipsData={shipsData}
      />

      {/* ── HEADER ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        padding: '14px 24px',
        background: 'linear-gradient(180deg,rgba(2,12,27,0.95) 0%,rgba(2,12,27,0) 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        pointerEvents: 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22d3ee', boxShadow: '0 0 8px #22d3ee', animation: 'pulse 2s infinite' }} />
          <span style={{ color: '#e2e8f0', fontSize: 13, letterSpacing: 3, fontWeight: 700 }}>
            SISTEMA DE GESTÃO PORTUÁRIA
          </span>
        </div>
        <div style={{ display: 'flex', gap: 28 }}>
          <Stat label="NAVIOS ATRACADOS" value="4" />
          <Stat label="GUINDASTES ATIVOS" value="12" />
          <Stat label="HORA LOCAL" value={time} />
        </div>
      </div>

      {/* ── PAINEL DE NAVIOS (lateral esquerda) ── */}
      <div style={{
        position: 'absolute', top: 70, left: 16,
        display: 'flex', flexDirection: 'column', gap: 8,
        pointerEvents: 'all',
      }}>
        {shipsData.map((ship, idx) => (
          <ShipCard
            key={idx}
            ship={ship}
            idx={idx}
            selected={focusedShipIndex === idx}
            onClick={() => handleShipSelect(idx)}
          />
        ))}
      </div>

      {/* ── PAINEL DE DETALHE (lateral direita) ── */}
      {selectedShip && (
        <div style={{
          position: 'absolute', top: 70, right: 16, width: 240,
          background: 'rgba(2,12,27,0.92)', border: '1px solid rgba(34,211,238,0.25)',
          borderRadius: 8, padding: '16px', color: '#e2e8f0',
          backdropFilter: 'blur(8px)',
        }}>
          <div style={{ fontSize: 10, color: '#22d3ee', letterSpacing: 3, marginBottom: 12 }}>
            DETALHE DA OPERAÇÃO
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>{selectedShip.name}</div>

          <DetailRow label="Carga" value={selectedShip.cargo} />
          <DetailRow label="Estado" value={selectedShip.status} accent="#22d3ee" />
          <DetailRow label="Guindastes" value="3 activos" />
          <DetailRow label="Funis" value="3 operacionais" />

          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 10, color: '#94a3b8', letterSpacing: 2, marginBottom: 6 }}>
              PROGRESSO DE DESCARGA
            </div>
            <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${selectedShip.progress}%`,
                background: 'linear-gradient(90deg,#0ea5e9,#22d3ee)',
                borderRadius: 4,
                transition: 'width 0.5s ease',
              }} />
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 5, textAlign: 'right' }}>
              {selectedShip.progress}%
            </div>
          </div>

          <button
            onClick={() => handleShipSelect(-1)}
            style={{
              marginTop: 16, width: '100%', padding: '8px 0',
              background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.3)',
              borderRadius: 4, color: '#22d3ee', fontSize: 11, letterSpacing: 2,
              cursor: 'pointer',
            }}
          >
            FECHAR
          </button>
        </div>
      )}

      {/* ── LEGENDA ── */}
      <div style={{
        position: 'absolute', bottom: 16, right: 16,
        background: 'rgba(2,12,27,0.85)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 8, padding: '12px 16px', pointerEvents: 'none',
      }}>
        <div style={{ fontSize: 9, color: '#64748b', letterSpacing: 2, marginBottom: 8 }}>LEGENDA</div>
        {[
          { color: '#f97316', label: 'Guindaste de Convés' },
          { color: '#c2410c', label: 'Garra Clamshell' },
          { color: '#eab308', label: 'Funil de Descarga' },
          { color: '#94a3b8', label: 'Silo de Armazenamento' },
        ].map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: item.color, flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: '#94a3b8' }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* ── CONTROLO DE CÂMERA (hint) ── */}
      <div style={{
        position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(2,12,27,0.7)', borderRadius: 20, padding: '6px 16px',
        color: '#475569', fontSize: 10, letterSpacing: 2, pointerEvents: 'none',
      }}>
        ARRASTAR · SCROLL ZOOM · CLIQUE NO NAVIO PARA FOCAR
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  );
}

/* ── Componentes UI auxiliares ── */
const Stat = ({ label, value }) => (
  <div style={{ textAlign: 'right' }}>
    <div style={{ fontSize: 9, color: '#64748b', letterSpacing: 2 }}>{label}</div>
    <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 700 }}>{value}</div>
  </div>
);

const ShipCard = ({ ship, idx, selected, onClick }) => (
  <div
    onClick={onClick}
    style={{
      width: 210, padding: '10px 14px',
      background: selected ? 'rgba(14,165,233,0.12)' : 'rgba(2,12,27,0.88)',
      border: `1px solid ${selected ? 'rgba(34,211,238,0.5)' : 'rgba(255,255,255,0.07)'}`,
      borderRadius: 6, cursor: 'pointer',
      backdropFilter: 'blur(6px)',
      transition: 'all 0.2s ease',
    }}
  >
    <div style={{ fontSize: 9, color: '#64748b', letterSpacing: 2, marginBottom: 4 }}>
      NAVIO {idx + 1}
    </div>
    <div style={{ fontSize: 12, color: '#e2e8f0', fontWeight: 700, marginBottom: 4 }}>
      {ship.name}
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 10, color: '#94a3b8' }}>{ship.cargo}</span>
      <span style={{
        fontSize: 9, padding: '2px 7px', borderRadius: 10,
        background: ship.status === 'A aguardar' ? 'rgba(100,116,139,0.3)' : 'rgba(34,211,238,0.15)',
        color: ship.status === 'A aguardar' ? '#64748b' : '#22d3ee',
        letterSpacing: 1,
      }}>
        {ship.status === 'A aguardar' ? '● ESPERA' : '● ACTIVO'}
      </span>
    </div>
  </div>
);

const DetailRow = ({ label, value, accent }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
    <span style={{ fontSize: 10, color: '#64748b', letterSpacing: 1 }}>{label}</span>
    <span style={{ fontSize: 11, color: accent || '#e2e8f0', fontWeight: 600 }}>{value}</span>
  </div>
);
