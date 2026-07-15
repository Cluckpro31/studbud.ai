import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  chart: string;
}

const generateId = () => `mermaid-${Math.random().toString(36).substring(2, 11)}`;

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [id] = useState(generateId());

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'loose',
      fontFamily: 'var(--font-sans)',
      suppressErrorRendering: true,
    });

    const renderChart = async () => {
      if (!chart) return;
      try {
        const cleanChart = chart.replace(/```/g, '').trim();
        const { svg } = await mermaid.render(id, cleanChart);
        setSvgContent(svg);
      } catch (e: any) {
        console.error("Failed to render mermaid diagram", e);
        setSvgContent(`<div style="color: var(--accent-red); padding: 10px;">Failed to render diagram: ${e.message}</div>`);
      }
    };

    renderChart();
  }, [chart, id]);

  if (!svgContent) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Generating Diagram...</div>;
  }

  return (
    <div 
      className="mermaid-diagram"
      ref={containerRef}
      style={{ 
        margin: '16px 0', 
        background: 'rgba(0, 0, 0, 0.3)', 
        padding: '16px', 
        borderRadius: 'var(--radius-md)',
        overflowX: 'auto',
        display: 'flex',
        justifyContent: 'center'
      }}
      dangerouslySetInnerHTML={{ __html: svgContent }} 
    />
  );
};
