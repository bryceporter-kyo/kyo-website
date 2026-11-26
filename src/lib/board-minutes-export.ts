import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { BoardMeeting } from "./board-meetings";
import { getImageMetadata } from "./image-service";

// ─── KYO Brand Palette ───────────────────────────────────────────────────────
const KYO = {
  green:        [25, 78, 24]   as [number, number, number],  // primary hsl(119 53% 20%)
  greenDark:    [13, 49, 12]   as [number, number, number],  // darker header accent
  greenLight:   [237, 247, 237] as [number, number, number], // very light green tint bg
  sage:         [119, 166, 124] as [number, number, number], // accent hsl(126 21% 56%)
  sagePale:     [224, 238, 225] as [number, number, number], // pale sage for table heads
  ink:          [15, 30, 15]   as [number, number, number],  // near-black body text
  muted:        [80, 100, 80]  as [number, number, number],  // secondary text
  border:       [180, 210, 180] as [number, number, number], // subtle green border
  white:        [255, 255, 255] as [number, number, number],
  slate:        [100, 116, 139] as [number, number, number], // footer / meta muted
};

/**
 * Fetch the KYO logo as a base64 data URL.
 * Falls back gracefully if unavailable (network / CORS).
 */
async function fetchLogoBase64(): Promise<{ data: string; format: "PNG" | "JPEG" } | null> {
  try {
    // Try the long (horizontal) logo first, fall back to the small square logo
    const longMeta = await getImageMetadata("kyo-logo-long");
    const smallMeta = await getImageMetadata("kyo-logo");
    const url = longMeta?.imageUrl || smallMeta?.imageUrl;
    if (!url) return null;

    // If already a data URL (stored directly in Firestore as base64), use it directly
    if (url.startsWith("data:image/")) {
      const format = url.startsWith("data:image/png") ? "PNG" : "JPEG";
      return { data: url, format };
    }

    // Otherwise fetch and convert to base64
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const buffer = await resp.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = "";
    bytes.forEach(b => (binary += String.fromCharCode(b)));
    const b64 = btoa(binary);
    const contentType = resp.headers.get("content-type") || "image/png";
    const format = contentType.includes("png") ? "PNG" : "JPEG";
    return { data: `data:${contentType};base64,${b64}`, format };
  } catch {
    return null;
  }
}

/**
 * Draw the KYO branded header band onto the first page (or any page).
 * Returns the Y position after the header.
 */
function drawHeader(
  doc: jsPDF,
  meeting: BoardMeeting,
  pageWidth: number,
  logoData: { data: string; format: "PNG" | "JPEG" } | null
): number {
  const BAND_H = 32; // mm — slightly taller for balanced breathing room

  // Deep green banner
  doc.setFillColor(...KYO.green);
  doc.rect(0, 0, pageWidth, BAND_H, "F");

  // Place logo with a neat, snug white card
  let textLeft = 14;
  if (logoData) {
    try {
      const cardW = 24;
      const cardH = 24;
      const cardX = 12;
      const cardY = (BAND_H - cardH) / 2;

      // Clean white rounded card with soft border
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(cardX, cardY, cardW, cardH, 2, 2, "F");

      // Center the logo inside the card
      const logoH = 18;
      const logoW = 18;
      const logoX = cardX + (cardW - logoW) / 2;
      const logoY = cardY + (cardH - logoH) / 2;

      doc.addImage(logoData.data, logoData.format, logoX, logoY, logoW, logoH, undefined, "FAST");
      textLeft = cardX + cardW + 8;
    } catch {
      textLeft = 14;
    }
  }

  // Organisation name in the banner (vertically centered nicely)
  doc.setFont("times", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...KYO.white);
  doc.text("KAWARTHA YOUTH ORCHESTRA", textLeft, 14);

  doc.setFont("times", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(210, 235, 210); // subtle light sage
  doc.text(
    `BOARD OF DIRECTORS — ${meeting.meetingType.toUpperCase()} MINUTES`,
    textLeft,
    21.5
  );

  // Styled date pill in top-right corner of banner
  const pillW = 28;
  const pillH = 7;
  const pillX = pageWidth - 12 - pillW;
  const pillY = 12.5;

  doc.setFillColor(18, 58, 17); // slightly darker translucent green
  doc.roundedRect(pillX, pillY, pillW, pillH, 1.5, 1.5, "F");
  doc.setDrawColor(...KYO.sage);
  doc.setLineWidth(0.3);
  doc.roundedRect(pillX, pillY, pillW, pillH, 1.5, 1.5, "D");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...KYO.white);
  doc.text(meeting.date, pillX + pillW / 2, pillY + 4.8, { align: "center" });

  // Thin sage accent strip below banner
  doc.setFillColor(...KYO.sage);
  doc.rect(0, BAND_H, pageWidth, 1.5, "F");

  return BAND_H + 1.5 + 7; // Y after header
}

