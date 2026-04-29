import { useState } from "react";
import JobCard from "./JobCard";

// Column configuration with colors and gradients
const columnConfig = {
  Applied: {
    gradient: "from-blue-500/20 to-blue-600/5",
    borderColor: "border-blue-500/30",
    dotColor: "bg-blue-400",
    textColor: "text-blue-400",
    countBg: "bg-blue-500/15 text-blue-300",
  },
  Interview: {
    gradient: "from-amber-500/20 to-amber-600/5",
    borderColor: "border-amber-500/30",
    dotColor: "bg-amber-400",
    textColor: "text-amber-400",
    countBg: "bg-amber-500/15 text-amber-300",
  },
  Offer: {
    gradient: "from-emerald-500/20 to-emerald-600/5",
    borderColor: "border-emerald-500/30",
    dotColor: "bg-emerald-400",
    textColor: "text-emerald-400",
    countBg: "bg-emerald-500/15 text-emerald-300",
  },
  Rejected: {
    gradient: "from-red-500/20 to-red-600/5",
    borderColor: "border-red-500/30",
    dotColor: "bg-red-400",
    textColor: "text-red-400",
    countBg: "bg-red-500/15 text-red-300",
  },
};

const KanbanColumn = ({ status, jobs, onEdit, onDelete, onDropJob }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const config = columnConfig[status] || columnConfig.Applied;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const jobId = e.dataTransfer.getData("jobId");
    const currentStatus = e.dataTransfer.getData("currentStatus");

    // Only update if dropped in a different column
    if (currentStatus !== status && jobId) {
      onDropJob(jobId, status);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex-1 min-w-[280px] max-w-[350px] flex flex-col rounded-2xl
        bg-dark-800/40 backdrop-blur-xl border transition-all duration-300
        ${isDragOver ? `${config.borderColor} ring-1 ring-primary-400/20 bg-dark-800/60` : "border-dark-700/30"}
      `}
      id={`kanban-column-${status.toLowerCase()}`}
    >
      {/* Column Header */}
      <div className={`px-4 py-3 rounded-t-2xl bg-gradient-to-b ${config.gradient}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${config.dotColor} shadow-lg`}></span>
            <h2 className={`font-semibold text-sm ${config.textColor}`}>
              {status}
            </h2>
          </div>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${config.countBg}`}
          >
            {jobs.length}
          </span>
        </div>
      </div>

      {/* Job Cards Container */}
      <div className="flex-1 p-3 space-y-2.5 overflow-y-auto max-h-[calc(100vh-320px)] min-h-[120px]">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        ) : (
          <div
            className={`flex flex-col items-center justify-center py-8 text-dark-600 
            ${isDragOver ? "opacity-100" : "opacity-50"} transition-opacity duration-200`}
          >
            <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <p className="text-xs font-medium">
              {isDragOver ? "Drop here!" : "No jobs yet"}
            </p>
            <p className="text-[10px] mt-1">Drag cards here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
