import React, { useState } from 'react';

const StudentGrowth = () => {
   
    const data = [
        { month: 'Jan', value: 0 },
        { month: 'Feb', value: 30 },
        { month: 'Mar', value: 15 },
        { month: 'Apr', value: 55 },
        { month: 'May', value: 100 },
        { month: 'Jun', value: 110 },
        { month: 'Jul', value: 155 },
        { month: 'Aug', value: 190 },
    ];

    const [hoveredPoint, setHoveredPoint] = useState(null);

    // SVG dimensions & coordinate calculations
    const svgWidth = 560;
    const svgHeight = 220;
    const paddingLeft = 45;
    const paddingRight = 25;
    const paddingTop = 20;
    const paddingBottom = 40;

    const chartWidth = svgWidth - paddingLeft - paddingRight;
    const chartHeight = svgHeight - paddingTop - paddingBottom;
    const maxY = 200;

    // Calculate coordinates (x, y) for each data point
    const points = data.map((d, index) => {
        const x = paddingLeft + (index / (data.length - 1)) * chartWidth;
        const y = paddingTop + chartHeight - (d.value / maxY) * chartHeight;
        return { ...d, x, y };
    });

    // Generate smooth cubic bezier curve path
    const createSmoothPath = (pts) => {
        if (pts.length === 0) return '';
        let d = `M ${pts[0].x} ${pts[0].y}`;
        for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[i === 0 ? i : i - 1];
            const p1 = pts[i];
            const p2 = pts[i + 1];
            const p3 = pts[i + 2] || p2;

            const cp1x = p1.x + (p2.x - p0.x) / 6;
            const cp1y = p1.y + (p2.y - p0.y) / 6;
            const cp2x = p2.x - (p3.x - p1.x) / 6;
            const cp2y = p2.y - (p3.y - p1.y) / 6;

            d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
        }
        return d;
    };

    const linePath = createSmoothPath(points);
    // Close path for gradient area fill
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;

    const yAxisTicks = [200, 150, 100, 50, 0];

    return (
        <div className="growth-card">
            {/* Card Header */}
            <div className="growth-header">
                <h3 className="growth-title">Learning Analytics</h3>
                <button className="menu-btn" aria-label="More options">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>

            {/* SVG Chart Area */}
            <div className="chart-wrapper">
                <svg
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    className="growth-svg"
                    preserveAspectRatio="none"
                >
                    <defs>
                        {/* Smooth purple vertical gradient matching image */}
                        <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.85" />
                            <stop offset="50%" stopColor="#9333ea" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
                        </linearGradient>
                    </defs>

                    {/* Horizontal Dashed Gridlines & Y-Axis Labels */}
                    {yAxisTicks.map((val) => {
                        const yPos = paddingTop + chartHeight - (val / maxY) * chartHeight;
                        return (
                            <g key={val}>
                                <text
                                    x={paddingLeft - 12}
                                    y={yPos + 4}
                                    textAnchor="end"
                                    className="axis-label"
                                >
                                    {val}
                                </text>
                                <line
                                    x1={paddingLeft}
                                    y1={yPos}
                                    x2={svgWidth - paddingRight}
                                    y2={yPos}
                                    className="grid-line"
                                />
                            </g>
                        );
                    })}

                    {/* X-Axis Labels */}
                    {points.map((pt) => (
                        <text
                            key={pt.month}
                            x={pt.x}
                            y={svgHeight - 12}
                            textAnchor="middle"
                            className="axis-label"
                        >
                            {pt.month}
                        </text>
                    ))}

                    {/* Gradient Filled Area Under Curve */}
                    <path d={areaPath} fill="url(#purpleGradient)" />

                    {/* Main Curve Line */}
                    <path
                        d={linePath}
                        fill="none"
                        stroke="#6d28d9"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                    />

                    {/* Circular Data Nodes (White inside, purple border) */}
                    {points.map((pt, idx) => (
                        <g
                            key={idx}
                            onMouseEnter={() => setHoveredPoint(pt)}
                            onMouseLeave={() => setHoveredPoint(null)}
                            className="point-node"
                        >
                            <circle
                                cx={pt.x}
                                cy={pt.y}
                                r="5"
                                fill="#ffffff"
                                stroke="#6d28d9"
                                strokeWidth="2.5"
                            />
                        </g>
                    ))}
                </svg>

                {/* Optional Hover Tooltip */}
                {hoveredPoint && (
                    <div
                        className="chart-tooltip"
                        style={{
                            left: `${(hoveredPoint.x / svgWidth) * 100}%`,
                            top: `${(hoveredPoint.y / svgHeight) * 100}%`,
                        }}
                    >
                        <span>{hoveredPoint.month}: <strong>{hoveredPoint.value}</strong></span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentGrowth;