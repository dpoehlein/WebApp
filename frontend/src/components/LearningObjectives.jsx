const LearningObjectives = ({ objectives = [], progress = [] }) => {
    return (
        <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Learning Objectives</h2>
            <ul className="space-y-2">
                {objectives.map((obj, index) => {
                    const isComplete = progress[index] || false;
                    return (
                        <li
                            key={index}
                            className="flex justify-between items-center bg-white border rounded px-3 py-2"
                        >
                            <span className="text-gray-800">{obj}</span>
                            <span className="ml-4 text-sm">
                                {isComplete ? '🟢 Completed' : '🔵 Pending'}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default LearningObjectives;
