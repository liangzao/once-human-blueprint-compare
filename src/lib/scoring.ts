import {
  attrDefById,
  type Blueprint,
  type ModelParams,
  type ScoreWeights,
} from '@/types/blueprint'

export type RollPoint = 'min' | 'avg' | 'max'

/**
 * 伤害指数：把图纸上的伤害类词条折算成一个综合伤害倍率。
 * - 武器伤害 / 元素伤害：独立乘区
 * - 暴击率 × 暴击伤害：1 + rate × dmg（暴击率封顶 100%）
 * - 弱点伤害：乘以弱点命中率系数
 * - 对精英/畸变体/首领：乘以覆盖率系数
 * - 其他加伤：统一加区
 * 非伤害词条不参与计算。
 */
export function damageIndex(
  bp: Blueprint,
  roll: RollPoint,
  params: ModelParams,
): number {
  let mult = 1
  let linear = 0
  let critRate = 0
  let critDmg = 0
  let weak = 0
  let boss = 0

  for (const e of bp.entries) {
    const def = attrDefById(e.attrId)
    if (def.kind === 'utility') continue
    const raw =
      roll === 'min' ? e.min : roll === 'max' ? e.max : (e.min + e.max) / 2
    const v = raw / 100
    switch (def.kind) {
      case 'weaponDmg':
      case 'elemental':
        mult *= 1 + v
        break
      case 'critRate':
        critRate += v
        break
      case 'critDmg':
        critDmg += v
        break
      case 'weakspot':
        weak += v
        break
      case 'bossDmg':
        boss += v
        break
      case 'otherDmg':
        linear += v
        break
    }
  }

  critRate = Math.min(critRate, 1)
  const critFactor = 1 + critRate * critDmg
  const weakFactor = 1 + weak * params.weakUptime
  const bossFactor = 1 + boss * params.bossUptime

  return mult * critFactor * weakFactor * bossFactor * (1 + linear)
}

export interface BlueprintScore {
  id: string
  /** 最高伤害指数（满 roll） */
  dMax: number
  /** 期望伤害指数（词条取中值） */
  dAvg: number
  /** 最低伤害指数（最低 roll） */
  dMin: number
  /** 出伤稳定度 = dMin / dMax × 100，越接近 100 出伤越稳 */
  stability: number
  /** 伤害上限得分：相对当前图纸池最高值的 0~100 分 */
  damageScore: number
  /** 期望伤害得分：相对最高期望值的 0~100 分 */
  avgScore: number
  /** 综合分 = 伤害权重 × damageScore + 稳定权重 × stability */
  total: number
  rank: number
}

/** 计算整池图纸评分并排名（综合分降序） */
export function scoreBlueprints(
  bps: Blueprint[],
  params: ModelParams,
  weights: ScoreWeights,
): BlueprintScore[] {
  const raw = bps.map((bp) => {
    const dMax = damageIndex(bp, 'max', params)
    const dAvg = damageIndex(bp, 'avg', params)
    const dMin = damageIndex(bp, 'min', params)
    const stability = dMax > 0 ? (dMin / dMax) * 100 : 0
    return { id: bp.id, dMax, dAvg, dMin, stability }
  })

  const bestDMax = Math.max(...raw.map((r) => r.dMax), 1e-9)
  const bestDAvg = Math.max(...raw.map((r) => r.dAvg), 1e-9)
  const wSum = Math.max(weights.damage + weights.stability, 1e-9)
  const wD = weights.damage / wSum
  const wS = weights.stability / wSum

  const scored = raw.map((r) => {
    const damageScore = (r.dMax / bestDMax) * 100
    const avgScore = (r.dAvg / bestDAvg) * 100
    return {
      ...r,
      damageScore,
      avgScore,
      total: wD * damageScore + wS * r.stability,
    }
  })

  scored.sort((a, b) => b.total - a.total)
  return scored.map((s, i) => ({ ...s, rank: i + 1 }))
}

export function fmt(n: number, digits = 2): string {
  return n.toFixed(digits)
}

export function fmtPct(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`
}
