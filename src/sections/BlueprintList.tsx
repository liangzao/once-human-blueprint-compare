import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Pencil, Trash2 } from 'lucide-react'
import { subAttrDef, type Blueprint } from '@/types/blueprint'

interface Props {
  blueprints: Blueprint[]
  bestId?: string
  onEdit: (bp: Blueprint) => void
  onDelete: (id: string) => void
}

export default function BlueprintList({ blueprints, bestId, onEdit, onDelete }: Props) {
  if (blueprints.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          还没有图纸，先录入或导入 JSON 吧
        </CardContent>
      </Card>
    )
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {blueprints.map((bp) => (
        <Card
          key={bp.id}
          className={bp.id === bestId ? 'border-amber-500 ring-1 ring-amber-500' : ''}
        >
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                  <span className="truncate">{bp.name}</span>
                  {bp.id === bestId && (
                    <Badge className="bg-amber-500 text-black hover:bg-amber-500">推荐</Badge>
                  )}
                </CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  {[bp.weapon, bp.rarity].filter(Boolean).join(' · ')}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button size="icon" variant="ghost" onClick={() => onEdit(bp)}>
                  <Pencil className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => onDelete(bp.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {bp.image && (
              <img
                src={bp.image}
                alt={bp.name}
                className="max-h-32 w-full rounded-md border bg-black/20 object-contain"
              />
            )}
            <ul className="space-y-1 text-sm">
              <li className="flex justify-between gap-2">
                <span className="text-muted-foreground">攻击力（主词条）</span>
                <span className="font-mono">{bp.attack}</span>
              </li>
              <li className="flex justify-between gap-2">
                <span className="text-muted-foreground">
                  {subAttrDef(bp.subAttrId).label}（副词条）
                </span>
                <span className="font-mono">{bp.subValue}%</span>
              </li>
            </ul>
            {bp.note && <p className="text-xs text-muted-foreground">备注：{bp.note}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
