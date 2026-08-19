import React from 'react';
import { ShieldCheck, Code, UserCheck, Briefcase, Cpu, CheckSquare } from 'lucide-react';

export const RoleBadge = ({ role }) => {
  const isAdmin = role === 'admin';

  return (
    <span className={`role-badge ${isAdmin ? 'admin' : 'developer'}`}>
      {isAdmin ? (
        <>
          <ShieldCheck size={12} />
          Admin
        </>
      ) : (
        <>
          <Code size={12} />
          Developer
        </>
      )}
    </span>
  );
};

const JOB_ROLE_CONFIG = {
  devRH: { label: 'devRH', color: '#00E5FF', icon: UserCheck },
  devCONTA: { label: 'devCONTA', color: '#00FFCC', icon: CheckSquare },
  TECHLEAD: { label: 'TECHLEAD', color: '#B388FF', icon: Cpu },
  PMO: { label: 'PMO', color: '#FFEA00', icon: Briefcase }
};

export const JobRoleBadge = ({ jobRole, size = 12 }) => {
  const cfg = JOB_ROLE_CONFIG[jobRole] || {
    label: jobRole || 'devRH',
    color: '#00E5FF',
    icon: Code
  };
  const Icon = cfg.icon;

  return (
    <span
      className="job-role-badge"
      style={{
        backgroundColor: `${cfg.color}18`,
        color: cfg.color,
        border: `1px solid ${cfg.color}44`
      }}
    >
      <Icon size={size} />
      <span>{cfg.label}</span>
    </span>
  );
};
