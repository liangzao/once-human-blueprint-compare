import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
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

export default function CompareCharts({ blueprints, scores }: Props) {
  const byId = useMemo(() => new Map(blueprints.map((b) => [b.id, b])), [blueprints])

  if (scores.length === 0) return null

  const barData = scores.map((s) => ({
    name: byId.get(s.id)?.name ?? s.id,
    综合分: +fmt(s.total),
    最高伤害分: +fmt(s.damageScore),
    稳定度: +fmt(s.stability),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">评分对比</CardTitle>
      </CardHeader>
      <CardContent className="h-72 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData} margin={{ left: -20, right: 8, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="name"
              fontSize={11}
              interval={0}
              angle={-15}
              textAnchor="end"
              height={50}
            />
            <YAxis fontSize={12} domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="综合分" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="最高伤害分" fill="#38bdf8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="稳定度" fill="#34d399" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
