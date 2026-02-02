import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const BarChart = ({ data, compareData, primaryGenreName, compareGenreName }) => {
    const svgRef = useRef();

    useEffect(() => {
        if (!data || data.length === 0) return;

        // 1. Data Processing Helper
        const processData = (raw) => d3.rollups(
            raw.filter(d => d.year_added > 0),
            v => v.length,
            d => d.year_added
        ).sort((a, b) => a[0] - b[0]);

        const mainCounts = processData(data);
        const compCounts = compareData && compareData.length > 0 ? processData(compareData) : [];

        // 2. Setup Dimensions
        const margin = { top: 30, right: 30, bottom: 60, left: 70 };
        const width = 600 - margin.left - margin.right;
        const height = 350 - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        // 3. Tooltip Setup
        const tooltip = d3.select("body").selectAll(".d3-tooltip").data([0])
            .join("div")
            .attr("class", "d3-tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background", "rgba(0,0,0,0.9)")
            .style("color", "#fff")
            .style("padding", "8px")
            .style("border", "1px solid #E50914")
            .style("border-radius", "4px")
            .style("font-size", "12px")
            .style("z-index", "1000");

        // 4. Grouped Scales (x0 for Years, x1 for Bars within Year)
        const allYears = Array.from(new Set([...mainCounts.map(d => d[0]), ...compCounts.map(d => d[0])])).sort();
        
        const x0 = d3.scaleBand()
            .domain(allYears)
            .range([0, width])
            .padding(0.2);

        const x1 = d3.scaleBand()
            .domain(['main', 'comp'])
            .range([0, x0.bandwidth()])
            .padding(0.05);

        const y = d3.scaleLinear()
            .domain([0, d3.max([...mainCounts, ...compCounts], d => d[1]) || 10])
            .nice()
            .range([height, 0]);

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // 5. Draw Primary Genre Bars (Netflix Red)
        g.selectAll(".bar-main")
            .data(mainCounts)
            .join("rect")
            .attr("class", "bar-main")
            .attr("x", d => x0(d[0]) + (compCounts.length > 0 ? x1('main') : 0))
            .attr("y", d => y(d[1]))
            .attr("width", compCounts.length > 0 ? x1.bandwidth() : x0.bandwidth())
            .attr("height", d => height - y(d[1]))
            .attr("fill", "#E50914")
            .on("mouseover", (event, d) => {
                tooltip.style("visibility", "visible")
                    .html(`<strong>${primaryGenreName}</strong><br/>Year: ${d[0]}<br/>Titles: ${d[1]}`);
            })
            .on("mousemove", (event) => {
                tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", () => tooltip.style("visibility", "hidden"));

        // 6. Draw Comparison Genre Bars (Grey)
        if (compCounts.length > 0) {
            g.selectAll(".bar-comp")
                .data(compCounts)
                .join("rect")
                .attr("class", "bar-comp")
                .attr("x", d => x0(d[0]) + x1('comp'))
                .attr("y", d => y(d[1]))
                .attr("width", x1.bandwidth())
                .attr("height", d => height - y(d[1]))
                .attr("fill", "#808080")
                .on("mouseover", (event, d) => {
                    tooltip.style("visibility", "visible")
                        .html(`<strong>${compareGenreName}</strong><br/>Year: ${d[0]}<br/>Titles: ${d[1]}`);
                })
                .on("mousemove", (event) => {
                    tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
                })
                .on("mouseout", () => tooltip.style("visibility", "hidden"));
        }

        // 7. Axes
        g.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x0).tickValues(x0.domain().filter((d, i) => !(i % 2))))
            .selectAll("text")
            .style("fill", "white");

        g.append("g")
            .call(d3.axisLeft(y))
            .selectAll("text")
            .style("fill", "white");

        // Y-Axis Label
        g.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -50)
            .attr("x", -height / 2)
            .attr("fill", "white")
            .style("text-anchor", "middle")
            .style("font-size", "14px")
            .text("Total Number of Titles");

        return () => tooltip.remove();
    }, [data, compareData, primaryGenreName, compareGenreName]);

    return (
        <div className="bar-chart-wrapper" style={{ textAlign: 'center' }}>
            <svg ref={svgRef} width={600} height={350}></svg>
            
            {/* Dynamic Comparison Legend */}
            {compareData && compareData.length > 0 && (
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    gap: '25px', 
                    marginTop: '15px', 
                    fontSize: '14px',
                    color: '#fff' 
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#E50914', fontSize: '20px' }}>●</span> 
                        <span>{primaryGenreName}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#808080', fontSize: '20px' }}>●</span> 
                        <span>{compareGenreName}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BarChart;