import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { stageDistribution } from '../../data/mockData.js'

const stageColors = {
  Normal: '#059669',
  'Very Mild': '#0284c7',
  Mild: '#d97706',
  Moderate: '#e11d48',
}

const totalCases = stageDistribution.reduce(
  (total, stage) => total + stage.count,
  0,
)

function getPercentage(count) {
  return Math.round((count / totalCases) * 100)
}

function StageDistribution() {
  return (
    <section className="dashboard-card-rise flex h-full min-h-64 flex-col rounded-xl border border-white/60 bg-white/60 p-6 shadow-[0_4px_16px_rgba(15,23,42,0.05)] backdrop-blur-md sm:p-7">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-blue-950">
          Alzheimer&apos;s Stage Distribution
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Distribution of analyzed patient cases
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 py-6 sm:flex-row sm:gap-8 xl:flex-col 2xl:flex-row">
        <div className="relative h-52 w-full max-w-[13rem] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stageDistribution}
                dataKey="count"
                nameKey="stage"
                cx="50%"
                cy="50%"
                innerRadius={62}
                outerRadius={88}
                paddingAngle={3}
                cornerRadius={5}
                startAngle={90}
                endAngle={-270}
                stroke="none"
              >
                {stageDistribution.map((stage) => (
                  <Cell key={stage.stage} fill={stageColors[stage.stage]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold tracking-tight text-blue-950">
              {totalCases}
            </span>
            <span className="mt-1 text-xs font-medium text-slate-500">
              Total Cases
            </span>
          </div>
        </div>

        <ul className="w-full max-w-[13rem] space-y-3" aria-label="Stage legend">
          {stageDistribution.map((stage) => (
            <li
              key={stage.stage}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: stageColors[stage.stage] }}
                />
                <span className="truncate font-medium text-slate-700">
                  {stage.stage}
                </span>
              </div>
              <span className="shrink-0 text-slate-500">
                {stage.count} <span className="text-slate-400">({getPercentage(stage.count)}%)</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default StageDistribution
