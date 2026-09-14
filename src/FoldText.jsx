import { useEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import './FoldText.css';

const HINGES = {
  top: { origin: '50% 0%', rotateX: -92, rotateY: 0 },
  bottom: { origin: '50% 100%', rotateX: 92, rotateY: 0 },
  left: { origin: '0% 50%', rotateX: 0, rotateY: 92 },
  right: { origin: '100% 50%', rotateX: 0, rotateY: -92 },
};

export default function FoldText({
  text,
  hinge = 'top',
  duration = 0.62,
  stagger = 0.06,
  ease = 'power3.out',
  perspective = 700,
  creaseShading = 0.48,
  repeatDelay = 1.15,
  className = '',
  trailing = null,
}) {
  const rootRef = useRef(null);
  const hingeConfig = HINGES[hinge] || HINGES.top;
  const characters = useMemo(() => Array.from(text), [text]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const pieces = root.querySelectorAll('.fold-text-piece');
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      gsap.set(pieces, { opacity: 1, rotateX: 0, rotateY: 0, '--fold-crease': 0 });
      return undefined;
    }

    const timeline = gsap.timeline({ repeat: -1, repeatDelay });
    timeline.fromTo(
      pieces,
      {
        opacity: 0,
        rotateX: hingeConfig.rotateX,
        rotateY: hingeConfig.rotateY,
        '--fold-crease': creaseShading,
        transformOrigin: hingeConfig.origin,
        force3D: true,
      },
      {
        opacity: 1,
        rotateX: 0,
        rotateY: 0,
        '--fold-crease': 0,
        duration,
        ease,
        stagger,
      },
    );

    return () => timeline.kill();
  }, [creaseShading, duration, ease, hingeConfig, repeatDelay, stagger]);

  return (
    <span ref={rootRef} className={`fold-text ${className}`.trim()}>
      <span className="fold-text-sr-only">{text}</span>
      <span className="fold-text-visual" aria-hidden="true">
        {characters.map((character, index) => (
          <span
            className="fold-text-segment"
            key={`${character}-${index}`}
            style={{ '--fold-perspective': `${Math.max(120, perspective)}px` }}
          >
            <span
              className="fold-text-piece"
              data-fold-hinge={hinge}
              style={{ transformOrigin: hingeConfig.origin, '--fold-crease': 0 }}
            >
              {character === ' ' ? '\u00a0' : character}
            </span>
          </span>
        ))}
        {trailing && (
          <span
            className="fold-text-segment fold-text-trailing"
            style={{ '--fold-perspective': `${Math.max(120, perspective)}px` }}
          >
            <span
              className="fold-text-piece"
              data-fold-hinge={hinge}
              style={{ transformOrigin: hingeConfig.origin, '--fold-crease': 0 }}
            >
              {trailing}
            </span>
          </span>
        )}
      </span>
    </span>
  );
}
