import React, { useEffect } from 'react';

/* global __APP_BRANCH__, __APP_COMMIT__, __APP_BUILD_TIME__ */

const BRANCH = typeof __APP_BRANCH__ !== 'undefined' ? __APP_BRANCH__ : 'unknown';
const COMMIT = typeof __APP_COMMIT__ !== 'undefined' ? __APP_COMMIT__ : 'unknown';
const BUILD_TIME = typeof __APP_BUILD_TIME__ !== 'undefined' ? __APP_BUILD_TIME__ : '';

const isProductionBranch = BRANCH === 'main' || BRANCH === 'master' || BRANCH === 'unknown';

const BuildBadge = () => {
  useEffect(() => {
    if (!isProductionBranch) {
      const original = document.title || 'Zemen';
      document.title = `[${BRANCH}] ${original}`;
      return () => {
        document.title = original;
      };
    }
  }, []);

  if (isProductionBranch) return null;

  const tooltip = `Branch: ${BRANCH}\nCommit: ${COMMIT}\nBuilt: ${BUILD_TIME}`;

  return (
    <div
      title={tooltip}
      style={{
        position: 'fixed',
        bottom: 12,
        right: 12,
        zIndex: 99999,
        background: '#d97706',
        color: 'white',
        padding: '6px 12px',
        borderRadius: 999,
        fontSize: 12,
        fontFamily: 'monospace',
        fontWeight: 700,
        letterSpacing: 0.4,
        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
        userSelect: 'none',
        pointerEvents: 'auto',
      }}
    >
      PREVIEW · {BRANCH} · {COMMIT}
    </div>
  );
};

export default BuildBadge;
