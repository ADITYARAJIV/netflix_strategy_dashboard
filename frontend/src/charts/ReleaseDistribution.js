import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const ReleaseDistribution = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;
    const years = data.map(d => +d.release_year).filter(y => !isNaN(y));
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 60 },
          width = 500 - margin.left - margin.right,
          height = 300 - margin.top - margin.bottom;

    const x = d3.scaleLinear().domain(d3.extent(years)).range([0, width]);
    const bins = d3.bin().domain(x.domain()).thresholds(20)(years);
    const y = d3.scaleLinear().domain([0, d3.max(bins, d => d.length)]).range([height, 0]);

    const tooltip = d3.select("body").selectAll(".chart-tooltip").data([0]).join("div")
      .attr("class", "chart-tooltip").style("position", "absolute").style("visibility", "hidden")
      .style("background", "#222").style("color", "#fff").style("padding", "8px").style("border-radius", "4px").style("z-index", "1000");

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    g.selectAll("rect")
      .data(bins)
      .enter().append("rect")
      .attr("x", 1)
      .attr("transform", d => `translate(${x(d.x0)},${y(d.length)})`)
      .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
      .attr("height", d => height - y(d.length))
      .attr("fill", "#E50914")
      .on("mouseover", (event, d) => {
        tooltip.style("visibility", "visible").html(`Period: ${d.x0}-${d.x1}<br/>Titles: <strong>${d.length}</strong>`);
      })
      .on("mousemove", (event) => tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px"))
      .on("mouseout", () => tooltip.style("visibility", "hidden"));

    g.append("g").attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")))
      .style("color", "white");
    
    g.append("g").call(d3.axisLeft(y)).style("color", "white");

    return () => tooltip.remove();
  }, [data]);

  return (
    <div style={{ textAlign: 'center' }}>
      <svg ref={svgRef} width={500} height={350}></svg>
      <p style={{ color: '#aaa', fontSize: '0.9rem', padding: '10px' }}>
        <strong>Summary:</strong> Compares library age. A heavy skew toward recent years indicates a high-turnover "Fresh Content" strategy vs. a "Classic Library" approach.
      </p>
    </div>
  );
};

export default ReleaseDistribution;