import React, { useEffect, useRef } from 'react';

interface ParticlesBackgroundProps {
  colorScheme?: 'blue' | 'red' | 'orange' | 'emerald' | 'purple';
}

export const ParticlesBackground: React.FC<ParticlesBackgroundProps> = ({ colorScheme = 'blue' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const particleCount = Math.min(Math.floor((width * height) / 12000), 100);
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      alpha: number;
      pulse: number;
    }> = [];

    const colors = colorScheme === 'purple' ? [
      'rgba(168, 85, 247, ',
      'rgba(139, 92, 246, ',
      'rgba(192, 132, 252, ',
      'rgba(217, 70, 239, ',
      'rgba(99, 102, 241, ',
      'rgba(167, 139, 250, ',
      'rgba(232, 121, 249, ',
    ] : colorScheme === 'emerald' ? [
      'rgba(16, 185, 129, ',
      'rgba(52, 211, 153, ',
      'rgba(20, 184, 166, ',
      'rgba(45, 212, 191, ',
      'rgba(6, 182, 212, ',
      'rgba(34, 211, 238, ',
      'rgba(110, 231, 183, ',
    ] : colorScheme === 'orange' ? [
      'rgba(249, 115, 22, ',
      'rgba(245, 158, 11, ',
      'rgba(234, 88, 12, ',
      'rgba(217, 119, 6, ',
      'rgba(251, 146, 60, ',
      'rgba(252, 211, 77, ',
      'rgba(194, 65, 12, ',
    ] : colorScheme === 'red' ? [
      'rgba(244, 63, 94, ',
      'rgba(239, 68, 68, ',
      'rgba(225, 29, 72, ',
      'rgba(220, 38, 38, ',
      'rgba(244, 114, 182, ',
      'rgba(251, 113, 133, ',
      'rgba(252, 165, 165, ',
    ] : [
      'rgba(56, 189, 248, ',
      'rgba(14, 165, 233, ',
      'rgba(59, 130, 246, ',
      'rgba(37, 99, 235, ',
      'rgba(99, 102, 241, ',
      'rgba(34, 211, 238, ',
      'rgba(94, 234, 212, ',
    ];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2.2 + 0.8,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.45 + 0.25,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 125) {
            const lineAlpha = (1 - dist / 125) * 0.18;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            const gradient = ctx.createLinearGradient(
              particles[i].x, particles[i].y,
              particles[j].x, particles[j].y
            );
            if (colorScheme === 'emerald') {
              gradient.addColorStop(0, `rgba(16, 185, 129, ${lineAlpha})`);
              gradient.addColorStop(0.5, `rgba(20, 184, 166, ${lineAlpha * 0.8})`);
              gradient.addColorStop(1, `rgba(52, 211, 153, ${lineAlpha})`);
            } else if (colorScheme === 'orange') {
              gradient.addColorStop(0, `rgba(249, 115, 22, ${lineAlpha})`);
              gradient.addColorStop(0.5, `rgba(234, 88, 12, ${lineAlpha * 0.8})`);
              gradient.addColorStop(1, `rgba(251, 146, 60, ${lineAlpha})`);
            } else if (colorScheme === 'red') {
              gradient.addColorStop(0, `rgba(244, 63, 94, ${lineAlpha})`);
              gradient.addColorStop(0.5, `rgba(220, 38, 38, ${lineAlpha * 0.8})`);
              gradient.addColorStop(1, `rgba(251, 113, 133, ${lineAlpha})`);
            } else {
              gradient.addColorStop(0, `rgba(56, 189, 248, ${lineAlpha})`);
              gradient.addColorStop(0.5, `rgba(37, 99, 235, ${lineAlpha * 0.8})`);
              gradient.addColorStop(1, `rgba(94, 234, 212, ${lineAlpha})`);
            }
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 0.65;
            ctx.stroke();
          }
        }
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.018;
        const pulseAlpha = p.alpha * (0.8 + Math.sin(p.pulse) * 0.2);
        const pulseRadius = p.radius * (0.95 + Math.sin(p.pulse * 0.7) * 0.15);

        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        ctx.beginPath();
        ctx.arc(p.x, p.y, pulseRadius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${pulseAlpha})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [colorScheme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1]"
      style={{ background: 'transparent', opacity: 0.75 }}
    />
  );
};

export default ParticlesBackground;
