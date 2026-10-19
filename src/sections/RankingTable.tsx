import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Crown } from 'lucide-react'
import { subAttrDef, type Blueprint } from '@/types/blueprint'
import { fmt, type BlueprintScore } from '@/lib/scoring'

interface Props {
  blueprints: Blueprint[]
  scores: BlueprintScore[]
}

export default function RankingTable({ blueprints, scores }: Props) {
  if (scores.length === 0) return null
  const byId = new Map(blueprints.map((b) => [b.id, b]))
  const best = scores[0]
  const bestBp = byId.get(best.id)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">排行榜与最佳推荐</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {bestBp && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-500/60 bg-amber-500/10 p-3">
            <Crown className="mt-0.5 size-5 shrink-0 text-amber-500" />
            <div className="min-w-0 text-sm">
              <p className="font-semibold">
                综合最优：{bestBp.name}
                <span className="ml-2 font-mono text-amber-600 dark:text-amber-400">
                  {fmt(best.total)} 分
                </span>
              </p>
              <p className="mt-1 text-muted-foreground">
                最高伤害倍率 {fmt(best.dMax, 2)}（得分 {fmt(best.damageScore)}），出伤稳定度{' '}
                {fmt(best.stability)}。综合权重下排名第一。
              </p>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <Table className="min-w-[520px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>图纸</TableHead>
                <TableHead className="text-right">综合分</TableHead>
                <TableHead className="text-right">最高伤害分</TableHead>
                <TableHead className="text-right">稳定度</TableHead>
                <TableHead className="text-right">最高伤害倍率</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scores.map((s) => {
                const bp = byId.get(s.id)
                if (!bp) return null
                return (
                  <TableRow key={s.id} className={s.rank === 1 ? 'bg-amber-500/10' : ''}>
                    <TableCell>
                      {s.rank === 1 ? (
                        <Badge className="bg-amber-500 text-black hover:bg-amber-500">1</Badge>
                      ) : (
                        s.rank
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{bp.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {[bp.weapon, `${subAttrDef(bp.subAttrId).label} +${bp.subValue}%`]
                          .filter(Boolean)
                          .join(' · ')}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold">
                      {fmt(s.total)}
                    </TableCell>
                    <TableCell className="text-right font-mono">{fmt(s.damageScore)}</TableCell>
                    <TableCell className="text-right font-mono">{fmt(s.stability)}</TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      ×{fmt(s.dMax, 2)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
