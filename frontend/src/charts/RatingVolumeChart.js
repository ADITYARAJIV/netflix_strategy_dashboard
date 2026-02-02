import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';

const RatingVolumeChart = ({ data }) => {
  const svgRef = useRef();
  const [hoverData, setHoverData] = useState({ show: false, x: 0, y: 0 });

  useEffect(() => {
    if (!data || data.length === 0) return;

    const ratingCounts = d3.rollups(data, v => v.length, d => d.rating)
      .filter(([rating]) => rating && rating !== "")
      .map(([name, value]) => ({ name, value }));

    const root = d3.hierarchy({ children: ratingCounts }).sum(d => d.value);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800, height = 350;
    d3.treemap().size([width, height]).padding(2)(root);

    const leaf = svg.selectAll("g")
      .data(root.leaves())
      .enter().append("g")
      .attr("transform", d => `translate(${d.x0},${d.y0})`);

    leaf.append("rect")
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)
      .attr("fill", d => d.data.name.includes('TV-MA') ? "#E50914" : "#444")
      .attr("stroke", "#141414");

    leaf.append("text")
      .attr("x", 5)
      .attr("y", 20)
      .text(d => d.data.name)
      .attr("fill", "white")
      .attr("font-size", "12px");
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
            <h2 className="analysis-title">The Maturity Mix Strategy</h2>
            <p className="analysis-text">
              Netflix strategically balances "Mature" content for adult engagement with "Family" ratings to capture <b>Total Household Viewing Time</b>.
            </p>
            <div className="business-impact-box">
              <h4>Business Impact:</h4>
              <ul>
                <li><b>Core Demographic Capture:</b> TV-MA dominance targets the high-LTV "Solo/Adult" segment that drives social trends.</li>
                <li><b>Family Stickiness:</b> G/PG content acts as a critical anchor for households, making the service harder to cancel.</li>
                <li><b>Global Compliance:</b> A diverse rating mix ensures the platform can enter markets with varying cultural standards.</li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <svg ref={svgRef} width={800} height={350}></svg>
    </div>
  );
};

export default RatingVolumeChart;