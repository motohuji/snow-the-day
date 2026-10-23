import React from 'react';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudRain,
  CloudDrizzle,
  CloudHail,
  CloudSnow,
  Snowflake,
  CloudLightning
} from 'lucide-react';

export const WeatherIcon = ({ name, className = 'w-6 h-6', type = 'clear' }) => {
  const getIcon = () => {
    switch (name) {
      case 'Sun':
        return <Sun className={`${className} text-amber-400`} />;
      case 'CloudSun':
        return <CloudSun className={`${className} text-amber-300`} />;
      case 'Cloud':
        return <Cloud className={`${className} text-slate-300`} />;
      case 'CloudFog':
        return <CloudFog className={`${className} text-slate-400`} />;
      case 'CloudRain':
        return <CloudRain className={`${className} text-sky-400`} />;
      case 'CloudDrizzle':
        return <CloudDrizzle className={`${className} text-sky-300`} />;
      case 'CloudHail':
        return <CloudHail className={`${className} text-indigo-300`} />;
      case 'CloudSnow':
        return <CloudSnow className={`${className} text-cyan-300 animate-pulse`} />;
      case 'Snowflake':
        return <Snowflake className={`${className} text-cyan-400 animate-spin-slow`} />;
      case 'CloudLightning':
        return <CloudLightning className={`${className} text-rose-400`} />;
      default:
        return <Cloud className={`${className} text-slate-400`} />;
    }
  };

  return <span className="inline-flex items-center justify-center">{getIcon()}</span>;
};
