import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useOrders } from "@/context/orders-context";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, BellIcon } from "lucide-react";
import OrderCard from "@/components/order-card";
import { Order } from "@shared/schema";
import { format } from "date-fns";

export default function OrdersPage() {
  const { user } = useAuth();
  const { orders, isLoading, fetchOrders } = useOrders();
  const [, navigate] = useLocation();
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    fetchOrders();
    // In a real app, we would set up a WebSocket connection here
    // to listen for new orders and update the notification count
    
    // Simulate notification count for now
    setNotificationCount(Math.floor(Math.random() * 5));
  }, [fetchOrders]);
  
  // Group orders by status
  const activeOrders = orders.filter(
    (order) => order.status === "assigned" || order.status === "in_progress"
  );
  
  const upcomingOrders = orders.filter(
    (order) => order.scheduledDate && new Date(order.scheduledDate) > new Date()
  );

  const handleOrderSelect = (orderId: number) => {
    navigate(`/map/${orderId}`);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <header className="bg-white p-4 shadow-sm flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 9v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9"/>
              <path d="M9 22V12h6v10M2 10.6L12 2l10 8.6"/>
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-[#1F2937]">Your Orders</h1>
        </div>
        <div className="relative">
          <BellIcon className="h-6 w-6 text-[#4B5563]" />
          {notificationCount > 0 && (
            <span className="notification-badge">{notificationCount}</span>
          )}
        </div>
      </header>

      {/* Orders List */}
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold text-[#1F2937]">Today's Deliveries</h2>
            <p className="text-sm text-[#4B5563]">
              {format(new Date(), "MMMM d, yyyy")}
            </p>
          </div>
          <div className="bg-[#86EFAC]/30 text-[#15803D] text-sm font-medium py-1 px-3 rounded-full">
            <span>{orders.length}</span> Orders
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Active Orders Section */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-[#4B5563] mb-3">ACTIVE ORDERS</h3>
              
              {activeOrders.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                  <p className="text-[#4B5563]">No active orders at the moment</p>
                </div>
              ) : (
                activeOrders.map((order) => (
                  <OrderCard 
                    key={order.id}
                    order={order}
                    onClick={() => handleOrderSelect(order.id)}
                  />
                ))
              )}
            </div>

            {/* Upcoming Orders Section */}
            {upcomingOrders.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-[#4B5563] mb-3">UPCOMING ORDERS</h3>
                
                {upcomingOrders.map((order) => (
                  <OrderCard 
                    key={order.id}
                    order={order}
                    onClick={() => handleOrderSelect(order.id)}
                    isUpcoming
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
