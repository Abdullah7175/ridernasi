import { useLocation } from "wouter";
import { ListIcon, UserIcon } from "lucide-react";

export default function BottomNavigation() {
  const [location, navigate] = useLocation();
  
  // Determine active tab based on current location
  const isOrdersActive = location === "/" || location === "/orders" || location.startsWith('/map/') || location.startsWith('/payment/');
  const isProfileActive = location === "/profile";

  return (
    <nav className="fixed bottom-0 w-full bg-white shadow-md max-w-md mx-auto">
      <div className="flex justify-around">
        <button 
          className={`flex flex-col items-center py-2 px-4 w-full ${isOrdersActive ? 'active' : 'text-[#4B5563]'}`}
          onClick={() => navigate("/orders")}
        >
          <ListIcon className="h-6 w-6" />
          <span className="text-xs mt-1">Orders</span>
        </button>
        
        <button 
          className={`flex flex-col items-center py-2 px-4 w-full ${isProfileActive ? 'active' : 'text-[#4B5563]'}`}
          onClick={() => navigate("/profile")}
        >
          <UserIcon className="h-6 w-6" />
          <span className="text-xs mt-1">Profile</span>
        </button>
      </div>
    </nav>
  );
}
