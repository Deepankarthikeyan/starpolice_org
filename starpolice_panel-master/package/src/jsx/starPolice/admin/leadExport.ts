import type { LeadRecord } from "./leadDefaults";

function escapeCsvCell(value: string) {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** CSV with a single Mobile Number column. */
export function downloadLeadMobileNumbersCsv(
  leads: LeadRecord[],
  filename = "lead-mobile-numbers.csv"
) {
  const mobiles = leads.map((lead) => lead.mobileNumber.trim()).filter(Boolean);
  const lines = ["Mobile Number", ...mobiles.map((mobile) => escapeCsvCell(mobile))];
  const csv = `\uFEFF${lines.join("\r\n")}`;

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
