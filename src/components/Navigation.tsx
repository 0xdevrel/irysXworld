"use client";

interface NavigationProps {
  user: {
    address: string;
    username?: string;
  } | null;
  onSignOut: () => void;
}

export const Navigation = ({ user, onSignOut }: NavigationProps) => {
  const getDisplayName = () => {
    if (user?.username && user.username.trim() !== '') {
      return user.username;
    }
    if (user?.address) {
      return `${user.address.slice(0, 6)}...${user.address.slice(-4)}`;
    }
    return "User";
  };

  return (
    <header className="px-4 py-3 border-b border-gray-100">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
          <div className="w-5 h-5 bg-white rounded"></div>
        </div>
        
      
        
        {/* User Menu */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-gray-600">
              {getDisplayName().charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="relative">
            <button
              onClick={onSignOut}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
