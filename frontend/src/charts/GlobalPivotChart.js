import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';

const GlobalPivotChart = ({ data }) => {
  const svgRef = useRef();
  const [hoverData, setHoverData] = useState({ show: false, x: 0, y: 0 });

  useEffect(() => {
    if (!data || data.length === 0) return;

    const yearGroups = d3.groups(data, d => +d.release_year)
      .filter(([year]) => year >= 2010 && year <= 2021)
      .sort((a, b) => a[0] - b[0])
      .map(([year, values]) => ({
        year,
        US: values.filter(v => v.country === 'United States').length,
        International: values.filter(v => v.country && v.country !== 'United States').length
      }));

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 60 },
          width = 800 - margin.left - margin.right,
          height = 300 - margin.top - margin.bottom;

    const x = d3.scaleLinear().domain(d3.extent(yearGroups, d => d.year)).range([0, width]);
    const y = d3.scaleLinear().domain([0, d3.max(yearGroups, d => d.US + d.International)]).range([height, 0]);
    const color = d3.scaleOrdinal().domain(["US", "International"]).range(["#444", "#E50914"]);

    const stack = d3.stack().keys(["US", "International"]);
    const stackedData = stack(yearGroups);
    const area = d3.area().x(d => x(d.data.year)).y0(d => y(d[0])).y1(d => y(d[1])).curve(d3.curveMonotoneX);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    g.selectAll(".layer")
      .data(stackedData)
      .enter().append("path")
      .attr("fill", d => color(d.key))
      .attr("d", area)
      .attr("opacity", 0.8);

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
            <h2 className="analysis-title">The "Global Bridge" Pivot (Post-2017)</h2>
            <p className="analysis-text">
              As the North American market reached saturation, Netflix shifted capital toward <b>Local-Language Originals</b> to unlock hyper-growth in EMEA and APAC regions.
            </p>
            <div className="business-impact-box">
              <h4>Business Impact:</h4>
              <ul>
                <li><b>Market De-risking:</b> Reduced dependency on US subscriber growth by establishing "local moats" in 190+ countries.</li>
                <li><b>IP Arbitrage:</b> Local hits (e.g., <i>Squid Game</i>) provide high-ROI global viewership at lower production costs.</li>
                <li><b>TAM Expansion:</b> Transitioned from a 300M household ceiling to a 1B+ household opportunity.</li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <svg ref={svgRef} width={800} height={300}></svg>
    </div>
  );
};

export default GlobalPivotChart;