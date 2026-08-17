import React from 'react';
import { ShieldCheck, Code } from 'lucide-react';

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
