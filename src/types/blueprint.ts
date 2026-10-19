// 七日世界 · 武器精校图纸 数据模型

/** 词条对伤害模型的作用方式 */
export type AttrKind =
  | 'weaponDmg' // 武器/枪械伤害加成：乘区
  | 'elemental' // 元素伤害加成：乘区
  | 'critRate' // 暴击率：与暴击伤害联动
  | 'critDmg' // 暴击伤害：与暴击率联动
  | 'weakspot' // 弱点伤害：乘以弱点命中率系数
  | 'bossDmg' // 对精英/畸变体/首领伤害：乘以覆盖率系数
  | 'otherDmg' // 其他线性加伤：统一加区
  | 'utility' // 非伤害词条（换弹、弹匣等），不参与伤害评分

export interface AttrDef {
  id: string
  label: string
  kind: AttrKind
  /** 数值单位说明，如 % */
  unit: string
}

/** 内置词条目录（伤害类 + 常用辅助类） */
export const ATTR_CATALOG: AttrDef[] = [
  { id: 'weapon_dmg', label: '武器伤害加成', kind: 'weaponDmg', unit: '%' },
  { id: 'gun_dmg', label: '枪械伤害加成', kind: 'weaponDmg', unit: '%' },
  { id: 'elemental_dmg', label: '元素伤害加成', kind: 'elemental', unit: '%' },
  { id: 'burn_dmg', label: '炽能伤害加成', kind: 'elemental', unit: '%' },
  { id: 'frost_dmg', label: '霜寒伤害加成', kind: 'elemental', unit: '%' },
  { id: 'shock_dmg', label: '电离伤害加成', kind: 'elemental', unit: '%' },
  { id: 'crit_rate', label: '暴击率', kind: 'critRate', unit: '%' },
  { id: 'crit_dmg', label: '暴击伤害', kind: 'critDmg', unit: '%' },
  { id: 'weakspot_dmg', label: '弱点伤害加成', kind: 'weakspot', unit: '%' },
  { id: 'elite_dmg', label: '对精英敌人伤害', kind: 'bossDmg', unit: '%' },
  { id: 'deviant_dmg', label: '对畸变体伤害', kind: 'bossDmg', unit: '%' },
  { id: 'boss_dmg', label: '对首领伤害', kind: 'bossDmg', unit: '%' },
  { id: 'other_dmg', label: '其他伤害加成', kind: 'otherDmg', unit: '%' },
  { id: 'reload_speed', label: '换弹速度', kind: 'utility', unit: '%' },
  { id: 'mag_capacity', label: '弹匣容量', kind: 'utility', unit: '%' },
  { id: 'stability', label: '武器稳定性', kind: 'utility', unit: '%' },
  { id: 'draw_speed', label: '切枪速度', kind: 'utility', unit: '%' },
  { id: 'move_speed', label: '移动速度', kind: 'utility', unit: '%' },
]

export function attrDefById(id: string): AttrDef {
  return (
    ATTR_CATALOG.find((a) => a.id === id) ?? {
      id,
      label: id,
      kind: 'utility',
      unit: '%',
    }
  )
}

/** 一条精校词条：数值有上下限（roll 区间） */
export interface BlueprintEntry {
  id: string
  attrId: string
  /** 自定义词条名（attrId 为 custom 时使用） */
  customLabel?: string
  min: number
  max: number
}

export interface Blueprint {
  id: string
  name: string
  weapon: string
  rarity: string
  entries: BlueprintEntry[]
  /** 截图（压缩后的 dataURL），可选 */
  image?: string
  note?: string
  createdAt: number
}

/** 伤害模型可调参数 */
export interface ModelParams {
  /** 弱点命中率系数 0~1，默认 0.6 */
  weakUptime: number
  /** 对精英/畸变体/首领词条的覆盖率系数 0~1，默认 0.7 */
  bossUptime: number
}

/** 综合评分权重 */
export interface ScoreWeights {
  /** 最高伤害权重 0~100 */
  damage: number
  /** 出伤稳定权重 0~100 */
  stability: number
}

export const DEFAULT_PARAMS: ModelParams = { weakUptime: 0.6, bossUptime: 0.7 }
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
