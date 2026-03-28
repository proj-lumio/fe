import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Video,
  Calendar,
  Users,
  FileText,
  ListChecks,
  ArrowLeft,
  Upload,
  Loader2,
  ChevronRight,
} from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { circlebackApi, companiesApi } from "@/lib/api"
import type { Meeting } from "@/types"

export default function Meetings() {
  const queryClient = useQueryClient()
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null)
  const [ingestDialogOpen, setIngestDialogOpen] = useState(false)
  const [ingestMeetingId, setIngestMeetingId] = useState<string | null>(null)
  const [selectedCompanyId, setSelectedCompanyId] = useState("")

  // List meetings
  const { data: meetings, isLoading: meetingsLoading } = useQuery({
    queryKey: ["meetings"],
    queryFn: () => circlebackApi.listMeetings(),
  })

  // Selected meeting detail
  const { data: meetingDetail } = useQuery({
    queryKey: ["meeting", selectedMeetingId],
    queryFn: () => circlebackApi.getMeeting(selectedMeetingId!),
    enabled: !!selectedMeetingId,
  })

  // Transcript
  const { data: transcriptData, isLoading: transcriptLoading } = useQuery({
    queryKey: ["meetingTranscript", selectedMeetingId],
    queryFn: () => circlebackApi.getTranscript(selectedMeetingId!),
    enabled: !!selectedMeetingId,
  })

  // Summary
  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ["meetingSummary", selectedMeetingId],
    queryFn: () => circlebackApi.getSummary(selectedMeetingId!),
    enabled: !!selectedMeetingId,
  })

  // Action items
  const { data: actionItemsData, isLoading: actionItemsLoading } = useQuery({
    queryKey: ["meetingActionItems", selectedMeetingId],
    queryFn: () => circlebackApi.getActionItems(selectedMeetingId!),
    enabled: !!selectedMeetingId,
  })

  // Companies for ingest dialog
  const { data: companiesData } = useQuery({
    queryKey: ["companies", { page: 1, page_size: 100 }],
    queryFn: () => companiesApi.list({ page: 1, page_size: 100 }),
    enabled: ingestDialogOpen,
  })

  // Ingest mutation
  const ingestMutation = useMutation({
    mutationFn: () => circlebackApi.ingestTranscript(ingestMeetingId!, selectedCompanyId),
    onSuccess: () => {
      setIngestDialogOpen(false)
      setIngestMeetingId(null)
      setSelectedCompanyId("")
    },
  })

  const meetingsList: Meeting[] = Array.isArray(meetings) ? meetings : []

  if (selectedMeetingId) {
    const meeting = meetingDetail ?? meetingsList.find((m) => m.id === selectedMeetingId)

    return (
      <div className="space-y-6">
        {/* Back button */}
        <Button variant="ghost" size="sm" onClick={() => setSelectedMeetingId(null)}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Meetings
        </Button>

        {/* Meeting header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {meeting?.title ?? "Meeting"}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {meeting?.date && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(meeting.date).toLocaleDateString()}
                </span>
              )}
              {meeting?.participants && meeting.participants.length > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {meeting.participants.length} participants
                </span>
              )}
            </div>
          </div>
          <Button
            onClick={() => {
              setIngestMeetingId(selectedMeetingId)
              setIngestDialogOpen(true)
            }}
          >
            <Upload className="mr-2 h-4 w-4" />
            Ingest Transcript
          </Button>
        </div>

        {/* Participants */}
        {meeting?.participants && meeting.participants.length > 0 && (
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Participants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {meeting.participants.map((p, i) => (
                  <Badge key={i} variant="secondary" className="rounded-full">
                    {p}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : summaryData?.summary ? (
              <p className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
                {summaryData.summary}
              </p>
            ) : (
              <p className="text-sm italic text-muted-foreground">No summary available.</p>
            )}
          </CardContent>
        </Card>

        {/* Action Items */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="h-5 w-5" />
              Action Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            {actionItemsLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : actionItemsData?.action_items && actionItemsData.action_items.length > 0 ? (
              <ul className="space-y-2">
                {actionItemsData.action_items.map((item: string, i: number) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-sm"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                      {i + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm italic text-muted-foreground">No action items.</p>
            )}
          </CardContent>
        </Card>

        {/* Transcript */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Transcript
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transcriptLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : transcriptData?.transcript ? (
              <div className="max-h-96 overflow-y-auto rounded-lg bg-muted/30 p-4">
                <p className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
                  {transcriptData.transcript}
                </p>
              </div>
            ) : (
              <p className="text-sm italic text-muted-foreground">No transcript available.</p>
            )}
          </CardContent>
        </Card>

        {/* Ingest Dialog */}
        <IngestDialog
          open={ingestDialogOpen}
          onOpenChange={setIngestDialogOpen}
          companies={companiesData?.items ?? []}
          selectedCompanyId={selectedCompanyId}
          onCompanyChange={setSelectedCompanyId}
          onIngest={() => ingestMutation.mutate()}
          isPending={ingestMutation.isPending}
        />
      </div>
    )
  }

  // Meetings list view
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Meetings</h1>
        <p className="text-muted-foreground">
          CircleBack meetings integration. View details, transcripts, and ingest into your document store.
        </p>
      </div>

      {meetingsLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : meetingsList.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Video className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No meetings found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Connect CircleBack to see your meetings here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {meetingsList.map((meeting) => (
            <Card
              key={meeting.id}
              className="cursor-pointer rounded-2xl transition-shadow hover:shadow-lg"
              onClick={() => setSelectedMeetingId(meeting.id)}
            >
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Video className="h-6 w-6 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold">{meeting.title}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {meeting.date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(meeting.date).toLocaleDateString()}
                      </span>
                    )}
                    {meeting.participants && meeting.participants.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {meeting.participants.length} participants
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Ingest Dialog */}
      <IngestDialog
        open={ingestDialogOpen}
        onOpenChange={setIngestDialogOpen}
        companies={companiesData?.items ?? []}
        selectedCompanyId={selectedCompanyId}
        onCompanyChange={setSelectedCompanyId}
        onIngest={() => ingestMutation.mutate()}
        isPending={ingestMutation.isPending}
      />
    </div>
  )
}

function IngestDialog({
  open,
  onOpenChange,
  companies,
  selectedCompanyId,
  onCompanyChange,
  onIngest,
  isPending,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  companies: { id: string; name: string }[]
  selectedCompanyId: string
  onCompanyChange: (id: string) => void
  onIngest: () => void
  isPending: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ingest Transcript</DialogTitle>
          <DialogDescription>
            Select a company to ingest this meeting transcript into its document store.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Company *</Label>
            <select
              value={selectedCompanyId}
              onChange={(e) => onCompanyChange(e.target.value)}
              className="flex h-9 w-full rounded-xl border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Select a company...</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onIngest} disabled={!selectedCompanyId || isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Ingest
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
