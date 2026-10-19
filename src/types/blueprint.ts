// 七日世界 · 武器精校图纸 数据模型

/** 副词条可选类型（游戏内精校图纸只有一主一副两条词条） */
export type SubAttrId = 'crit_rate' | 'crit_dmg' | 'weakspot_dmg' | 'elemental_dmg'

export interface AttrDef {
  id: SubAttrId
  label: string
  unit: string
}

/** 副词条目录：暴击率 / 暴击伤害 / 弱点伤害 / 元素伤害 */
export const SUB_ATTR_CATALOG: AttrDef[] = [
  { id: 'crit_rate', label: '暴击率', unit: '%' },
  { id: 'crit_dmg', label: '暴击伤害', unit: '%' },
  { id: 'weakspot_dmg', label: '弱点伤害加成', unit: '%' },
  { id: 'elemental_dmg', label: '元素伤害加成', unit: '%' },
]

export function subAttrDef(id: string): AttrDef {
  return (
    SUB_ATTR_CATALOG.find((a) => a.id === id) ?? {
      id: 'elemental_dmg',
      label: id,
      unit: '%',
    }
  )
}

/**
 * 精校图纸：主词条固定为攻击力加成（百分比），
 * 副词条为四类之一（百分比）。所有数值均为确切值。
 */
export interface Blueprint {
  id: string
  name: string
  weapon: string
  rarity: string
  /** 主词条：攻击力加成（百分比确切数值） */
  attack: number
  /** 副词条类型 */
  subAttrId: SubAttrId
  /** 副词条数值（%） */
  subValue: number
  /** 截图（压缩后的 dataURL），可选 */
  image?: string
  note?: string
  createdAt: number
}

/** 伤害模型可调参数 */
export interface ModelParams {
  /** 面板基础暴击率（%），默认 5 */
  baseCritRate: number
  /** 面板基础暴击伤害（%），默认 150 */
  baseCritDmg: number
  /** 弱点命中率系数 0~1，默认 0.6 */
  weakUptime: number
}

/** 综合评分权重 */
export interface ScoreWeights {
  /** 最高伤害权重 0~100 */
  damage: number
  /** 出伤稳定权重 0~100 */
  stability: number
}

export const DEFAULT_PARAMS: ModelParams = {
  baseCritRate: 5,
  baseCritDmg: 150,
  weakUptime: 0.6,
}
export const DEFAULT_WEIGHTS: ScoreWeights = { damage: 60, stability: 40 }

export const RARITIES = ['稀有(蓝)', '史诗(紫)', '传说(金)']

export const WEAPON_SUGGESTIONS = [
  '大白鲨',
  '狞笑',
  '黄泉',
  '恶灭',
  '冰雨',
  '猎食者',
  '临界脉冲',
  '重锤',
  '冰魄',
  '腐蚀',
]
