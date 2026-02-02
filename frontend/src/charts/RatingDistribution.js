import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const RatingDistribution = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const counts = d3.rollups(data, v => v.length, d => d.rating || 'Unrated')
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 40, bottom: 40, left: 80 },
          width = 500 - margin.left - margin.right,
          height = 350 - margin.top - margin.bottom;

    // Swapping: Y is now for the Labels (Categories)
    const y = d3.scaleBand().domain(counts.map(d => d[0])).range([0, height]).padding(0.3);
    // Swapping: X is now for the Values (Length)
    const x = d3.scaleLinear().domain([0, d3.max(counts, d => d[1])]).range([0, width]);

    const tooltip = d3.select("body").selectAll(".chart-tooltip").data([0]).join("div")
      .attr("class", "chart-tooltip").style("position", "absolute").style("visibility", "hidden")
      .style("background", "#222").style("color", "#fff").style("padding", "8px").style("border-radius", "4px").style("z-index", "1000");

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    g.selectAll("rect")
      .data(counts)
      .enter().append("rect")
      .attr("x", 0)
      .attr("y", d => y(d[0]))
      .attr("width", d => x(d[1])) // Width is determined by the count
      .attr("height", y.bandwidth())
      .attr("fill", "#E50914")
      .on("mouseover", (event, d) => {
        tooltip.style("visibility", "visible").html(`Rating: ${d[0]}<br/>Total: <strong>${d[1]}</strong>`);
      })
      .on("mousemove", (event) => tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px"))
      .on("mouseout", () => tooltip.style("visibility", "hidden"));

    // Add labels to the ends of the bars
    g.selectAll(".label")
      .data(counts)
      .enter().append("text")
      .attr("x", d => x(d[1]) + 5)
      .attr("y", d => y(d[0]) + y.bandwidth() / 2)
      .attr("dy", ".35em")
      .style("fill", "#aaa")
      .style("font-size", "10px")
      .text(d => d[1]);

    g.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x).ticks(5)).style("color", "white");
    g.append("g").call(d3.axisLeft(y)).style("color", "white");

    return () => tooltip.remove();
  }, [data]);

  return (
    <div style={{ textAlign: 'center' }}>
      <svg ref={svgRef} width={500} height={350}></svg>
      <p style={{ color: '#aaa', fontSize: '0.9rem', padding: '10px' }}>
        <strong>Summary:</strong> Horizontal analysis of content maturity. This highlights the "Adult-Heavy" nature of the library, often used to differentiate from family-oriented competitors like Disney+.
      </p>
    </div>
  );
};

export default RatingDistribution;