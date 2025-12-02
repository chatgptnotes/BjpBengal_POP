import React from 'react';

interface GaugeProps {
  score: number; // 0 to 100
  label: string;
  change: string; // "+20%"
  color: string; // hex
}

export const Gauge: React.FC<GaugeProps> = ({ score, label, change, color }) => {
  const radius = 40;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;

  // Needle rotation: 0 = -90deg, 50 = 0deg, 100 = 90deg
  const rotation = (score / 100) * 180 - 90;

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <div className={`text-xs font-bold mb-1 ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
        {change}
      </div>
      <div className="relative w-24 h-14 overflow-hidden">
        <svg height="100%" width="100%" viewBox="0 0 100 60" className="absolute bottom-0">
           {/* Background Grey Arc */}
          <path
             d="M 10 50 A 40 40 0 0 1 90 50"
             fill="none"
             stroke="#e2e8f0"
             strokeWidth="12"
             strokeLinecap="round"
          />
           {/* Colored Value Arc */}
          <path
             d="M 10 50 A 40 40 0 0 1 90 50"
             fill="none"
             stroke={color}
             strokeWidth="12"
             strokeLinecap="round"
             strokeDasharray={`${circumference / 2} ${circumference}`}
             style={{ strokeDashoffset: circumference - (score / 100) * (circumference / 2), transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        {/* Needle */}
        <div
            className="absolute bottom-0 left-1/2 w-1 h-10 origin-bottom bg-slate-700"
            style={{
                transform: `translateX(-50%) rotate(${rotation}deg)`,
                transition: 'transform 0.5s ease',
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
            }}
        ></div>
        <div className="absolute bottom-0 left-1/2 w-4 h-4 bg-slate-800 rounded-full -translate-x-1/2 translate-y-1/2 border-2 border-white"></div>
      </div>
      <div className="mt-1 text-center">
        <p className="text-xs font-bold text-slate-700">{label}</p>
        <span className={`text-[10px] font-bold ${score < 50 ? 'text-red-500' : 'text-green-600'}`}>
            {score < 50 ? 'Negative' : 'Positive'}
        </span>
      </div>
    </div>
  );
};

export default Gauge;
