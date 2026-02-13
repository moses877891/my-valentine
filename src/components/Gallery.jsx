import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';

// === 10 images: adjust filenames if needed ===
const photos = [
  { src: '/photos/1.jpg',  alt: 'Us #1'  },
  { src: '/photos/2.jpg',  alt: 'Us #2'  },
  { src: '/photos/3.jpg',  alt: 'Us #3'  },
  { src: '/photos/4.jpg',  alt: 'Us #4'  },
  { src: '/photos/5.jpg',  alt: 'Us #5'  },
  { src: '/photos/6.jpg',  alt: 'Us #6'  },
  { src: '/photos/7.jpg',  alt: 'Us #7'  },
  { src: '/photos/8.jpg',  alt: 'Us #8'  },
  { src: '/photos/9.jpg',  alt: 'Us #9'  },
  { src: '/photos/10.jpg', alt: 'Us #10' },
  { src: '/photos/11.jpg', alt: 'Us #11' },
];

// Helper to chunk into pages of size N
function chunk(arr, size) {
  const pages = [];
  for (let i = 0; i < arr.length; i += size) pages.push(arr.slice(i, i + size));
  return pages;
}

export default function Gallery() {
  const pageSize = 4; // always 4 images per page
  const pages = useMemo(() => chunk(photos, pageSize), []);
  const totalPages = pages.length;

  // --- Infinite loop: slides = [last, ...pages, first] ---
  const slides = useMemo(() => {
    if (totalPages === 0) return [];
    return [pages[totalPages - 1], ...pages, pages[0]];
  }, [pages, totalPages]);

  // idx: current slide index inside "slides" (1..totalPages are the real pages)
  const [idx, setIdx] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(true);

  // Lightbox index (global photo index)
  const [activeIdx, setActiveIdx] = useState(null);

  // ---- Pointer (mouse + touch) drag state ----
  const viewportRef = useRef(null);
  const pointerIdRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [deltaX, setDeltaX] = useState(0);
  const didDragRef = useRef(false); // suppress click after a drag

  // Navigation (looped)
  const goNext = useCallback(() => {
    setIsTransitioning(true);
    setIdx((i) => i + 1);
  }, []);
  const goPrev = useCallback(() => {
    setIsTransitioning(true);
    setIdx((i) => i - 1);
  }, []);

  // Keyboard support (always looped)
  const onKey = useCallback((e) => {
    if (e.key === 'ArrowRight') goNext();
    if (e.key === 'ArrowLeft')  goPrev();
    if (e.key === 'Escape')     setActiveIdx(null);
  }, [goNext, goPrev]);

  useEffect(() => {
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onKey]);

  // After transition ends, if on a clone, jump (no transition) to the real slide
  const onTransitionEnd = () => {
    if (idx === 0) {
      setIsTransitioning(false);
      setIdx(totalPages);
    } else if (idx === totalPages + 1) {
      setIsTransitioning(false);
      setIdx(1);
    }
  };

  // Re-enable transition after jump to avoid flicker
  useEffect(() => {
    if (!isTransitioning) {
      const id = requestAnimationFrame(() => setIsTransitioning(true));
      return () => cancelAnimationFrame(id);
    }
  }, [isTransitioning]);

  // --- Pointer handlers (mouse + touch) ---
  const onPointerDown = (e) => {
    // Left click or touch/pen
    if (e.button !== undefined && e.button !== 0) return;
    didDragRef.current = false;
    setIsDragging(true);
    setIsTransitioning(false);
    setStartX(e.clientX);
    setDeltaX(0);
    pointerIdRef.current = e.pointerId;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
  };

  const onPointerMove = (e) => {
    if (!isDragging || e.pointerId !== pointerIdRef.current) return;
    const dx = e.clientX - startX;
    setDeltaX(dx);
    if (Math.abs(dx) > 3) didDragRef.current = true;
  };

  const endDrag = (el) => {
    const width = el?.clientWidth || 1;
    const thresholdPx = Math.max(60, width * 0.15); // at least 60px or 15% of viewport
    const shouldSlide = Math.abs(deltaX) > thresholdPx;

    setIsTransitioning(true);
    setIsDragging(false);

    if (shouldSlide) {
      if (deltaX < 0) goNext();
      else goPrev();
    } else {
      setIdx((i) => i); // snap back
    }
    setDeltaX(0);

    // Allow clicks again after frame
    setTimeout(() => { didDragRef.current = false; }, 0);
  };

  const onPointerUp = (e) => {
    if (e.pointerId !== pointerIdRef.current) return;
    try { e.currentTarget.releasePointerCapture(pointerIdRef.current); } catch {}
    endDrag(viewportRef.current);
  };

  const onPointerCancel = (e) => {
    if (e.pointerId !== pointerIdRef.current) return;
    try { e.currentTarget.releasePointerCapture(pointerIdRef.current); } catch {}
    endDrag(viewportRef.current);
  };

  // Drag offset in percent (for transform)
  const dragPercent = (() => {
    if (!viewportRef.current || !isDragging) return 0;
    const width = viewportRef.current.clientWidth || 1;
    return (deltaX / width) * 100;
  })();

  // Current real page number for indicator (1..totalPages)
  const realPage = ((idx - 1 + totalPages) % totalPages) + 1;

  return (
    <div className="w-full">
      {/* Controls OUTSIDE the container so they never block images */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <button
          onClick={goPrev}
          className="rounded-full bg-white/90 text-gray-800 px-3 py-1 shadow hover:bg-white"
          aria-label="Previous page"
        >
          ◀ Prev
        </button>

        <div className="text-xs md:text-sm bg-white/90 rounded-full px-3 py-1 shadow">
          Page <span className="font-semibold">{realPage}</span> / {totalPages}
        </div>

        <button
          onClick={goNext}
          className="rounded-full bg-white/90 text-gray-800 px-3 py-1 shadow hover:bg-white"
          aria-label="Next page"
        >
          Next ▶
        </button>
      </div>

      {/* Viewport */}
      <div
        ref={viewportRef}
        className="relative overflow-hidden rounded-2xl border border-pink-200/60 select-none"
        style={{ touchAction: 'pan-y' }} // allow vertical scrolling; we handle horizontal drag
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        {/* Slider track */}
        <div
          className={`flex ${isTransitioning ? 'transition-transform duration-500 ease-in-out' : ''}`}
          style={{ transform: `translateX(calc(-${idx * 100}% + ${dragPercent}%))` }}
          onTransitionEnd={onTransitionEnd}
          aria-live="polite"
          aria-roledescription="carousel"
        >
          {slides.map((group, slideIndex) => (
            <div key={slideIndex} className="w-full flex-shrink-0 p-4">
              {/* Page grid: 2x2 on mobile, 4 cols on md+ (always 4 per page) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {group.map((p, itemIndex) => {
                  // Map slideIndex to 0..totalPages-1
                  const realPageIdx = (slideIndex - 1 + totalPages) % totalPages;
                  const globalIndex = realPageIdx * pageSize + itemIndex;

                  const onImageClick = () => {
                    if (didDragRef.current) return; // ignore click if it was a drag
                    setActiveIdx(globalIndex);
                  };

                  return (
                    <button
                      key={`${slideIndex}-${p.src}`}
                      onClick={onImageClick}
                      className="group block rounded-xl overflow-hidden border border-pink-100 bg-white shadow hover:shadow-md transition"
                      aria-label={`Open photo ${globalIndex + 1}`}
                    >
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={p.src}
                          alt={p.alt}
                          className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                          loading="lazy"
                          draggable={false}
                        />
                      </div>
                      <div className="p-2 text-center text-sm text-gray-600">
                        {p.alt}
                      </div>
                    </button>
                  );
                })}

                {/* Keep layout balanced if last page has <4 images */}
                {group.length < pageSize &&
                  Array.from({ length: pageSize - group.length }).map((_, k) => (
                    <div key={`ph-${slideIndex}-${k}`} className="hidden md:block" aria-hidden="true" />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- Lightbox (optional, click any image) --- */}
      {activeIdx !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setActiveIdx(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={photos[activeIdx].src} alt={photos[activeIdx].alt} className="w-full rounded-xl" />
            <button
              className="absolute -top-3 -right-3 bg-white rounded-full w-10 h-10 grid place-items-center text-gray-800 font-bold"
              onClick={() => setActiveIdx(null)}
              aria-label="Close"
            >
              ✕
            </button>

            {/* Lightbox navigation */}
            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2">
              <button
                onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
                disabled={activeIdx === 0}
                className="rounded-full bg-white/90 text-gray-800 w-10 h-10 grid place-items-center disabled:opacity-50"
                aria-label="Previous photo"
              >
                ◀
              </button>
              <button
                onClick={() => setActiveIdx((i) => Math.min(photos.length - 1, i + 1))}
                disabled={activeIdx === photos.length - 1}
                className="rounded-full bg-white/90 text-gray-800 w-10 h-10 grid place-items-center disabled:opacity-50"
                aria-label="Next photo"
              >
                ▶
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}