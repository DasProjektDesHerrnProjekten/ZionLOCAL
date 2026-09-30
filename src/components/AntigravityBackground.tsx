import { useEffect, useRef } from 'react';

const AntigravityBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  console.log('AntigravityBackground component mounted');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('Canvas element not found');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Could not get 2D context');
      return;
    }

    let particles: any[] = [];
    const particleCount = 60;
    const mouse = { x: null as number | null, y: null as number | null, radius: 150 };
    const types = ['circle', 'square', 'triangle'];
    const spriteCache: Record<string, HTMLCanvasElement> = {};

    function createSprites() {
      types.forEach(type => {
        const offscreen = document.createElement('canvas');
        offscreen.width = 100;
        offscreen.height = 100;
        const oCtx = offscreen.getContext('2d');
        if (!oCtx) return;

        oCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        oCtx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        oCtx.lineWidth = 1.5;
        oCtx.shadowBlur = 5;
        oCtx.shadowColor = "rgba(255, 255, 255, 0.1)";

        oCtx.beginPath();
        if (type === 'circle') {
          oCtx.arc(50, 50, 30, 0, Math.PI * 2);
        } else if (type === 'square') {
          oCtx.rect(20, 20, 60, 60);
        } else if (type === 'triangle') {
          oCtx.moveTo(50, 20);
          oCtx.lineTo(80, 80);
          oCtx.lineTo(20, 80);
          oCtx.closePath();
        }
        oCtx.fill();
        oCtx.stroke();
        spriteCache[type] = offscreen;
      });
    }

    class Particle {
      x: number;
      y: number;
      size: number;
      baseSpeed: number;
      type: string;
      rotation: number;
      rotationSpeed: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height + canvas.height;
        this.size = Math.random() * 40 + 20;
        this.baseSpeed = Math.random() * 0.5 + 0.2;
        this.type = types[Math.floor(Math.random() * types.length)];
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.01;
      }

      update() {
        this.y -= this.baseSpeed;
        this.rotation += this.rotationSpeed;

        if (mouse.x !== null && mouse.y !== null) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < mouse.radius) {
            const force = (mouse.radius - distance) / mouse.radius;
            const directionX = dx / distance;
            const directionY = dy / distance;
            
            this.x += directionX * force * 4;
            this.y += directionY * force * 4;
          }
        }

        if (this.y < -this.size) {
          this.y = canvas.height + this.size;
          this.x = Math.random() * canvas.width;
        }
      }

      draw() {
        if (!ctx) return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = 0.8;
        
        const sprite = spriteCache[this.type];
        if (sprite) {
          ctx.drawImage(sprite, -this.size/2, -this.size/2, this.size, this.size);
        }
        
        ctx.restore();
      }
    }

    function init() {
      if (!canvas) {
        console.error('Canvas is null during initialization');
        return;
      }
      
      const updateCanvasSize = () => {
        if (!canvas) return;
        console.log('Updating canvas size:', window.innerWidth, 'x', window.innerHeight);
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      
      updateCanvasSize();
      createSprites();
      
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
      
      window.addEventListener('resize', updateCanvasSize);
      
      return () => {
        window.removeEventListener('resize', updateCanvasSize);
      };
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    let animationFrameId: number;
    
    const animate = () => {
      if (!ctx || !canvas) {
        console.error('Canvas or context is null in animation loop');
        return;
      }
      
      // Fill with a semi-transparent black to create a trail effect
      ctx.fillStyle = 'rgba(10, 10, 11, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw a border to visualize the canvas area
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
      
      // Draw debug info
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.fillText(`Particles: ${particles.length}`, 10, 20);
      
      for (const particle of particles) {
        particle.update();
        particle.draw();
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };

    const cleanup = init();
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    
    animationFrameId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      if (cleanup) cleanup();
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10 bg-gray-900">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          backgroundColor: '#0a0a0b',
        }}
      />
      {/* Debug overlay */}
      <div className="absolute bottom-4 right-4 bg-black/50 text-white p-2 text-xs rounded">
        Antigravity Background
      </div>
    </div>
  );
};

export default AntigravityBackground;
