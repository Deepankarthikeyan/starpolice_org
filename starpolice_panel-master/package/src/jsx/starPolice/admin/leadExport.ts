import type { LeadRecord } from "./leadDefaults";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Excel-compatible workbook with a single Mobile Number column (opens in Excel / LibreOffice). */
export function downloadLeadMobileNumbersSheet(
  leads: LeadRecord[],
  filename = "lead-mobile-numbers.xls"
) {
  const mobiles = leads.map((lead) => lead.mobileNumber.trim()).filter(Boolean);
  const rows = mobiles
    .map(
      (mobile) =>
        `<Row><Cell><Data ss:Type="String">${escapeXml(mobile)}</Data></Cell></Row>`
    )
    .join("");

  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="Mobile Numbers">
  <Table>
   <Row><Cell><Data ss:Type="String">Mobile Number</Data></Cell></Row>
   ${rows}
  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
