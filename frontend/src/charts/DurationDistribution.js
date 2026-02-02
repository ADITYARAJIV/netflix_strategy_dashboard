import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const DurationDistribution = ({ data }) => {
  const svgRef = useRef();
  useEffect(() => {
    if (!data || data.length === 0) return;
    const durations = data.filter(d => d.type === 'Movie').map(d => parseInt(d.duration) || 0).filter(d => d > 0);
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = {top: 20, right: 30, bottom: 40, left: 50}, 
          width = 500 - margin.left - margin.right, 
          height = 300 - margin.top - margin.bottom;

    const x = d3.scaleLinear().domain([0, d3.max(durations)]).range([0, width]);
    const bins = d3.bin().domain(x.domain()).thresholds(20)(durations);
    const y = d3.scaleLinear().domain([0, d3.max(bins, d => d.length)]).range([height, 0]);

    const tooltip = d3.select("body").selectAll(".chart-tooltip").data([0]).join("div")
      .attr("class", "chart-tooltip").style("position", "absolute").style("visibility", "hidden")
      .style("background", "#222").style("color", "#fff").style("padding", "8px").style("border-radius", "4px").style("z-index", "1000");

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    const line = d3.line().x(d => x((d.x0 + d.x1) / 2)).y(d => y(d.length)).curve(d3.curveBasis);
    
    g.append("path").datum(bins).attr("fill", "none").attr("stroke", "#E50914").attr("stroke-width", 2).attr("d", line);
    
    g.selectAll("circle").data(bins).enter().append("circle")
      .attr("cx", d => x((d.x0 + d.x1) / 2)).attr("cy", d => y(d.length)).attr("r", 4).attr("fill", "#fff")
      .on("mouseover", (event, d) => tooltip.style("visibility", "visible").html(`Duration: ~${d.x0}m<br/>Titles: <strong>${d.length}</strong>`))
      .on("mousemove", (event) => tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px"))
      .on("mouseout", () => tooltip.style("visibility", "hidden"));

    g.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x).tickFormat(d3.format("d"))).style("color", "white");
    g.append("g").call(d3.axisLeft(y)).style("color", "white");

    return () => tooltip.remove();
  }, [data]);

  return (
    <div style={{ textAlign: 'center' }}>
      <svg ref={svgRef} width={500} height={300}></svg>
      <p style={{ color: '#aaa', fontSize: '0.9rem', padding: '10px' }}>
        <strong>Summary:</strong> Visualizes watch-time commitment. Spikes around 90-100 minutes identify the standard engagement length for the film library.
      </p>
    </div>
  );
};

export default DurationDistribution;