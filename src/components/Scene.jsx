import React, { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
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
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[12000, 12000]} />
      <meshStandardMaterial
        color={0x0b3d5c}
        roughness={0.3}
        metalness={0.2}
        emissive={0x021929}
      />
    </mesh>
  );
};

const concreteTexture = new THREE.TextureLoader().load('/textures/concrete.jpg');
concreteTexture.wrapS = concreteTexture.wrapT = THREE.RepeatWrapping;
concreteTexture.repeat.set(8, 8);

/* ─────────────────────────────────────────
   QUAY / CAIS
───────────────────────────────────────── */
const Quay = () => {
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

      {/* Correia transportadora */}
      <mesh position={[0, 20, -500]} castShadow>
        <boxGeometry args={[8, 4, 900]} />
        <meshStandardMaterial color={0x334155} roughness={0.7} metalness={0.2} />
      </mesh>
    </group>
  );
};

/* ─────────────────────────────────────────
   FUNIL DE DESCARGA E CAMINHÃO
───────────────────────────────────────── */
const DischargeHopper = ({ worldX }) => {
  const quaySurfaceY = 8;
  const hopperZ = -18;

  return (
    <group position={[worldX, quaySurfaceY, hopperZ]}>
      {[[-5, -5], [5, -5], [-5, 5], [5, 5]].map(([px, pz], i) => (
        <mesh key={i} position={[px, 8, pz]} castShadow>
          <boxGeometry args={[1.2, 16, 1.2]} />
          <meshStandardMaterial color={0xca8a04} roughness={0.5} metalness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 17, 0]} castShadow>
        <boxGeometry args={[14, 1, 12]} />
        <meshStandardMaterial color={0xca8a04} roughness={0.5} metalness={0.4} />
      </mesh>
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
      <mesh position={[0, 5, 0]} castShadow>
        <boxGeometry args={[4, 12, 4]} />
        <meshStandardMaterial color={0x92400e} roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0, 16.5, 0]}>
        <boxGeometry args={[16, 0.3, 13]} />
        <meshStandardMaterial color={0x78716c} roughness={0.7} metalness={0.2} />
      </mesh>
      {[-7, 7].map((dx) => (
        <mesh key={dx} position={[dx, 18.5, 0]}>
          <boxGeometry args={[0.3, 4, 13]} />
          <meshStandardMaterial color={0xca8a04} roughness={0.5} />
        </mesh>
      ))}
      <TruckBelow x={0} />
    </group>
  );
};

const TruckBelow = ({ x }) => (
  <group position={[x, 1.8, 0]}>
    <mesh position={[-9, 4.5, 0]} castShadow>
      <boxGeometry args={[5, 6, 8]} />
      <meshStandardMaterial color={0xf8fafc} roughness={0.4} />
    </mesh>
    <mesh position={[2, 4, 0]} castShadow>
      <boxGeometry args={[18, 5, 8]} />
      <meshStandardMaterial color={0x94a3b8} roughness={0.6} metalness={0.3} />
    </mesh>
    <mesh position={[0, 1.2, 0]}>
      <boxGeometry args={[25, 1, 7]} />
      <meshStandardMaterial color={0x1e293b} roughness={0.8} />
    </mesh>
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
   GUINDASTE E GARRA
───────────────────────────────────────── */
const ClamshellGrab = () => {
  return (
    <group>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[3, 2, 8]} />
        <meshStandardMaterial color={0xb45309} roughness={0.5} metalness={0.5} />
      </mesh>
      <group position={[-1.5, -1, 0]} rotation-z={0.05}>
        <mesh position={[-2, -3, 0]} castShadow>
          <boxGeometry args={[1.2, 7, 7.5]} />
          <meshStandardMaterial color={0xc2410c} roughness={0.4} metalness={0.6} />
        </mesh>
        <mesh position={[-2.5, -7.5, 0]} castShadow>
          <boxGeometry args={[2.5, 2, 7.5]} />
          <meshStandardMaterial color={0x9a3412} roughness={0.3} metalness={0.7} />
        </mesh>
      </group>
      <group position={[1.5, -1, 0]} rotation-z={-0.05}>
        <mesh position={[2, -3, 0]} castShadow>
          <boxGeometry args={[1.2, 7, 7.5]} />
          <meshStandardMaterial color={0xc2410c} roughness={0.4} metalness={0.6} />
        </mesh>
        <mesh position={[2.5, -7.5, 0]} castShadow>
          <boxGeometry args={[2.5, 2, 7.5]} />
          <meshStandardMaterial color={0x9a3412} roughness={0.3} metalness={0.7} />
        </mesh>
      </group>
    </group>
  );
};

