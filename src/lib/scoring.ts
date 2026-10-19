import type { Blueprint, ModelParams, ScoreWeights } from '@/types/blueprint'

interface DamageProfile {
  /** 最高伤害倍率（暴击与弱点同时触发） */
  dMax: number
  /** 期望伤害倍率（仅用于内部稳定度计算） */
  dAvg: number
  /** 伤害波动（标准差，仅用于内部稳定度计算） */
  sigma: number
}

/**
 * 伤害模型（攻击力为百分比加成）：
 * - 基础倍率 = (1 + 攻击力加成) × (1 + 元素伤害加成)，全程生效、无波动
 * - 暴击因子 = 1 + 暴击率 × 暴击伤害（期望），波动 sqrt(p(1-p)) × 暴击伤害
 * - 弱点因子 = 1 + 弱点命中率 × 弱点伤害（期望），波动 sqrt(q(1-q)) × 弱点伤害
 * 最高伤害 = 基础 × (1+暴击伤害) × (1+弱点伤害)（暴击与弱点同时触发）
 */
export function damageProfile(bp: Blueprint, params: ModelParams): DamageProfile {
  const p =
    (params.baseCritRate + (bp.subAttrId === 'crit_rate' ? bp.subValue : 0)) / 100
  const d =
    (params.baseCritDmg + (bp.subAttrId === 'crit_dmg' ? bp.subValue : 0)) / 100
  const v = (bp.subAttrId === 'weakspot_dmg' ? bp.subValue : 0) / 100
  const e = (bp.subAttrId === 'elemental_dmg' ? bp.subValue : 0) / 100
  const q = Math.min(Math.max(params.weakUptime, 0), 1)

  const base = (1 + bp.attack / 100) * (1 + e)
  const critP = Math.min(Math.max(p, 0), 1)

  const mc = 1 + critP * d
  const sc = Math.sqrt(critP * (1 - critP)) * d
  const mw = 1 + q * v
  const sw = Math.sqrt(q * (1 - q)) * v

  const dAvg = base * mc * mw
  const dMax = base * (1 + d) * (1 + v)
  // 两个独立随机因子的乘积方差：E[A²]E[B²] − (E[A]E[B])²
  const variance =
    base * base * ((sc * sc + mc * mc) * (sw * sw + mw * mw) - mc * mc * mw * mw)
  const sigma = Math.sqrt(Math.max(variance, 0))

  return { dMax, dAvg, sigma }
}

export interface BlueprintScore {
  id: string
  /** 最高伤害倍率 */
  dMax: number
  /** 出伤稳定度 = 期望 ÷ (期望 + 波动) × 100，越接近 100 出伤越稳 */
  stability: number
  /** 最高伤害得分：相对当前图纸池最高值的 0~100 分 */
  damageScore: number
  /** 综合分 = 伤害权重 × damageScore + 稳定权重 × stability */
  total: number
  rank: number
}

/** 计算整池图纸评分并排名（综合分降序），评分维度只有最高伤害与出伤稳定 */
export function scoreBlueprints(
  bps: Blueprint[],
  params: ModelParams,
  weights: ScoreWeights,
): BlueprintScore[] {
  const raw = bps.map((bp) => {
    const { dMax, dAvg, sigma } = damageProfile(bp, params)
    const stability = dAvg + sigma > 0 ? (dAvg / (dAvg + sigma)) * 100 : 100
    return { id: bp.id, dMax, stability }
  })

  const bestDMax = Math.max(...raw.map((r) => r.dMax), 1e-9)
  const wSum = Math.max(weights.damage + weights.stability, 1e-9)
  const wD = weights.damage / wSum
  const wS = weights.stability / wSum

  const scored = raw.map((r) => {
    const damageScore = (r.dMax / bestDMax) * 100
    return {
      ...r,
      damageScore,
      total: wD * damageScore + wS * r.stability,
    }
  })

  scored.sort((a, b) => b.total - a.total)
  return scored.map((s, i) => ({ ...s, rank: i + 1 }))
}

export function fmt(n: number, digits = 1): string {
  return n.toFixed(digits)
}
