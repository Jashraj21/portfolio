import { useState, useRef, useEffect, useCallback } from 'react';
import { soundFx } from './soundEffects';
import './OilPastel.css';

const PRESETS = [
  { id: 'classic', label: '🎨 Classic Oil Pastel', radius: 4, texture: 0.3, saturation: 1.3 },
  { id: 'impasto', label: '🖌️ Thick Impasto', radius: 5, texture: 0.5, saturation: 1.45 },
  { id: 'soft', label: '🌸 Soft Wax Pastel', radius: 3, texture: 0.15, saturation: 1.15 },
  { id: 'cyberpunk', label: '⚡ Cyberpunk Pastel', radius: 4, texture: 0.35, saturation: 1.6 },
];

export default function OilPastelStudio({ onClose }) {
  // Modes: 'select' (camera / upload / sample) | 'camera' (taking selfie) | 'result' (editing/viewing oil pastel art)
  const [mode, setMode] = useState('select');
  const [processing, setProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [countdown, setCountdown] = useState(null);
  const [cameraFacing, setCameraFacing] = useState('user'); // 'user' | 'environment'
  const [activePreset, setActivePreset] = useState('classic');
  const [strokeRadius, setStrokeRadius] = useState(4);
  const [textureAmount, setTextureAmount] = useState(0.3);
  const [saturation, setSaturation] = useState(1.3);
  const [compareSplit, setCompareSplit] = useState(50); // percentage for split slider
  const [isComparing, setIsComparing] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const originalCanvasRef = useRef(null);
  const pastelCanvasRef = useRef(null);
  const displayCanvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const rawImageRef = useRef(null);

  // Stop camera tracks cleanly
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Start live webcam for selfie
  const startCamera = async (facing = cameraFacing) => {
    stopCamera();
    setCameraError('');
    setMode('camera');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 960 },
          height: { ideal: 960 },
          facingMode: facing,
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      soundFx.playKey();
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError('Could not access camera. Please check camera permissions or upload an image.');
    }
  };

  // Flip front/rear camera
  const toggleCameraFacing = () => {
    const nextFacing = cameraFacing === 'user' ? 'environment' : 'user';
    setCameraFacing(nextFacing);
    startCamera(nextFacing);
  };

  // Capture Selfie with 3-second countdown
  const triggerSelfieCountdown = () => {
    if (countdown !== null) return;
    let count = 3;
    setCountdown(count);
    soundFx.playBeep(440, 0.08, 'sine');

    const timer = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
        soundFx.playBeep(440, 0.08, 'sine');
      } else {
        clearInterval(timer);
        setCountdown(null);
        captureSelfie();
      }
    }, 900);
  };

  // Take selfie snapshot from video feed
  const captureSelfie = () => {
    const video = videoRef.current;
    if (!video) return;

    soundFx.playBeep(880, 0.15, 'triangle'); // shutter beep

    const tempCanvas = document.createElement('canvas');
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 640;

    // Crop to square or max 720 resolution for snappy processing
    const maxDim = 720;
    let finalW = width;
    let finalH = height;
    if (Math.max(width, height) > maxDim) {
      const scale = maxDim / Math.max(width, height);
      finalW = Math.round(width * scale);
      finalH = Math.round(height * scale);
    }

    tempCanvas.width = finalW;
    tempCanvas.height = finalH;
    const ctx = tempCanvas.getContext('2d');

    // If front camera, mirror image naturally
    if (cameraFacing === 'user') {
      ctx.translate(finalW, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, finalW, finalH);

    stopCamera();

    const img = new Image();
    img.onload = () => {
      rawImageRef.current = img;
      processOilPastel(img, strokeRadius, textureAmount, saturation, activePreset);
    };
    img.src = tempCanvas.toDataURL('image/jpeg', 0.95);
  };

  // Handle uploaded file
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        rawImageRef.current = img;
        processOilPastel(img, strokeRadius, textureAmount, saturation, activePreset);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    soundFx.playKey();
  };

  // Load sample portrait (Jashraaj's photo from public)
  const loadSamplePhoto = () => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      rawImageRef.current = img;
      processOilPastel(img, strokeRadius, textureAmount, saturation, activePreset);
    };
    img.src = '/profile.jpg';
    soundFx.playKey();
  };

  // Core Oil Pastel Transform Algorithm (Kuwahara + Impasto Texture)
  const processOilPastel = (image, radius, texture, sat, preset) => {
    setProcessing(true);
    setProgressMsg('Analyzing strokes and color pigment distribution...');
    setMode('result');

    setTimeout(() => {
      // 1. Prepare off-screen canvas at scaled dimensions
      const maxDim = 680;
      let w = image.naturalWidth || image.width;
      let h = image.naturalHeight || image.height;
      if (Math.max(w, h) > maxDim) {
        const scale = maxDim / Math.max(w, h);
        w = Math.round(w * scale);
        h = Math.round(h * scale);
      }

      // Save original onto original canvas
      const origCanvas = originalCanvasRef.current || document.createElement('canvas');
      origCanvas.width = w;
      origCanvas.height = h;
      const origCtx = origCanvas.getContext('2d');
      origCtx.drawImage(image, 0, 0, w, h);
      originalCanvasRef.current = origCanvas;

      const srcData = origCtx.getImageData(0, 0, w, h);
      const src = srcData.data;

      // 2. Precompute luminance for quadrant variance evaluation
      const lum = new Float32Array(w * h);
      for (let i = 0, j = 0; i < src.length; i += 4, j++) {
        lum[j] = 0.299 * src[i] + 0.587 * src[i + 1] + 0.114 * src[i + 2];
      }

      const outData = new Uint8ClampedArray(src.length);
      const r = Math.max(2, Math.min(6, Math.round(radius)));

      // 3. Kuwahara Filter Pass (Creates painterly flattened wax strokes with preserved edges)
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const quadrants = [
            { x0: Math.max(0, x - r), x1: x, y0: Math.max(0, y - r), y1: y },
            { x0: x, x1: Math.min(w - 1, x + r), y0: Math.max(0, y - r), y1: y },
            { x0: Math.max(0, x - r), x1: x, y0: y, y1: Math.min(h - 1, y + r) },
            { x0: x, x1: Math.min(w - 1, x + r), y0: y, y1: Math.min(h - 1, y + r) },
          ];

          let minVar = Infinity;
          let bestR = 0, bestG = 0, bestB = 0;

          for (let q = 0; q < 4; q++) {
            const quad = quadrants[q];
            let sumL = 0, sumL2 = 0;
            let sumR = 0, sumG = 0, sumB = 0;
            let count = 0;

            for (let qy = quad.y0; qy <= quad.y1; qy++) {
              const row = qy * w;
              for (let qx = quad.x0; qx <= quad.x1; qx++) {
                const idx = row + qx;
                const lVal = lum[idx];
                sumL += lVal;
                sumL2 += lVal * lVal;

                const p = idx * 4;
                sumR += src[p];
                sumG += src[p + 1];
                sumB += src[p + 2];
                count++;
              }
            }

            if (count > 0) {
              const meanL = sumL / count;
              const variance = sumL2 / count - meanL * meanL;
              if (variance < minVar) {
                minVar = variance;
                bestR = sumR / count;
                bestG = sumG / count;
                bestB = sumB / count;
              }
            }
          }

          // 4. Color Grading, Pigment Richness & Saturation Boost
          const avg = (bestR + bestG + bestB) / 3;
          let rOut = avg + (bestR - avg) * sat;
          let gOut = avg + (bestG - avg) * sat;
          let bOut = avg + (bestB - avg) * sat;

          // Preset-specific pigment blending
          if (preset === 'cyberpunk') {
            rOut = Math.min(255, rOut * 1.12 + 18);
            bOut = Math.min(255, bOut * 1.25 + 28);
          } else if (preset === 'impasto') {
            // Enhanced tonal contrast like thick oils
            rOut = (rOut - 128) * 1.22 + 128;
            gOut = (gOut - 128) * 1.22 + 128;
            bOut = (bOut - 128) * 1.22 + 128;
          }

          // 5. Authentic Oil Pastel Paper Tooth & Wax Crayon Stippling
          if (texture > 0) {
            const grain = ((Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1) - 0.5;
            const strokeTexture = Math.sin((x + y) * 0.75) * 0.5 + Math.cos((x - y) * 0.5) * 0.5;
            const textureFactor = (grain * 0.65 + strokeTexture * 0.35) * texture * 48;

            rOut += textureFactor;
            gOut += textureFactor;
            bOut += textureFactor;
          }

          const outIdx = (y * w + x) * 4;
          outData[outIdx] = Math.max(0, Math.min(255, rOut));
          outData[outIdx + 1] = Math.max(0, Math.min(255, gOut));
          outData[outIdx + 2] = Math.max(0, Math.min(255, bOut));
          outData[outIdx + 3] = 255;
        }
      }

      // Store pastel canvas
      const pastelCanvas = pastelCanvasRef.current || document.createElement('canvas');
      pastelCanvas.width = w;
      pastelCanvas.height = h;
      const pastelCtx = pastelCanvas.getContext('2d');
      pastelCtx.putImageData(new ImageData(outData, w, h), 0, 0);
      pastelCanvasRef.current = pastelCanvas;

      // Render onto active display canvas
      renderDisplayCanvas();
      setProcessing(false);
      soundFx.playSuccess();
    }, 50);
  };

  // Re-render display canvas with before/after comparison split
  const renderDisplayCanvas = useCallback(() => {
    const display = displayCanvasRef.current;
    const orig = originalCanvasRef.current;
    const pastel = pastelCanvasRef.current;
    if (!display || !pastel || !orig) return;

    display.width = pastel.width;
    display.height = pastel.height;
    const ctx = display.getContext('2d');

    // Draw full pastel artwork
    ctx.drawImage(pastel, 0, 0);

    // If split comparing or holding comparison, draw portion of original
    if (isComparing || compareSplit < 100) {
      const splitX = isComparing ? display.width : Math.round((compareSplit / 100) * display.width);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, splitX, display.height);
      ctx.clip();
      ctx.drawImage(orig, 0, 0);
      ctx.restore();

      // Draw subtle neon divider line
      if (!isComparing && compareSplit > 0 && compareSplit < 100) {
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(splitX, 0);
        ctx.lineTo(splitX, display.height);
        ctx.stroke();
      }
    }
  }, [compareSplit, isComparing]);

  useEffect(() => {
    if (mode === 'result') {
      renderDisplayCanvas();
    }
  }, [compareSplit, isComparing, mode, renderDisplayCanvas]);

  // Apply a new preset
  const selectPreset = (p) => {
    setActivePreset(p.id);
    setStrokeRadius(p.radius);
    setTextureAmount(p.texture);
    setSaturation(p.saturation);
    if (rawImageRef.current) {
      processOilPastel(rawImageRef.current, p.radius, p.texture, p.saturation, p.id);
    }
  };

  // Re-run with custom slider adjustments
  const applyCustomAdjustments = () => {
    if (rawImageRef.current) {
      processOilPastel(rawImageRef.current, strokeRadius, textureAmount, saturation, activePreset);
    }
  };

  // Download high-resolution artwork
  const downloadArtwork = () => {
    const pastel = pastelCanvasRef.current;
    if (!pastel) return;
    soundFx.playKey();
    const link = document.createElement('a');
    link.download = `oil-pastel-art-${Date.now()}.png`;
    link.href = pastel.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="oil-pastel-studio">
      {/* Studio Header */}
      <div className="pastel-header">
        <div className="pastel-header-title">
          <span className="pastel-badge">🎨 NEURAL LAB</span>
          <h3>Oil Pastel Art Studio</h3>
        </div>
        <div className="pastel-header-actions">
          {mode === 'result' && (
            <button
              className="pastel-action-btn primary"
              onClick={downloadArtwork}
              title="Download PNG artwork"
            >
              💾 Save Artwork
            </button>
          )}
          <button
            className="pastel-action-btn"
            onClick={onClose}
            title="Return to Terminal (Esc)"
          >
            ✕ Exit Studio
          </button>
        </div>
      </div>

      {/* Main Studio Body */}
      <div className="pastel-body">
        {/* SELECT / UPLOAD MODE */}
        {mode === 'select' && (
          <div className="pastel-select-view">
            <h4 className="select-title">Transform any photo into authentic Oil Pastel art</h4>
            <p className="select-subtitle">
              Take a live selfie or upload an image to apply painterly Kuwahara brush strokes, rich pigment blending, and canvas paper texture.
            </p>

            <div className="select-cards-grid">
              {/* Option 1: Live Selfie */}
              <div className="select-card" onClick={startCamera}>
                <div className="card-icon-wrap">📸</div>
                <h5>Take a Live Selfie</h5>
                <p>Use your webcam with 3s countdown & instant oil pastel transformation</p>
                <button className="card-btn">Open Camera</button>
              </div>

              {/* Option 2: Upload File */}
              <div
                className="select-card"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="card-icon-wrap">📁</div>
                <h5>Upload a Photo</h5>
                <p>Pick any portrait, landscape, or artwork from your device</p>
                <button className="card-btn">Choose File</button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
              </div>

              {/* Option 3: Sample Portrait */}
              <div className="select-card sample" onClick={loadSamplePhoto}>
                <div className="card-icon-wrap">✨</div>
                <h5>Try with Jashraaj's Photo</h5>
                <p>Instant demonstration with the portfolio creator's portrait</p>
                <button className="card-btn highlight">Demo 1-Click</button>
              </div>
            </div>
          </div>
        )}

        {/* CAMERA SELFIE MODE */}
        {mode === 'camera' && (
          <div className="pastel-camera-view">
            <div className="camera-viewfinder-frame">
              {cameraError ? (
                <div className="camera-error-box">
                  <p>{cameraError}</p>
                  <button className="card-btn" onClick={() => setMode('select')}>
                    Back to Options
                  </button>
                </div>
              ) : (
                <>
                  <video ref={videoRef} autoPlay playsInline muted className="camera-video-feed" />
                  <div className="viewfinder-grid" />
                  {countdown !== null && (
                    <div className="selfie-countdown-badge">{countdown}</div>
                  )}
                </>
              )}
            </div>

            {!cameraError && (
              <div className="camera-controls-bar">
                <button className="camera-ctrl-btn secondary" onClick={() => { stopCamera(); setMode('select'); }}>
                  ✕ Cancel
                </button>
                <button
                  className="camera-snap-btn"
                  onClick={triggerSelfieCountdown}
                  disabled={countdown !== null}
                >
                  <div className="snap-btn-inner" />
                </button>
                <button className="camera-ctrl-btn secondary" onClick={toggleCameraFacing} title="Flip Camera">
                  🔄 Flip
                </button>
              </div>
            )}
            <p className="camera-hint">Position your face in the frame • Hit the shutter for a 3s countdown!</p>
          </div>
        )}

        {/* RESULT / EDITOR MODE */}
        {mode === 'result' && (
          <div className="pastel-result-view">
            {processing ? (
              <div className="pastel-processing-splash">
                <div className="processing-spinner" />
                <h4 className="processing-title">CREATING OIL PASTEL ART...</h4>
                <p className="processing-msg">{progressMsg}</p>
              </div>
            ) : (
              <div className="result-layout">
                {/* Artwork Canvas Display */}
                <div className="result-canvas-container">
                  <canvas ref={displayCanvasRef} className="display-canvas" />

                  {/* Split Comparison Slider Overlay */}
                  <div className="compare-slider-wrap">
                    <span className="compare-label left">Original</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={compareSplit}
                      onChange={(e) => setCompareSplit(+e.target.value)}
                      className="split-range-input"
                    />
                    <span className="compare-label right">Oil Pastel</span>
                  </div>

                  <div className="compare-hold-row">
                    <button
                      className="compare-hold-btn"
                      onMouseDown={() => setIsComparing(true)}
                      onMouseUp={() => setIsComparing(false)}
                      onTouchStart={() => setIsComparing(true)}
                      onTouchEnd={() => setIsComparing(false)}
                    >
                      👁️ Hold to Peek Original
                    </button>
                    <button
                      className="compare-reset-btn"
                      onClick={() => setCompareSplit(50)}
                    >
                      50/50 Split
                    </button>
                  </div>
                </div>

                {/* Studio Adjustments Sidebar */}
                <div className="result-sidebar">
                  <div className="sidebar-section">
                    <span className="sidebar-heading">STYLE PRESETS</span>
                    <div className="presets-pill-group">
                      {PRESETS.map((p) => (
                        <button
                          key={p.id}
                          className={`preset-pill-btn ${activePreset === p.id ? 'active' : ''}`}
                          onClick={() => selectPreset(p)}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="sidebar-section">
                    <span className="sidebar-heading">PASTEL CONTROLS</span>
                    <div className="control-slider-item">
                      <div className="slider-label-row">
                        <span>Stroke Size (Impasto)</span>
                        <strong>{strokeRadius}px</strong>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="6"
                        step="1"
                        value={strokeRadius}
                        onChange={(e) => setStrokeRadius(+e.target.value)}
                        onMouseUp={applyCustomAdjustments}
                        onTouchEnd={applyCustomAdjustments}
                      />
                    </div>

                    <div className="control-slider-item">
                      <div className="slider-label-row">
                        <span>Paper Tooth / Texture</span>
                        <strong>{Math.round(textureAmount * 100)}%</strong>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="0.8"
                        step="0.05"
                        value={textureAmount}
                        onChange={(e) => setTextureAmount(+e.target.value)}
                        onMouseUp={applyCustomAdjustments}
                        onTouchEnd={applyCustomAdjustments}
                      />
                    </div>

                    <div className="control-slider-item">
                      <div className="slider-label-row">
                        <span>Pigment Saturation</span>
                        <strong>{Math.round(saturation * 100)}%</strong>
                      </div>
                      <input
                        type="range"
                        min="0.8"
                        max="2.0"
                        step="0.1"
                        value={saturation}
                        onChange={(e) => setSaturation(+e.target.value)}
                        onMouseUp={applyCustomAdjustments}
                        onTouchEnd={applyCustomAdjustments}
                      />
                    </div>
                  </div>

                  <div className="sidebar-actions">
                    <button
                      className="sidebar-btn download"
                      onClick={downloadArtwork}
                    >
                      💾 Download Artwork (PNG)
                    </button>
                    <button
                      className="sidebar-btn retake"
                      onClick={() => setMode('select')}
                    >
                      🔄 Upload / Shoot Another
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
