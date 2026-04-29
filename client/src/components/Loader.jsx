const Loader = ({ text = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      {/* Animated spinner */}
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-dark-700"></div>
        <div className="w-12 h-12 rounded-full border-4 border-transparent border-t-primary-500 animate-spin absolute top-0 left-0"></div>
      </div>
      <p className="text-dark-400 text-sm font-medium animate-pulse">{text}</p>
    </div>
  );
};

export default Loader;