/**
 * Draw a lightweight repeated header for pages 2+.
 */
function drawPageHeader(doc: jsPDF, meeting: BoardMeeting, pageWidth: number): number {
  const THIN_H = 10;
  doc.setFillColor(...KYO.green);
  doc.rect(0, 0, pageWidth, THIN_H, "F");
  doc.setFont("times", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...KYO.white);
  doc.text("KAWARTHA YOUTH ORCHESTRA", 10, 6.5);
  doc.setFont("times", "normal");
  doc.setFontSize(8);
  doc.setTextColor(200, 230, 200);
  doc.text(`${meeting.meetingType.toUpperCase()} MINUTES — ${meeting.date}`, pageWidth - 10, 6.5, { align: "right" });

  doc.setFillColor(...KYO.sage);
  doc.rect(0, THIN_H, pageWidth, 0.8, "F");
  return THIN_H + 0.8 + 5;
}

/**
 * Draw the footer on a given page.
 */
function drawFooter(doc: jsPDF, pageWidth: number, pageNum: number, totalPages: number, meeting: BoardMeeting) {
  const footerY = 290;
  doc.setDrawColor(...KYO.border);
  doc.setLineWidth(0.3);
  doc.line(14, footerY - 3, pageWidth - 14, footerY - 3);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...KYO.slate);
  doc.text(
    `Kawartha Youth Orchestra  •  Board Minutes: ${meeting.date}  •  CONFIDENTIAL — BOARD USE ONLY`,
    pageWidth / 2,
    footerY,
    { align: "center" }
  );
  doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - 14, footerY, { align: "right" });
}

/**
 * Generate a branded KYO PDF for a board meeting.
 * Async so it can fetch the logo from Firebase Storage.
 */
