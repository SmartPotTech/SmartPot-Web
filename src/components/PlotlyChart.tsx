import React, {useEffect, useRef} from "react";
import Plot from "react-plotly.js";
import { History } from "../types/ApiResponses";
import Plotly from "plotly.js";

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

interface FrameData {
    x: Date[];
    y: number[];
}

interface Frame {
    data: FrameData[];
}

const PlotlyChart: React.FC<PlotlyChartProps> = ({ history, measure, label }) => {
    const { line, fill } = measureColors[measure] || { line: "#000", fill: "#EEE" };
    const plotRef = useRef(null);

    const xValues = history.map(d => new Date(d.date));
    const yValues = history.map(d => d.measures[measure] || 0);

    const frames: Frame[] = [];
    const n = history.length;
    for (let i = 0; i < n; i++) {
        frames[i] = { data: [{ x: [], y: [] }] };
        frames[i].data[0].x = xValues.slice(0, i + 1);
        frames[i].data[0].y = yValues.slice(0, i + 1);
    }

    const traceArea = {
        x: frames[0].data[0].x,
        y: frames[0].data[0].y,
        fill: "tozeroy",
        fillcolor: fill,
        type: "scatter",
        mode: "none",
        line: { color: "rgba(255,255,255,0)" }
    };

    const traceLine = {
        x: frames[0].data[0].x,
        y: frames[0].data[0].y,
        type: "scatter",
        mode: "lines+markers",
        marker: { color: line, size: 6 },
        line: { color: line, width: 2 }
    };

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
        },
        annotations: [{
            showarrow: false,
            text: "<b>TESTING</b>",
            font: {
                family: 'Gravitas One',
                size: 48,
                color: 'white'
            },
            xref: 'paper',
            yref: 'paper',
            x: 0.5,
            y: 0.5
        }]
    };

    useEffect(() => {
        if (plotRef.current) {
            Plotly.animate(plotRef.current, frames, {
                transition: {
                    duration: 0
                },
                frame: {
                    duration: 20,
                    redraw: false
                }
            });
        }
    }, [history, measure]);

    return (
        <div className="chart-container overflow-auto max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mb-8">
            <Plot
                ref={plotRef}
                data={[traceArea, traceLine]}
                layout={layout}
                config={{ responsive: true }}
            />
        </div>
    );
};

export default PlotlyChart;
