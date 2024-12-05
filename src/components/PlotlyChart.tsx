import React from "react";
import Plot from "react-plotly.js";
import { History } from "../types/ApiResponses";

interface PlotlyChartProps {
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

const PlotlyChart: React.FC<PlotlyChartProps> = ({ history, measure, label }) => {
    const { line, fill } = measureColors[measure] || { line: "#000", fill: "#EEE" };

    const xValues = history.map(d => new Date(d.date));
    const yValues = history.map(d => d.measures[measure]);

    const traceArea = {
        x: xValues,
        y: yValues,
        fill: "tozeroy",
        fillcolor: fill,
        type: "scatter",
        mode: "none",
        line: { color: "rgba(255,255,255,0)" }
    };

    const traceLine = {
        x: xValues,
        y: yValues,
        type: "scatter",
        mode: "lines+markers",
        marker: { color: line, size: 6 },
        line: { color: line, width: 2 }
    };

    // Opciones del gráfico
    const layout = {
        title: label,
        xaxis: {
            title: "Fecha",
            type: "date"
        },
        yaxis: {
            title: measure.charAt(0).toUpperCase() + measure.slice(1),
            rangemode: "tozero"
        },
        hovermode: "closest",
        margin: {
            t: 20, r: 30, b: 60, l: 40
        }
    };

    return (
        <div className="overflow-x-auto bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-lg font-semibold text-center mb-4">{label}</h3>
            <Plot
                data={[traceArea, traceLine]}
                layout={layout}
                config={{ responsive: true }}
            />
        </div>
    );
};

export default PlotlyChart;
