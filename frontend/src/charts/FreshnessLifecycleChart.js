import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';

const FreshnessLifecycleChart = ({ data }) => {
  const svgRef = useRef();
  const [hoverData, setHoverData] = useState({ show: false, x: 0, y: 0 });

  useEffect(() => {
    if (!data || data.length === 0) return;

    const processed = d3.groups(data, d => d.release_year)
      .filter(([year]) => year >= 2010 && year <= 2021)
      .map(([year, values]) => ({
        year,
        count: values.length,
        tvRatio: values.filter(v => v.type === 'TV Show').length / values.length
      }));

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 30, right: 30, bottom: 50, left: 60 },
          width = 800 - margin.left - margin.right,
          height = 350 - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    const x = d3.scaleLinear().domain([2010, 2021]).range([0, width]);
    const y = d3.scaleLinear().domain([0, d3.max(processed, d => d.count)]).range([height, 0]);
    const size = d3.scaleLinear().domain([0, 1]).range([5, 15]);

    g.selectAll("circle")
      .data(processed)
      .enter().append("circle")
      .attr("cx", d => x(d.year))
      .attr("cy", d => y(d.count))
      .attr("r", d => size(d.tvRatio))
      .attr("fill", "#E50914")
      .attr("opacity", 0.7)
      .attr("stroke", "#fff");

    g.append("g").attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")))
      .style("color", "white");

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
            <h2 className="analysis-title">The Content "Freshness" Moat</h2>
            <p className="analysis-text">
              The data indicates an aggressive acceleration of releases. Netflix prioritizes <b>Originals</b> over licensed content to control the platform's "cultural pulse."
            </p>
            <div className="business-impact-box">
              <h4>Business Impact:</h4>
              <ul>
                <li><b>Algorithm Velocity:</b> Constant new releases prevent user "catalog fatigue" and keep the recommendation engine active.</li>
                <li><b>IP Ownership:</b> Shifting to owned IP reduces long-term licensing overhead and prevents competitor clawbacks.</li>
                <li><b>Marketing Efficiency:</b> High-frequency releases allow for "event-based" marketing that sustains global conversation.</li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <svg ref={svgRef} width={800} height={350}></svg>
    </div>
  );
};

export default FreshnessLifecycleChart;