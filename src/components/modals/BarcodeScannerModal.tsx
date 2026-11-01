"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X, Camera, Barcode, AlertCircle, Loader2, Search, Zap, Volume2, VolumeX } from "lucide-react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { fetchProductByBarcode } from "@/lib/services/openfoodfacts-service";
import { Food } from "@/types/database";

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductFound: (food: Food) => void;
  onProductNotFound: (barcode: string) => void;
}

export function BarcodeScannerModal({
  isOpen,
  onClose,
  onProductFound,
  onProductNotFound,
}: BarcodeScannerModalProps) {
  const [manualBarcode, setManualBarcode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isScanningRef = useRef<boolean>(false);
  const isProcessingBarcodeRef = useRef<boolean>(false);

  // Play audio beep & trigger mobile haptic vibration
  const triggerScanFeedback = useCallback(() => {
    if (soundEnabled && typeof window !== "undefined") {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(880, ctx.currentTime); // 880 Hz beep (A5)
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.13);
        }
      } catch {
        // Audio playback error or autoplay blocked, ignore safely
      }
    }

    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate?.([60]);
      } catch {
        // Ignore haptic failure
      }
    }
  }, [soundEnabled]);

  // Handle scanned barcode lookup
  const handleProcessBarcode = useCallback(
    async (rawCode: string) => {
      const cleanCode = rawCode.trim();
      if (!cleanCode || isProcessingBarcodeRef.current) return;

      isProcessingBarcodeRef.current = true;
      setIsLoading(true);
      setStatusMessage(`Looking up barcode ${cleanCode}...`);
      triggerScanFeedback();

      // Pause or stop camera while looking up
      if (scannerRef.current && isScanningRef.current) {
        try {
          await scannerRef.current.stop();
          isScanningRef.current = false;
          setIsCameraActive(false);
        } catch {
          // Scanner stop error
        }
      }

      try {
        const product = await fetchProductByBarcode(cleanCode);

        if (product) {
          setStatusMessage(`Found: ${product.name}!`);
          onProductFound(product);
          onClose();
        } else {
          setStatusMessage(`No product found for barcode ${cleanCode}`);
          onProductNotFound(cleanCode);
        }
      } catch (err: any) {
        setStatusMessage("Error fetching product data.");
        onProductNotFound(cleanCode);
      } finally {
        setIsLoading(false);
        isProcessingBarcodeRef.current = false;
      }
    },
    [onProductFound, onProductNotFound, onClose, triggerScanFeedback]
  );

  // Stop the camera scanner cleanly
  const stopScanner = useCallback(async () => {
    if (scannerRef.current && isScanningRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {
        // Ignore stop error
      }
      try {
        scannerRef.current.clear();
      } catch {
        // Ignore clear error
      }
      isScanningRef.current = false;
      setIsCameraActive(false);
    }
  }, []);

  // Initialize camera scanner when modal opens
  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      setManualBarcode("");
      setCameraError(null);
      setIsLoading(false);
      setStatusMessage(null);
      return;
    }

    let isCancelled = false;

    const startScanner = async () => {
      setCameraError(null);
      setIsCameraActive(false);
      setStatusMessage("Starting camera...");

      // Wait 150ms for modal DOM to mount viewport element
      await new Promise((r) => setTimeout(r, 150));
      if (isCancelled) return;

      const element = document.getElementById("barcode-scanner-viewport");
      if (!element) {
        setCameraError("Camera viewport container could not be found.");
        return;
      }

      try {
        const formatsToSupport = [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.QR_CODE,
        ];

        const scanner = new Html5Qrcode("barcode-scanner-viewport", {
          formatsToSupport,
          verbose: false,
        });

        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: (viewfinderWidth, viewfinderHeight) => {
              const width = Math.min(viewfinderWidth * 0.85, 320);
              const height = Math.min(viewfinderHeight * 0.55, 200);
              return { width: Math.floor(width), height: Math.floor(height) };
            },
            aspectRatio: 1.333333,
          },
          (decodedText) => {
            if (!isProcessingBarcodeRef.current) {
              handleProcessBarcode(decodedText);
            }
          },
          () => {
            // Frame scan failure callback (normal when barcode is not in frame)
          }
        );

        if (!isCancelled) {
          isScanningRef.current = true;
          setIsCameraActive(true);
          setStatusMessage("Point camera at barcode");
        } else {
          try {
            await scanner.stop();
            scanner.clear();
          } catch {
            // Ignore
          }
        }
      } catch (err: any) {
        if (isCancelled) return;
        const errName = err?.name || "";
        const errMsg = String(err?.message || err);

        if (errName === "NotAllowedError" || errMsg.includes("Permission")) {
          setCameraError(
            "Camera permission was denied. Please allow camera access in your browser settings or enter the barcode manually below."
          );
        } else if (errName === "NotFoundError" || errMsg.includes("Requested device not found")) {
          setCameraError(
            "No camera detected on this device. You can type or paste the barcode manually below."
          );
        } else if (location.protocol !== "https:" && location.hostname !== "localhost") {
          setCameraError(
            "Browser camera access requires HTTPS. Please enter the barcode manually below."
          );
        } else {
          setCameraError("Could not start camera. You can enter the barcode manually below.");
        }
        setStatusMessage(null);
      }
    };

    startScanner();

    return () => {
      isCancelled = true;
      stopScanner();
    };
  }, [isOpen, handleProcessBarcode, stopScanner]);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      handleProcessBarcode(manualBarcode.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#141417] border border-[#27272a] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col animate-slide-up">
        {/* Header */}
        <div className="p-4 border-b border-[#27272a] flex items-center justify-between bg-[#18181b]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center border border-violet-500/30">
              <Barcode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                Scan Barcode
                {isCameraActive && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-zinc-400">Scan packaged foods via OpenFoodFacts</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "Mute scan beep" : "Enable scan beep"}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => {
                stopScanner();
                onClose();
              }}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Camera Viewport Area */}
        <div className="relative bg-black w-full min-h-[260px] max-h-[340px] flex items-center justify-center overflow-hidden">
          {/* HTML5 QR Code Mount Node */}
          <div id="barcode-scanner-viewport" className="w-full h-full min-h-[260px]" />

          {/* Overlaid Animated Scanner Box Reticle (Only when camera is active and not loading) */}
          {isCameraActive && !isLoading && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="relative w-64 h-40 border-2 border-violet-500/60 rounded-2xl shadow-[0_0_25px_rgba(139,92,246,0.3)] flex items-center justify-center">
                {/* Reticle Corner Marks */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-violet-400 rounded-tl" />
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-violet-400 rounded-tr" />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-violet-400 rounded-bl" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-violet-400 rounded-br" />

                {/* Animated Red Laser Scan Line */}
                <div
                  className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_8px_#ef4444]"
                  style={{
                    animation: "barcode-scan 2s ease-in-out infinite alternate",
                  }}
                />
              </div>
            </div>
          )}

          {/* Loading or Querying Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10 space-y-3">
              <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
              <div>
                <p className="text-sm font-bold text-white">Searching OpenFoodFacts</p>
                <p className="text-xs text-zinc-400 mt-1">{statusMessage || "Fetching nutrition data..."}</p>
              </div>
            </div>
          )}

          {/* Camera Error / Permission Fallback View */}
          {cameraError && !isLoading && (
            <div className="absolute inset-0 bg-[#121215] flex flex-col items-center justify-center p-6 text-center space-y-3 z-10">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="max-w-xs space-y-1">
                <p className="text-xs font-bold text-white">Camera Unavailable</p>
                <p className="text-[11px] text-zinc-400 leading-relaxed">{cameraError}</p>
              </div>
            </div>
          )}
        </div>

        {/* Scan Status Banner */}
        <div className="px-4 py-2 bg-[#18181b] border-t border-b border-[#27272a] flex items-center justify-between text-xs">
          <span className="text-zinc-400 flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-violet-400" />
            <span className="truncate">{statusMessage || "Align barcode inside the frame"}</span>
          </span>
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
            EAN / UPC / QR
          </span>
        </div>

        {/* Manual Barcode Input Fallback */}
        <form onSubmit={handleManualSubmit} className="p-4 bg-[#141417] space-y-3">
          <label className="text-[11px] font-bold text-zinc-300 block">
            Or Enter Barcode Manually
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Barcode className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
              <input
                type="text"
                pattern="[0-9a-zA-Z]*"
                inputMode="numeric"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                placeholder="e.g. 8901030927973"
                className="w-full pl-9 pr-3 py-2 bg-[#18181b] border border-[#27272a] focus:border-violet-500 rounded-xl text-xs text-white placeholder-zinc-500 outline-none font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={!manualBarcode.trim() || isLoading}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-md shadow-violet-600/20"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Lookup</span>
            </button>
          </div>
        </form>
      </div>

      {/* Embedded Scanline Animation Keyframes */}
      <style jsx>{`
        @keyframes barcode-scan {
          0% {
            top: 8%;
          }
          100% {
            top: 90%;
          }
        }
      `}</style>
    </div>
  );
}
