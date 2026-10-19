import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Pencil, Trash2 } from 'lucide-react'
import { attrDefById, type Blueprint } from '@/types/blueprint'

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
          还没有图纸，先在左侧录入或导入 JSON 吧
        </CardContent>
      </Card>
    )
  }
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {blueprints.map((bp) => (
        <Card key={bp.id} className={bp.id === bestId ? 'border-amber-500 ring-1 ring-amber-500' : ''}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  {bp.name}
                  {bp.id === bestId && (
                    <Badge className="bg-amber-500 text-black hover:bg-amber-500">推荐</Badge>
                  )}
                </CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  {[bp.weapon, bp.rarity].filter(Boolean).join(' · ')}
                </p>
              </div>
              <div className="flex gap-1">
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
              <img src={bp.image} alt={bp.name} className="max-h-32 w-full rounded-md border object-contain bg-black/20" />
            )}
            <ul className="space-y-1 text-sm">
              {bp.entries.map((e) => {
                const def = attrDefById(e.attrId)
                return (
                  <li key={e.id} className="flex justify-between gap-2">
                    <span className="text-muted-foreground">
                      {e.customLabel ?? def.label}
                      {def.kind === 'utility' && (
                        <span className="ml-1 text-xs">(辅助)</span>
                      )}
                    </span>
                    <span className="font-mono">
                      {e.min}%~{e.max}%
                    </span>
                  </li>
                )
              })}
            </ul>
            {bp.note && <p className="text-xs text-muted-foreground">备注：{bp.note}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
