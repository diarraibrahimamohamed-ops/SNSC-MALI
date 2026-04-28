'use client';

import React, { useEffect, useRef } from 'react';

export function RisqueChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Sample data for risk distribution
    const data = [
      { label: 'Faible', value: 45, color: '#10b981' },
      { label: 'Moyen', value: 30, color: '#f59e0b' },
      { label: 'Élevé', value: 25, color: '#ef4444' }
    ];

    // Draw pie chart
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    let currentAngle = -Math.PI / 2;

    data.forEach((segment) => {
      const sliceAngle = (segment.value / 100) * 2 * Math.PI;
      
      // Draw segment
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.lineTo(centerX, centerY);
      ctx.fillStyle = segment.color;
      ctx.fill();
      
      // Draw label
      const labelX = centerX + Math.cos(currentAngle + sliceAngle / 2) * (radius / 2);
      const labelY = centerY + Math.sin(currentAngle + sliceAngle / 2) * (radius / 2);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${segment.value}%`, labelX, labelY);
      
      currentAngle += sliceAngle;
    });

    // Draw legend
    ctx.fillStyle = '#374151';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    
    data.forEach((segment, index) => {
      const legendY = 20 + index * 20;
      
      // Color box
      ctx.fillStyle = segment.color;
      ctx.fillRect(10, legendY - 8, 12, 12);
      
      // Label
      ctx.fillStyle = '#374151';
      ctx.fillText(`${segment.label} (${segment.value}%)`, 30, legendY);
    });

  }, []);

  return (
    <div className="w-full h-64 flex items-center justify-center">
      <canvas 
        ref={canvasRef}
        width={300}
        height={250}
        className="max-w-full"
      />
    </div>
  );
}
