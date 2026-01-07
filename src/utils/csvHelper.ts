/**
 * UTILITY: CSV Downloader
 * Converts JSON data into a downloadable .csv file for Excel/Sheets.
 */
export const downloadDatasetAsCSV = (filename: string, rows: any[]) => {
  if (!rows || rows.length === 0) {
    alert("No data available to download.");
    return;
  }

  // 1. Safety Check: Parse rows if they are strings (sometimes happens with AI data)
  const parsedRows = rows.map(row => {
    if (typeof row === 'string') {
      try { return JSON.parse(row); } catch (e) { return {}; }
    }
    return row;
  });

  if (parsedRows.length === 0) return;

  // 2. Extract Headers from the first row
  const headers = Object.keys(parsedRows[0]);
  
  // 3. Build CSV String
  const csvContent = [
    headers.join(','), // Header Row
    ...parsedRows.map(row => headers.map(fieldName => {
      // Wrap values in quotes to handle commas inside text (e.g. "Mumbai, India")
      const val = row[fieldName] !== undefined ? row[fieldName] : '';
      return JSON.stringify(val); 
    }).join(','))
  ].join('\n');

  // 4. Trigger Browser Download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) { 
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename || 'case_study_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
