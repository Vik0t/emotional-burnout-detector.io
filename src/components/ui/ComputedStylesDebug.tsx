import React, { useEffect, useState } from 'react';

interface Props {
  selectors: string[];
}

export function ComputedStylesDebug({ selectors }: Props) {
  const [data, setData] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      const out: Record<string, any> = {};
      selectors.forEach((sel) => {
        const el = document.querySelector(sel);
        if (!el) {
          out[sel] = { error: 'not found' };
          return;
        }
        const cs = window.getComputedStyle(el as Element);
        out[sel] = {
          display: cs.display,
          height: cs.height,
          width: cs.width,
          lineHeight: cs.lineHeight,
          paddingTop: cs.paddingTop,
          paddingBottom: cs.paddingBottom,
          paddingLeft: cs.paddingLeft,
          paddingRight: cs.paddingRight,
          alignItems: cs.alignItems,
          transform: cs.transform,
          fontSize: cs.fontSize,
          fontFamily: cs.fontFamily,
          marginTop: cs.marginTop,
          marginBottom: cs.marginBottom,
        };
      });
      setData(out);
    }, 200);
    return () => clearTimeout(t);
  }, [selectors.join(',')]);

  if (!data) return null;
  return (
    <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded text-slate-800 text-xs">
      <strong>Dev computed styles:</strong>
      <pre className="mt-2 whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export default ComputedStylesDebug;
