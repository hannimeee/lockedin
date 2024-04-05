// Example timelog data
const timelog = [
{ currentTimeIn: '2022-04-10T08:00:00', currentTimeOut: '2022-04-10T16:00:00', efficiency: 90 },
{ currentTimeIn: '2022-04-11T09:00:00', currentTimeOut: '2022-04-11T17:00:00', efficiency: 85 },
// More objects can be added here
];

// Function to convert the timelog array to a CSV string
function timelogToCSV(data) {
    // Add header row
    const csvRows = ['currentTimeIn,currentTimeOut,efficiency'];
    
    // Add data rows
    data.forEach(row => {
        csvRows.push(`${row.currentTimeIn},${row.currentTimeOut},${row.efficiency}`);
    });
    
    return csvRows.join('\n');
}

// Function to download data as a CSV file
function downloadCSV(csvData, filename) {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Convert timelog to CSV and trigger the download
function triggerDownload() {
    // Example CSV data and filename
    const csvData = "Name,Age\nAlice,30\nBob,25";
    const filename = "example.csv";
    
    downloadCSV(csvData, filename);
}
  