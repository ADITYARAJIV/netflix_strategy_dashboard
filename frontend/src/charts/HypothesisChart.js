import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const HypothesisChart = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const margin = { top: 20, right: 80, bottom: 60, left: 70 };
    const width = 800 - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Data Processing: 2009 to 2021
    const yearlyData = d3.rollups(
      data.filter(d => d.year_added >= 2009 && d.year_added <= 2021),
      v => ({
        movies: v.filter(d => d.type === 'Movie').length,
        tv: v.filter(d => d.type === 'TV Show').length
      }),
      d => d.year_added
    ).sort((a, b) => a[0] - b[0]);

    const x = d3.scaleLinear().domain([2009, 2021]).range([0, width]);
    const y = d3.scaleLinear().domain([0, 1500]).range([height, 0]);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Axes styling
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")).tickSizeOuter(0))
      .style("color", "#888");
    
    g.append("g")
      .call(d3.axisLeft(y).tickSizeOuter(0))
      .style("color", "#888");

    // Line Generators
    const lineMovies = d3.line().x(d => x(d[0])).y(d => y(d[1].movies)).curve(d3.curveMonotoneX);
    const lineTV = d3.line().x(d => x(d[0])).y(d => y(d[1].tv)).curve(d3.curveMonotoneX);

    // Draw Paths
    g.append("path").datum(yearlyData).attr("fill", "none").attr("stroke", "#E50914").attr("stroke-width", 4).attr("d", lineMovies);
    g.append("path").datum(yearlyData).attr("fill", "none").attr("stroke", "#808080").attr("stroke-width", 4).attr("d", lineTV);

    // Enhanced Insight Tooltip
    const hTooltip = d3.select("body").append("div")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background", "rgba(10, 10, 10, 0.98)")
        .style("color", "#fff")
        .style("padding", "20px")
        .style("border", "1px solid #E50914")
        .style("border-radius", "8px")
        .style("width", "360px")
        .style("box-shadow", "0 10px 30px rgba(0,0,0,0.8)")
        .style("z-index", "2000")
        .style("font-family", "Helvetica Neue, sans-serif");

    svg.on("mouseover", () => hTooltip.style("visibility", "visible"))
       .on("mousemove", (event) => {
           hTooltip.html(`
                <div style="border-bottom: 1px solid #444; padding-bottom: 10px; margin-bottom: 12px;">
                    <span style="color:#E50914; font-weight:bold; letter-spacing:1px; font-size:11px; text-transform:uppercase;">Strategic Analysis</span>
                    <h4 style="margin: 5px 0 0 0; color: #fff; font-size: 16px;">The "Stickiness" Pivot (Post-2016)</h4>
                </div>
                <p style="font-size:13px; line-height:1.5; color: #ccc; margin-bottom: 15px;">
                    The data reveals a deliberate shift. While Movies (Red) drove initial growth, TV Shows (Grey) represent a transition toward <strong>Recurring Engagement</strong>.
                </p>
                <div style="background: rgba(229, 9, 20, 0.1); padding: 12px; border-radius: 6px; font-size: 12px; border-left: 4px solid #E50914;">
                    <strong>Business Impact:</strong>
                    <ul style="padding-left: 18px; margin: 8px 0 0 0; list-style-type: square;">
                        <li style="margin-bottom: 6px;"><strong>Churn Reduction:</strong> Multi-episode series lock users into the platform for longer billing cycles.</li>
                        <li style="margin-bottom: 6px;"><strong>Algorithm Precision:</strong> Each episode provides more granular user-taste data than a single film.</li>
                        <li><strong>LTV Growth:</strong> TV viewers demonstrate higher Lifetime Value (LTV) due to consistent daily usage.</li>
                    </ul>
                </div>
           `)
           .style("top", (event.pageY - 20) + "px")
           .style("left", (event.pageX + 30) + "px");
       })
       .on("mouseout", () => hTooltip.style("visibility", "hidden"));

    return () => hTooltip.remove();
  }, [data]);

  return (
    <div className="hypothesis-container" style={{ position: 'relative' }}>
      <svg ref={svgRef} width={800} height={450}></svg>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginTop: '10px' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '4px', backgroundColor: '#E50914' }}></div>
            <span style={{ fontSize: '13px', color: '#E50914', fontWeight: 'bold' }}>Movies (Catalog Volume)</span>
         </div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '4px', backgroundColor: '#808080' }}></div>
            <span style={{ fontSize: '13px', color: '#808080', fontWeight: 'bold' }}>TV Shows (Retention Engine)</span>
         </div>
      </div>
    </div>
  );
};

export default HypothesisChart;