export async function generateBoardMeetingPdf(meeting: BoardMeeting): Promise<jsPDF> {
  const logoData = await fetchLogoBase64();

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  // ── Page 1 Header ────────────────────────────────────────────────────────
  let currentY = drawHeader(doc, meeting, pageWidth, logoData);

  // ── Meeting Metadata ─────────────────────────────────────────────────────
  // Helper to format names nicely if empty or raw email
  const formatPerson = (personStr?: string) => {
    if (!personStr || personStr.trim() === "" || personStr.toUpperCase() === "N/A") return "—";
    if (personStr.includes("@")) {
      const parts = personStr.split("@")[0].split(/[._-]/);
      return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(" ");
    }
    return personStr;
  };

  const chairFormatted = formatPerson(meeting.chair);
  const secFormatted = formatPerson(meeting.secretary);

  autoTable(doc, {
    startY: currentY,
    theme: "plain",
    styles: {
      fontSize: 8.5,
      cellPadding: { top: 2.2, bottom: 2.2, left: 3, right: 3 },
      textColor: KYO.ink,
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 30, textColor: KYO.green },
      1: { cellWidth: 64 },
      2: { fontStyle: "bold", cellWidth: 30, textColor: KYO.green },
      3: { cellWidth: 64 },
    },
    body: [
      [
        "Date & Time",
        `${meeting.date}  ·  ${meeting.time}`,
        "Meeting Type",
        meeting.meetingType,
      ],
      [
        "Location",
        `${meeting.locationType.charAt(0).toUpperCase() + meeting.locationType.slice(1)}${meeting.locationDetails ? `  —  ${meeting.locationDetails}` : ""}`,
        "Next Meeting",
        meeting.nextMeetingDate || "TBD",
      ],
      [
        "Chair",
        chairFormatted,
        "Secretary",
        secFormatted,
      ],
    ],
  });

  currentY = (doc as any).lastAutoTable.finalY + 3;

  // Thin green rule under metadata
  doc.setDrawColor(...KYO.border);
  doc.setLineWidth(0.4);
  doc.line(14, currentY, pageWidth - 14, currentY);
  currentY += 7;

  // ── Attendance & Quorum ──────────────────────────────────────────────────
  const present = meeting.attendees.filter(a => a.status === "present").map(a => a.name).join(", ") || "None recorded";
  const regrets = meeting.attendees.filter(a => a.status === "regrets").map(a => a.name).join(", ") || "None";
  const guests  = meeting.attendees.filter(a => a.status === "guest").map(a => a.name).join(", ");
  const ineligible = meeting.attendees.filter(a => a.isIneligibleToVote).map(a => a.name).join(", ");

  // Section label with small decorative accent bar
  doc.setFillColor(...KYO.green);
  doc.rect(14, currentY - 0.5, 2.5, 5, "F");
  doc.setFont("times", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...KYO.green);
  doc.text("ATTENDANCE & QUORUM", 19, currentY + 3.5);
  currentY += 7;

  autoTable(doc, {
    startY: currentY,
    theme: "grid",
    headStyles: {
      fillColor: KYO.green,
      textColor: KYO.white,
      fontStyle: "bold",
      fontSize: 8.5,
      cellPadding: 3,
    },
    alternateRowStyles: { fillColor: KYO.greenLight },
    styles: { fontSize: 8.5, cellPadding: 2.8, textColor: KYO.ink },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 36, textColor: KYO.muted } },
    head: [["STATUS", "MEMBERS"]],
    body: [
      ["Present", present],
      ["Regrets", regrets],
      ...(guests     ? [["Guests / Staff", guests]]            : []),
      ...(ineligible ? [["Ineligible to Vote", ineligible]]    : []),
    ],
  });

  currentY = (doc as any).lastAutoTable.finalY + 11;

  // ── Agenda Items ─────────────────────────────────────────────────────────
  if (meeting.agendaItems.length > 0) {
    doc.setFillColor(...KYO.green);
    doc.rect(14, currentY - 0.5, 2.5, 5, "F");
    doc.setFont("times", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(...KYO.green);
    doc.text("AGENDA, DISCUSSION & DECISIONS", 19, currentY + 3.5);
    currentY += 10;
  }

  meeting.agendaItems.forEach((item, index) => {
    // Page overflow check
    if (currentY > 255) {
      doc.addPage();
      currentY = drawPageHeader(doc, meeting, pageWidth);
    }

    // ── Agenda item title bar ────────────────────────────────────────────
    const titleBarH = 8;
    const barY = currentY;

    // Soft sage tinted title background with rounded border
    doc.setFillColor(...KYO.sagePale);
    doc.roundedRect(14, barY, pageWidth - 28, titleBarH, 1, 1, "F");

    // Green left accent bar
    doc.setFillColor(...KYO.green);
    doc.rect(14, barY, 2.5, titleBarH, "F");

    // Item number circle - perfectly centered
    const circleCenterX = 21;
    const circleCenterY = barY + titleBarH / 2;
    doc.setFillColor(...KYO.green);
    doc.circle(circleCenterX, circleCenterY, 3.2, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...KYO.white);
    const numStr = String(index + 1);
    doc.text(numStr, circleCenterX, circleCenterY + 1.1, { align: "center" });

    // Item title text
    doc.setFont("times", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(...KYO.greenDark);
    doc.text(item.title, 27, barY + 5.5);
    currentY = barY + titleBarH + 3;

    // ── Discussion text ──────────────────────────────────────────────────
    if (item.discussion && item.discussion.trim()) {
      const stripped = item.discussion.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      if (stripped) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...KYO.ink);

        const lines = doc.splitTextToSize(stripped, pageWidth - 36);
        for (const line of lines) {
          if (currentY > 278) {
            doc.addPage();
            currentY = drawPageHeader(doc, meeting, pageWidth);
          }
          doc.text(line, 20, currentY);
          currentY += 4.5;
        }
        currentY += 3;
      }
    }

    // ── Motions ──────────────────────────────────────────────────────────
    if (item.motions && item.motions.length > 0) {
      item.motions.forEach(motion => {
        if (currentY > 255) {
          doc.addPage();
          currentY = drawPageHeader(doc, meeting, pageWidth);
        }

        const isCarried = motion.result === "approved" || motion.result === "unanimous";
        const resultColour: [number, number, number] = isCarried ? [22, 101, 52] : [153, 27, 27];
        const resultBg: [number, number, number]     = isCarried ? [220, 252, 231] : [254, 226, 226];

        const rollCallSummary = motion.voterRollCall
          ? Object.entries(motion.voterRollCall).map(([name, vote]) => `${name}: ${vote}`).join("  ·  ")
          : "";

        autoTable(doc, {
          startY: currentY,
          theme: "grid",
          headStyles: {
            fillColor: resultBg,
            textColor: resultColour,
            fontStyle: "bold",
            fontSize: 8.5,
          },
          styles: { fontSize: 8, cellPadding: 2, textColor: KYO.ink },
          columnStyles: {
            0: { fontStyle: "bold", cellWidth: 30, textColor: KYO.muted },
          },
          head: [
            [`MOTION — ${motion.result.toUpperCase()}`, ""],
          ],
          body: [
            ["Motion Text", motion.text],
            ["Moved by", `${motion.movedBy || "—"}   |   Seconded by: ${motion.secondedBy || "—"}`],
            ...(rollCallSummary ? [["Roll Call", rollCallSummary]] : []),
          ],
          margin: { left: 20, right: 14 },
        });
        currentY = (doc as any).lastAutoTable.finalY + 4;
      });
    }

    // ── Action Items ─────────────────────────────────────────────────────
    if (item.actionItems && item.actionItems.length > 0) {
      if (currentY > 255) {
        doc.addPage();
        currentY = drawPageHeader(doc, meeting, pageWidth);
      }

      autoTable(doc, {
        startY: currentY,
        theme: "striped",
        headStyles: {
          fillColor: KYO.sagePale,
          textColor: KYO.greenDark,
          fontStyle: "bold",
          fontSize: 8,
        },
        alternateRowStyles: { fillColor: KYO.greenLight },
        styles: { fontSize: 8, cellPadding: 2, textColor: KYO.ink },
        head: [["✓ ACTION ITEM", "ASSIGNED TO", "DUE DATE"]],
        body: item.actionItems.map(a => [
          a.task,
          a.assignedTo || "—",
          a.dueDate || meeting.nextMeetingDate || "Next Meeting",
        ]),
        margin: { left: 20, right: 14 },
      });
      currentY = (doc as any).lastAutoTable.finalY + 5;
    }

    currentY += 6;
  });

  // ── Footers (all pages) ──────────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(doc, pageWidth, i, totalPages, meeting);
  }

  return doc;
}

