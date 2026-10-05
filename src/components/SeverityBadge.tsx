import React from 'react';
import { SeverityLevel } from '../types';
import { AlertCircle, AlertTriangle, AlertOctagon, CheckCircle2, Info } from 'lucide-react';

interface SeverityBadgeProps {
  severity: SeverityLevel | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  size = 'md',
  showIcon = true,
}) => {
  const norm = (severity || 'medium').toLowerCase() as SeverityLevel;

  // Explicit color mappings:
  // Critical: Red
  // High: Orange
  // Medium: Yellow
  // Low: Green
  const config = {
    critical: {
      label: 'CRITICAL',
      bg: 'bg-red-950/60 border-red-500/60 text-red-300',
      dot: 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]',
      icon: AlertOctagon,
      description: 'System Blocker / Data Loss Risk',
    },
    high: {
      label: 'HIGH',
      bg: 'bg-orange-950/60 border-orange-500/60 text-orange-300',
      dot: 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]',
      icon: AlertTriangle,
      description: 'Major Workflow Impairment',
    },
    medium: {
      label: 'MEDIUM',
      bg: 'bg-yellow-950/60 border-yellow-500/60 text-yellow-300',
      dot: 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]',
      icon: AlertCircle,
      description: 'Moderate Impact / Workaround Exists',
    },
    low: {
      label: 'LOW',
      bg: 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300',
      dot: 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]',
      icon: CheckCircle2,
      description: 'Minor / Cosmetic Glitch',
    },
  }[norm] || {
    label: norm.toUpperCase(),
    bg: 'bg-zinc-800 border-zinc-700 text-zinc-300',
    dot: 'bg-zinc-400',
    icon: Info,
    description: 'Standard Defect',
  };

  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs font-semibold px-2.5 py-1 gap-2',
    lg: 'text-sm font-bold px-3 py-1.5 gap-2.5',
  }[size];

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-md border font-mono tracking-wider transition-colors ${config.bg} ${sizeClasses}`}
      title={`Severity: ${config.label} - ${config.description}`}
    >
      <span className={`rounded-full shrink-0 animate-pulse ${config.dot} ${dotSizes}`} />
      {showIcon && <IconComponent className="w-3.5 h-3.5 shrink-0 opacity-90" />}
      <span>{config.label}</span>
    </span>
  );
};
