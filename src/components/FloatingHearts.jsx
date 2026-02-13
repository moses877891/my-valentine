import React, { useEffect, useState } from 'react';

// Renders drifting heart chars (♥) that float upward
export default function FloatingHearts({ maxHearts = 20, intervalMs = 600 }) {
  const [hearts, setHearts] = useState([]);

  useEffect(() => {
    const id = setInterval(() => {
      setHearts((prev) => {
        const newHeart = {
          id: Date.now() + Math.random(),
          left: Math.random() * 100,                 // % from left
          size: 14 + Math.random() * 22,             // px
          duration: 6 + Math.random() * 6,           // seconds
          hue: 330 + Math.random() * 30,             // pink-ish hue
        };
        const arr = [...prev, newHeart];
        // keep only last N to avoid memory growth
        return arr.slice(-maxHearts);
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [maxHearts, intervalMs]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {hearts.map((h) => (
        <span
          key={h.id}
          className="absolute floating-heart"
          style={{
            left: `${h.left}%`,
            bottom: `-40px`,
            fontSize: `${h.size}px`,
            color: `hsl(${h.hue}, 80%, 60%)`,
            animationDuration: `${h.duration}s`,
          }}
        >
          ♥
        </span>
      ))}
    </div>
  );
}