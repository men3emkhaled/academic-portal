/**
 * Exports JSON data to a CSV file and triggers a browser download.
 * @param {Array} data - Array of objects containing the data to export.
 * @param {Array} headers - Array of strings for the CSV headers.
 * @param {string} fileName - The name of the file to be downloaded.
 */
export const exportToCSV = (data, headers, fileName) => {
  if (!data || !data.length) {
    console.error("No data to export");
    return;
  }

  const csvRows = [];
  
  // Add headers
  csvRows.push(headers.join(','));

  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      // Find the key in the object that corresponds to the header (or use a mapping if needed)
      // For simplicity, we assume the data objects have keys matching the headers or a flat structure
      // We'll handle common fields and quotes for strings
      const val = row[header.toLowerCase().replace(/ /g, '_')] || '';
      const escaped = ('' + val).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  if (link.download !== undefined) {
    link.setAttribute("href", url);
    link.setAttribute("download", `${fileName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
