import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const CirclePacking = ({ data }) => {
    const svgRef = useRef();

    useEffect(() => {
        if (!data || data.length === 0) return;

        const genreCounts = d3.rollup(
            data.flatMap(d => d.listed_in || []),
            v => v.length,
            d => d
        );

        const hierarchicalData = {
            name: "root",
            children: Array.from(genreCounts, ([name, value]) => ({ name, value }))
        };

        const width = 500;
        const height = 400;
        const pack = d3.pack().size([width, height]).padding(3);
        const root = d3.hierarchy(hierarchicalData).sum(d => d.value);
        const nodes = pack(root).leaves();

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const tooltip = d3.select("body").selectAll(".chart-tooltip").data([0]).join("div")
            .attr("class", "chart-tooltip").style("position", "absolute").style("visibility", "hidden")
            .style("background", "#222").style("color", "#fff").style("padding", "8px").style("border-radius", "4px").style("z-index", "1000");

        const g = svg.append("g");
        const leaf = g.selectAll("g")
            .data(nodes)
            .join("g")
            .attr("transform", d => `translate(${d.x},${d.y})`);

        leaf.append("circle")
            .attr("r", d => d.r)
            .attr("fill", "#E50914")
            .attr("opacity", 0.7)
            .on("mouseover", function(event, d) { 
                d3.select(this).attr("opacity", 1); 
                tooltip.style("visibility", "visible").html(`Genre: ${d.data.name}<br/>Count: <strong>${d.data.value}</strong>`);
            })
            .on("mousemove", (event) => tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px"))
            .on("mouseout", function() { 
                d3.select(this).attr("opacity", 0.7); 
                tooltip.style("visibility", "hidden");
            });

        leaf.append("text")
            .attr("dy", ".3em")
            .style("text-anchor", "middle")
            .style("font-size", d => Math.min(d.r / 3, 12))
            .style("fill", "white")
            .style("pointer-events", "none")
            .text(d => d.r > 20 ? d.data.name : "");

        return () => tooltip.remove();
    }, [data]);

    return (
        <div style={{ textAlign: 'center' }}>
            <svg ref={svgRef} width={500} height={400}></svg>
            <p style={{ color: '#aaa', fontSize: '0.9rem', padding: '10px' }}>
                <strong>Summary:</strong> Visualizes library density. Larger bubbles represent core content pillars, identifying which genres dominate the current catalog.
            </p>
        </div>
    );
};

export default CirclePacking;