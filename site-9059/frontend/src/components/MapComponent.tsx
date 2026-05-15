import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, MapPin } from 'lucide-react';

export const MapComponent: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [glContextLost, setGlContextLost] = useState(false);
  const [gpuError, setGpuError] = useState<string | null>(null);
  const [hwAccelerationOff, setHwAccelerationOff] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  // Defect 9: WebGL Context Loss
  const triggerWebGLContextLoss = () => {
    if (!canvasRef.current) return;
    const gl = canvasRef.current.getContext('webgl');
    if (gl) {
      const ext = gl.getExtension('WEBGL_lose_context');
      if (ext) {
        ext.loseContext();
        setGlContextLost(true);
      }
    }
  };

  // Defect 10: WebGPU Crash
  const triggerWebGPUCrash = async () => {
    try {
      if (!navigator.gpu) {
        throw new Error("WebGPU not supported in this browser.");
      }
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) throw new Error("No adapter found");
      const device = await adapter.requestDevice();

      // Intentionally malformed WGSL
      const badShaderCode = `
        @fragment fn main() -> @location(0) vec4<f32> {
            return vec4<f32>(1.0, 0.0, 0.0, 1.0) // Missing semicolon and invalid syntax
        }
      `;
      
      // This will throw a validation error
      device.createShaderModule({ code: badShaderCode });
    } catch (e: any) {
      setGpuError(`WebGPU Initialization Failed: ${e.message}`);
    }
  };

  useEffect(() => {
    if (!canvasRef.current || hwAccelerationOff) return;
    const gl = canvasRef.current.getContext('webgl');
    if (gl) {
      // Basic clear to a dark color to represent the map background
      gl.clearColor(0.01, 0.02, 0.09, 1.0); // Midnight blue
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
  }, [hwAccelerationOff, glContextLost]);

  return (
    <div className="relative w-full h-[500px] bg-slate-900 rounded-xl overflow-hidden neon-border">
      {/* Defect 7: Canvas blank without HW Acceleration */}
      {hwAccelerationOff ? (
        <div className="absolute inset-0 bg-black flex items-center justify-center">
          <span className="text-gray-500">Blank Screen (Hardware Acceleration Disabled)</span>
        </div>
      ) : (
        <canvas ref={canvasRef} width={800} height={500} className="w-full h-full" />
      )}

      {/* Overlays and Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button onClick={() => setHwAccelerationOff(!hwAccelerationOff)} className="bg-slate-800 text-xs p-2 rounded border border-slate-600 hover:bg-slate-700">
          Toggle HW Accel {hwAccelerationOff ? '(OFF)' : '(ON)'}
        </button>
        <button onClick={triggerWebGLContextLoss} className="bg-slate-800 text-xs p-2 rounded border border-red-500/50 hover:bg-red-900/50">
          Simulate GPU Reset (WebGL)
        </button>
        <button onClick={triggerWebGPUCrash} className="bg-slate-800 text-xs p-2 rounded border border-pink-500/50 hover:bg-pink-900/50">
          Init 3D Tracking (WebGPU)
        </button>
        <button onClick={() => setShowPopup(!showPopup)} className="bg-slate-800 text-xs p-2 rounded border border-cyan-500/50 hover:bg-cyan-900/50">
          Toggle Vehicle Popup
        </button>
      </div>

      {glContextLost && (
        <div className="absolute inset-0 bg-red-950/80 flex items-center justify-center flex-col text-red-500">
          <AlertCircle size={48} className="mb-2" />
          <p className="font-bold">WebGL Context Lost</p>
          <p className="text-sm">Cannot recover map context.</p>
        </div>
      )}

      {gpuError && (
        <div className="absolute bottom-4 left-4 right-4 bg-red-900/90 text-white p-3 rounded text-sm border border-red-500">
          {gpuError}
        </div>
      )}

      {/* Defect 6: Hardware Acceleration Layer Compositing Error */}
      {showPopup && (
        <div className="defect-layer-compositing-glitch top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800 p-4 rounded-lg border border-cyan-500 shadow-xl flex items-center gap-3">
           <MapPin className="text-cyan-400" />
           <div>
             <h4 className="text-cyan-400 font-bold m-0 leading-tight">Autonomous Unit #892</h4>
             <p className="text-xs text-slate-300 m-0">Status: Active</p>
           </div>
        </div>
      )}
    </div>
  );
};
