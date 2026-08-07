import React from 'react';
import { cn } from '@/lib/utils';
import type { DimensionScore } from '@/types/diagnostic';

interface RadarChartProps {
  dimensions: DimensionScore[];
  maxScore?: number;
  size?: number;
}

/**
 * Radar pentagonal SVG puro. zero deps. sem blur.
 * Estilo antivibecode: 1px stroke, hard edges.
 */
export const DiagnosticRadarChart: React.FC<RadarChartProps> = ({
  dimensions,
  maxScore = 20,
  size = 360,
}) => {
  const count = Math.min(dimensions.length, 5);
  const items = dimensions.slice(0, 5);
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 40;
  const angleStep = (Math.PI * 2) / count;
  const startAngle = -Math.PI / 2;

  const pointFor = (value: number, index: number) => {
    const ratio = Math.min(value / maxScore, 1);
    const angle = startAngle + angleStep * index;
    return {
      x: cx + Math.cos(angle) * radius * ratio,
      y: cy + Math.sin(angle) * radius * ratio,
    };
  };

  const dataRing = (scale: number) => {
    const points = Array.from({ length: count }, (_, i) => {
      const angle = startAngle + angleStep * i;
      const x = cx + Math.cos(angle) * radius * scale;
      const y = cy + Math.sin(angle) * radius * scale;
      return `${x},${y}`;
    }).join(' ');
    return points;
  };

  const dataPoints = items.map((d, i) => pointFor(d.score, i));

  const dataPoly = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="border border-zinc-900 bg-white p-6">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
          score por dimensao
        </h3>
        <span className="text-xs text-zinc-500 font-medium">escala 0-20</span>
      </div>
      <div className="relative">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="block mx-auto"
          aria-label="radar de dimensões"
        >
          {[0.25, 0.5, 0.75, 1].map((scale) => (
            <polygon
              key={scale}
              points={dataRing(scale)}
              fill="none"
              stroke="#E4E4E7"
              strokeWidth={1}
            />
          ))}

          {Array.from({ length: count }, (_, i) => {
            const angle = startAngle + angleStep * i;
            const x = cx + Math.cos(angle) * radius;
            const y = cy + Math.sin(angle) * radius;
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={x}
                y2={y}
                stroke="#E4E4E7"
                strokeWidth={1}
              />
            );
          })}

          <polygon
            points={dataPoly}
            fill="#00CC6A"
            fillOpacity={0.18}
            stroke="#00CC6A"
            strokeWidth={2}
          />

          {dataPoints.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={4}
              fill="#09090B"
              stroke="#00CC6A"
              strokeWidth={2}
            />
          ))}
        </svg>

        <div className="absolute inset-0 pointer-events-none">
          {items.map((d, i) => {
            const angle = startAngle + angleStep * i;
            const labelRadius = radius + 22;
            const x = cx + Math.cos(angle) * labelRadius;
            const y = cy + Math.sin(angle) * labelRadius;
            const labelX = Math.cos(angle) > 0.1 ? 'left' : Math.cos(angle) < -0.1 ? 'right' : 'center';
            return (
              <div
                key={i}
                className={cn(
                  'absolute -translate-y-1/2 text-[10px] font-bold uppercase tracking-wider text-zinc-900',
                  labelX === 'left' && 'translate-x-0',
                  labelX === 'right' && '-translate-x-full',
                  labelX === 'center' && '-translate-x-1/2',
                )}
                style={{
                  left: `${(x / size) * 100}%`,
                  top: `${(y / size) * 100}%`,
                }}
              >
                <div>{d.name}</div>
                <div className="text-[#00CC6A] text-xs">{d.score}/20</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};