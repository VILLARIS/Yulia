import { useId, useRef, useState } from 'react';

/**
 * Apariencia de las pestañas. `underline` es la variante por defecto; `segmented`
 * reproduce un control compacto tipo píldoras, usado en paneles laterales donde
 * el espacio es escaso. En ambos casos el comportamiento de teclado es el mismo.
 */
const APPEARANCES = {
  underline: {
    list: 'flex gap-1 overflow-x-auto border-b border-slate-200',
    base: '-mb-px min-h-11 shrink-0 whitespace-nowrap border-b-2 px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2',
    active: 'border-action text-action',
    inactive: 'border-transparent text-slate-600 hover:border-slate-300 hover:text-navy',
    panel: 'pt-6',
  },
  segmented: {
    list: 'flex gap-1 rounded-lg border border-slate-200 bg-white p-1',
    base: 'min-h-10 flex-1 rounded-md px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action',
    active: 'bg-blue-50 text-action',
    inactive: 'text-slate-600 hover:bg-slate-50',
    panel: 'pt-4',
  },
};

/**
 * Pestañas accesibles con navegación por flechas, `Home` y `End`, siguiendo el
 * patrón `tablist` / `tab` / `tabpanel` con un único elemento en el orden de
 * tabulación (roving tabindex).
 */
export function Tabs({ tabs, initialId, ariaLabel, variant = 'underline', panelClassName = '', children }) {
  const [activeId, setActiveId] = useState(initialId ?? tabs[0]?.id);
  const baseId = useId();
  const listRef = useRef(null);
  const appearance = APPEARANCES[variant] ?? APPEARANCES.underline;

  const activeIndex = tabs.findIndex((tab) => tab.id === activeId);
  const activeTab = tabs[activeIndex] ?? tabs[0];

  const focusTabAt = (index) => {
    const next = tabs[(index + tabs.length) % tabs.length];
    setActiveId(next.id);
    const button = listRef.current?.querySelector(`#${CSS.escape(`${baseId}-tab-${next.id}`)}`);
    button?.focus();
  };

  const handleKeyDown = (event) => {
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        focusTabAt(activeIndex + 1);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        focusTabAt(activeIndex - 1);
        break;
      case 'Home':
        event.preventDefault();
        focusTabAt(0);
        break;
      case 'End':
        event.preventDefault();
        focusTabAt(tabs.length - 1);
        break;
      default:
        break;
    }
  };

  return (
    <div>
      <div
        ref={listRef}
        role="tablist"
        aria-label={ariaLabel}
        onKeyDown={handleKeyDown}
        className={appearance.list}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab.id;
          return (
            <button
              key={tab.id}
              id={`${baseId}-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`${baseId}-panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveId(tab.id)}
              className={`${appearance.base} ${isActive ? appearance.active : appearance.inactive}`}
            >
              {tab.label}
              {typeof tab.count === 'number' ? (
                <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                  {tab.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div
        id={`${baseId}-panel-${activeTab.id}`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${activeTab.id}`}
        tabIndex={0}
        className={`${appearance.panel} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 ${panelClassName}`}
      >
        {typeof children === 'function' ? children(activeTab.id) : children}
      </div>
    </div>
  );
}
