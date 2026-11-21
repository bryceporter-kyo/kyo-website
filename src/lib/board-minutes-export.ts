import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { BoardMeeting } from "./board-meetings";

/**
 * Generate a single official PDF for a board meeting
 */
export function generateBoardMeetingPdf(meeting: BoardMeeting): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 18;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text("KAWARTHA YOUTH ORCHESTRA", pageWidth / 2, currentY, { align: "center" });

  currentY += 6;
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(`BOARD OF DIRECTORS — ${meeting.meetingType.toUpperCase()} MINUTES`, pageWidth / 2, currentY, { align: "center" });

  currentY += 8;
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.5);
  doc.line(14, currentY, pageWidth - 14, currentY);

  currentY += 6;

  // Meeting Metadata Grid
  autoTable(doc, {
    startY: currentY,
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 1.5, textColor: [30, 41, 59] },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 28 },
      1: { cellWidth: 65 },
      2: { fontStyle: "bold", cellWidth: 28 },
      3: { cellWidth: 65 },
    },
    body: [
      ["Date & Time:", `${meeting.date} at ${meeting.time}`, "Meeting Type:", meeting.meetingType],
      ["Location:", `${meeting.locationType.toUpperCase()} ${meeting.locationDetails ? `(${meeting.locationDetails})` : ''}`, "Next Meeting:", meeting.nextMeetingDate || "TBD"],
      ["Chair:", meeting.chair || "N/A", "Secretary:", meeting.secretary || "N/A"],
    ],
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // Attendees Section
  const present = meeting.attendees.filter(a => a.status === 'present').map(a => a.name).join(", ") || "None recorded";
  const regrets = meeting.attendees.filter(a => a.status === 'regrets').map(a => a.name).join(", ") || "None";
  const guests = meeting.attendees.filter(a => a.status === 'guest').map(a => a.name).join(", ");

  autoTable(doc, {
    startY: currentY,
    theme: "striped",
    headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: "bold", fontSize: 9 },
    styles: { fontSize: 8.5, cellPadding: 2 },
    body: [
      ["Present", present],
      ["Regrets", regrets],
      ...(guests ? [["Guests / Staff", guests]] : []),
    ],
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Agenda Items Loop
  meeting.agendaItems.forEach((item, index) => {
    // Check page overflow
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(`${index + 1}. ${item.title}`, 14, currentY);
    currentY += 5;

    // Discussion text
    if (item.discussion && item.discussion.trim()) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      
      const lines = doc.splitTextToSize(item.discussion.trim(), pageWidth - 28);
      for (const line of lines) {
        if (currentY > 275) {
          doc.addPage();
          currentY = 20;
        }
        doc.text(line, 14, currentY);
        currentY += 4.5;
      }
      currentY += 2;
    }

    // Motions in this item
    if (item.motions && item.motions.length > 0) {
      item.motions.forEach(motion => {
        if (currentY > 255) {
          doc.addPage();
          currentY = 20;
        }

        const rollCallSummary = motion.voterRollCall 
          ? Object.entries(motion.voterRollCall).map(([name, vote]) => `${name}: ${vote}`).join(", ")
          : "";

        autoTable(doc, {
          startY: currentY,
          theme: "grid",
          headStyles: { fillColor: [238, 242, 255], textColor: [49, 46, 129], fontStyle: "bold", fontSize: 8.5 },
          styles: { fontSize: 8, cellPadding: 2 },
          head: [["MOTION", `Result: ${motion.result.toUpperCase()}`]],
          body: [
            ["Text:", motion.text],
            ["Moved by:", motion.movedBy || "—", "Seconded by:", motion.secondedBy || "—"],
            ...(rollCallSummary ? [["Roll Call:", rollCallSummary]] : []),
          ],
        });
        currentY = (doc as any).lastAutoTable.finalY + 4;
      });
    }

    // Action Items in this item
    if (item.actionItems && item.actionItems.length > 0) {
      if (currentY > 255) {
        doc.addPage();
        currentY = 20;
      }

      autoTable(doc, {
        startY: currentY,
        theme: "plain",
        styles: { fontSize: 8, cellPadding: 1.5 },
        headStyles: { fillColor: [248, 250, 252], textColor: [100, 116, 139], fontStyle: "bold" },
        head: [["Action Task", "Assigned To", "Due Date"]],
        body: item.actionItems.map(a => [
          a.task,
          a.assignedTo || "—",
          a.dueDate || meeting.nextMeetingDate || "Next Meeting"
        ]),
      });
      currentY = (doc as any).lastAutoTable.finalY + 5;
    }

    currentY += 4;
  });

  // Footer / Page numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Kawartha Youth Orchestra • Board Minutes: ${meeting.date} • Page ${i} of ${totalPages}`,
      pageWidth / 2,
      287,
      { align: "center" }
    );
  }

  return doc;
}

