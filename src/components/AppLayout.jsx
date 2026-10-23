import { Maximize2, Minimize2 } from 'lucide-react';

function Pane({ title, headerActions, expandKey, expanded, onToggleExpand, children }) {
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
      <div
        className={`flex shrink-0 items-center justify-between border-b border-rule bg-surface/80 transition-colors dark:border-slate-800 select-none ${
          isMinimized
            ? 'h-full w-full justify-between p-2.5 md:h-full md:w-14 md:flex-col md:justify-center md:gap-2 md:py-4 border-b-0 cursor-pointer'
            : 'px-3.5 py-2'
        }`}
        onClick={isMinimized ? () => onToggleExpand(expandKey) : undefined}
      >
        <button
          type="button"
          onClick={() => onToggleExpand(isExpanded ? null : expandKey)}
          className={`flex items-center gap-2 text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade rounded-lg transition-colors hover:text-jade ${
            isMinimized ? 'h-full w-full justify-between md:h-full md:w-14 md:flex-col md:justify-center' : ''
          }`}
          aria-label={isExpanded ? `Restore ${title} panel` : `Expand ${title} panel`}
        >
          <span
            className={`font-display text-sm sm:text-base font-bold tracking-wide text-ink dark:text-slate-100 transition-all duration-300 ${
              isMinimized
                ? 'text-ink-faint group-hover:text-jade md:[writing-mode:vertical-rl] md:rotate-180'
                : ''
            }`}
          >
            {title}
          </span>
        </button>

        {!isMinimized && (
          <div className="flex items-center gap-2 min-w-0">
            {headerActions}
            <button
              type="button"
              onClick={() => onToggleExpand(isExpanded ? null : expandKey)}
              aria-label={isExpanded ? `Restore ${title} panel` : `Expand ${title} panel`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint transition hover:bg-surface-dim hover:text-ink cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
          </div>
        )}

        {isMinimized && (
          <span className="text-ink-faint group-hover:text-jade transition-all">
            <Maximize2 size={15} />
          </span>
        )}
      </div>

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
export default function AppLayout({
  leftTitle,
  rightTitle,
  left,
  right,
  leftHeaderActions,
  rightHeaderActions,
  expanded,
  onToggleExpand,
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-3 md:flex-row md:gap-4 md:p-4">
      <Pane
        title={leftTitle}
        headerActions={leftHeaderActions}
        expandKey="left"
        expanded={expanded}
        onToggleExpand={onToggleExpand}
      >
        {left}
      </Pane>
      <Pane
        title={rightTitle}
        headerActions={rightHeaderActions}
        expandKey="right"
        expanded={expanded}
        onToggleExpand={onToggleExpand}
      >
        {right}
      </Pane>
    </div>
  );
}
