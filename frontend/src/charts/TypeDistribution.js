import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const TypeDistribution = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;
    const counts = d3.rollups(data, v => v.length, d => d.type);
    const total = d3.sum(counts, d => d[1]);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 300, height = 300, radius = 100;
    const color = d3.scaleOrdinal().domain(["Movie", "TV Show"]).range(["#E50914", "#444"]);
    
    const pie = d3.pie().value(d => d[1]);
    const arc = d3.arc().innerRadius(60).outerRadius(radius);
    
    const tooltip = d3.select("body").selectAll(".chart-tooltip").data([0]).join("div")
      .attr("class", "chart-tooltip").style("position", "absolute").style("visibility", "hidden")
      .style("background", "#222").style("color", "#fff").style("padding", "8px").style("border-radius", "4px").style("z-index", "1000");

    const g = svg.append("g").attr("transform", `translate(${width/2},${height/2})`);

    g.selectAll("path")
      .data(pie(counts))
      .enter().append("path")
      .attr("d", arc)
      .attr("fill", d => color(d.data[0]))
      .on("mouseover", (e, d) => {
        tooltip.style("visibility", "visible")
               .html(`${d.data[0]}: <strong>${d.data[1]}</strong> (${((d.data[1]/total)*100).toFixed(1)}%)`);
      })
      .on("mousemove", (e) => tooltip.style("top", (e.pageY - 10) + "px").style("left", (e.pageX + 10) + "px"))
      .on("mouseout", () => tooltip.style("visibility", "hidden"));

    return () => tooltip.remove();
  }, [data]);

  return (
    <div style={{ textAlign: 'center' }}>
      <svg ref={svgRef} width={300} height={300}></svg>
      <p style={{ color: '#aaa', fontSize: '0.9rem', padding: '10px' }}>
        <strong>Summary:</strong> Analyzes the ratio of Movies to TV Shows. A shift toward TV Shows typically indicates a strategy focused on long-term subscriber retention and binge-watching.
      </p>
    </div>
  );
};

export default TypeDistribution;