const DeckCrane = ({ localX, localZ }) => {
  const CABLE_LENGTH = 13;
  return (
    <group position={[localX, 0, localZ]}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[4, 4.5, 4, 16]} />
        <meshStandardMaterial color={0x475569} roughness={0.5} metalness={0.6} />
      </mesh>
      <group rotation-y={0}>
        <mesh position={[0, 10, 0]} castShadow>
          <cylinderGeometry args={[3, 3.5, 20, 8]} />
          <meshStandardMaterial color={0x334155} roughness={0.5} metalness={0.5} />
        </mesh>
        <mesh position={[3, 16, 0]} castShadow>
          <boxGeometry args={[4, 5, 4]} />
          <meshStandardMaterial color={0x1e3a8a} roughness={0.4} />
        </mesh>
        <mesh position={[4.2, 16.5, 0]}>
          <boxGeometry args={[0.1, 3, 3.5]} />
          <meshStandardMaterial color={0x7dd3fc} roughness={0.1} metalness={0.0} transparent opacity={0.6} />
        </mesh>
        <mesh position={[-3.5, 19, 0]} castShadow>
          <boxGeometry args={[6, 4, 4.5]} />
          <meshStandardMaterial color={0x64748b} roughness={0.5} metalness={0.4} />
        </mesh>
        <group position={[0, 20, 0]} rotation-x={0.70}>
          <mesh position={[0, 0, -15]} castShadow>
            <boxGeometry args={[3, 3, 30]} />
            <meshStandardMaterial color={0xf97316} roughness={0.4} metalness={0.4} />
          </mesh>
          <mesh position={[0, 0, -32]} castShadow>
            <boxGeometry args={[2, 2, 8]} />
            <meshStandardMaterial color={0xf97316} roughness={0.4} metalness={0.4} />
          </mesh>
          <mesh position={[0, 0, -36]} castShadow>
            <sphereGeometry args={[1.5, 8, 8]} />
            <meshStandardMaterial color={0x94a3b8} metalness={0.8} roughness={0.2} />
          </mesh>
          <group position={[0, 0, -36]}>
            <mesh position={[0, -CABLE_LENGTH / 2, 0]} scale-y={CABLE_LENGTH}>
              <cylinderGeometry args={[0.15, 0.15, 1, 6]} />
              <meshStandardMaterial color={0x1e293b} roughness={0.9} />
            </mesh>
            <group position={[0, -CABLE_LENGTH, 0]}>
              <mesh position={[0, 0, 0]} castShadow>
                <boxGeometry args={[2.5, 2, 2.5]} />
                <meshStandardMaterial color={0x78716c} metalness={0.6} roughness={0.3} />
              </mesh>
              <group position={[0, -2, 0]}>
                <ClamshellGrab />
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};

/* ─────────────────────────────────────────
   COMPONENTES DE DETALHE NAVAL
───────────────────────────────────────── */
const Radar = ({ position }) => {
  const radarRef = useRef();
  useFrame((state) => {
    if (radarRef.current) radarRef.current.rotation.y += 0.05;
  });
  return (
    <group position={position}>
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 4]} />
        <meshStandardMaterial color={0xf1f5f9} />
      </mesh>
      <mesh ref={radarRef} position={[0, 4, 0]}>
        <boxGeometry args={[4, 0.4, 0.4]} />
        <meshStandardMaterial color={0xffffff} />
      </mesh>
    </group>
  );
};

