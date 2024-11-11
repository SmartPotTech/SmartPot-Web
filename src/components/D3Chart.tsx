import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { History } from "../types/ApiResponses";

interface D3ChartProps {
    history: History[];
    measure: 'brightness' | 'humidity' | 'ph' | 'tds' | 'temperature';
    label: string;
}

// Colores específicos para cada medida
const measureColors: { [key: string]: { line: string; fill: string } } = {
    brightness: { line: "#FFD700", fill: "#FFF5CC" }, // Amarillo
    humidity: { line: "#1E90FF", fill: "#D0EFFF" },   // Azul claro
    ph: { line: "#32CD32", fill: "#E5FFE5" },         // Verde
    tds: { line: "#8A2BE2", fill: "#EADCF9" },        // Violeta
    temperature: { line: "#FF4500", fill: "#FFE4CC" } // Naranja/rojo
};

const D3Chart: React.FC<D3ChartProps> = ({ history, measure, label }) => {
    const svgRef = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        if (history.length > 0 && svgRef.current) {
            const margin = { top: 20, right: 30, bottom: 60, left: 40 };
            const width = 800 - margin.left - margin.right;
            const height = 400 - margin.top - margin.bottom;

            const svg = d3.select(svgRef.current);
            svg.selectAll("*").remove(); // Limpiar el SVG antes de renderizar

            const x = d3
                .scaleTime()
                .domain(d3.extent(history, (d) => new Date(d.date)) as [Date, Date])
                .range([0, width]);

            const y = d3
                .scaleLinear()
                .domain([0, d3.max(history, (d) => d.measures[measure]) || 100])
                .nice()
                .range([height, 0]);

            const chartGroup = svg
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            // Ejes X y Y
            chartGroup.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x).ticks(7))
                .selectAll("text")
                .style("text-anchor", "middle")
                .style("font-size", "12px");

            chartGroup.append("g")
                .call(d3.axisLeft(y));

            // Generadores de línea y área con curva
            const lineGenerator = d3.line<History>()
                .x((d) => x(new Date(d.date)))
                .y((d) => y(d.measures[measure]))
                .curve(d3.curveCardinal);

            const areaGenerator = d3.area<History>()
                .x((d) => x(new Date(d.date)))
                .y0(height)
                .y1((d) => y(d.measures[measure]))
                .curve(d3.curveCardinal);

            // Colores asignados para la medida actual
            const { line, fill } = measureColors[measure] || { line: "#000", fill: "#EEE" };

            // Dibujar el área de relleno
            chartGroup.append("path")
                .datum(history)
                .attr("fill", fill)
                .attr("opacity", 0.3)
                .attr("d", areaGenerator);

            // Dibujar la línea
            chartGroup.append("path")
                .datum(history)
                .attr("fill", "none")
                .attr("stroke", line)
                .attr("stroke-width", 2)
                .attr("d", lineGenerator);

            // Tooltip
            const tooltip = d3.select("body").append("div")
                .style("position", "absolute")
                .style("background", "#fff")
                .style("padding", "5px")
                .style("border-radius", "4px")
                .style("box-shadow", "0px 0px 5px rgba(0, 0, 0, 0.3)")
                .style("pointer-events", "none")
                .style("opacity", 0);

            // Círculos en los puntos de datos
            chartGroup.selectAll("circle")
                .data(history)
                .enter()
                .append("circle")
                .attr("cx", (d) => x(new Date(d.date)))
                .attr("cy", (d) => y(d.measures[measure]))
                .attr("r", 4)
                .attr("fill", line)
                .on("mouseover", (event, d) => {
                    tooltip.transition().duration(200).style("opacity", 1);
                    tooltip.html(`${d.measures[measure]}<br>${d.date}`)
                        .style("left", `${event.pageX + 10}px`)
                        .style("top", `${event.pageY - 20}px`);
                })
                .on("mouseout", () => {
                    tooltip.transition().duration(200).style("opacity", 0);
                });
        }
    }, [history, measure]);

    return (
        <div className="overflow-x-auto bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-lg font-semibold text-center mb-4">{label}</h3>
            <svg ref={svgRef}></svg>
        </div>
    );
};

export default D3Chart;
