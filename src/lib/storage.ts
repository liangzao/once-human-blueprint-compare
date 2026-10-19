import {
  DEFAULT_PARAMS,
  DEFAULT_WEIGHTS,
  SUB_ATTR_CATALOG,
  type Blueprint,
  type ModelParams,
  type ScoreWeights,
  type SubAttrId,
} from '@/types/blueprint'

const KEY_BPS = 'oh-blueprints:v2'
const KEY_PARAMS = 'oh-params:v2'
const KEY_WEIGHTS = 'oh-weights:v2'

export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function read<T>(key: string, fallback: T): T {
  try {
    const s = localStorage.getItem(key)
    return s ? (JSON.parse(s) as T) : fallback
  } catch {
    return fallback
  }
}

export function loadBlueprints(): Blueprint[] {
  const bps = read<Blueprint[] | null>(KEY_BPS, null)
  if (bps === null) {
    const sample = sampleBlueprints()
    saveBlueprints(sample)
    return sample
  }
  return bps
}

export function saveBlueprints(bps: Blueprint[]) {
  try {
    localStorage.setItem(KEY_BPS, JSON.stringify(bps))
  } catch (e) {
    console.warn('保存失败（可能是截图过大）', e)
  }
}

export function loadParams(): ModelParams {
  return read(KEY_PARAMS, DEFAULT_PARAMS)
}
export function saveParams(p: ModelParams) {
  localStorage.setItem(KEY_PARAMS, JSON.stringify(p))
}
export function loadWeights(): ScoreWeights {
  return read(KEY_WEIGHTS, DEFAULT_WEIGHTS)
}
export function saveWeights(w: ScoreWeights) {
  localStorage.setItem(KEY_WEIGHTS, JSON.stringify(w))
}

/** 导出 JSON 文件 */
export function exportJson(bps: Blueprint[]) {
  const blob = new Blob([JSON.stringify(bps, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `七日世界精校图纸_${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const VALID_SUB_IDS = new Set(SUB_ATTR_CATALOG.map((a) => a.id))

/** 解析导入的 JSON，返回合法的图纸数组（非法则抛错） */
export function parseImport(text: string): Blueprint[] {
  const data = JSON.parse(text)
  const arr = Array.isArray(data) ? data : data?.blueprints
  if (!Array.isArray(arr)) throw new Error('JSON 格式不正确：需要图纸数组')
  const out: Blueprint[] = []
  for (const item of arr) {
    if (!item || typeof item !== 'object') continue
    const attack = Number(item.attack)
    const subValue = Number(item.subValue)
    const subAttrId = String(item.subAttrId ?? '') as SubAttrId
    if (!Number.isFinite(attack) || attack <= 0) continue
    if (!VALID_SUB_IDS.has(subAttrId) || !Number.isFinite(subValue)) continue
    out.push({
      id: typeof item.id === 'string' ? item.id : uid(),
      name: String(item.name ?? '未命名图纸'),
      weapon: String(item.weapon ?? ''),
      rarity: String(item.rarity ?? ''),
      note: item.note ? String(item.note) : undefined,
      image: typeof item.image === 'string' ? item.image : undefined,
      createdAt: typeof item.createdAt === 'number' ? item.createdAt : Date.now(),
      attack,
      subAttrId,
      subValue,
    })
  }
  if (out.length === 0) throw new Error('没有可导入的图纸数据')
  return out
}

/** 压缩截图到 dataURL（最长边 960px，jpeg 0.8） */
export function fileToCompressedDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, 960 / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(url)
        reject(new Error('无法处理图片'))
        return
      }
      ctx.drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.8))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('图片读取失败'))
    }
    img.src = url
  })
}

function sampleBlueprints(): Blueprint[] {
  const now = Date.now()
  return [
    {
      id: uid(),
      name: '图纸A · 暴击率',
      weapon: '大白鲨',
      rarity: '传说(金)',
      attack: 452,
      subAttrId: 'crit_rate',
      subValue: 12.5,
      createdAt: now - 2000,
    },
    {
      id: uid(),
      name: '图纸B · 弱点伤害',
      weapon: '大白鲨',
      rarity: '传说(金)',
      attack: 468,
      subAttrId: 'weakspot_dmg',
      subValue: 24,
      createdAt: now - 1000,
    },
    {
      id: uid(),
      name: '图纸C · 元素伤害',
      weapon: '大白鲨',
      rarity: '史诗(紫)',
      attack: 445,
      subAttrId: 'elemental_dmg',
      subValue: 15,
      createdAt: now,
    },
  ]
}
