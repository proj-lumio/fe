import { useRef, useEffect, useCallback, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import ForceGraph2D from "react-force-graph-2d"
import { analyticsApi, companiesApi } from "@/lib/api"
import { useTranslations } from "@/hooks/useTranslations"
const GROUP_COLORS: Record<string, string> = {
  company: "#7966ff",
  document: "#22cfff",
  entity: "#ff9f43",
}

const GROUP_SIZES: Record<string, number> = {
  company: 5,
  document: 3,
  entity: 2,
}

export default function Graph() {
  const t = useTranslations()
  const containerRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<{ zoomToFit: (ms?: number, padding?: number) => void } | undefined>(undefined)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("__national__")

  const companiesQuery = useQuery({
    queryKey: ["companies"],
    queryFn: () => companiesApi.list(),
  })

  const graphQuery = useQuery({
    queryKey: ["knowledgeGraph", selectedCompanyId],
    queryFn: () =>
      selectedCompanyId === "__national__"
        ? analyticsApi.nationalGraph()
        : analyticsApi.graph(selectedCompanyId),
  })

  // Resize observer
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        })
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Zoom to fit when data loads
  useEffect(() => {
    if (graphQuery.data?.nodes?.length) {
      setTimeout(() => graphRef.current?.zoomToFit(400, 60), 300)
    }
  }, [graphQuery.data])

  const nodeCanvasObject = useCallback((node: Record<string, unknown>, ctx: CanvasRenderingContext2D) => {
    const x = node.x as number
    const y = node.y as number
    const group = (node.group as string) ?? "entity"
    const label = (node.label as string) ?? ""
    const color = GROUP_COLORS[group] ?? "#a9a9a9"
    const size = GROUP_SIZES[group] ?? 4

    // Node circle
    ctx.beginPath()
    ctx.arc(x, y, size, 0, 2 * Math.PI)
    ctx.fillStyle = color
    ctx.fill()

    // Glow
    ctx.beginPath()
    ctx.arc(x, y, size + 2, 0, 2 * Math.PI)
    ctx.fillStyle = color.replace(")", ", 0.15)").replace("rgb", "rgba").replace("#", "")
    // Use hex alpha instead
    ctx.strokeStyle = `${color}30`
    ctx.lineWidth = 3
    ctx.stroke()

    // Label
    const fontSize = group === "company" ? 3 : group === "document" ? 2 : 1.5
    ctx.font = `${fontSize}px Unbounded, sans-serif`
    ctx.textAlign = "center"
    ctx.textBaseline = "top"
    ctx.fillStyle = "#ffffff"
    ctx.fillText(label, x, y + size + 3)
  }, [])

  const linkColor = useCallback(() => "rgba(255,255,255,0.2)", [])

  const data = graphQuery.data
  const hasNodes = (data?.nodes?.length ?? 0) > 0

  const graphData = hasNodes
    ? {
        nodes: data!.nodes.map((n) => ({ ...n })),
        links: data!.edges.map((e) => ({ source: e.source, target: e.target, relation: e.relation })),
      }
    : { nodes: [], links: [] }

  return (
    <div
      className="flex flex-col h-[calc(100vh-120px)] md:h-[calc(100vh-120px)] overflow-hidden"
      style={{ animation: "fadeInUp 500ms both", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1 pb-3 sm:pb-4 shrink-0">
        <h1 className="text-lg sm:text-xl font-bold uppercase text-white">{t.graph.title}</h1>
        <select
          value={selectedCompanyId}
          onChange={(e) => setSelectedCompanyId(e.target.value)}
          className="w-full sm:w-auto bg-transparent text-white text-sm px-3 py-2 focus:outline-none liquid-input"
          style={{ borderRadius: 14, height: 38, maxWidth: 220 }}
        >
          <option value="__national__" className="bg-[#1f1f1f]">
            {t.chat.general}
          </option>
          {companiesQuery.data?.items.map((c) => (
            <option key={c.id} value={c.id} className="bg-[#1f1f1f]">{c.name}</option>
          ))}
        </select>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 sm:gap-4 px-1 pb-2 sm:pb-3 shrink-0">
        {(["company", "document", "entity"] as const).map((group) => (
          <span key={group} className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-[#a9a9a9]">
            <span
              className="inline-block w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full"
              style={{ backgroundColor: GROUP_COLORS[group] }}
            />
            {t.graph[group]}
          </span>
        ))}
        {hasNodes && (
          <span className="text-[10px] sm:text-xs text-[#a9a9a9] ml-auto">
            {data!.nodes.length} {t.graph.nodes} / {data!.edges.length} {t.graph.edges}
          </span>
        )}
      </div>

      {/* Graph */}
      <div ref={containerRef} className="liquid-card flex-1 min-h-0 overflow-hidden relative" style={{ marginBottom: 0 }}>
        {graphQuery.isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#7966ff]" />
          </div>
        ) : !hasNodes ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-[#a9a9a9] text-center max-w-xs">{t.graph.no_data}</p>
          </div>
        ) : (
          <ForceGraph2D
            ref={graphRef as React.MutableRefObject<never>}
            graphData={graphData}
            width={dimensions.width}
            height={dimensions.height}
            backgroundColor="transparent"
            nodeCanvasObject={nodeCanvasObject}
            nodePointerAreaPaint={(node: Record<string, unknown>, color: string, ctx: CanvasRenderingContext2D) => {
              const size = GROUP_SIZES[(node.group as string) ?? "entity"] ?? 4
              ctx.beginPath()
              ctx.arc(node.x as number, node.y as number, size + 4, 0, 2 * Math.PI)
              ctx.fillStyle = color
              ctx.fill()
            }}
            linkColor={linkColor}
            linkWidth={1}
            linkDirectionalParticles={1}
            linkDirectionalParticleWidth={1.5}
            linkDirectionalParticleColor={() => "#7966ff"}
            cooldownTicks={100}
            enableZoomInteraction={true}
            enablePanInteraction={true}
          />
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
