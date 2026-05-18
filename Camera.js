import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';

const CameraAnimator = ({ focusedShipIndex, shipsData }) => {
  const { camera, controls } = useThree();
  const baseTargetRef = useRef(new THREE.Vector3(0, 0, -60));

  useEffect(() => {
    if (!controls) return;
    
    let targetPos, camPos;

    // 1. DEFINIÇÃO DE CONSTANTES (Eixos Y e Z bloqueados)
    // Estes valores mantêm a câmara sempre à mesma altura e distância.
    // Podes ajustar estes números para encontrar o enquadramento perfeito.
    const FIXED_CAM_Y = 400;  // Altura da câmara
    const FIXED_CAM_Z = 900;  // Distância da câmara
    const FIXED_TARGET_Y = 20; // Altura para onde a câmara olha
    const FIXED_TARGET_Z = 28; // Profundidade para onde a câmara olha

    if (focusedShipIndex === -1) {
      // 2. VISÃO GERAL (X = 0)
      // A câmara volta ao centro do porto.
      targetPos = new THREE.Vector3(0, FIXED_TARGET_Y, FIXED_TARGET_Z);
      camPos = new THREE.Vector3(0, FIXED_CAM_Y, FIXED_CAM_Z);
    } else {
      // 3. VISÃO FOCADA NO NAVIO (Move apenas o eixo X)
      const ship = shipsData[focusedShipIndex];
      // O eixo X acompanha o navio. Os eixos Y e Z usam as constantes.
      targetPos = new THREE.Vector3(ship.x, FIXED_TARGET_Y, FIXED_TARGET_Z);
      camPos = new THREE.Vector3(ship.x, FIXED_CAM_Y, FIXED_CAM_Z);
    }

    // Inicia a animação suave (Tween) para a nova posição
    new TWEEN.Tween(camera.position)
      .to(camPos, 2000)
      .easing(TWEEN.Easing.Quartic.InOut)
      .start();
      
    new TWEEN.Tween(baseTargetRef.current)
      .to(targetPos, 2000)
      .easing(TWEEN.Easing.Quartic.InOut)
      .start();
      
  }, [focusedShipIndex, camera, controls, shipsData]);

  useFrame(() => {
    TWEEN.update();
    if (controls) {
      controls.target.copy(baseTargetRef.current);
      // Mantivemos o teu efeito de flutuação suave no alvo!
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

  // Calculamos um ângulo fixo para bloquear a rotação vertical da câmara
  const fixedPolarAngle = Math.PI / 3; // Aproximadamente 60 graus

  return (
    <Canvas
      shadows
      onPointerDown={handlePointerDown}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
    >
      <color attach="background" args={['#020c1b']} />
      <fogExp2 attach="fog" args={['#020c1b', 0.0007]} />

      <PerspectiveCamera makeDefault position={[0, 400, 900]} fov={35} near={10} far={9000} />
      
      {/* Ajustes no OrbitControls para restringir o utilizador */}
      <OrbitControls 
        makeDefault 
        enableDamping 
        dampingFactor={0.05} 
        
        // Bloqueia a rotação vertical (não deixa olhar mais para cima ou para baixo)
        minPolarAngle={fixedPolarAngle} 
        maxPolarAngle={fixedPolarAngle} 
        
        // Bloqueia a rotação horizontal (opcional: impede de rodar à volta do navio)
        minAzimuthAngle={0}
        maxAzimuthAngle={0}
        
        // Impede o utilizador de fazer zoom manual com a roda do rato
        enableZoom={false} 
        
        // Permite apenas arrastar horizontalmente (pan)
        enablePan={true}
      />
      
      <CameraAnimator focusedShipIndex={focusedShipIndex} shipsData={shipsData} />

      <hemisphereLight args={[0xd4e8ff, 0x0a1628, 0.6]} />
      <directionalLight position={[300, 400, 200]} intensity={2.2} color={0xfff8f0} castShadow shadow-bias={-0.0004} shadow-mapSize={[2048, 2048]} shadow-camera-left={-800} shadow-camera-right={800} shadow-camera-top={400} shadow-camera-bottom={-400} />
      <directionalLight position={[-200, 200, -100]} intensity={0.5} color={0x4488cc} />
      <pointLight position={[0, 50, -200]} intensity={1} color={0xffcc88} distance={700} />

      {/* Os teus componentes da cena continuam iguais! */}
      {/* <Ocean /> */}
      {/* <Quay /> */}

      {/* Renderização dos Navios e Guindastes... */}
    </Canvas>
  );
};

export default Scene3D;