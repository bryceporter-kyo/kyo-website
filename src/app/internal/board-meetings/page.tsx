"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  FileText, 
  Plus, 
  Download, 
  Search, 
  Calendar as CalendarIcon, 
  MapPin, 
  Trash2, 
  ArrowLeft,
  Loader2,
  ShieldAlert,
  Archive,
  Layers
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { fetchUsersFromFirebase, User as UserType } from "@/lib/users";
import { fetchBoardFromFirebase, BoardMember } from "@/lib/staff";
import { 
  BoardMeeting, 
  fetchBoardMeetings, 
  deleteBoardMeeting, 
  createBoardMeeting, 
  DEFAULT_AGENDA_ITEMS 
} from "@/lib/board-meetings";
import { downloadMeetingPdf, exportMassMinutesPdfZip, exportMeetingsToCsv } from "@/lib/board-minutes-export";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CsvManagerDialog } from "@/components/shared/CsvManagerDialog";

export default function BoardMeetingsListPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [meetings, setMeetings] = useState<BoardMeeting[]>([]);
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Mass PDF export modal
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isGeneratingPdfZip, setIsGeneratingPdfZip] = useState(false);

  // Load and verify access
  useEffect(() => {
    async function init() {
      if (authLoading) return;
      if (!user) {
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      try {
        const [usersData, boardData, meetingsData] = await Promise.all([
          fetchUsersFromFirebase(),
          fetchBoardFromFirebase(),
          fetchBoardMeetings(),
        ]);

        setUsers(usersData);
        setBoardMembers(boardData);
        setMeetings(meetingsData);

        // Check if user is linked to a board profile
        const currentUserRecord = usersData.find(
          u => u.email.trim().toLowerCase() === user.email?.trim().toLowerCase()
        );

        const isBoard = Boolean(
          currentUserRecord?.linkedProfile && 
          currentUserRecord.linkedProfile.type === 'board'
        );

        setIsAuthorized(isBoard);
      } catch (err) {
        console.error("Error verifying board access:", err);
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, [user, authLoading]);

  // Filtered meetings
  const filteredMeetings = useMemo(() => {
    return meetings.filter(m => {
      // Type filter
      if (typeFilter !== "all" && m.meetingType !== typeFilter) return false;

      // Search filter (date, type, chair, secretary, agenda items, discussions)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesDate = m.date.toLowerCase().includes(query);
        const matchesType = m.meetingType.toLowerCase().includes(query);
        const matchesChair = m.chair.toLowerCase().includes(query);
        const matchesLocation = m.locationDetails?.toLowerCase().includes(query) || false;
        const matchesItems = m.agendaItems?.some(item => 
          item.title.toLowerCase().includes(query) || 
          item.discussion.toLowerCase().includes(query)
        );
        if (!matchesDate && !matchesType && !matchesChair && !matchesLocation && !matchesItems) {
          return false;
        }
      }

      // Date Range filter
      if (startDate && m.date < startDate) return false;
      if (endDate && m.date > endDate) return false;

      return true;
    });
  }, [meetings, typeFilter, searchQuery, startDate, endDate]);

  // Create new meeting handler
  const handleStartNewMeeting = async () => {
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];
    const timeStr = today.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    // Pre-populate attendees from board members
    const initialAttendees = boardMembers.map(b => ({
      id: b.id,
      name: b.name,
      email: b.email,
      role: b.title || "Director",
      status: 'present' as const,
      isIneligibleToVote: false,
    }));

    // Create new meeting without pre-populating blank agenda items
    // Users will add items one-by-one as the meeting progresses
    const initialItems: any[] = [];

    try {
      const newMeeting = await createBoardMeeting({
        title: `Board Meeting — ${dateStr}`,
        date: dateStr,
        time: timeStr,
        meetingType: "Standing",
        locationType: "hybrid",
        locationDetails: "Google Meet & KYO Boardroom, New Canadians Centre",
        chair: "",
        secretary: user?.displayName || user?.email || "",
        attendees: initialAttendees,
        agendaItems: initialItems,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      router.push(`/internal/board-meetings/${newMeeting.id}`);
    } catch (err) {
      console.error("Failed to start meeting:", err);
      toast({
        title: "Error Starting Meeting",
        description: "Could not create meeting record. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Delete meeting handler
  const handleDeleteMeeting = async (id: string) => {
    try {
      await deleteBoardMeeting(id);
      setMeetings(prev => prev.filter(m => m.id !== id));
      toast({
        title: "Meeting Deleted",
        description: "The meeting record was removed.",
      });
    } catch (err) {
      console.error("Failed to delete meeting:", err);
      toast({
        title: "Delete Failed",
        description: "Could not delete meeting.",
        variant: "destructive",
      });
    }
  };

  // Mass PDF export
  const handleExportZip = async () => {
    if (filteredMeetings.length === 0) {
      toast({
        title: "No Meetings Found",
        description: "No meeting records match the selected date range.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingPdfZip(true);
    try {
      const filename = startDate && endDate 
        ? `KYO_Board_Minutes_${startDate}_to_${endDate}.zip`
        : `KYO_Board_Minutes_Archive.zip`;
      await exportMassMinutesPdfZip(filteredMeetings, filename);
      toast({
        title: "Audit Package Downloaded",
        description: `Exported ${filteredMeetings.length} meeting PDF(s) into zip archive.`,
      });
      setIsExportModalOpen(false);
    } catch (err) {
      console.error("Failed to generate PDF zip:", err);
      toast({
        title: "Export Failed",
        description: "Could not generate zipped PDFs.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPdfZip(false);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    if (meetings.length === 0) return;
    const csvData = exportMeetingsToCsv(filteredMeetings);
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `KYO_Board_Minutes_Export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Import handler
  const handleCsvImport = async (data: any[]) => {
    let importedCount = 0;
    try {
      // Group rows by MeetingID or Date
      const grouped: Record<string, any[]> = {};
      data.forEach(row => {
        const key = row.MeetingID || row.Date || `meeting-${Date.now()}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(row);
      });

      for (const [key, rows] of Object.entries(grouped)) {
        const first = rows[0];
        const date = first.Date || new Date().toISOString().split("T")[0];
        const time = first.Time || "19:00";
        const meetingType = first.MeetingType || "Standing";
        const locationType = first.LocationType || "remote";
        const locationDetails = first.LocationDetails || "";
        const chair = first.Chair || "";
        const secretary = first.Secretary || "";

        const attendeesPresent = (first.AttendeesPresent || "").split(";").map((n: string) => n.trim()).filter(Boolean);
        const attendeesRegrets = (first.AttendeesRegrets || "").split(";").map((n: string) => n.trim()).filter(Boolean);

        const attendees = [
          ...attendeesPresent.map((name: string, i: number) => ({ id: `p-${i}`, name, status: 'present' as const })),
          ...attendeesRegrets.map((name: string, i: number) => ({ id: `r-${i}`, name, status: 'regrets' as const }))
        ];

        const agendaItems = rows.map((r, i) => ({
          id: `item-${Date.now()}-${i}`,
          title: r.AgendaItemTitle || `Agenda Item ${i + 1}`,
          discussion: r.Discussion || "",
          motions: r.MotionText ? [{
            id: `motion-${Date.now()}-${i}`,
            text: r.MotionText,
            movedBy: r.MotionMovedBy || "",
            secondedBy: r.MotionSecondedBy || "",
            result: (r.MotionResult || 'unanimous') as any,
          }] : [],
          actionItems: r.ActionTask ? [{
            id: `action-${Date.now()}-${i}`,
            task: r.ActionTask,
            assignedTo: r.ActionAssignedTo || "",
            dueDate: r.ActionDueDate || "",
          }] : [],
        }));

        await createBoardMeeting({
          title: `Board Meeting — ${date}`,
          date,
          time,
          meetingType: meetingType as any,
          locationType: locationType as any,
          locationDetails,
          chair,
          secretary,
          attendees,
          agendaItems,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        importedCount++;
      }

      const refreshed = await fetchBoardMeetings();
      setMeetings(refreshed);
      toast({
        title: "Minutes Imported",
        description: `Successfully imported ${importedCount} meeting archive(s).`,
      });
    } catch (err) {
      console.error("Error importing minutes CSV:", err);
      toast({
        title: "Import Error",
        description: "Failed to parse and import minutes CSV.",
        variant: "destructive",
      });
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="container mx-auto py-24 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">Verifying Board of Directors Access...</p>
      </div>
    );
  }

  // Access Denied Screen
  if (!isAuthorized) {
    return (
      <div className="container mx-auto py-20 max-w-lg px-4">
        <Card className="border-destructive/30 shadow-lg text-center p-6">
          <div className="mx-auto w-12 h-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <CardTitle className="text-xl font-headline mb-2">Board of Directors Restricted Area</CardTitle>
          <CardDescription className="text-sm leading-relaxed mb-6">
            This section is reserved exclusively for members of the <strong>Kawartha Youth Orchestra Board of Directors</strong>. Your account is not currently linked to an active Board profile on <code>/admin/team</code>.
          </CardDescription>
          <div className="flex justify-center gap-3">
            <Button asChild variant="outline">
              <Link href="/internal">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Internal Portal
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl">
      {/* Navigation Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="h-8 -ml-2 text-muted-foreground hover:text-foreground">
            <Link href="/internal">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Internal Portal
            </Link>
          </Button>
          <span className="text-muted-foreground">/</span>
          <span className="font-semibold text-sm">Board Meetings</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => setIsExportModalOpen(true)}
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5 border-slate-300 shadow-sm"
          >
            <Archive className="h-3.5 w-3.5 text-indigo-600" />
            Audit Mass PDF Export
          </Button>

          <Button
            onClick={handleExportCsv}
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5 border-slate-300 shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>

          <CsvManagerDialog
            title="Import Past Minutes Archive"
            description="Upload a CSV file containing historical minutes to import into the archive."
            triggerButtonText="Import Minutes"
            templateHeaders={[
              "MeetingID", "Date", "Time", "MeetingType", "LocationType", "LocationDetails", 
              "Chair", "Secretary", "AttendeesPresent", "AttendeesRegrets", 
              "AgendaItemTitle", "Discussion", "MotionText", "MotionMovedBy", "MotionSecondedBy", 
              "MotionResult", "ActionTask", "ActionAssignedTo", "ActionDueDate"
            ]}
            templateSampleRow={[
              "meeting-2025-01", "2025-01-15", "19:00", "Standing", "hybrid", "Art Gallery / Zoom",
              "John Doe", "Jane Smith", "John Doe; Jane Smith; Board Member", "Absent Member",
              "Call to Order", "Meeting called to order at 7:04 PM.", "Approval of agenda", "Jane Smith", "John Doe",
              "unanimous", "Draft budget revision", "Treasurer", "2025-02-19"
            ]}
            instructionText="Use this template to import past minutes records. Multiple agenda items or motions for the same meeting should share the same MeetingID or Date."
            onUpload={handleCsvImport}
          />

          <Button
            onClick={handleStartNewMeeting}
            size="sm"
            className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground font-semibold shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Start Meeting Minutes
          </Button>
        </div>
      </div>

      {/* Main Content Card */}
      <Card className="border border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/70 border-b border-slate-100 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="font-headline text-2xl text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                Board Meeting Minutes &amp; Archive
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-1">
                Official records of the Kawartha Youth Orchestra Board of Directors meetings, motions, and action items.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-white text-indigo-700 border-indigo-200 px-2.5 py-1 text-xs font-semibold">
                {meetings.length} Meetings Archived
              </Badge>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search minutes, motions, reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs h-8 bg-white"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-8 text-xs bg-white">
                <SelectValue placeholder="All Meeting Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Meeting Types</SelectItem>
                <SelectItem value="Standing">Standing Meeting</SelectItem>
                <SelectItem value="Ad Hoc">Ad Hoc Meeting</SelectItem>
                <SelectItem value="Members Meeting">Members Meeting</SelectItem>
                <SelectItem value="Annual General Members Meeting">AGM</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="From Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-xs h-8 bg-white"
            />

            <Input
              type="date"
              placeholder="To Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-xs h-8 bg-white"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="font-semibold text-xs">Date &amp; Time</TableHead>
                <TableHead className="font-semibold text-xs">Meeting Type</TableHead>
                <TableHead className="font-semibold text-xs">Location</TableHead>
                <TableHead className="font-semibold text-xs">Secretary / Chair</TableHead>
                <TableHead className="font-semibold text-xs text-center">Motions</TableHead>
                <TableHead className="font-semibold text-xs text-center">Actions</TableHead>
                <TableHead className="font-semibold text-xs text-right pr-4">Document Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMeetings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-muted-foreground text-xs">
                    {searchQuery || typeFilter !== "all" || startDate || endDate
                      ? "No board minutes match your search filters."
                      : "No board meeting minutes found. Click 'Start Meeting Minutes' to take live minutes."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredMeetings.map((meeting) => {
                  const motionCount = meeting.agendaItems?.reduce(
                    (acc, it) => acc + (it.motions?.length || 0), 0
                  ) || 0;
                  const actionCount = meeting.agendaItems?.reduce(
                    (acc, it) => acc + (it.actionItems?.length || 0), 0
                  ) || 0;

                  return (
                    <TableRow key={meeting.id} className="hover:bg-slate-50/70 transition-colors">
                      <TableCell className="font-medium text-xs">
                        <Link 
                          href={`/internal/board-meetings/${meeting.id}`}
                          className="font-bold text-slate-900 hover:text-indigo-600 flex items-center gap-1.5"
                        >
                          <CalendarIcon className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                          {meeting.date}
                        </Link>
                        <span className="text-[10px] text-muted-foreground pl-5 block">
                          {meeting.time}
                        </span>
                      </TableCell>

                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={`text-[10px] font-semibold ${
                            meeting.meetingType === 'Annual General Members Meeting'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : meeting.meetingType === 'Standing'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-purple-50 text-purple-700 border-purple-200'
                          }`}
                        >
                          {meeting.meetingType}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-xs text-slate-600">
                        <span className="capitalize font-medium block">{meeting.locationType}</span>
                        {meeting.locationDetails && (
                          <span className="text-[10px] text-muted-foreground block truncate max-w-[180px]">
                            {meeting.locationDetails}
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="text-xs text-slate-700">
                        <span className="block font-medium">Sec: {meeting.secretary || "—"}</span>
                        <span className="text-[10px] text-muted-foreground block">Chair: {meeting.chair || "—"}</span>
                      </TableCell>

                      <TableCell className="text-xs text-center font-semibold text-slate-700">
                        {motionCount > 0 ? (
                          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-indigo-50 text-indigo-700 text-[10px]">
                            {motionCount}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>

                      <TableCell className="text-xs text-center font-semibold text-slate-700">
                        {actionCount > 0 ? (
                          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-50 text-emerald-700 text-[10px]">
                            {actionCount}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>

                      <TableCell className="text-right pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs px-2.5 font-medium border-slate-300 hover:bg-slate-100"
                          >
                            <Link href={`/internal/board-meetings/${meeting.id}`}>
                              Open Minutes
                            </Link>
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-slate-600 hover:text-indigo-600"
                            onClick={() => downloadMeetingPdf(meeting)}
                            title="Download Official PDF"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                title="Delete Minutes"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Meeting Minutes?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the minutes for <strong>{meeting.date}</strong> ({meeting.meetingType})? This official record will be removed from the archive.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteMeeting(meeting.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete Record
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Mass PDF Export Modal */}
      <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5 text-indigo-600" />
              Mass PDF Audit Package
            </DialogTitle>
            <DialogDescription>
              Export official signed PDF minutes for all board meetings matching your selected date range into a single downloadable .ZIP archive.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold block mb-1">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="text-xs h-8"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="text-xs h-8"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 border rounded-lg space-y-1">
              <p className="font-semibold text-slate-800">
                Package Contents: {filteredMeetings.length} Meeting(s)
              </p>
              <p className="text-[11px] text-muted-foreground">
                Each meeting will be generated as an individual, publication-ready PDF with complete agenda items, roll-call votes, and action items.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExportModalOpen(false)}
              disabled={isGeneratingPdfZip}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleExportZip}
              disabled={isGeneratingPdfZip || filteredMeetings.length === 0}
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
            >
              {isGeneratingPdfZip ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Generating Archive...
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" />
                  Download ZIP Package
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
