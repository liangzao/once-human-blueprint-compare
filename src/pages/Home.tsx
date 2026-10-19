import { useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Swords, Upload } from 'lucide-react'
import BlueprintForm from '@/sections/BlueprintForm'
import BlueprintList from '@/sections/BlueprintList'
import CompareCharts from '@/sections/CompareCharts'
import RankingTable from '@/sections/RankingTable'
import WeightSettings from '@/sections/WeightSettings'
import {
  type Blueprint,
  type ModelParams,
  type ScoreWeights,
} from '@/types/blueprint'
import { scoreBlueprints } from '@/lib/scoring'
import {
  exportJson,
  loadBlueprints,
  loadParams,
  loadWeights,
  parseImport,
  saveBlueprints,
  saveParams,
  saveWeights,
} from '@/lib/storage'
import '../App.css'

export default function Home() {
  const [blueprints, setBlueprints] = useState<Blueprint[]>(() => loadBlueprints())
  const [params, setParams] = useState<ModelParams>(() => loadParams())
  const [weights, setWeights] = useState<ScoreWeights>(() => loadWeights())
  const [editing, setEditing] = useState<Blueprint | null>(null)
  const [importMsg, setImportMsg] = useState('')
  const importRef = useRef<HTMLInputElement>(null)

  const scores = useMemo(
    () => scoreBlueprints(blueprints, params, weights),
    [blueprints, params, weights],
  )
  const bestId = scores[0]?.id

  function commit(next: Blueprint[]) {
    setBlueprints(next)
    saveBlueprints(next)
  }

  function onSave(bp: Blueprint) {
    const idx = blueprints.findIndex((b) => b.id === bp.id)
    commit(idx >= 0 ? blueprints.map((b) => (b.id === bp.id ? bp : b)) : [bp, ...blueprints])
  }

  function onDelete(id: string) {
    commit(blueprints.filter((b) => b.id !== id))
    if (editing?.id === id) setEditing(null)
  }

  function onWeights(w: ScoreWeights) {
    setWeights(w)
    saveWeights(w)
  }
  function onParams(p: ModelParams) {
    setParams(p)
    saveParams(p)
  }

  async function onImportFile(file: File | undefined) {
    if (!file) return
    try {
      const imported = parseImport(await file.text())
      const existing = new Set(blueprints.map((b) => b.id))
      const fresh = imported.map((b) =>
        existing.has(b.id) ? { ...b, id: `${b.id}-imp${Date.now()}` } : b,
      )
      commit([...fresh, ...blueprints])
      setImportMsg(`已导入 ${fresh.length} 张图纸`)
    } catch (e) {
      setImportMsg(e instanceof Error ? `导入失败：${e.message}` : '导入失败')
    }
    if (importRef.current) importRef.current.value = ''
    setTimeout(() => setImportMsg(''), 4000)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-2">
            <Swords className="size-6 text-amber-500" />
            <div>
              <h1 className="text-lg font-bold leading-tight">七日世界 · 精校图纸对比</h1>
              <p className="text-xs text-zinc-400">
                录入图纸词条 roll 区间，综合最高伤害与出伤稳定度，挑出最优图纸
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={importRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => onImportFile(e.target.files?.[0])}
            />
            <Button variant="outline" size="sm" onClick={() => importRef.current?.click()}>
              <Upload className="size-4" /> 导入 JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportJson(blueprints)}
              disabled={blueprints.length === 0}
            >
              <Download className="size-4" /> 导出 JSON
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        {importMsg && (
          <p className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm">
            {importMsg}
          </p>
        )}

        <div className="grid items-start gap-6 lg:grid-cols-[360px_1fr]">
          <div className="space-y-6">
            <BlueprintForm
              editing={editing}
              onSave={onSave}
              onCancelEdit={() => setEditing(null)}
            />
            <WeightSettings
              weights={weights}
              params={params}
              onWeights={onWeights}
              onParams={onParams}
            />
          </div>

          <div className="space-y-6">
            <RankingTable blueprints={blueprints} scores={scores} />
            <CompareCharts blueprints={blueprints} scores={scores} />
          </div>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">图纸库</h2>
          <BlueprintList
            blueprints={blueprints}
            bestId={bestId}
            onEdit={setEditing}
            onDelete={onDelete}
          />
        </section>

        <footer className="border-t border-zinc-800 pt-4 text-xs text-zinc-500">
          <p>
            评分说明：伤害指数把武器/元素伤害作为乘区、暴击率×暴击伤害联动、弱点与特攻词条按覆盖率系数折算；
            稳定度 = 最低 roll 伤害 ÷ 满 roll 伤害 × 100，越高出伤越稳；综合分按上方权重加权。数据仅保存在本机浏览器。
          </p>
        </footer>
      </main>
    </div>
  )
}
