import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import type { ModelParams, ScoreWeights } from '@/types/blueprint'

interface Props {
  weights: ScoreWeights
  params: ModelParams
  onWeights: (w: ScoreWeights) => void
  onParams: (p: ModelParams) => void
}

export default function WeightSettings({ weights, params, onWeights, onParams }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">评分模型设置</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>最高伤害权重</Label>
              <span className="font-mono text-sm text-muted-foreground">{weights.damage}%</span>
            </div>
            <Slider
              value={[weights.damage]}
              min={0}
              max={100}
              step={5}
              onValueChange={([v]) => onWeights({ ...weights, damage: v })}
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>出伤稳定权重</Label>
              <span className="font-mono text-sm text-muted-foreground">{weights.stability}%</span>
            </div>
            <Slider
              value={[weights.stability]}
              min={0}
              max={100}
              step={5}
              onValueChange={([v]) => onWeights({ ...weights, stability: v })}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            综合分 = 伤害权重 × 伤害上限分 + 稳定权重 × 稳定度。两项权重会按比例归一化。
          </p>
        </div>
        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>弱点命中率系数</Label>
              <span className="font-mono text-sm text-muted-foreground">
                {Math.round(params.weakUptime * 100)}%
              </span>
            </div>
            <Slider
              value={[params.weakUptime * 100]}
              min={0}
              max={100}
              step={5}
              onValueChange={([v]) => onParams({ ...params, weakUptime: v / 100 })}
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>精英/畸变体/首领词条覆盖率</Label>
              <span className="font-mono text-sm text-muted-foreground">
                {Math.round(params.bossUptime * 100)}%
              </span>
            </div>
            <Slider
              value={[params.bossUptime * 100]}
              min={0}
              max={100}
              step={5}
              onValueChange={([v]) => onParams({ ...params, bossUptime: v / 100 })}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            弱点/特攻词条不是全程生效，用系数折算进伤害指数。按你的实战习惯调整。
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