const CargoHold = ({ x, width = 36, length = 52, fillLevel = 0.7 }) => {
  return (
    <group position={[x, 0, 0]}>
      {/* Braçolas da escotilha (Hatch Coamings - Bordas elevadas) */}
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[width + 2, 2, length + 2]} />
        <meshStandardMaterial color={0x475569} roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Abertura / Recorte interior (fake) */}
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[width, 2.2, length]} />
        <meshStandardMaterial color={0x1e293b} roughness={0.9} />
      </mesh>

      {/* Tampas de escotilha empilhadas (Hydraulic Folding Covers) */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * (width / 2 + 3), 1.5, 0]}>
          <mesh position={[0, 0, 0]} rotation={[0, 0, side * 0.2]} castShadow>
            <boxGeometry args={[4, 1.5, length]} />
            <meshStandardMaterial color={0xd97706} roughness={0.6} metalness={0.4} />
          </mesh>
          <mesh position={[side * 2, 2, 0]} rotation={[0, 0, side * -0.1]} castShadow>
            <boxGeometry args={[4, 1.2, length]} />
            <meshStandardMaterial color={0xd97706} roughness={0.6} metalness={0.4} />
          </mesh>
        </group>
      ))}

      {/* Interior profundo do porão */}
      <mesh position={[0, -6, 0]} receiveShadow>
        <boxGeometry args={[width - 0.5, 14, length - 0.5]} />
        <meshStandardMaterial color={0x78350f} roughness={0.9} side={THREE.BackSide} />
      </mesh>

      {/* Grãos/fertilizante no porão */}
      <mesh position={[0, -7 + fillLevel * 8, 0]} receiveShadow>
        <boxGeometry args={[width - 1, 1, length - 1]} />
        <meshStandardMaterial color={0xd4a96a} roughness={0.95} />
      </mesh>
    </group>
  );
};

// Posições X locais dos guindastes
const CRANE_LOCAL_X = [-80, 0, 80];