/**
 * Trigger download of a single meeting minutes PDF
 */
export function downloadMeetingPdf(meeting: BoardMeeting) {
  const doc = generateBoardMeetingPdf(meeting);
  const safeTitle = (meeting.title || `Board_Minutes_${meeting.date}`).replace(/[^a-zA-Z0-9_-]/g, "_");
  doc.save(`${safeTitle}.pdf`);
}

/**
 * Export a mass PDF bundle as a zipped archive for a specific date range (for audits)
 */
export async function exportMassMinutesPdfZip(
  meetings: BoardMeeting[],
  zipFilename = "KYO_Board_Minutes_Audit_Package.zip"
): Promise<void> {
  const zip = new JSZip();

  meetings.forEach((meeting) => {
    const doc = generateBoardMeetingPdf(meeting);
    const pdfBlob = doc.output("blob");
    const safeName = `KYO_Minutes_${meeting.date}_${meeting.meetingType.replace(/\s+/g, '_')}.pdf`;
    zip.file(safeName, pdfBlob);
  });

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, zipFilename);
}

/**
 * Convert meetings array into a flattened CSV format suitable for Excel or legacy archival
 */
export function exportMeetingsToCsv(meetings: BoardMeeting[]): string {
  const headers = [
    "MeetingID",
    "Date",
    "Time",
    "MeetingType",
    "LocationType",
    "LocationDetails",
    "Chair",
    "Secretary",
    "AttendeesPresent",
    "AttendeesRegrets",
    "AgendaItemTitle",
    "Discussion",
    "MotionText",
    "MotionMovedBy",
    "MotionSecondedBy",
    "MotionResult",
    "ActionTask",
    "ActionAssignedTo",
    "ActionDueDate"
  ];

  const rows: string[][] = [];

  meetings.forEach(m => {
    const present = m.attendees.filter(a => a.status === 'present').map(a => a.name).join("; ");
    const regrets = m.attendees.filter(a => a.status === 'regrets').map(a => a.name).join("; ");

    if (m.agendaItems.length === 0) {
      rows.push([
        m.id,
        m.date,
        m.time,
        m.meetingType,
        m.locationType,
        m.locationDetails || '',
        m.chair,
        m.secretary,
        present,
        regrets,
        '', '', '', '', '', '', '', '', ''
      ]);
    } else {
      m.agendaItems.forEach(item => {
        const motionsSummary = item.motions?.map(mo => `${mo.text} (Moved by: ${mo.movedBy}, 2nd: ${mo.secondedBy} [${mo.result}])`).join(" | ") || "";
        const actionsSummary = item.actionItems?.map(ac => `${ac.task} -> ${ac.assignedTo} (Due: ${ac.dueDate})`).join(" | ") || "";

        rows.push([
          m.id,
          m.date,
          m.time,
          m.meetingType,
          m.locationType,
          m.locationDetails || '',
          m.chair,
          m.secretary,
          present,
          regrets,
          item.title,
          item.discussion.replace(/\n/g, ' '),
          motionsSummary,
          '',
          '',
          '',
          actionsSummary,
          '',
          ''
        ]);
      });
    }
  });

  const csvContent = [
    headers.map(h => `"${h}"`).join(","),
    ...rows.map(r => r.map(c => `"${String(c || '').replace(/"/g, '""')}"`).join(","))
  ].join("\n");

  return csvContent;
}
