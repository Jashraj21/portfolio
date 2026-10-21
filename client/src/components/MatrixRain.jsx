import { useEffect, useRef } from 'react';
import { soundFx } from './soundEffects';

export default function MatrixRain({ onClose }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    soundFx.playSuccess();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationFrameId;
    const chars = 'ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZλΩ⚡<>/{}[]*+=#';
    const charArray = chars.split('');
    const fontSize = 16;
    let columns = 0;
    let drops = [];

    const resize = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
      columns = Math.floor(canvas.width / fontSize);
      drops = [];
      for (let i = 0; i < columns; i++) {
        drops[i] = Math.floor(Math.random() * -50);
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      // Semi-transparent black background creates phosphor trail effect
      ctx.fillStyle = 'rgba(5, 10, 16, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px "JetBrains Mono", monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = charArray[Math.floor(Math.random() * charArray.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Leading character is bright neon white/cyan, trailing characters are matrix green
        ctx.fillStyle = '#a7f3d0';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 8;
        ctx.fillText(text, x, y);

        // Next iteration trailing text
        ctx.fillStyle = '#059669';
        ctx.shadowBlur = 0;

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'q' || e.key === 'Q') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="matrix-rain-overlay">
      <div className="matrix-hud">
        <span className="matrix-hud-status">● MATRIX_STREAM_ACTIVE [CONNECTED]</span>
        <button className="matrix-exit-btn" onClick={onClose}>
          ✕ Exit Matrix (Esc)
        </button>
      </div>
      <canvas ref={canvasRef} className="matrix-canvas" />
    </div>
  );
}
