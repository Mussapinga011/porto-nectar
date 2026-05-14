import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Water } from 'three-stdlib';
import * as TWEEN from '@tweenjs/tween.js';

extend({ Water });

const WATER_NORMALS_URL = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/waternormals.jpg';

const Ocean = () => {
  const ref = useRef();
  const gl = useThree((state) => state.gl);
  const waterNormals = useMemo(() => new THREE.TextureLoader().load(WATER_NORMALS_URL, (texture) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  }), []);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.material.uniforms.time.value += delta / 1.5;
    }
  });

  return (
    <water
      ref={ref}
      args={[
        new THREE.PlaneGeometry(10000, 10000),
        {
          textureWidth: 512,
          textureHeight: 512,
          waterNormals,
          sunDirection: new THREE.Vector3(250, 350, 150).normalize(),
          sunColor: 0xfff5e6,
          waterColor: 0x001020,
          distortionScale: 3.0,
          fog: true,
          format: gl.encoding,
        },
      ]}
      rotation-x={-Math.PI / 2}
    />
  );
};

const QuayAndYard = () => {
  // Contentores removidos do pátio do cais conforme solicitado

  return (
    <group>
      <mesh position={[0, -7, -1010]} receiveShadow>
        <boxGeometry args={[3200, 30, 2000]} />
        <meshStandardMaterial color={0x1a1e23} roughness={0.9} metalness={0.2} />
      </mesh>
      
      <mesh position={[0, 8.25, -13]} receiveShadow>
        <boxGeometry args={[3200, 0.5, 3]} />
        <meshStandardMaterial color={0xf59e0b} roughness={0.6} />
      </mesh>

    </group>
  );
};

