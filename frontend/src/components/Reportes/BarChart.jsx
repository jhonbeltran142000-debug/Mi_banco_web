export default function BarChart({ data, height = 190 }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="bar-chart" style={{ height }}>
      {data.map((d, i) => {
        const pct = (d.value / max) * 100;
        return (
          <div className="bar-col" key={d.label}>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{ height: `${Math.max(pct, 2)}%`, animationDelay: `${i * 80}ms` }}
                title={`${d.label}: $${d.value.toLocaleString('es-CO')}`}
              >
                <span className="bar-value">
                  ${d.value >= 1000000
                    ? `${(d.value / 1000000).toFixed(1)}M`
                    : `${Math.round(d.value / 1000)}k`}
                </span>
              </div>
            </div>
            <span className="bar-label">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}
