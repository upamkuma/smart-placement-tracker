import { useState } from "react";

// Status config with colors and icons
const statusConfig = {
  Applied: {
    color: "status-applied",
    dotColor: "bg-blue-400",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    ),
  },
  Interview: {
    color: "status-interview",
    dotColor: "bg-amber-400",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  Offer: {
    color: "status-offer",
    dotColor: "bg-emerald-400",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  Rejected: {
    color: "status-rejected",
    dotColor: "bg-red-400",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

const JobCard = ({ job, onEdit, onDelete, onDragStart }) => {
  const [showActions, setShowActions] = useState(false);
  const config = statusConfig[job.status] || statusConfig.Applied;

  // Format the date nicely
  const formattedDate = new Date(job.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Days since application
  const daysSince = Math.floor(
    (new Date() - new Date(job.date)) / (1000 * 60 * 60 * 24)
  );

  return (
    <div
      draggable="true"
      onDragStart={(e) => {
        e.dataTransfer.setData("jobId", job._id);
        e.dataTransfer.setData("currentStatus", job.status);
        if (onDragStart) onDragStart(job);
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className="group bg-dark-800/80 border border-dark-700/40 rounded-xl p-4 
        hover:border-dark-600/60 hover:bg-dark-800 
        cursor-grab active:cursor-grabbing
        transition-all duration-200 hover:shadow-lg hover:shadow-dark-950/50
        animate-fade-in"
      id={`job-card-${job._id}`}
    >
      {/* Header: Company & Actions */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <h3 className="text-white font-semibold text-sm truncate">
            {job.company}
          </h3>
          <a
            href={`https://www.glassdoor.com/Search/results.htm?keyword=${encodeURIComponent(job.company + " interview questions")}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-primary-400 hover:text-primary-300 transition-opacity duration-200 ${showActions ? "opacity-100" : "opacity-0"}`}
            title={`Research ${job.company} Interviews`}
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z" />
            </svg>
          </a>
        </div>
        <p className="text-dark-400 text-xs mt-0.5 truncate w-full absolute top-10 left-4 max-w-[80%]">{job.role}</p>

        {/* Action buttons */}
        <div
          className={`flex items-center gap-1 transition-opacity duration-200 ${
            showActions ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(job);
            }}
            className="p-1.5 text-dark-500 hover:text-primary-400 hover:bg-primary-500/10 
              rounded-lg transition-all duration-150"
            title="Edit job"
            id={`edit-job-${job._id}`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(job._id);
            }}
            className="p-1.5 text-dark-500 hover:text-red-400 hover:bg-red-500/10 
              rounded-lg transition-all duration-150"
            title="Delete job"
            id={`delete-job-${job._id}`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Status badge */}
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border ${config.color}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`}></span>
          {job.status}
        </span>

        {/* Date info */}
        <div className="flex items-center gap-1 text-dark-500 text-xs">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* Notes preview */}
      {job.notes && (
        <p className="mt-3 text-dark-500 text-xs line-clamp-2 border-t border-dark-700/30 pt-2">
          {job.notes}
        </p>
      )}

      {/* Days tracker */}
      {daysSince >= 0 && (
        <div className="mt-2 text-dark-600 text-[10px] font-medium">
          {daysSince === 0 ? "Today" : `${daysSince}d ago`}
        </div>
      )}
    </div>
  );
};

export default JobCard;