const GantryCrane = ({ x, z, active }) => {
  const trolleyRef = useRef();
  const cableGroupRef = useRef();
  const cargoRef = useRef();
  const phaseRef = useRef(Math.random() * Math.PI * 2);

  useFrame(() => {
    if (!trolleyRef.current) return;
    
    if (active) {
      phaseRef.current += 0.015;
      const zMove = Math.sin(phaseRef.current) * 22.5 + 22.5; 
      trolleyRef.current.position.z = zMove;
      cableGroupRef.current.position.z = zMove;
      
      const hoistPhase = Math.sin(phaseRef.current);
      const isEdge = Math.abs(hoistPhase) > 0.85;
      
      let targetY = isEdge ? 12 : 28;
      cableGroupRef.current.position.y += (targetY - cableGroupRef.current.position.y) * 0.1;
      
      if(isEdge && targetY === 12 && hoistPhase > 0) { 
        cargoRef.current.visible = true; 
      } else if(isEdge && targetY === 12 && hoistPhase < 0) {
        cargoRef.current.visible = false; 
      }
    } else {
      trolleyRef.current.position.z += (5 - trolleyRef.current.position.z) * 0.02;
      cableGroupRef.current.position.z += (5 - cableGroupRef.current.position.z) * 0.02;
      cableGroupRef.current.position.y += (28 - cableGroupRef.current.position.y) * 0.02;
      cargoRef.current.visible = false;
    }
  });

  return (
    <group position={[x, 8, z]}>
      {[-14, 14].map(dx => (
        <group key={dx}>
          {[-12, 12].map(dz => (
            <mesh key={dz} position={[dx, 27.5, dz]} castShadow receiveShadow>
              <boxGeometry args={[2.5, 55, 2.5]} />
              <meshStandardMaterial color={0xe2e8f0} roughness={0.5} metalness={0.2} />
            </mesh>
          ))}
          <mesh position={[dx, 18, 0]} castShadow>
            <boxGeometry args={[2.5, 2.5, 24]} />
            <meshStandardMaterial color={0xe2e8f0} roughness={0.5} metalness={0.2} />
          </mesh>
        </group>
      ))}
      
      <mesh position={[0, 59.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[30, 9, 28]} />
        <meshStandardMaterial color={0x1e3a8a} roughness={0.7} metalness={0.3} />
      </mesh>

      <mesh position={[0, 55, 40]} castShadow receiveShadow>
        <boxGeometry args={[7, 3.5, 120]} />
        <meshStandardMaterial color={0xe2e8f0} roughness={0.5} metalness={0.2} />
      </mesh>

      <mesh ref={trolleyRef} position={[0, 53, 50]} castShadow>
        <boxGeometry args={[9, 4.5, 9]} />
        <meshStandardMaterial color={0xf97316} roughness={0.6} />
      </mesh>
      
      <group ref={cableGroupRef} position={[0, 28, 50]}>
        {[-3.5, 3.5].map(cdx => 
          [-2.5, 2.5].map(cdz => (
            <mesh key={`${cdx}-${cdz}`} position={[cdx, 0, cdz]}>
              <cylinderGeometry args={[0.15, 0.15, 46]} />
              <meshStandardMaterial color={0x0f172a} roughness={0.9} />
            </mesh>
          ))
        )}
        
        <mesh position={[0, -23.5, 0]} castShadow>
          <boxGeometry args={[9, 1.5, 21]} />
          <meshStandardMaterial color={0xf97316} roughness={0.6} />
          <mesh ref={cargoRef} position={[0, -5, 0]} visible={false}>
            <boxGeometry args={[8.5, 9, 20.5]} />
            <meshStandardMaterial color={0x1d4ed8} roughness={0.6} />
          </mesh>
        </mesh>
      </group>
    </group>
  );
};

const Ship = ({ shipData, index, active }) => {
  const groupRef = useRef();
  
  const length = 260; const width = 36; const depth = 20;
  
  const hullGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-length/2, -width/2);
    shape.lineTo(length/2 - 35, -width/2);
    shape.quadraticCurveTo(length/2, 0, length/2, 0); 
    shape.quadraticCurveTo(length/2 - 35, width/2, length/2 - 35, width/2);
    shape.lineTo(-length/2, width/2);
    shape.lineTo(-length/2, -width/2);
    
    const geo = new THREE.ExtrudeGeometry(shape, { depth: depth, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 1.5, bevelThickness: 1.5 });
    geo.rotateX(Math.PI / 2);
    geo.translate(0, depth - 6, 0);
    return geo;
  }, []);

  const contColors = [0x0f172a, 0x1d4ed8, 0xb91c1c, 0xd97706, 0x047857, 0xf8fafc, 0x64748b];
  const containers = useMemo(() => {
    const list = [];
    for(let bx = -length/2 + 70; bx < length/2 - 45; bx += 8.5 + 0.8) {
      if(Math.random() > 0.9) continue;
      const stack = Math.floor(Math.random() * 5) + 2; 
      for(let y = 0; y < stack; y++) {
        const color = contColors[Math.floor(Math.random()*contColors.length)];
        list.push({ x: bx, y: depth - 6 + y * 9 + 4.5, z: 0, color });
      }
    }
    return list;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(time * 1.2 + index * 1.5) * 0.6;
      groupRef.current.rotation.z = Math.sin(time * 0.8 + index) * 0.01;
      groupRef.current.rotation.x = Math.cos(time * 0.6 + index) * 0.005;
    }
  });

  return (
    <group position={[shipData.x, 0, 24]}>
      <group ref={groupRef} userData={{ type: 'ship', index }}>
        <mesh geometry={hullGeo} castShadow receiveShadow>
          <meshStandardMaterial color={shipData.color} roughness={0.6} metalness={0.25} />
        </mesh>
        
        <group position={[-length/2 + 28, depth - 6, 0]}>
          <mesh position={[0, 6, 0]} castShadow>
            <boxGeometry args={[32, 12, 34]} />
            <meshStandardMaterial color={0xf8fafc} roughness={0.4} />
          </mesh>
          <mesh position={[0, 17, 0]} castShadow>
            <boxGeometry args={[24, 10, 28]} />
            <meshStandardMaterial color={0xf8fafc} roughness={0.4} />
          </mesh>
          <mesh position={[0, 26.5, 0]} castShadow>
            <boxGeometry args={[16, 9, 38]} />
            <meshStandardMaterial color={0xf8fafc} roughness={0.4} />
          </mesh>
          <mesh position={[0, 26.5, 0]}>
            <boxGeometry args={[16.5, 4.5, 36]} />
            <meshStandardMaterial color={0x020617} roughness={0.1} metalness={0.9} />
          </mesh>
          <mesh position={[-8, 36, 0]} castShadow>
            <cylinderGeometry args={[3, 4.5, 16, 16]} />
            <meshStandardMaterial color={0x1e293b} />
          </mesh>
        </group>
        
        {containers.map((c, i) => (
          <mesh key={i} position={[c.x, c.y, c.z]} castShadow receiveShadow>
            <boxGeometry args={[8.5, 9, 20.5]} />
            <meshStandardMaterial color={c.color} roughness={0.6} />
          </mesh>
        ))}
      </group>
      
      {/* Cranes for this ship */}
      <GantryCrane x={-45} z={-25 - 24} active={active} />
      <GantryCrane x={45} z={-25 - 24} active={active} />
    </group>
  );
};

