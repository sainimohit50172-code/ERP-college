export default function DataTable({ columns, rows }) {
  const gridStyle = { gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` };
  const minTableWidth = Math.max(720, columns.length * 160);

  return (
    <div className="data-table overflow-hidden rounded-[32px] border border-slate-200/70 bg-white shadow-soft">
      <div className="overflow-x-auto">
        <div style={{ minWidth: minTableWidth }}>
          <div className="data-table-header grid gap-0 bg-slate-100 px-5 py-4 text-sm uppercase tracking-[0.18em] text-slate-500" style={gridStyle}>
            {columns.map((title) => (
              <span key={title} className="font-semibold">
                {title}
              </span>
            ))}
          </div>
          <div className="divide-y divide-slate-200">
            {rows.map((row, index) => (
              <div
                key={index}
                className={`grid items-center gap-0 px-5 py-4 text-slate-700 transition ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-emerald-50`}
                style={gridStyle}
              >
                {row.map((cell, cellIndex) => (
                  <div key={cellIndex} className="truncate">
                    {cell}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