/* ─────────────────────────────────────────
   NAVIO BULK CARRIER (MAIS REALISTA)
───────────────────────────────────────── */
const BulkCarrierShip = ({ shipData, index, active }) => {
  const groupRef = useRef();
  const length = 300;
  const width = 46;
  const draft = 18;

  // Casco mais detalhado com proa alongada
  const hullGeo = useMemo(() => {
    const shape = new THREE.Shape();
    const hw = width / 2;
    const hl = length / 2;
    shape.moveTo(-hl, -hw + 4);
    shape.quadraticCurveTo(-hl - 12, 0, -hl, hw - 4); // Popa mais suave
    shape.lineTo(hl - 55, hw);
    shape.quadraticCurveTo(hl - 10, hw, hl + 10, 0); // Proa curva aerodinâmica
    shape.quadraticCurveTo(hl - 10, -hw, hl - 55, -hw);
    shape.lineTo(-hl, -hw + 4);

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: draft + 2,
      bevelEnabled: true,
      bevelSegments: 4,
      bevelSize: 2,
      bevelThickness: 2,
    });
    geo.rotateX(Math.PI / 2);
    geo.translate(0, draft - 4, 0);
    return geo;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 0.8 + index * 1.6) * 0.6;
      groupRef.current.rotation.z = Math.sin(t * 0.6 + index) * 0.006;
      groupRef.current.rotation.x = Math.cos(t * 0.4 + index) * 0.003;
    }
  });

  const deckY = draft - 4;

  return (
    <group position={[shipData.x, 0, 30]}>
      <group ref={groupRef} userData={{ type: 'ship', index }}>

        {/* ── CASCO PRINCIPAL ── */}
        <mesh geometry={hullGeo} castShadow receiveShadow>
          <meshStandardMaterial color={shipData.color} roughness={0.6} metalness={0.3} />
        </mesh>

        {/* ── BULBO DE PROA (Bulbous Bow) ── */}
        <mesh position={[length / 2 + 10, 2, 0]} castShadow>
          <capsuleGeometry args={[4, 12, 16, 16]} />
          <meshStandardMaterial color={0x7f1d1d} roughness={0.7} />
        </mesh>

        {/* ── MARCAS DE CALADO / FAIXA (Plimsoll line) ── */}
        <mesh position={[0, 5, 0]}>
          <boxGeometry args={[length - 25, 1, width + 0.8]} />
          <meshStandardMaterial color={0xb45309} roughness={0.5} />
        </mesh>

        {/* ── CONVÉS PRINCIPAL ── */}
        <mesh position={[0, deckY, 0]} receiveShadow castShadow>
          <boxGeometry args={[length - 12, 1.5, width - 1]} />
          <meshStandardMaterial color={0x334155} roughness={0.9} metalness={0.1} />
        </mesh>

        {/* ── CASTELO DE PROA (Forecastle) ── */}
        <group position={[length / 2 - 20, deckY + 1.5, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[40, 4, width - 4]} />
            <meshStandardMaterial color={shipData.color} roughness={0.6} />
          </mesh>
          <mesh position={[0, 2, 0]}>
            <boxGeometry args={[40, 0.5, width - 4]} />
            <meshStandardMaterial color={0x1e293b} roughness={0.8} />
          </mesh>
          {/* Quebra-mar (Breakwater) */}
          <mesh position={[-16, 4, 0]} rotation={[0, 0, 0.2]}>
            <boxGeometry args={[2, 4, width - 6]} />
            <meshStandardMaterial color={shipData.color} />
          </mesh>
          {/* Guinchos de Amarração (Mooring Winches) */}
          {[-12, 12].map(z => (
            <mesh key={z} position={[5, 3, z]} castShadow>
              <cylinderGeometry args={[2, 2, 5]} rotation={[Math.PI / 2, 0, 0]} />
              <meshStandardMaterial color={0x0f172a} />
            </mesh>
          ))}
        </group>

        {/* ── PORÕES ── */}
        {[-80, 0, 80].map((hx, i) => (
          <group key={i} position={[hx, deckY + 0.5, 0]}>
            <CargoHold x={0} fillLevel={active ? 0.3 : 0.8} />
          </group>
        ))}

        {/* ── TUBULAÇÕES DE CONVÉS ── */}
        <mesh position={[0, deckY + 1, width / 2 - 4]} castShadow>
          <cylinderGeometry args={[0.4, 0.4, length - 80]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color={0x94a3b8} metalness={0.6} />
        </mesh>

        {/* ── SUPERESTRUTURA E PONTE DE COMANDO ── */}
        <group position={[-length / 2 + 35, deckY + 1, 0]}>
          {/* Blocos da acomodação */}
          {[
            { y: 4, w: 42, h: 8, d: 40 },
            { y: 12, w: 38, h: 8, d: 36 },
            { y: 20, w: 32, h: 8, d: 34 },
            { y: 28, w: 26, h: 8, d: 34 },
          ].map((s, i) => (
            <mesh key={i} position={[0, s.y, 0]} castShadow>
              <boxGeometry args={[s.w, s.h, s.d]} />
              <meshStandardMaterial color={0xf8fafc} roughness={0.3} />
            </mesh>
          ))}

          {/* Asas do Passadiço (Bridge Wings) - Maior que o casco */}
          <mesh position={[4, 34, 0]} castShadow>
            <boxGeometry args={[14, 6, width + 14]} />
            <meshStandardMaterial color={0xf8fafc} roughness={0.3} />
          </mesh>

          {/* Janelas panorâmicas da ponte */}
          <mesh position={[11.2, 34.5, 0]}>
            <boxGeometry args={[0.2, 4, width + 13.5]} />
            <meshStandardMaterial color={0x0284c7} roughness={0.1} metalness={0.8} transparent opacity={0.8} />
          </mesh>

          {/* Radares e Mastro superior */}
          <Radar position={[0, 37, 0]} />

          {/* Chaminés (Funnels) Detalhadas */}
          <group position={[-12, 36, 0]}>
            <mesh castShadow>
              <boxGeometry args={[12, 14, 16]} />
              <meshStandardMaterial color={shipData.color} roughness={0.5} />
            </mesh>
            {/* Tubos de escape */}
            {[-3, 3].map(z => (
              <mesh key={z} position={[0, 9, z]} castShadow>
                <cylinderGeometry args={[1.5, 1.5, 6]} />
                <meshStandardMaterial color={0x1e293b} roughness={0.8} />
              </mesh>
            ))}
          </group>

          {/* Baleeiras (Lifeboats) nos Turcos */}
          {[-width / 2 - 1, width / 2 + 1].map((z, i) => (
            <group key={i} position={[-5, 20, z]}>
              <mesh castShadow>
                <capsuleGeometry args={[2, 5, 8, 16]} rotation={[Math.PI / 2, 0, 0]} />
                <meshStandardMaterial color={0xff5500} roughness={0.4} />
              </mesh>
              {/* Turcos (Davits) */}
              <mesh position={[2, 2, 0]}>
                <boxGeometry args={[6, 8, 0.5]} />
                <meshStandardMaterial color={0x64748b} />
              </mesh>
            </group>
          ))}
        </group>

        {/* ── MASTRO DE PROA ── */}
        <group position={[length / 2 - 25, deckY + 18, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.6, 1.2, 36, 8]} />
            <meshStandardMaterial color={0xf1f5f9} />
          </mesh>
          <mesh position={[0, 10, 0]}>
            <boxGeometry args={[4, 0.5, 12]} />
            <meshStandardMaterial color={0xf1f5f9} />
          </mesh>
        </group>

        {/* ── 3 GUINDASTES DE CONVÉS ── */}
        {CRANE_LOCAL_X.map((lx, i) => (
          <group key={i} position={[lx, deckY + 1, -width / 2 + 6]}>
            <DeckCrane localX={0} localZ={0} phase={[0.0, 0.33, 0.66][i]} active={active} />
          </group>
        ))}

        {/* ── ÂNCORAS ── */}
        {[-width / 2, width / 2].map((dz) => (
          <mesh key={dz} position={[length / 2 - 35, deckY - 6, dz]} rotation={[0, 0, 0.2]} castShadow>
            <boxGeometry args={[4, 5, 2]} />
            <meshStandardMaterial color={0x1e293b} roughness={0.7} metalness={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

/* ─────────────────────────────────────────
   ANIMADOR DE CÂMERA E CENA PRINCIPAL
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
      camPos = new THREE.Vector3(ship.x - 140, 150, 300);
    }
    new TWEEN.Tween(camera.position).to(camPos, 2000).easing(TWEEN.Easing.Quartic.InOut).start();
    new TWEEN.Tween(baseTargetRef.current).to(targetPos, 2000).easing(TWEEN.Easing.Quartic.InOut).start();
  }, [focusedShipIndex, camera, controls, shipsData]);

  useFrame(() => {
    TWEEN.update();
    if (controls) {
      controls.target.copy(baseTargetRef.current);
      controls.target.y += Math.sin(Date.now() * 0.001) * 1.5;
    }
  });
  return null;
};

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
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
    >
      <color attach="background" args={['#020c1b']} />
      <fogExp2 attach="fog" args={['#020c1b', 0.0007]} />

      <PerspectiveCamera makeDefault position={[0, 600, 1100]} fov={35} near={10} far={9000} />
      <OrbitControls makeDefault enableDamping dampingFactor={0.05} maxPolarAngle={Math.PI / 2 - 0.03} minDistance={60} maxDistance={2500} />
      <CameraAnimator focusedShipIndex={focusedShipIndex} shipsData={shipsData} />

      <hemisphereLight args={[0xd4e8ff, 0x0a1628, 0.6]} />
      <directionalLight position={[300, 400, 200]} intensity={2.2} color={0xfff8f0} castShadow shadow-bias={-0.0004} shadow-mapSize={[2048, 2048]} shadow-camera-left={-800} shadow-camera-right={800} shadow-camera-top={400} shadow-camera-bottom={-400} />
      <directionalLight position={[-200, 200, -100]} intensity={0.5} color={0x4488cc} />
      <pointLight position={[0, 50, -200]} intensity={1} color={0xffcc88} distance={700} />

      <Ocean />
      <Quay />

      {shipsData.map((data, idx) => (
        <BulkCarrierShip key={idx} shipData={data} index={idx} active={focusedShipIndex === idx} />
      ))}

      {shipsData.map((data) =>
        CRANE_LOCAL_X.map((lx, ci) => (
          <DischargeHopper key={`${data.x}-${ci}`} worldX={data.x + lx} />
        ))
      )}
    </Canvas>
  );
};

/* ─────────────────────────────────────────
   UI PRINCIPAL EXPORTADA
───────────────────────────────────────── */
const shipsData = [
  { x: -680, color: 0x7f1d1d, name: 'MV BEIRA STAR', cargo: 'Fertilizante', status: 'A descarregar', progress: 62 },
  { x: -220, color: 0x1e3a5f, name: 'MV MAPUTO BAY', cargo: 'Soja', status: 'A descarregar', progress: 38 },
  { x: 240, color: 0x14532d, name: 'MV NACALA WIND', cargo: 'Granéis Secos', status: 'A aguardar', progress: 0 },
  { x: 700, color: 0x4c1d95, name: 'MV SOFALA PRIDE', cargo: 'Clínquer', status: 'A descarregar', progress: 81 },
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
      <Scene3D focusedShipIndex={focusedShipIndex} onShipSelect={handleShipSelect} shipsData={shipsData} />

      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '14px 24px', background: 'linear-gradient(180deg,rgba(2,12,27,0.95) 0%,rgba(2,12,27,0) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', pointerEvents: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22d3ee', boxShadow: '0 0 8px #22d3ee', animation: 'pulse 2s infinite' }} />
          <span style={{ color: '#e2e8f0', fontSize: 13, letterSpacing: 3, fontWeight: 700 }}>SISTEMA DE GESTÃO PORTUÁRIA</span>
        </div>
        <div style={{ display: 'flex', gap: 28 }}>
          <Stat label="NAVIOS ATRACADOS" value="4" />
          <Stat label="GUINDASTES ATIVOS" value="12" />
          <Stat label="HORA LOCAL" value={time} />
        </div>
      </div>

      <div style={{ position: 'absolute', top: 70, left: 16, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'all' }}>
        {shipsData.map((ship, idx) => (
          <ShipCard key={idx} ship={ship} idx={idx} selected={focusedShipIndex === idx} onClick={() => handleShipSelect(idx)} />
        ))}
      </div>

      {selectedShip && (
        <div style={{ position: 'absolute', top: 70, right: 16, width: 240, background: 'rgba(2,12,27,0.92)', border: '1px solid rgba(34,211,238,0.25)', borderRadius: 8, padding: '16px', color: '#e2e8f0', backdropFilter: 'blur(8px)' }}>
          <div style={{ fontSize: 10, color: '#22d3ee', letterSpacing: 3, marginBottom: 12 }}>DETALHE DA OPERAÇÃO</div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>{selectedShip.name}</div>
          <DetailRow label="Carga" value={selectedShip.cargo} />
          <DetailRow label="Estado" value={selectedShip.status} accent="#22d3ee" />
          <DetailRow label="Guindastes" value="3 activos" />
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 10, color: '#94a3b8', letterSpacing: 2, marginBottom: 6 }}>PROGRESSO DE DESCARGA</div>
            <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${selectedShip.progress}%`, background: 'linear-gradient(90deg,#0ea5e9,#22d3ee)', borderRadius: 4, transition: 'width 0.5s ease' }} />
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 5, textAlign: 'right' }}>{selectedShip.progress}%</div>
          </div>
          <button onClick={() => handleShipSelect(-1)} style={{ marginTop: 16, width: '100%', padding: '8px 0', background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.3)', borderRadius: 4, color: '#22d3ee', fontSize: 11, letterSpacing: 2, cursor: 'pointer' }}>FECHAR</button>
        </div>
      )}

      <div style={{ position: 'absolute', bottom: 16, right: 16, background: 'rgba(2,12,27,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '12px 16px', pointerEvents: 'none' }}>
        <div style={{ fontSize: 9, color: '#64748b', letterSpacing: 2, marginBottom: 8 }}>LEGENDA</div>
        {[{ color: '#f97316', label: 'Guindaste de Convés' }, { color: '#c2410c', label: 'Garra Clamshell' }, { color: '#eab308', label: 'Funil de Descarga' }, { color: '#94a3b8', label: 'Silo de Armazenamento' }].map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: item.color, flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: '#94a3b8' }}>{item.label}</span>
          </div>
        ))}
      </div>

      <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', background: 'rgba(2,12,27,0.7)', borderRadius: 20, padding: '6px 16px', color: '#475569', fontSize: 10, letterSpacing: 2, pointerEvents: 'none' }}>
        ARRASTAR · SCROLL ZOOM · CLIQUE NO NAVIO PARA FOCAR
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}

const Stat = ({ label, value }) => (
  <div style={{ textAlign: 'right' }}>
    <div style={{ fontSize: 9, color: '#64748b', letterSpacing: 2 }}>{label}</div>
    <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 700 }}>{value}</div>
  </div>
);

const ShipCard = ({ ship, idx, selected, onClick }) => (
  <div onClick={onClick} style={{ width: 210, padding: '10px 14px', background: selected ? 'rgba(14,165,233,0.12)' : 'rgba(2,12,27,0.88)', border: `1px solid ${selected ? 'rgba(34,211,238,0.5)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 6, cursor: 'pointer', backdropFilter: 'blur(6px)', transition: 'all 0.2s ease' }}>
    <div style={{ fontSize: 9, color: '#64748b', letterSpacing: 2, marginBottom: 4 }}>NAVIO {idx + 1}</div>
    <div style={{ fontSize: 12, color: '#e2e8f0', fontWeight: 700, marginBottom: 4 }}>{ship.name}</div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 10, color: '#94a3b8' }}>{ship.cargo}</span>
      <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 10, background: ship.status === 'A aguardar' ? 'rgba(100,116,139,0.3)' : 'rgba(34,211,238,0.15)', color: ship.status === 'A aguardar' ? '#64748b' : '#22d3ee', letterSpacing: 1 }}>
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