/**
 * Trigger download of a single meeting minutes PDF
 */
export async function downloadMeetingPdf(meeting: BoardMeeting): Promise<void> {
  const doc = await generateBoardMeetingPdf(meeting);
  const filename = `${meeting.date}_Board_Meeting`;
  doc.save(`${filename}.pdf`);
}

/**
 * Generates the Board Meeting Minutes PDF and uploads it to Google Drive
 * via the configured Google Apps Script Web App.
 */
export async function saveMeetingPdfToDrive(meeting: BoardMeeting): Promise<{ fileId: string; fileUrl: string }> {
  const { callGrantsAppsScript } = await import("@/lib/grants/grant-actions");
  const doc = await generateBoardMeetingPdf(meeting);
  const fileName = `${meeting.date}_Board_Meeting.pdf`;
  const dataUri = doc.output("datauristring");
  const pdfBase64 = dataUri.split(",")[1] || "";
  const year = (meeting.date || "").split("-")[0] || new Date().getFullYear().toString();

  const res = await callGrantsAppsScript("saveBoardMinutesPdf", {
    fileName,
    pdfBase64,
    year,
    meetingType: meeting.meetingType,
  });

  return { fileId: res.fileId, fileUrl: res.fileUrl };
}

/**
 * Export a mass PDF bundle as a zipped archive for a specific date range (for audits)
 */
export async function exportMassMinutesPdfZip(
  meetings: BoardMeeting[],
  zipFilename = "KYO_Board_Minutes_Audit_Package.zip"
): Promise<void> {
  const zip = new JSZip();

  await Promise.all(
    meetings.map(async (meeting) => {
      const doc = await generateBoardMeetingPdf(meeting);
      const pdfBlob = doc.output("blob");
      const safeName = `KYO_Minutes_${meeting.date}_${meeting.meetingType.replace(/\s+/g, "_")}.pdf`;
      zip.file(safeName, pdfBlob);
    })
  );

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
