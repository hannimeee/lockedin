function handleFileSelect(event) {
    const file = event.target.files[0];

    if (file) {
        // Create a FileReader object
        const reader = new FileReader();
        
        // Set up the callback for when the file is fully read
        reader.onload = function(e) {
            const text = e.target.result;
            // Parse the CSV text
            const data = parseCSV(text);
            // Display or use the parsed data (for demonstration purposes)
            document.getElementById('output').textContent = JSON.stringify(data, null, 4);
        };
        
        // Read the file as text
        reader.readAsText(file);
    }
}

function parseCSV(text) {
    // Split the input text into rows
    const rows = text.split('\n');
    // Parse rows into columns and trim whitespace
    return rows.map(row => row.split(',').map(cell => cell.trim()));
}
