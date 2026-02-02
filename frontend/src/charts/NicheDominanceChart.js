import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';

const NicheDominanceChart = ({ data }) => {
  const svgRef = useRef();
  const [hoverData, setHoverData] = useState({ show: false, x: 0, y: 0 });

  useEffect(() => {
    if (!data || data.length === 0) return;

    const genreCounts = d3.rollups(data.flatMap(d => d.listed_in || []), v => v.length, d => d)
      .sort((a, b) => b[1] - a[1]).slice(0, 10).map(d => d[0]);

    const matrix = [];
    genreCounts.forEach(genre => {
      ['Movie', 'TV Show'].forEach(type => {
        const count = data.filter(d => d.type === type && d.listed_in?.includes(genre)).length;
        matrix.push({ genre, type, count });
      });
    });

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 140 },
          width = 800 - margin.left - margin.right,
          height = 350 - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    const x = d3.scaleBand().domain(['Movie', 'TV Show']).range([0, width]).padding(0.05);
    const y = d3.scaleBand().domain(genreCounts).range([0, height]).padding(0.05);
    const color = d3.scaleLinear().domain([0, d3.max(matrix, d => d.count)]).range(["#222", "#E50914"]);

    g.selectAll("rect")
      .data(matrix)
      .enter().append("rect")
      .attr("x", d => x(d.type))
      .attr("y", d => y(d.genre))
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .attr("fill", d => color(d.count));

    g.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x)).style("color", "white");
    g.append("g").call(d3.axisLeft(y)).style("color", "white");
  }, [data]);

  const handleMouseMove = (e) => {
    setHoverData({ show: true, x: e.clientX + 20, y: e.clientY + 20 });
  };

  return (
    <div 
      className="hypothesis-wrapper" 
      style={{ position: 'relative', cursor: 'default' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoverData({ ...hoverData, show: false })}
    >
      <AnimatePresence>
        {hoverData.show && (
          <motion.div 
            className="strategic-analysis-overlay" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', left: hoverData.x, top: hoverData.y, zIndex: 9999, pointerEvents: 'none' }}
          >
            <h3 className="analysis-tag">STRATEGIC ANALYSIS</h3>
            <h2 className="analysis-title">The "Niche Dominance" Strategy</h2>
            <p className="analysis-text">
              Netflix uses a <b>"Long Tail"</b> content strategy, flooding specific niches (Documentaries, International TV) to ensure every demographic has a "reason to stay."
            </p>
            <div className="business-impact-box">
              <h4>Business Impact:</h4>
              <ul>
                <li><b>Efficiency at Scale:</b> High-volume genres like Documentaries require significantly lower production spend per hour watched.</li>
                <li><b>Reduced Churn:</b> By dominating niche interests, Netflix becomes an "essential service" rather than a discretionary one.</li>
                <li><b>Algorithm Fuel:</b> Massive genre depth provides the recommendation engine with deep user preference data.</li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <svg ref={svgRef} width={800} height={350}></svg>
    </div>
  );
};

export default NicheDominanceChart;