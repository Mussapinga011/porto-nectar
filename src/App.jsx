import React, { useState } from 'react';
import Scene from './components/Scene';
import UIOverlay from './components/UIOverlay';
import { shipsData } from './data/ships';

function App() {
  const [focusedShipIndex, setFocusedShipIndex] = useState(-1);

  const handleShipSelect = (index) => {
    setFocusedShipIndex(index);
  };

  const handleResetView = () => {
    setFocusedShipIndex(-1);
  };

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-slate-950 text-slate-100">
      <UIOverlay 
        focusedShipIndex={focusedShipIndex} 
        onReset={handleResetView} 
        shipsData={shipsData}
      />
      <div className="absolute inset-0 z-0">
        <Scene 
          focusedShipIndex={focusedShipIndex} 
          onShipSelect={handleShipSelect}
          shipsData={shipsData}
        />
      </div>
    </div>
  );
}

export default App;
