import React from 'react';

interface ProgressCircleProps {
    progress: number; // 0 to 100
    size?: number;
    strokeWidth?: number;
    color?: string;
    icon?: React.ReactNode;
}

const ProgressCircle: React.FC<ProgressCircleProps> = ({
    progress,
    size = 120,
    strokeWidth = 10,
    color = "#0f172a",
    icon
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#f1f5f9"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                {/* Progress stroke */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    fill="none"
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
            </svg>
            {icon && (
                <div style={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {icon}
                </div>
            )}
        </div>
    );
};

export default ProgressCircle;
