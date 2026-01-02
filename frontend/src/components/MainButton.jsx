export const MainButton = ({ text = "Button", startIcon, onClick, href }) => {
  const handleClick = () => {
    if (href) {
      window.location.href = href; // navigate
    } else if (onClick) {
      onClick(); // call user function
    }
  };

  return (
    <button
      onClick={handleClick}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium 
                     flex items-center gap-2 transition-all duration-200 
                     hover:scale-[1.03] active:scale-[0.97]"
    >
      {startIcon && <span>{startIcon}</span>}
      {text}
    </button>
  );
};
