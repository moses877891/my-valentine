import React, { useEffect, useState, useCallback } from 'react';
import Heart from './components/Heart.jsx';
import FloatingHearts from './components/FloatingHearts.jsx';
import Gallery from './components/Gallery.jsx';
import confetti from 'canvas-confetti';

export default function App() {
  // Front-page prompt state
  const [accepted, setAccepted] = useState(false);

  // Existing surprise section
  const [revealed, setRevealed] = useState(false);

  // Base confetti
  const fireConfetti = useCallback(() => {
    confetti({
      particleCount: 130,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff6b81', '#ff99ac', '#ffd1dc', '#ffe6ea'],
    });
    setTimeout(() => {
      confetti({ particleCount: 90, spread: 100, angle: 60, origin: { x: 0, y: 0.7 }, colors: ['#ff6b81', '#ff99ac'] });
      confetti({ particleCount: 90, spread: 100, angle: 120, origin: { x: 1, y: 0.7 }, colors: ['#ff6b81', '#ffd1dc'] });
    }, 220);
  }, []);

  // Mega confetti for "Yessssss!!!"
  const fireMegaConfetti = useCallback(() => {
    const bursts = [
      { count: 200, spread: 80, start: 0 },
      { count: 180, spread: 100, start: 150, angle: 60, origin: { x: 0 } },
      { count: 180, spread: 100, start: 150, angle: 120, origin: { x: 1 } },
      { count: 120, spread: 60, start: 350 },
    ];
    bursts.forEach((b) =>
      setTimeout(
        () =>
          confetti({
            particleCount: b.count,
            spread: b.spread,
            angle: b.angle,
            origin: { y: 0.6, ...(b.origin || {}) },
            colors: ['#ff6b81', '#ff99ac', '#ffd1dc', '#ffe6ea'],
          }),
        b.start
      )
    );
  }, []);

  // Handlers for the question overlay
  const onYes = () => {
    setAccepted(true);
    setRevealed(true);
    fireConfetti();
  };

  const onYessssss = () => {
    setAccepted(true);
    setRevealed(true);
    fireMegaConfetti();
  };

  // Keyboard accessibility: Y or Enter = accept
  useEffect(() => {
    if (accepted) return;
    const onKey = (e) => {
      if (e.key?.toLowerCase() === 'y' || e.key === 'Enter') {
        onYes();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [accepted]);

  return (
    <main className="min-h-screen bg-valentine relative">
      {/* Floating hearts (background decoration) */}
      <FloatingHearts maxHearts={24} intervalMs={500} />

      {/* ===== Front-page Valentine Question Overlay ===== */}
      {!accepted && (
        <div
          className="fixed inset-0 z-50 bg-white/90 backdrop-blur-sm flex items-center justify-center p-6"
          aria-modal="true"
          role="dialog"
          aria-labelledby="valentine-title"
        >
          <section className="card w-full max-w-xl p-8 text-center text-gray-800">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Heart size={38} />
              <h1 id="valentine-title" className="text-3xl md:text-4xl font-bold">
                Sarika, will you be my <span className="text-pink-600">Valentine</span>? 💘
              </h1>
              <Heart size={38} />
            </div>

            <p className="text-lg md:text-xl leading-8 mb-8">
              You get two choices… both are the right answer 😉
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={onYes}
                className="px-6 py-3 rounded-full bg-pink-600 text-white hover:bg-pink-700 transition shadow"
              >
                Yes
              </button>
              <button
                onClick={onYessssss}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-400 text-white hover:from-pink-600 hover:to-rose-500 transition shadow animate-pulse"
                aria-label="Yessssss!!!"
                title="Yessssss!!!"
              >
                Yessssss!!!
              </button>
            </div>

            <p className="mt-6 text-sm text-gray-600">
              Tip: Press <span className="font-semibold">Y</span> or <span className="font-semibold">Enter</span>
            </p>
          </section>
        </div>
      )}

      {/* ===== Main content (visible after accept) ===== */}
      <section className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-3xl card p-8 text-center text-gray-800">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart size={40} />
            <h1 className="text-3xl md:text-4xl font-bold">
              Happy Valentine’s Day, <span className="text-pink-600">Sarika</span> 💖
            </h1>
            <Heart size={40} />
          </div>

          <p className="text-lg md:text-xl leading-8">
            Every day with you is my favorite story. I built this tiny website to say{' '}
            <span className="font-semibold text-pink-600">I love you</span> and to share a few
            reasons why you’re amazing.
          </p>

          <div className="mt-8 flex items-center justify-center">
            <button
              onClick={() => {
                if (!revealed) {
                  setRevealed(true);
                  confetti({ particleCount: 120, spread: 70, origin: { y: 0.7 } });
                }
              }}
              className="px-6 py-3 rounded-full bg-pink-600 text-white hover:bg-pink-700 transition disabled:opacity-60"
              disabled={revealed}
            >
              {revealed ? 'Ready? Scroll down 💌' : 'Reveal a Surprise ✨'}
            </button>
          </div>

          {/* Surprise reasons section */}
          <div className={`mt-10 overflow-hidden transition-all ${revealed ? 'max-h-[1000px]' : 'max-h-0'}`}>
            <ul className="grid sm:grid-cols-2 gap-4 text-left">
              {[
                'Your smile brightens my day.',
                'You make the small moments magical.',
                'You’re thoughtful, kind, and brilliant.',
                'With you, home is wherever we are.',
              ].map((text, i) => (
                <li key={i} className="p-4 rounded-xl bg-pink-50 border border-pink-100">
                  🌹 {text}
                </li>
              ))}
            </ul>

            <div className="mt-8 text-center">
              <a href="#love-letter" className="inline-block px-4 py-2 rounded-full bg-pink-100 text-pink-700 hover:bg-pink-200 transition">
                Read your letter 💌
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto card p-6">
          <h2 className="text-2xl font-semibold mb-4">Our Moments 📸</h2>
          <p className="mb-6 text-gray-700">A little gallery of us.</p>
          <Gallery />
        </div>
      </section>

      {/* Love Letter */}
      <section id="love-letter" className="py-12 px-6">
        <div className="max-w-3xl mx-auto card p-8 text-left space-y-4">
          <h2 className="text-2xl font-semibold">A Love Letter</h2>

          <p>
            Sarika, these last two and a half years with you have been the most beautiful
            chapter of my life. Ever since the day you walked into my world, everything
            became brighter, softer, and so much more meaningful. You are the reason I
            am where I am today. You lifted me, shaped me, and gently pushed
            me toward the man I’m becoming. You are my now, my forever, and the home my
            heart always returns to.
          </p>

          <p>
            When I think about us, it’s not the grand things that come to mind first -
            it’s our late‑night walks in Carmelram, our peaceful Sunday trips to church,
            our Saturday walks by the lake, side by side, step by step,
            without ever needing many words. It’s our cute little surprises, the tiny
            routines that became the highlights of my days. It’s roaming on the bike
            together, laughing at nothing, racing against time just to drop you at the
            office, and the warmth I felt every time I came to pick you up again. These
            small moments are my treasure.
          </p>

          <p>
            And Finally, please take care of yourself - your heart, your mind, your health.
            I want us to reach everything we dream about. One day, we will make it.
            We will stand together and marry, build the little family we always talk
            about, raise our kids with love, and live the quiet, peaceful life we dream
            of - a life just for us, without noise, without chaos, without worries.
            Just us, forever.
          </p>

          <p>
            Much love, always and endlessly -
            Moses
          </p>

          <div className="pt-6 text-center text-2xl font-bold text-pink-700">
            நான் உன்னை காதலிக்கிறேன் 💗
          </div>

          <div className="pt-6 text-center">
            <button
              onClick={fireConfetti}
              className="px-4 py-2 rounded-full bg-pink-600 text-white hover:bg-pink-700"
            >
              Celebrate 🎉 **Click Me!!**
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}