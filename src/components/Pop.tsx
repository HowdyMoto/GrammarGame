import { useEffect, useState } from 'react';

export interface PopItem {
  id: number;
  x: number;
  y: number;
  text: string;
  kind: 'good' | 'bad';
}

interface Props {
  items: PopItem[];
  onExpire: (id: number) => void;
}

export function PopLayer({ items, onExpire }: Props) {
  return (
    <div className="pop-layer" aria-hidden="true">
      {items.map((p) => (
        <PopBubble key={p.id} item={p} onExpire={onExpire} />
      ))}
    </div>
  );
}

function PopBubble({ item, onExpire }: { item: PopItem; onExpire: (id: number) => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
    const t = setTimeout(() => onExpire(item.id), 900);
    return () => clearTimeout(t);
  }, [item.id, onExpire]);
  return (
    <span
      className={`pop pop--${item.kind} ${mounted ? 'pop--in' : ''}`}
      style={{ left: item.x, top: item.y }}
    >
      {item.text}
    </span>
  );
}
