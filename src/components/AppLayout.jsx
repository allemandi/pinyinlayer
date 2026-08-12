import { Maximize2, Minimize2 } from 'lucide-react';

function Pane({ title, expandKey, expanded, onToggleExpand, children }) {
  const isExpanded = expanded === expandKey;
  const isMinimized = Boolean(expanded) && !isExpanded;

  return (
    <section
      className={`group flex flex-col overflow-hidden rounded-2xl border bg-surface transition-all duration-300 ease-out ${
        isMinimized
          ? 'h-14 shrink-0 md:h-full md:w-14 md:flex-[0_0_3.5rem] border-rule dark:border-slate-800 shadow-sm hover:shadow-md hover:border-jade/40 dark:hover:border-jade/40'
          : isExpanded
          ? 'min-h-0 flex-1 md:flex-[5] border-jade/30 dark:border-jade/40 shadow-lg shadow-jade/5 dark:shadow-black/20'
          : 'min-h-0 flex-1 md:flex-[3] border-rule dark:border-slate-800 shadow-md shadow-black/5'
      }`}
    >
      <button
        type="button"
        onClick={() => onToggleExpand(isExpanded ? null : expandKey)}
        className={`flex shrink-0 items-center gap-2 px-4 py-2.5 text-left transition-colors hover:bg-surface-dim cursor-pointer ${
          isMinimized
            ? 'h-full w-full justify-between md:h-full md:w-14 md:flex-col md:justify-center md:gap-2 md:py-4'
            : 'w-full justify-between border-b border-rule dark:border-slate-800'
        }`}
        aria-label={isExpanded ? `Restore ${title} panel` : `Expand ${title} panel`}
      >
        <span
          className={`font-display text-base font-semibold tracking-wide transition-all duration-300 ${
            isMinimized
              ? 'text-ink-faint group-hover:text-jade md:[writing-mode:vertical-rl] md:rotate-180'
              : 'text-ink-soft'
          }`}
        >
          {title}
        </span>
        <span className={`transition-all duration-300 ${isMinimized ? 'text-ink-faint group-hover:text-jade group-hover:scale-110' : 'text-ink-faint'}`}>
          {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
        </span>
      </button>

      <div
        className={`min-h-0 flex-1 transition-opacity duration-300 ${
          isMinimized ? 'pointer-events-none opacity-0 h-0 overflow-hidden' : 'opacity-100'
        }`}
      >
        {children}
      </div>
    </section>
  );
}

/**
 * Dual-pane shell. Each pane's header doubles as its expand/restore
 * control: expanding one pane shrinks the other to a thin strip (a vertical
 * tab on desktop, a thin bar on mobile) rather than hiding it outright, so
 * it's always one tap away from coming back. Panes stack top/bottom below
 * the `md` breakpoint.
 */
export default function AppLayout({ leftTitle, rightTitle, left, right, expanded, onToggleExpand }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-3 md:flex-row md:gap-4 md:p-4">
      <Pane title={leftTitle} expandKey="left" expanded={expanded} onToggleExpand={onToggleExpand}>
        {left}
      </Pane>
      <Pane title={rightTitle} expandKey="right" expanded={expanded} onToggleExpand={onToggleExpand}>
        {right}
      </Pane>
    </div>
  );
}
