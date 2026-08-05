'use client';

import React, { useEffect, useRef } from 'react';

export function CouvertureChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Sample data for vaccination coverage
    const data = [
      { month: 'Jan', coverage: 65 },
      { month: 'Fév', coverage: 68 },
      { month: 'Mar', coverage: 72 },
      { month: 'Avr', coverage: 75 },
      { month: 'Mai', coverage: 78 },
      { month: 'Jun', coverage: 82 }
    ];

    const padding = 40;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;
    const barWidth = chartWidth / data.length * 0.6;
    const spacing = chartWidth / data.length * 0.4;

    // Draw axes
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.stroke();
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // Draw Y-axis labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    
    for (let i = 0; i <= 100; i += 20) {
      const y = canvas.height - padding - (i / 100) * chartHeight;
      ctx.fillText(`${i}%`, padding - 10, y);
      
      // Grid lines
      ctx.strokeStyle = '#f3f4f6';
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();
    }

    // Draw bars
    data.forEach((item, index) => {
      const barHeight = (item.coverage / 100) * chartHeight;
      const x = padding + index * (barWidth + spacing) + spacing / 2;
      const y = canvas.height - padding - barHeight;
      
      // Bar gradient
      const gradient = ctx.createLinearGradient(0, y, 0, canvas.height - padding);
      gradient.addColorStop(0, '#3b82f6');
      gradient.addColorStop(1, '#1d4ed8');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth, barHeight);
      
      // Value label
      ctx.fillStyle = '#374151';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`${item.coverage}%`, x + barWidth / 2, y - 5);
      
      // Month label
      ctx.fillStyle = '#6b7280';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(item.month, x + barWidth / 2, canvas.height - padding + 5);
    });

  }, []);

  return (
    <div className="w-full h-64 flex items-center justify-center">
      <canvas 
        ref={canvasRef}
        width={400}
        height={250}
        className="max-w-full"
      />
    </div>
  );
}
