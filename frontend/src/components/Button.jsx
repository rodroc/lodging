function Button({ type = 'button', className = '', onClick, children, variant = 'primary', disabled = false }) {
  const baseClasses = 'font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white', 
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white'
  };
  
  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;
