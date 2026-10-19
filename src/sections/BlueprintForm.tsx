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
import { ImagePlus, X } from 'lucide-react'
import {
  RARITIES,
  SUB_ATTR_CATALOG,
  WEAPON_SUGGESTIONS,
  type Blueprint,
  type SubAttrId,
} from '@/types/blueprint'
import { fileToCompressedDataUrl, uid } from '@/lib/storage'

interface Props {
  editing: Blueprint | null
  onSave: (bp: Blueprint) => void
  onCancelEdit: () => void
}

export default function BlueprintForm({ editing, onSave, onCancelEdit }: Props) {
  const [name, setName] = useState('')
  const [weapon, setWeapon] = useState('')
  const [rarity, setRarity] = useState(RARITIES[1])
  const [attack, setAttack] = useState('')
  const [subAttrId, setSubAttrId] = useState<SubAttrId>('crit_rate')
  const [subValue, setSubValue] = useState('')
  const [note, setNote] = useState('')
  const [image, setImage] = useState<string | undefined>()
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      setName(editing.name)
      setWeapon(editing.weapon)
      setRarity(editing.rarity || RARITIES[1])
      setAttack(String(editing.attack))
      setSubAttrId(editing.subAttrId)
      setSubValue(String(editing.subValue))
      setNote(editing.note ?? '')
      setImage(editing.image)
    } else {
      reset()
    }
  }, [editing])

  function reset() {
    setName('')
    setWeapon('')
    setRarity(RARITIES[1])
    setAttack('')
    setSubAttrId('crit_rate')
    setSubValue('')
    setNote('')
    setImage(undefined)
    setError('')
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
    const atk = parseFloat(attack)
    const sub = parseFloat(subValue)
    if (!name.trim()) {
      setError('请给图纸起个名字')
      return
    }
    if (!Number.isFinite(atk) || atk <= 0) {
      setError('请填写主词条攻击力加成（%）')
      return
    }
    if (!Number.isFinite(sub) || sub < 0) {
      setError('请填写副词条数值')
      return
    }
    onSave({
      id: editing?.id ?? uid(),
      name: name.trim(),
      weapon: weapon.trim(),
      rarity,
      attack: atk,
      subAttrId,
      subValue: sub,
      note: note.trim() || undefined,
      image,
      createdAt: editing?.createdAt ?? Date.now(),
    })
    reset()
    onCancelEdit()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{editing ? '编辑图纸' : '录入图纸'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>图纸名称</Label>
            <Input
              placeholder="例：大白鲨·暴击率金图纸"
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
          <div className="space-y-1.5">
            <Label>主词条 · 攻击力加成</Label>
            <div className="flex items-center gap-1">
              <Input
                placeholder="例：15"
                inputMode="decimal"
                value={attack}
                onChange={(e) => setAttack(e.target.value)}
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>副词条</Label>
            <div className="flex gap-2">
              <Select value={subAttrId} onValueChange={(v) => setSubAttrId(v as SubAttrId)}>
                <SelectTrigger className="w-[55%]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUB_ATTR_CATALOG.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-1 items-center gap-1">
                <Input
                  placeholder="数值"
                  inputMode="decimal"
                  value={subValue}
                  onChange={(e) => setSubValue(e.target.value)}
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
          </div>
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
