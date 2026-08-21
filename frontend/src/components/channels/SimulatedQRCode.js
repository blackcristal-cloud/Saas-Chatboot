import React, { useMemo } from "react";

// Deterministic pseudo-random generator so the QR looks stable per seed
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FinderPattern = ({ x, y, cell }) => (
  <g>
    <rect x={x * cell} y={y * cell} width={cell * 7} height={cell * 7} fill="currentColor" />
    <rect x={(x + 1) * cell} y={(y + 1) * cell} width={cell * 5} height={cell * 5} fill="white" />
    <rect x={(x + 2) * cell} y={(y + 2) * cell} width={cell * 3} height={cell * 3} fill="currentColor" />
  </g>
);

export const SimulatedQRCode = ({ seed = 42, size = 220 }) => {
  const modules = 25;
  const cell = size / modules;

  const cells = useMemo(() => {
    const rand = mulberry32(seed);
    const list = [];
    for (let r = 0; r < modules; r++) {
      for (let c = 0; c < modules; c++) {
        const inFinder =
          (r < 8 && c < 8) || (r < 8 && c >= modules - 8) || (r >= modules - 8 && c < 8);
        if (!inFinder && rand() > 0.52) {
          list.push([r, c]);
        }
      }
    }
    return list;
  }, [seed]);

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm" data-testid="whatsapp-qr-code">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="text-neutral-900">
        <rect width={size} height={size} fill="white" />
        {cells.map(([r, c], i) => (
          <rect key={i} x={c * cell} y={r * cell} width={cell} height={cell} fill="currentColor" />
        ))}
        <FinderPattern x={0} y={0} cell={cell} />
        <FinderPattern x={modules - 7} y={0} cell={cell} />
        <FinderPattern x={0} y={modules - 7} cell={cell} />
      </svg>
    </div>
  );
};
