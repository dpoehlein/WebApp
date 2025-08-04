import React from 'react';

function DownloadButton() {
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = '/assets/assignments/Number_Systems_Assignment.xlsx';
        link.download = 'Number_Systems_Assignment.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <button
            onClick={handleDownload}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
        >
            📥 Download Assignment
        </button>
    );
}

export default DownloadButton;
