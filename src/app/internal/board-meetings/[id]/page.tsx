"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Download, 
  Plus, 
  Trash2, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  ChevronUp, 
  ChevronDown, 
  Vote, 
  ListTodo, 
  Loader2, 
  ShieldAlert,
  CalendarCheck2,
  MapPin,
  Users,
  FileText
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { fetchUsersFromFirebase, User as UserType } from "@/lib/users";
import { fetchBoardFromFirebase, fetchStaffFromFirebase, BoardMember, StaffMember } from "@/lib/staff";
import { 
  BoardMeeting, 
  fetchBoardMeetingById, 
  updateBoardMeeting, 
  MeetingAgendaItem, 
  MeetingMotion, 
  MeetingActionItem, 
  MeetingAttendee,
  VoteStatus,
  DEFAULT_AGENDA_ITEMS
} from "@/lib/board-meetings";
import { downloadMeetingPdf } from "@/lib/board-minutes-export";
import { syncActionItemToCalendar, syncMeetingActionItemsToCalendar } from "@/lib/board-calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PersonCombobox, PersonOption } from "@/components/shared/PersonCombobox";
import { MarkdownEditor } from "@/components/shared/MarkdownEditor";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";


export default function BoardMeetingEditorPage() {
  const { id } = useParams() as { id: string };
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [meeting, setMeeting] = useState<BoardMeeting | null>(null);
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // Auto-save state
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const latestMeetingRef = useRef<BoardMeeting | null>(null);

  // New agenda item input
  const [customItemTitle, setCustomItemTitle] = useState("");

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
        const [usersData, boardData, staffData, meetingData] = await Promise.all([
          fetchUsersFromFirebase(),
          fetchBoardFromFirebase(),
          fetchStaffFromFirebase(),
          fetchBoardMeetingById(id),
        ]);

        setUsers(usersData);
        setBoardMembers(boardData);
        setStaffMembers(staffData);
        setMeeting(meetingData);
        latestMeetingRef.current = meetingData;

        // Verify board membership
        const currentUserRecord = usersData.find(
          u => u.email.trim().toLowerCase() === user.email?.trim().toLowerCase()
        );

        const isBoard = Boolean(
          currentUserRecord?.linkedProfile && 
          currentUserRecord.linkedProfile.type === 'board'
        );

        setIsAuthorized(isBoard);
      } catch (err) {
        console.error("Error loading board meeting details:", err);
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, [id, user, authLoading]);

  // Combined person options for PersonCombobox
  const personOptions: PersonOption[] = React.useMemo(() => {
    const list: PersonOption[] = [];

    boardMembers.forEach(b => {
      list.push({
        id: b.id,
        name: b.name,
        email: b.email,
        role: b.title || "Director",
        category: 'board',
      });
    });

    staffMembers.forEach(s => {
      if (!list.some(p => p.name === s.name)) {
        list.push({
          id: s.id,
          name: s.name,
          email: s.email,
          role: s.title,
          category: 'staff',
        });
      }
    });

    users.forEach(u => {
      if (!list.some(p => p.name === u.name)) {
        list.push({
          id: u.id,
          name: u.name,
          email: u.email,
          category: 'user',
        });
      }
    });

    return list;
  }, [boardMembers, staffMembers, users]);

  // Debounced auto-save function
  const triggerAutoSave = useCallback((updated: BoardMeeting) => {
    setMeeting(updated);
    latestMeetingRef.current = updated;
    setSaveStatus("unsaved");

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        setSaveStatus("saving");
        await updateBoardMeeting(updated.id, updated);
        setSaveStatus("saved");
      } catch (err) {
        console.error("Auto-save failed:", err);
        setSaveStatus("unsaved");
      }
    }, 800);
  }, []);

  // Update top-level metadata
  const handleUpdateMeta = (field: keyof BoardMeeting, value: any) => {
    if (!meeting) return;
    const updated = { ...meeting, [field]: value };
    triggerAutoSave(updated);
  };

  // Attendee status toggle (present -> regrets -> guest)
  const handleUpdateAttendeeStatus = (attendeeId: string, status: 'present' | 'regrets' | 'guest') => {
    if (!meeting) return;
    const updatedAttendees = meeting.attendees.map(a => 
      a.id === attendeeId ? { ...a, status } : a
    );
    triggerAutoSave({ ...meeting, attendees: updatedAttendees });
  };

  // Toggle ineligibility to vote (sticky default across meeting)
  const handleToggleAttendeeIneligibility = (attendeeId: string) => {
    if (!meeting) return;
    const updatedAttendees = meeting.attendees.map(a => 
      a.id === attendeeId ? { ...a, isIneligibleToVote: !a.isIneligibleToVote } : a
    );
    triggerAutoSave({ ...meeting, attendees: updatedAttendees });
  };

  // Add attendee
  const handleAddAttendee = (name: string, person?: PersonOption) => {
    if (!meeting || !name.trim()) return;
    if (meeting.attendees.some(a => a.name.toLowerCase() === name.toLowerCase())) {
      toast({ title: "Already added", description: "This person is already listed in attendance." });
      return;
    }

    const newAttendee: MeetingAttendee = {
      id: `att-${Date.now()}`,
      name,
      email: person?.email,
      role: person?.role || (person?.category === 'board' ? 'Director' : 'Guest'),
      status: 'present',
      isIneligibleToVote: false,
    };

    triggerAutoSave({
      ...meeting,
      attendees: [...meeting.attendees, newAttendee]
    });
  };

  // Remove attendee
  const handleRemoveAttendee = (attendeeId: string) => {
    if (!meeting) return;
    triggerAutoSave({
      ...meeting,
      attendees: meeting.attendees.filter(a => a.id !== attendeeId)
    });
  };

  // Add Agenda Item
  const handleAddAgendaItem = (title: string) => {
    if (!meeting || !title.trim()) return;
    const newItem: MeetingAgendaItem = {
      id: `item-${Date.now()}`,
      title: title.trim(),
      discussion: "",
      motions: [],
      actionItems: [],
    };
    triggerAutoSave({
      ...meeting,
      agendaItems: [...meeting.agendaItems, newItem],
    });
    setCustomItemTitle("");
  };

  // Move Agenda Item Up/Down
  const handleMoveAgendaItem = (index: number, direction: 'up' | 'down') => {
    if (!meeting) return;
    const items = [...meeting.agendaItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const temp = items[index];
    items[index] = items[targetIndex];
    items[targetIndex] = temp;

    triggerAutoSave({ ...meeting, agendaItems: items });
  };

  // Remove Agenda Item
  const handleRemoveAgendaItem = (itemId: string) => {
    if (!meeting) return;
    triggerAutoSave({
      ...meeting,
      agendaItems: meeting.agendaItems.filter(it => it.id !== itemId),
    });
  };

  // Update Discussion for Item
  const handleUpdateDiscussion = (itemId: string, text: string) => {
    if (!meeting) return;
    const updatedItems = meeting.agendaItems.map(it => 
      it.id === itemId ? { ...it, discussion: text } : it
    );
    triggerAutoSave({ ...meeting, agendaItems: updatedItems });
  };

  // Add Motion to an item
  const handleAddMotion = (itemId: string) => {
    if (!meeting) return;
    // Build initial voter roll call from present attendees, respecting ineligibility
    const initialRollCall: Record<string, VoteStatus> = {};
    meeting.attendees
      .filter(a => a.status === 'present')
      .forEach(a => {
        initialRollCall[a.name] = a.isIneligibleToVote ? 'Ineligible' : 'Approved';
      });

    const newMotion: MeetingMotion = {
      id: `motion-${Date.now()}`,
      text: "",
      movedBy: meeting.chair || "",
      secondedBy: "",
      result: "unanimous",
      voterRollCall: initialRollCall,
      linkedActionItemIds: [],
    };

    const updatedItems = meeting.agendaItems.map(it => 
      it.id === itemId ? { ...it, motions: [...it.motions, newMotion] } : it
    );
    triggerAutoSave({ ...meeting, agendaItems: updatedItems });
  };

  // Update Motion fields
  const handleUpdateMotion = (itemId: string, motionId: string, updates: Partial<MeetingMotion>) => {
    if (!meeting) return;
    const updatedItems = meeting.agendaItems.map(it => {
      if (it.id !== itemId) return it;
      const updatedMotions = it.motions.map(mo => 
        mo.id === motionId ? { ...mo, ...updates } : mo
      );
      return { ...it, motions: updatedMotions };
    });
    triggerAutoSave({ ...meeting, agendaItems: updatedItems });
  };

  // Update individual vote in roll-call
  const handleSetVote = (itemId: string, motionId: string, voterName: string, status: VoteStatus) => {
    if (!meeting) return;
    const updatedItems = meeting.agendaItems.map(it => {
      if (it.id !== itemId) return it;
      const updatedMotions = it.motions.map(mo => {
        if (mo.id !== motionId) return mo;
        const currentRoll = { ...(mo.voterRollCall || {}) };
        currentRoll[voterName] = status;
        return { ...mo, voterRollCall: currentRoll };
      });
      return { ...it, motions: updatedMotions };
    });
    triggerAutoSave({ ...meeting, agendaItems: updatedItems });
  };

  // Delete Motion
  const handleDeleteMotion = (itemId: string, motionId: string) => {
    if (!meeting) return;
    const updatedItems = meeting.agendaItems.map(it => 
      it.id === itemId ? { ...it, motions: it.motions.filter(mo => mo.id !== motionId) } : it
    );
    triggerAutoSave({ ...meeting, agendaItems: updatedItems });
  };

  // Add Action Item
  const handleAddActionItem = (itemId: string) => {
    if (!meeting) return;
    const defaultDue = meeting.nextMeetingDate || meeting.date;
    const newAction: MeetingActionItem = {
      id: `action-${Date.now()}`,
      task: "",
      assignedTo: "",
      dueDate: defaultDue,
      syncedToCalendar: false,
    };

    const updatedItems = meeting.agendaItems.map(it => 
      it.id === itemId ? { ...it, actionItems: [...it.actionItems, newAction] } : it
    );
    triggerAutoSave({ ...meeting, agendaItems: updatedItems });
  };

  // Update Action Item
  const handleUpdateActionItem = (itemId: string, actionId: string, updates: Partial<MeetingActionItem>) => {
    if (!meeting) return;
    const updatedItems = meeting.agendaItems.map(it => {
      if (it.id !== itemId) return it;
      const updatedActions = it.actionItems.map(ac => 
        ac.id === actionId ? { ...ac, ...updates } : ac
      );
      return { ...it, actionItems: updatedActions };
    });
    triggerAutoSave({ ...meeting, agendaItems: updatedItems });
  };

  // Delete Action Item
  const handleDeleteActionItem = (itemId: string, actionId: string) => {
    if (!meeting) return;
    const updatedItems = meeting.agendaItems.map(it => 
      it.id === itemId ? { ...it, actionItems: it.actionItems.filter(ac => ac.id !== actionId) } : it
    );
    triggerAutoSave({ ...meeting, agendaItems: updatedItems });
  };

  // Sync specific action item to Google / Internal Calendar
  const handleSyncActionToCalendar = async (action: MeetingActionItem, itemId: string) => {
    if (!meeting) return;
    if (!action.task.trim()) {
      toast({ title: "Task description required", description: "Please enter what the action item is before syncing to calendar.", variant: "destructive" });
      return;
    }

    try {
      const eventId = await syncActionItemToCalendar(action, meeting);
      handleUpdateActionItem(itemId, action.id, {
        syncedToCalendar: true,
        googleCalendarEventId: eventId,
      });
      toast({
        title: "Added to Board Calendar",
        description: `"${action.task}" scheduled for ${action.dueDate} on the Internal Board Calendar.`,
      });
    } catch (err) {
      toast({
        title: "Sync Error",
        description: "Failed to schedule action item to the calendar.",
        variant: "destructive",
      });
    }
  };

  // Sync ALL action items to calendar
  const handleSyncAllActions = async () => {
    if (!meeting) return;
    try {
      await syncMeetingActionItemsToCalendar(meeting);
      // Trigger a re-save with synced flags
      triggerAutoSave({ ...meeting });
      toast({
        title: "All Action Items Synced",
        description: "All pending action items have been added to the board calendar.",
      });
    } catch (err) {
      toast({
        title: "Sync Error",
        description: "Could not sync all action items to calendar.",
        variant: "destructive",
      });
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="container mx-auto py-24 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">Loading Minutes Document...</p>
      </div>
    );
  }

  if (!isAuthorized || !meeting) {
    return (
      <div className="container mx-auto py-20 max-w-lg px-4 text-center">
        <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-headline font-bold mb-2">Access Denied or Not Found</h2>
        <p className="text-sm text-muted-foreground mb-6">
          You do not have permission to view or edit this meeting record, or the document no longer exists.
        </p>
        <Button asChild variant="outline">
          <Link href="/internal/board-meetings">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Board Meetings
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      {/* Top Floating Control Bar */}
      <div className="sticky top-16 z-30 mb-6 bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-md rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="h-8 text-slate-600 hover:text-slate-900">
            <Link href="/internal/board-meetings">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> All Minutes
            </Link>
          </Button>
          <div className="h-4 w-[1px] bg-slate-200 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-900 truncate max-w-[200px] sm:max-w-[320px]">
              {meeting.date} ({meeting.meetingType})
            </span>
            {saveStatus === "saving" ? (
              <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-300 gap-1 font-medium animate-pulse">
                <Loader2 className="h-2.5 w-2.5 animate-spin" /> Saving...
              </Badge>
            ) : saveStatus === "unsaved" ? (
              <Badge variant="outline" className="text-[10px] bg-slate-100 text-slate-600 border-slate-300 font-medium">
                Unsaved changes
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-300 gap-1 font-medium">
                <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" /> All changes saved
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleSyncAllActions}
            variant="outline"
            size="sm"
            className="h-8 text-xs font-semibold gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-50"
            title="Sync all action items to the KYO Board Calendar"
          >
            <CalendarCheck2 className="h-3.5 w-3.5 text-emerald-600" />
            Sync Calendar Actions
          </Button>

          <Button
            onClick={() => downloadMeetingPdf(meeting)}
            size="sm"
            className="h-8 text-xs font-semibold gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Main Document Canvas */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 sm:p-10 space-y-8">
        
        {/* Document Header & Metadata */}
        <div className="border-b border-slate-200 pb-8 space-y-6">
          <div className="text-center space-y-1">
            <h1 className="font-headline text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              KAWARTHA YOUTH ORCHESTRA
            </h1>
            <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">
              Board of Directors Meeting Minutes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 text-xs">
            {/* Meeting Date & Time */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-indigo-500" /> Date &amp; Time
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                <Input
                  type="date"
                  value={meeting.date}
                  onChange={(e) => handleUpdateMeta("date", e.target.value)}
                  className="h-8 text-xs bg-white col-span-3"
                />
                <Input
                  type="text"
                  value={meeting.time}
                  onChange={(e) => handleUpdateMeta("time", e.target.value)}
                  placeholder="7:00 PM"
                  className="h-8 text-xs bg-white col-span-2 text-center"
                />
              </div>
            </div>

            {/* Meeting Type */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Meeting Type</label>
              <Select 
                value={meeting.meetingType} 
                onValueChange={(val: any) => handleUpdateMeta("meetingType", val)}
              >
                <SelectTrigger className="h-8 text-xs bg-white w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Standing">Standing Meeting</SelectItem>
                  <SelectItem value="Ad Hoc">Ad Hoc Meeting</SelectItem>
                  <SelectItem value="Members Meeting">Members Meeting</SelectItem>
                  <SelectItem value="Annual General Members Meeting">AGM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location Type & Details */}
            <div className="space-y-1 md:col-span-2">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-500" /> Location Details
              </label>
              <div className="flex items-center gap-2">
                <Select 
                  value={meeting.locationType} 
                  onValueChange={(val: any) => handleUpdateMeta("locationType", val)}
                >
                  <SelectTrigger className="h-8 text-xs bg-white w-28 shrink-0 capitalize">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="in-person">In-Person</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="text"
                  value={meeting.locationDetails || ""}
                  onChange={(e) => handleUpdateMeta("locationDetails", e.target.value)}
                  placeholder="Google Meet & KYO Boardroom, New Canadians Centre"
                  className="h-8 text-xs bg-white flex-1"
                />
              </div>
            </div>

            {/* Meeting Chair & Secretary */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Meeting Chair</label>
              <PersonCombobox
                value={meeting.chair || ""}
                onChange={(name) => handleUpdateMeta("chair", name)}
                options={personOptions}
                placeholder="Select or enter Chair..."
                className="h-8 bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Recording Secretary</label>
              <PersonCombobox
                value={meeting.secretary || ""}
                onChange={(name) => handleUpdateMeta("secretary", name)}
                options={personOptions}
                placeholder="Select or enter Secretary..."
                className="h-8 bg-white"
              />
            </div>

            {/* Next Meeting Date */}
            <div className="space-y-1 md:col-span-2">
              <label className="font-bold text-slate-700 flex items-center justify-between">
                <span>Next Board Meeting Date (Action Items Due Date Default)</span>
              </label>
              <Input
                type="date"
                value={meeting.nextMeetingDate || ""}
                onChange={(e) => handleUpdateMeta("nextMeetingDate", e.target.value)}
                className="h-8 text-xs bg-white"
              />
            </div>
          </div>
        </div>

        {/* Attendees Section */}
        <div className="space-y-3 border-b border-slate-200 pb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-headline text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                Attendance &amp; Quorum
              </h3>
              <p className="text-xs text-muted-foreground">
                Mark who is present, regrets, guests, or ineligible to vote. Ineligible status carries over as default across roll-call votes.
              </p>
            </div>

            <div className="w-64">
              <PersonCombobox
                value=""
                onChange={(name, person) => handleAddAttendee(name, person)}
                options={personOptions}
                placeholder="+ Add Attendee / Guest..."
                className="h-8 bg-white text-xs border-dashed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {meeting.attendees.map((attendee) => (
              <div 
                key={attendee.id} 
                className={`p-3 rounded-lg border text-xs flex flex-col justify-between gap-2.5 transition-colors ${
                  attendee.status === 'present' 
                    ? 'bg-slate-50/90 border-slate-200' 
                    : attendee.status === 'regrets'
                    ? 'bg-amber-50/50 border-amber-200 opacity-80'
                    : 'bg-purple-50/50 border-purple-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2 min-w-0">
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-slate-900 truncate text-[13px]">{attendee.name}</span>
                    <span className="text-[11px] text-muted-foreground truncate">
                      {attendee.role || "Director"}
                    </span>
                  </div>
                  {attendee.isIneligibleToVote && (
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 bg-rose-50 text-rose-700 border-rose-300 shrink-0">
                      Ineligible
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-slate-200/60 pt-2 gap-1.5">
                  {/* Status Toggle */}
                  <Select
                    value={attendee.status}
                    onValueChange={(val: any) => handleUpdateAttendeeStatus(attendee.id, val)}
                  >
                    <SelectTrigger className="h-7 text-xs px-2 bg-white capitalize font-medium flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="present">Present</SelectItem>
                      <SelectItem value="regrets">Regrets</SelectItem>
                      <SelectItem value="guest">Guest</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-1 shrink-0">
                    {/* Toggle Ineligible to vote */}
                    <Button
                      type="button"
                      variant={attendee.isIneligibleToVote ? "destructive" : "outline"}
                      size="icon"
                      onClick={() => handleToggleAttendeeIneligibility(attendee.id)}
                      title={attendee.isIneligibleToVote ? "Mark as Eligible to Vote" : "Mark as Ineligible to Vote (conflict or non-voting attendee)"}
                      className={cn(
                        "h-7 w-7 text-xs",
                        attendee.isIneligibleToVote 
                          ? "bg-rose-600 hover:bg-rose-700 text-white border-rose-600" 
                          : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
                      )}
                    >
                      <Vote className="h-3.5 w-3.5" />
                    </Button>

                    {/* Remove */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveAttendee(attendee.id)}
                      className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      title="Remove attendee"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agenda Items Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h3 className="font-headline text-lg font-bold text-slate-900">
                Agenda Items, Discussion &amp; Decisions
              </h3>
              <p className="text-xs text-muted-foreground">
                Document narrative discussions, motions, votes, and action items in sequence.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Select onValueChange={(val) => handleAddAgendaItem(val)}>
                <SelectTrigger className="h-8 text-xs bg-white w-48">
                  <SelectValue placeholder="+ Add Standard Item..." />
                </SelectTrigger>
                <SelectContent>
                  {DEFAULT_AGENDA_ITEMS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1">
                <Input
                  placeholder="Custom Item Title..."
                  value={customItemTitle}
                  onChange={(e) => setCustomItemTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && customItemTitle.trim()) {
                      handleAddAgendaItem(customItemTitle);
                    }
                  }}
                  className="h-8 text-xs w-44 bg-white"
                />
                <Button
                  onClick={() => handleAddAgendaItem(customItemTitle)}
                  disabled={!customItemTitle.trim()}
                  size="sm"
                  className="h-8 px-2 text-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Agenda Items List */}
          <div className="space-y-8">
            {meeting.agendaItems.length === 0 ? (
              <div className="border border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50/50">
                <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <h4 className="font-semibold text-slate-800 text-sm mb-1">No Agenda Items Added Yet</h4>
                <p className="text-xs text-muted-foreground max-w-md mx-auto mb-4">
                  Add items as your meeting progresses using the <strong>"+ Add Standard Item..."</strong> dropdown or by typing a custom title above.
                </p>
                <div className="flex flex-wrap justify-center gap-1.5 max-w-xl mx-auto">
                  {["Call to Order", "Approval of Agenda", "Approval of Past Meeting Minutes", "Operations Report"].map((defaultTitle) => (
                    <Button
                      key={defaultTitle}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddAgendaItem(defaultTitle)}
                      className="text-xs h-7 bg-white hover:bg-slate-100 border-slate-200"
                    >
                      + {defaultTitle}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              meeting.agendaItems.map((item, index) => (
                <div 
                  key={item.id}
                  className="rounded-xl border border-slate-200 p-5 bg-slate-50/40 hover:bg-slate-50/70 transition-all space-y-4"
                >
                {/* Item Title & Ordering */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-slate-900 text-white font-bold text-xs shrink-0">
                      {index + 1}
                    </span>
                    <Input
                      value={item.title}
                      onChange={(e) => {
                        const updated = meeting.agendaItems.map(it => 
                          it.id === item.id ? { ...it, title: e.target.value } : it
                        );
                        triggerAutoSave({ ...meeting, agendaItems: updated });
                      }}
                      className="h-8 font-bold text-sm bg-transparent border-transparent hover:border-slate-300 focus:bg-white text-slate-900 w-[300px] sm:w-[450px]"
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMoveAgendaItem(index, 'up')}
                      disabled={index === 0}
                      className="h-7 w-7 text-slate-500"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMoveAgendaItem(index, 'down')}
                      disabled={index === meeting.agendaItems.length - 1}
                      className="h-7 w-7 text-slate-500"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveAgendaItem(item.id)}
                      className="h-7 w-7 text-muted-foreground hover:text-destructive ml-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Discussion WYSIWYG Markdown Editor */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Discussion &amp; Notes</label>
                  <MarkdownEditor
                    value={item.discussion}
                    onChange={(text) => handleUpdateDiscussion(item.id, text)}
                    placeholder={`Discussion, committee reports, remarks, or notes regarding ${item.title}...`}
                  />
                </div>

                {/* Motions Table / Section */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5 uppercase tracking-wider">
                      <Vote className="w-3.5 h-3.5 text-indigo-600" />
                      Motions &amp; Formal Decisions ({item.motions.length})
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddMotion(item.id)}
                      className="h-6 text-[11px] gap-1 font-semibold border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100"
                    >
                      <Plus className="h-3 w-3" /> Add Motion
                    </Button>
                  </div>

                  {item.motions.length > 0 && (
                    <div className="space-y-3">
                      {item.motions.map((motion, mIdx) => (
                        <div key={motion.id} className="p-3.5 rounded-lg border border-indigo-100 bg-white shadow-sm space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-xs text-indigo-900">
                              Motion #{mIdx + 1}
                            </span>
                            <div className="flex items-center gap-2">
                              <Select
                                value={motion.result}
                                onValueChange={(val: any) => handleUpdateMotion(item.id, motion.id, { result: val })}
                              >
                                <SelectTrigger className="h-7 text-xs bg-slate-50 font-bold w-32 uppercase">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="unanimous">Unanimous</SelectItem>
                                  <SelectItem value="approved">Approved</SelectItem>
                                  <SelectItem value="defeated">Defeated</SelectItem>
                                  <SelectItem value="tabled">Tabled</SelectItem>
                                </SelectContent>
                              </Select>

                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteMotion(item.id, motion.id)}
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          <Input
                            placeholder="That the Board of Directors approve..."
                            value={motion.text}
                            onChange={(e) => handleUpdateMotion(item.id, motion.id, { text: e.target.value })}
                            className="text-xs h-8 bg-slate-50 font-medium"
                          />

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Moved By</label>
                              <PersonCombobox
                                value={motion.movedBy}
                                onChange={(name) => handleUpdateMotion(item.id, motion.id, { movedBy: name })}
                                options={personOptions}
                                placeholder="Select Mover..."
                                className="h-8 bg-slate-50"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Seconded By</label>
                              <PersonCombobox
                                value={motion.secondedBy}
                                onChange={(name) => handleUpdateMotion(item.id, motion.id, { secondedBy: name })}
                                options={personOptions}
                                placeholder="Select Seconder..."
                                className="h-8 bg-slate-50"
                              />
                            </div>
                          </div>

                          {/* Roll-Call Voting Details */}
                          <div className="pt-2 border-t border-slate-100">
                            <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
                              Roll Call Voting &amp; Record
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                              {meeting.attendees
                                .filter(a => a.status === 'present')
                                .map(att => {
                                  const vote = motion.voterRollCall?.[att.name] || (att.isIneligibleToVote ? 'Ineligible' : 'Approved');
                                  return (
                                    <div key={att.id} className="p-1.5 rounded border bg-slate-50/80 text-[11px] flex items-center justify-between gap-1">
                                      <span className="truncate font-medium">{att.name}</span>
                                      <Select
                                        value={vote}
                                        onValueChange={(val: VoteStatus) => handleSetVote(item.id, motion.id, att.name, val)}
                                      >
                                        <SelectTrigger className={`h-6 text-[9px] px-1 font-bold w-20 border-0 ${
                                          vote === 'Approved' ? 'text-emerald-700 bg-emerald-100/70' :
                                          vote === 'Rejected' ? 'text-rose-700 bg-rose-100/70' :
                                          vote === 'Ineligible' ? 'text-slate-600 bg-slate-200' :
                                          'text-amber-700 bg-amber-100/70'
                                        }`}>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Approved">Approved</SelectItem>
                                          <SelectItem value="Rejected">Rejected</SelectItem>
                                          <SelectItem value="Abstained">Abstained</SelectItem>
                                          <SelectItem value="Recused">Recused</SelectItem>
                                          <SelectItem value="Ineligible">Ineligible</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Items Section */}
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5 uppercase tracking-wider">
                      <ListTodo className="w-3.5 h-3.5 text-emerald-600" />
                      Action Items ({item.actionItems.length})
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddActionItem(item.id)}
                      className="h-6 text-[11px] gap-1 font-semibold border-emerald-200 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100"
                    >
                      <Plus className="h-3 w-3" /> Add Action Item
                    </Button>
                  </div>

                  {item.actionItems.length > 0 && (
                    <div className="space-y-2">
                      {item.actionItems.map((action) => (
                        <div 
                          key={action.id} 
                          className="p-3 rounded-lg border border-emerald-100 bg-white shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
                        >
                          <Input
                            placeholder="What needs to be done..."
                            value={action.task}
                            onChange={(e) => handleUpdateActionItem(item.id, action.id, { task: e.target.value })}
                            className="text-xs h-8 flex-1 bg-slate-50"
                          />

                          <div className="w-full sm:w-48">
                            <PersonCombobox
                              value={action.assignedTo}
                              onChange={(name, person) => handleUpdateActionItem(item.id, action.id, { 
                                assignedTo: name,
                                assignedToEmail: person?.email
                              })}
                              options={personOptions}
                              placeholder="Assigned to..."
                              className="h-8 bg-slate-50 text-xs"
                            />
                          </div>

                          <div className="w-full sm:w-36">
                            <Input
                              type="date"
                              value={action.dueDate}
                              onChange={(e) => handleUpdateActionItem(item.id, action.id, { dueDate: e.target.value })}
                              className="h-8 text-xs bg-slate-50"
                            />
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {action.syncedToCalendar ? (
                              <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 h-7">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Synced
                              </Badge>
                            ) : (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleSyncActionToCalendar(action, item.id)}
                                className="h-7 text-[10px] px-2 gap-1 border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-semibold"
                                title="Sync to Board Calendar"
                              >
                                <CalendarIcon className="w-3 h-3" />
                                Sync
                              </Button>
                            )}

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteActionItem(item.id, action.id)}
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )))}
          </div>

          {/* Bottom Add Agenda Item Controls (convenient once items are added) */}
          {meeting.agendaItems.length > 0 && (
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60 p-4 rounded-xl border">
              <div>
                <p className="font-bold text-xs text-slate-800">Add Another Agenda Item</p>
                <p className="text-[11px] text-muted-foreground">Select from common items or enter a custom title</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Select onValueChange={(val) => handleAddAgendaItem(val)}>
                  <SelectTrigger className="h-8 text-xs bg-white w-48">
                    <SelectValue placeholder="+ Add Standard Item..." />
                  </SelectTrigger>
                  <SelectContent>
                    {DEFAULT_AGENDA_ITEMS.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-1">
                  <Input
                    placeholder="Custom Item Title..."
                    value={customItemTitle}
                    onChange={(e) => setCustomItemTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && customItemTitle.trim()) {
                        handleAddAgendaItem(customItemTitle);
                      }
                    }}
                    className="h-8 text-xs w-44 bg-white"
                  />
                  <Button
                    onClick={() => handleAddAgendaItem(customItemTitle)}
                    disabled={!customItemTitle.trim()}
                    size="sm"
                    className="h-8 px-2.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
