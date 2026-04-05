import React from 'react'

export default function CircularProgress({ percentage }) {
    const radius = 45;
    const stroke = 10;
    const normalizedRadius = radius - stroke / 2;
    const circumference = 2 * Math.PI * normalizedRadius;
    const safePercentage = Math.min(100, Math.max(0, percentage));

    const strokeDashoffset =
        circumference - (safePercentage / 100) * circumference;

    return (
        <div className="flex items-center justify-center">
            <svg height={radius * 2} width={radius * 2}>
                {/* Background */}
                <circle
                    stroke="#e5e7eb"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />

                {/* Progress */}
                <circle
                    stroke="#3b82f6"
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    style={{
                        transform: "rotate(-90deg)",
                        transformOrigin: "50% 50%",
                        transition: "stroke-dashoffset 0.5s ease",
                    }}
                />

                {/* Center Text */}
                <text
                    x="50%"
                    y="45%"
                    textAnchor="middle"
                    fontSize="20"
                    fontWeight="bold"
                    fill="#111"
                >
                    {percentage}%
                </text>

                <text
                    x="50%"
                    y="65%"
                    textAnchor="middle"
                    fontSize="12"
                    fill="#6b7280"
                >
                    Complete
                </text>
            </svg>
        </div>
    );
}