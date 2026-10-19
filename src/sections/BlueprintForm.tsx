import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, ImagePlus, X } from 'lucide-react'
import {
  ATTR_CATALOG,
  RARITIES,
  WEAPON_SUGGESTIONS,
  attrDefById,
  type Blueprint,
  type BlueprintEntry,
} from '@/types/blueprint'
import { fileToCompressedDataUrl, uid } from '@/lib/storage'

interface Props {
  editing: Blueprint | null
  onSave: (bp: Blueprint) => void
  onCancelEdit: () => void
}

interface DraftEntry {
  id: string
  attrId: string
  min: string
  max: string
}

const emptyDraft = (): DraftEntry => ({ id: uid(), attrId: 'weapon_dmg', min: '', max: '' })

export default function BlueprintForm({ editing, onSave, onCancelEdit }: Props) {
  const [name, setName] = useState('')
  const [weapon, setWeapon] = useState('')
  const [rarity, setRarity] = useState(RARITIES[1])
  const [note, setNote] = useState('')
  const [image, setImage] = useState<string | undefined>()
  const [entries, setEntries] = useState<DraftEntry[]>([emptyDraft()])
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      setName(editing.name)
      setWeapon(editing.weapon)
      setRarity(editing.rarity || RARITIES[1])
      setNote(editing.note ?? '')
      setImage(editing.image)
      setEntries(
        editing.entries.map((e) => ({
          id: e.id,
          attrId: e.attrId,
          min: String(e.min),
          max: String(e.max),
        })),
      )
    } else {
      reset()
    }
  }, [editing])

  function reset() {
    setName('')
    setWeapon('')
    setRarity(RARITIES[1])
    setNote('')
    setImage(undefined)
    setEntries([emptyDraft()])
    setError('')
  }

  function updateEntry(id: string, patch: Partial<DraftEntry>) {
    setEntries((list) => list.map((e) => (e.id === id ? { ...e, ...patch } : e)))
  }

  async function onPickImage(file: File | undefined) {
    if (!file) return
    try {
      setImage(await fileToCompressedDataUrl(file))
    } catch {
      setError('图片处理失败，请换一张试试')
    }
  }

  function submit() {
    setError('')
    const rows: BlueprintEntry[] = []
    for (const d of entries) {
      const min = parseFloat(d.min)
      const max = parseFloat(d.max)
      if (Number.isNaN(min) && Number.isNaN(max)) continue
      if (Number.isNaN(min) || Number.isNaN(max)) {
        setError('词条数值不完整：每条词条都要填下限和上限')
        return
      }
      if (min > max) {
        setError(`词条「${attrDefById(d.attrId).label}」下限不能大于上限`)
        return
      }
      rows.push({ id: d.id, attrId: d.attrId, min, max })
    }
    if (!name.trim()) {
      setError('请给图纸起个名字')
      return
    }
    if (rows.length === 0) {
      setError('至少需要一条词条')
      return
    }
    onSave({
      id: editing?.id ?? uid(),
      name: name.trim(),
      weapon: weapon.trim(),
      rarity,
      note: note.trim() || undefined,
      image,
      entries: rows,
      createdAt: editing?.createdAt ?? Date.now(),
    })
    reset()
    onCancelEdit()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {editing ? '编辑图纸' : '录入图纸'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1.5">
            <Label>图纸名称</Label>
            <Input
              placeholder="例：大白鲨·双暴金图纸"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>适用武器</Label>
            <Input
              list="weapon-suggestions"
              placeholder="例：大白鲨"
              value={weapon}
              onChange={(e) => setWeapon(e.target.value)}
            />
            <datalist id="weapon-suggestions">
              {WEAPON_SUGGESTIONS.map((w) => (
                <option key={w} value={w} />
              ))}
            </datalist>
          </div>
          <div className="space-y-1.5">
            <Label>品质</Label>
            <Select value={rarity} onValueChange={setRarity}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RARITIES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>词条（数值填 roll 区间，单位 %）</Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setEntries((l) => [...l, emptyDraft()])}
            >
              <Plus className="size-4" /> 加词条
            </Button>
          </div>
          {entries.map((d) => (
            <div key={d.id} className="flex items-center gap-2">
              <Select value={d.attrId} onValueChange={(v) => updateEntry(d.id, { attrId: v })}>
                <SelectTrigger className="w-[45%]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ATTR_CATALOG.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                className="w-0 flex-1"
                placeholder="下限"
                inputMode="decimal"
                value={d.min}
                onChange={(e) => updateEntry(d.id, { min: e.target.value })}
              />
              <span className="text-muted-foreground">~</span>
              <Input
                className="w-0 flex-1"
                placeholder="上限"
                inputMode="decimal"
                value={d.max}
                onChange={(e) => updateEntry(d.id, { max: e.target.value })}
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                disabled={entries.length <= 1}
                onClick={() => setEntries((l) => l.filter((e) => e.id !== d.id))}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="space-y-1.5">
          <Label>截图（可选，仅存本地）</Label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onPickImage(e.target.files?.[0])}
          />
          {image ? (
            <div className="relative w-fit">
              <img src={image} alt="图纸截图" className="max-h-40 rounded-md border" />
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute -right-2 -top-2 size-6"
                onClick={() => setImage(undefined)}
              >
                <X className="size-3" />
              </Button>
            </div>
          ) : (
            <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>
              <ImagePlus className="size-4" /> 上传图纸截图
            </Button>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>备注（可选）</Label>
          <Textarea
            rows={2}
            placeholder="例：PVE 用，打畸变体 Boss"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-2">
          <Button className="flex-1" onClick={submit}>
            {editing ? '保存修改' : '添加图纸'}
          </Button>
          {editing && (
            <Button variant="outline" onClick={onCancelEdit}>
              取消
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
