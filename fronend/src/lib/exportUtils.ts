export function exportToCSV(headers: string[], rows: string[][], filename: string) {
  const bom = "\uFEFF"; // UTF-8 BOM for Arabic support
  const csv = bom + [headers.join(","), ...rows.map((r) => r.map((c) => `"${(c || "").replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, `${filename}.csv`);
}

export function exportToPDF(title: string, headers: string[], rows: string[][], isRTL = false) {
  const html = `<!DOCTYPE html>
<html dir="${isRTL ? "rtl" : "ltr"}" lang="${isRTL ? "ar" : "en"}">
<head><meta charset="utf-8"><title>${title}</title>
<style>
  body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 20px; direction: ${isRTL ? "rtl" : "ltr"}; }
  h1 { font-size: 18px; margin-bottom: 4px; color: #1a1a1a; }
  .date { font-size: 11px; color: #888; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { background: #f5f5f5; padding: 8px 6px; border: 1px solid #ddd; text-align: ${isRTL ? "right" : "left"}; font-weight: 600; }
  td { padding: 6px; border: 1px solid #eee; }
  tr:nth-child(even) { background: #fafafa; }
  @media print { body { padding: 0; } }
</style>
</head><body>
<h1>${title}</h1>
<p class="date">${new Date().toLocaleDateString(isRTL ? "ar-SA" : "en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
<table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
<tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c || ""}</td>`).join("")}</tr>`).join("")}</tbody></table>
</body></html>`;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 300);
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
