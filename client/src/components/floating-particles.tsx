import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

export default function FloatingParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const colors = ['minecraft-green', 'neon-cyan', 'neon-magenta', 'yellow-400'];
    const newParticles: Particle[] = [];

    for (let i = 0; i < 20; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: Math.random() * 3 + 2,
        delay: Math.random() * 2,
      });
    }

    setParticles(newParticles);
  }, []);

  const getColorClass = (color: string) => {
    switch (color) {
      case 'minecraft-green':
        return 'bg-minecraft-green';
      case 'neon-cyan':
        return 'bg-neon-cyan';
      case 'neon-magenta':
        return 'bg-neon-magenta';
      case 'yellow-400':
        return 'bg-yellow-400';
      default:
        return 'bg-minecraft-green';
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`absolute rounded-full opacity-30 animate-float ${getColorClass(particle.color)}`}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  );
}