const CameraAnimator = ({ focusedShipIndex, shipsData }) => {
  const { camera, controls } = useThree();
  
  useEffect(() => {
    if(!controls) return;
    
    let targetPos, camPos;
    if (focusedShipIndex === -1) {
      targetPos = new THREE.Vector3(0, 0, -100);
      camPos = new THREE.Vector3(500, 450, 700);
    } else {
      const ship = shipsData[focusedShipIndex];
      targetPos = new THREE.Vector3(ship.x, 15, 24);
      camPos = new THREE.Vector3(ship.x - 140, 110, 224);
    }

    new TWEEN.Tween(camera.position).to(camPos, 1800).easing(TWEEN.Easing.Cubic.InOut).start();
    new TWEEN.Tween(controls.target).to(targetPos, 1800).easing(TWEEN.Easing.Cubic.InOut).start();
  }, [focusedShipIndex, camera, controls, shipsData]);

  useFrame(() => {
    TWEEN.update();
  });

  return null;
};

const Scene = ({ focusedShipIndex, onShipSelect, shipsData }) => {
  const handlePointerDown = (e) => {
    e.stopPropagation();
    let obj = e.object;
    while(obj && !obj.userData.type) {
      obj = obj.parent;
    }
    if (obj && obj.userData.type === 'ship') {
      onShipSelect(obj.userData.index);
    } else {
      onShipSelect(-1);
    }
  };

  return (
    <Canvas shadows onPointerDown={handlePointerDown} gl={{ antialias: true, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}>
      <color attach="background" args={['#030712']} />
      <fogExp2 attach="fog" args={['#030712', 0.001]} />
      
      <PerspectiveCamera makeDefault position={[500, 450, 700]} fov={30} near={10} far={8000} />
      
      <OrbitControls 
        makeDefault
        enableDamping 
        dampingFactor={0.05} 
        maxPolarAngle={Math.PI / 2 - 0.05} 
        minDistance={80} 
        maxDistance={2000} 
        target={[0, 0, -100]} 
      />
      <CameraAnimator focusedShipIndex={focusedShipIndex} shipsData={shipsData} />

      <hemisphereLight args={[0xffffff, 0x0f172a, 0.45]} />
      <directionalLight
        position={[250, 350, 150]}
        intensity={1.8}
        color={0xfff5e6}
        castShadow
        shadow-bias={-0.0005}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-600}
        shadow-camera-right={600}
        shadow-camera-top={300}
        shadow-camera-bottom={-300}
      />

      <Ocean />
      <QuayAndYard />
      
      {shipsData.map((data, idx) => (
        <Ship 
          key={idx} 
          shipData={data} 
          index={idx} 
          active={focusedShipIndex === idx} 
        />
      ))}
    </Canvas>
  );
};

// Must import PerspectiveCamera from Drei since we define makeDefault
import { PerspectiveCamera } from '@react-three/drei';

export default Scene;
