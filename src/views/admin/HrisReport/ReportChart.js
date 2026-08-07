import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { CHART_SERIES, CHART_GRID, CHART_AXIS } from '../../../api/hrisReport'

// Chart companion for a report result set.
//
// Every chart here sits directly above the full data table for the same rows.
// That matters beyond convenience: the series colours sit just under 3:1
// contrast against the card surface, and an always-present table is the
// accepted relief for that — the numbers are never available only as colour.
//
// Series colours come from the validated categorical set in api/hrisReport.js.
// They are assigned in fixed order and never cycled: a chart that needs more
// than three series is the wrong chart, so the category cap below bites first.

// Beyond this many categories a bar chart stops being readable. Truncation is
// announced rather than silent — a chart that quietly drops the tail is worse
// than no chart.
const MAX_CATEGORIES = 20

const shorten = (value, max = 22) => {
  const s = String(value == null ? '' : value)
  return s.length > max ? `${s.slice(0, max - 1)}…` : s
}

const ReportChart = ({ rows, labelKey, series, type, height }) => {
  const data = useMemo(() => {
    if (!rows || !rows.length || !labelKey) return []
    return rows
      .filter((r) => r[labelKey] !== null && r[labelKey] !== undefined)
      .map((r) => {
        const point = { __label: String(r[labelKey]) }
        series.forEach((s) => {
          const v = r[s.key]
          point[s.key] = typeof v === 'number' ? v : Number(v) || 0
        })
        return point
      })
  }, [rows, labelKey, series])

  const shown = data.slice(0, MAX_CATEGORIES)
  const truncated = data.length - shown.length

  // Nothing to compare — a one-bar chart says less than the number itself.
  if (shown.length < 2) return null

  const multi = series.length > 1
  const longLabels = shown.some((d) => d.__label.length > 8)

  return (
    <div className="mb-3">
      <div style={{ width: '100%', height: height || 280 }}>
        <ResponsiveContainer>
          {type === 'line' ? (
            <LineChart data={shown} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_GRID} />
              <XAxis dataKey="__label" tick={CHART_AXIS} tickLine={false} />
              <YAxis tick={CHART_AXIS} tickLine={false} axisLine={false} width={48} />
              <Tooltip />
              {multi && <Legend iconType="plainline" wrapperStyle={{ fontSize: 12 }} />}
              {series.map((s, i) => (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.label || s.key}
                  stroke={CHART_SERIES[i % CHART_SERIES.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          ) : (
            <BarChart
              data={shown}
              margin={{ top: 8, right: 12, bottom: longLabels ? 72 : 8, left: 0 }}
              barGap={2}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_GRID} />
              <XAxis
                dataKey="__label"
                tick={CHART_AXIS}
                tickLine={false}
                interval={0}
                angle={longLabels ? -35 : 0}
                textAnchor={longLabels ? 'end' : 'middle'}
                height={longLabels ? 80 : 30}
                tickFormatter={(v) => shorten(v)}
              />
              <YAxis tick={CHART_AXIS} tickLine={false} axisLine={false} width={48} />
              <Tooltip />
              {multi && <Legend wrapperStyle={{ fontSize: 12 }} />}
              {series.map((s, i) => (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  name={s.label || s.key}
                  fill={CHART_SERIES[i % CHART_SERIES.length]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {truncated > 0 && (
        <div className="text-medium-emphasis" style={{ fontSize: 12 }}>
          Chart shows the first {MAX_CATEGORIES} of {data.length}. The table below has them all.
        </div>
      )}
    </div>
  )
}

ReportChart.propTypes = {
  rows: PropTypes.array,
  labelKey: PropTypes.string,
  series: PropTypes.arrayOf(
    PropTypes.shape({ key: PropTypes.string.isRequired, label: PropTypes.string }),
  ).isRequired,
  type: PropTypes.oneOf(['bar', 'line']),
  height: PropTypes.number,
}

export default ReportChart
