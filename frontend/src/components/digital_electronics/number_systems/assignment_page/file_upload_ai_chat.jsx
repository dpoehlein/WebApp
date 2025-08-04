import React, { useState } from 'react';

function FileUploadAIChat() {
    const [file, setFile] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('http://localhost:8000/grade/number_systems', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            setFeedback(data.feedback || 'No feedback returned.');
        } catch (err) {
            setFeedback('Something went wrong while uploading the file.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Upload Your Completed Assignment</h2>
            <input type="file" accept=".xlsx" onChange={handleFileChange} className="mb-2" />
            <button
                onClick={handleUpload}
                disabled={!file || loading}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition disabled:opacity-50"
            >
                {loading ? 'Evaluating...' : 'Upload & Get Feedback'}
            </button>

            {feedback && (
                <div className="mt-4 p-4 bg-gray-100 border rounded">
                    <h3 className="font-bold mb-2">AI Feedback:</h3>
                    <pre className="whitespace-pre-wrap">{feedback}</pre>
                </div>
            )}
        </div>
    );
}

export default FileUploadAIChat;
