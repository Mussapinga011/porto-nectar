import React from 'react';
import { ArrowLeft, Move } from 'lucide-react';

const UIOverlay = ({ focusedShipIndex, onReset, shipsData }) => {
  const isFocused = focusedShipIndex !== -1;
  const ship = isFocused ? shipsData[focusedShipIndex] : null;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col z-10">
      <header className="px-8 py-6 flex justify-between items-start bg-gradient-to-b from-slate-950/95 via-slate-950/50 to-transparent pointer-events-auto">
        <div className="flex flex-col gap-1">
          <h1 className="m-0 text-2xl font-bold tracking-widest text-slate-200 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
            PORTO <span className="text-amber-500">DA BEIRA</span>
          </h1>
          <p className="m-0 text-[11px] text-slate-400 uppercase tracking-widest font-mono">
            Terminal Logístico Digital • Visualização 3D SCADA
          </p>
        </div>
        <div className="flex items-center gap-2.5 text-[11px] font-semibold text-slate-300 uppercase tracking-widest bg-slate-900/60 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md">
          <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_12px_#10b981] animate-[pulse_2s_infinite]" />
          Sistema Online
        </div>
      </header>

      {/* Side Panel */}
      <div 
        className={`absolute top-24 bottom-8 w-[380px] bg-slate-900/85 backdrop-blur-xl border border-white/10 border-r-0 rounded-l-3xl p-8 flex flex-col gap-6 shadow-[-10px_0_40px_rgba(0,0,0,0.6)] pointer-events-auto transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isFocused ? 'right-0' : '-right-[450px]'}`}
      >
        <button 
          onClick={onReset}
          className="self-start bg-white/5 border border-white/10 text-slate-200 px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-white/15 hover:-translate-x-1 text-[11px] font-semibold uppercase tracking-widest flex items-center gap-1.5"
        >
          <ArrowLeft size={14} />
          Visão Geral
        </button>
        
        {ship && (
          <>
            <div className="flex flex-col gap-2">
              <h2 className="m-0 text-3xl font-bold text-slate-50 tracking-wide">{ship.name}</h2>
              <div className="inline-flex px-2.5 py-1.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-md text-[10px] font-bold uppercase tracking-widest self-start font-mono">
                Operação em Curso
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Carga</label>
                <span className="text-lg font-semibold text-slate-200 font-mono">{ship.cargo}</span>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Cais</label>
                <span className="text-lg font-semibold text-slate-200 font-mono">0{focusedShipIndex + 5}</span>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Progresso</label>
                <span className="text-lg font-semibold text-slate-200 font-mono">{ship.progress}%</span>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Término Estimado</label>
                <span className="text-lg font-semibold text-slate-200 font-mono">18:30 GMT</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                <span>Movimentação</span>
                <span>{Math.floor(2500 * ship.progress / 100)} / 2500 TEU</span>
              </div>
              <div className="h-2 bg-black/40 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{ width: `${ship.progress}%` }}
                />
              </div>
            </div>
            
            <h3 className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-slate-500 border-b border-white/5 pb-3">Gruas Gantry Designadas</h3>
            <div className="flex flex-col gap-2 flex-1 overflow-y-auto pr-1 custom-scrollbar">
              {[0, 1].map((craneIdx) => (
                <div key={craneIdx} className="flex items-center justify-between bg-white/5 p-3 px-4 rounded-lg border border-white/5">
                  <span className="text-xs font-medium text-slate-300">Gantry Crane RTG-{focusedShipIndex + 1}0{craneIdx + 1}</span>
                  <div className="text-[10px] font-semibold uppercase tracking-widest flex items-center gap-1.5 font-mono text-emerald-400">
                    <div className="w-1.5 h-1.5 bg-current rounded-full shadow-[0_0_6px_currentColor]" />
                    Operando
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      
      <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 bg-slate-900/85 px-7 py-3.5 rounded-full text-[13px] font-medium text-slate-300 backdrop-blur-md pointer-events-none border border-white/10 flex items-center gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.6)] transition-opacity duration-400 ${isFocused ? 'opacity-0' : 'opacity-100'}`}>
        <Move size={18} />
        Arraste para navegar a câmera. Clique num navio para iniciar a inspeção detalhada.
      </div>
    </div>
  );
};

export default UIOverlay;
