export default function SpaceBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Base dark gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-[#0a0a1a] to-gray-950" />
      
      {/* Nebula layer 1 - deep blue/purple */}
      <div className="absolute inset-0 opacity-30 blur-3xl animate-nebula-drift-1">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-radial from-blue-900/40 via-purple-900/20 to-transparent" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-gradient-radial from-purple-900/30 via-indigo-900/15 to-transparent" />
      </div>
      
      {/* Nebula layer 2 - pink/violet hints */}
      <div className="absolute inset-0 opacity-20 blur-3xl animate-nebula-drift-2">
        <div className="absolute top-1/2 right-1/3 w-72 h-72 rounded-full bg-gradient-radial from-pink-900/30 via-violet-900/15 to-transparent" />
        <div className="absolute top-1/6 left-1/2 w-64 h-64 rounded-full bg-gradient-radial from-indigo-800/25 via-blue-900/10 to-transparent" />
      </div>
      
      {/* Stars layer 1 - small stars */}
      <div className="absolute inset-0 animate-stars-drift-1" style={{ backgroundImage: generateStarField(120, 1) }} />
      
      {/* Stars layer 2 - medium stars */}
      <div className="absolute inset-0 animate-stars-drift-2" style={{ backgroundImage: generateStarField(60, 1.5) }} />
      
      {/* Stars layer 3 - bright stars with twinkle */}
      <div className="absolute inset-0 animate-stars-twinkle" style={{ backgroundImage: generateStarField(20, 2) }} />
      
      {/* Subtle planets */}
      <div
        className="absolute rounded-full animate-planet-drift-1"
        style={{
          width: '120px',
          height: '120px',
          top: '15%',
          right: '12%',
          opacity: 0.1,
          filter: 'blur(24px)',
          background: 'radial-gradient(circle at 35% 35%, rgba(99, 102, 241, 0.6), rgba(67, 56, 202, 0.3) 50%, transparent 70%)',
        }}
      />
      <div
        className="absolute rounded-full animate-planet-drift-2"
        style={{
          width: '80px',
          height: '80px',
          bottom: '20%',
          left: '8%',
          opacity: 0.12,
          filter: 'blur(20px)',
          background: 'radial-gradient(circle at 40% 30%, rgba(249, 115, 22, 0.5), rgba(194, 65, 12, 0.25) 50%, transparent 70%)',
        }}
      />
      <div
        className="absolute rounded-full animate-planet-drift-3"
        style={{
          width: '60px',
          height: '60px',
          top: '60%',
          right: '35%',
          opacity: 0.08,
          filter: 'blur(18px)',
          background: 'radial-gradient(circle at 30% 40%, rgba(147, 51, 234, 0.5), rgba(88, 28, 135, 0.25) 50%, transparent 70%)',
        }}
      />

      {/* Shooting Stars */}
      <div
        className="absolute h-[2px] rounded-full bg-gradient-to-r from-transparent via-white to-blue-200"
        style={{ top: '12%', left: '15%', animation: 'shooting-star 15s ease-out infinite', animationDelay: '0s' }}
      />
      <div
        className="absolute h-[2px] rounded-full bg-gradient-to-r from-transparent via-white to-purple-200"
        style={{ top: '25%', left: '60%', animation: 'shooting-star 15s ease-out infinite', animationDelay: '2.5s' }}
      />
      <div
        className="absolute h-[1px] rounded-full bg-gradient-to-r from-transparent via-white to-blue-300"
        style={{ top: '45%', left: '30%', animation: 'shooting-star 15s ease-out infinite', animationDelay: '5s' }}
      />
      <div
        className="absolute h-[2px] rounded-full bg-gradient-to-r from-transparent via-white to-indigo-200"
        style={{ top: '65%', left: '75%', animation: 'shooting-star 15s ease-out infinite', animationDelay: '7.5s' }}
      />
      <div
        className="absolute h-[1px] rounded-full bg-gradient-to-r from-transparent via-white to-cyan-200"
        style={{ top: '8%', left: '80%', animation: 'shooting-star 15s ease-out infinite', animationDelay: '10s' }}
      />
      <div
        className="absolute h-[2px] rounded-full bg-gradient-to-r from-transparent via-white to-violet-200"
        style={{ top: '55%', left: '10%', animation: 'shooting-star 15s ease-out infinite', animationDelay: '12.5s' }}
      />

      {/* Overall subtle overlay to keep it muted */}
      <div className="absolute inset-0 bg-gray-950/40" />
    </div>
  );
}

function generateStarField(count: number, size: number): string {
  // Use a seeded approach for consistent star positions
  const stars: string[] = [];
  const seed = count * 7 + size * 13;
  
  for (let i = 0; i < count; i++) {
    const x = ((seed * (i + 1) * 17) % 2000) / 20;
    const y = ((seed * (i + 1) * 23) % 2000) / 20;
    const opacity = 0.3 + ((seed * (i + 1) * 31) % 70) / 100;
    stars.push(
      `radial-gradient(${size}px ${size}px at ${x}% ${y}%, rgba(255,255,255,${opacity}) 0%, transparent 100%)`
    );
  }
  
  return stars.join(', ');
}