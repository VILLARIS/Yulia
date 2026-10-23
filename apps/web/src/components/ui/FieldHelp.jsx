import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CircleHelp } from 'lucide-react';

export function FieldHelp({ label, text, example, avoid }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 320 });
  const buttonRef = useRef(null);
  const panelRef = useRef(null);
  const id = useId();

  const place = useCallback(() => {
    const button = buttonRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const width = window.innerWidth < 640 ? window.innerWidth - 32 : Math.min(340, window.innerWidth - 32);
    const left = Math.min(Math.max(rect.left, 16), window.innerWidth - width - 16);
    const height = panelRef.current?.offsetHeight ?? 0;
    let top = rect.bottom + 8;
    if (height && top + height > window.innerHeight - 16) top = Math.max(16, rect.top - height - 8);
    setCoords((current) => (current.top === top && current.left === left && current.width === width ? current : { top, left, width }));
  }, []);

  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (buttonRef.current?.contains(event.target) || panelRef.current?.contains(event.target)) return;
      setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    const onViewportChange = () => place();
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onViewportChange);
    window.addEventListener('scroll', onViewportChange, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onViewportChange);
      window.removeEventListener('scroll', onViewportChange, true);
    };
  }, [open, place]);

  return (
    <span className="field-help">
      <button
        ref={buttonRef}
        type="button"
        className="field-help-btn"
        aria-label={`Ayuda: ${label}`}
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => setOpen((value) => !value)}
      >
        <CircleHelp size={16} aria-hidden="true" />
      </button>
      {open && typeof document !== 'undefined' ? createPortal(
        <div
          id={id}
          ref={panelRef}
          className="field-help-pop"
          style={{ top: coords.top, left: coords.left, width: coords.width }}
          role="note"
          aria-live="polite"
        >
          <p className="field-help-text">{text}</p>
          {example ? (
            <p className="field-help-example">
              <span className="field-help-example-label">Ejemplo</span>
              {example}
            </p>
          ) : null}
          {avoid ? <p className="field-help-avoid"><span>Evita:</span> {avoid}</p> : null}
        </div>,
        document.body,
      ) : null}
    </span>
  );
}
