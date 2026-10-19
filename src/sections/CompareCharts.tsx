import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Blueprint } from '@/types/blueprint'
import { fmt, type BlueprintScore } from '@/lib/scoring'

interface Props {
  blueprints: Blueprint[]
  scores: BlueprintScore[]
}

const COLORS = ['#f59e0b', '#38bdf8', '#a78bfa', '#34d399', '#f472b6', '#fb7185']

export default function CompareCharts({ blueprints, scores }: Props) {
  const [selected, setSelected] = useState<string[]>([])

  const byId = useMemo(() => new Map(blueprints.map((b) => [b.id, b])), [blueprints])

  if (scores.length === 0) return null

  const barData = scores.map((s) => ({
    name: byId.get(s.id)?.name ?? s.id,
    综合分: +fmt(s.total, 1),
    伤害上限分: +fmt(s.damageScore, 1),
    期望伤害分: +fmt(s.avgScore, 1),
    稳定度: +fmt(s.stability, 1),
  }))

  const shown = (selected.length > 0 ? selected : scores.slice(0, 3).map((s) => s.id))
    .map((id) => scores.find((s) => s.id === id))
    .filter((s): s is BlueprintScore => !!s)

  const radarData = [
    { metric: '伤害上限', key: 'damageScore' as const },
    { metric: '期望伤害', key: 'avgScore' as const },
    { metric: '出伤稳定', key: 'stability' as const },
    { metric: '综合分', key: 'total' as const },
  ].map(({ metric, key }) => {
    const row: Record<string, string | number> = { metric }
    for (const s of shown) {
      row[byId.get(s.id)?.name ?? s.id] = +fmt(s[key], 1)
    }
    return row
  })

  function toggle(id: string, checked: boolean) {
    setSelected((list) =>
      checked ? [...list, id] : list.filter((x) => x !== id),
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">评分对比</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ left: -16, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="综合分" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="伤害上限分" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="期望伤害分" fill="#a78bfa" radius={[4, 4, 0, 0]} />
              <Bar dataKey="稳定度" fill="#34d399" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">雷达对比</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {scores.map((s) => (
              <div key={s.id} className="flex items-center gap-1.5">
                <Checkbox
                  id={`sel-${s.id}`}
                  checked={shown.some((x) => x.id === s.id)}
                  onCheckedChange={(c) => toggle(s.id, c === true)}
                />
                <Label htmlFor={`sel-${s.id}`} className="text-sm font-normal">
                  {byId.get(s.id)?.name}
                </Label>
              </div>
            ))}
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid opacity={0.3} />
                <PolarAngleAxis dataKey="metric" fontSize={12} />
                <PolarRadiusAxis domain={[0, 100]} fontSize={10} />
                {shown.map((s, i) => {
                  const name = byId.get(s.id)?.name ?? s.id
                  return (
                    <Radar
                      key={s.id}
                      name={name}
                      dataKey={name}
                      stroke={COLORS[i % COLORS.length]}
                      fill={COLORS[i % COLORS.length]}
                      fillOpacity={0.25}
                    />
                  )
                })}
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
