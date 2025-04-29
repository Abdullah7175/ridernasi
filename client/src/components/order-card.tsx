import { Order } from "@shared/schema";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useOrders } from "@/context/orders-context";
import { MapPinIcon, CreditCardIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface OrderCardProps {
  order: Order;
  onClick: () => void;
  isUpcoming?: boolean;
}

export default function OrderCard({ order, onClick, isUpcoming = false }: OrderCardProps) {
  const { updateOrderStatus } = useOrders();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Helper functions
  const getStatusBadgeClass = () => {
    switch (order.status) {
      case "assigned":
        return "bg-[#86EFAC]/20 text-[#15803D]";
      case "in_progress":
        return "bg-[#7DD3FC]/20 text-[#0369A1]";
      default:
        return "bg-[#F3F4F6] text-[#4B5563]";
    }
  };
  
  const getStatusText = () => {
    switch (order.status) {
      case "assigned":
        return "Assigned";
      case "in_progress":
        return "In Progress";
      case "completed":
        return "Completed";
      default:
        return "Scheduled";
    }
  };
  
  const getOrderTypeClass = () => {
    switch (order.orderType) {
      case "pickup":
        return "text-[#F59E0B]";
      case "delivery":
        return "text-[#10B981]";
      default:
        return "text-[#0EA5E9]";
    }
  };

  const handleStartDelivery = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUpdating(true);
    
    try {
      await updateOrderStatus(order.id, "in_progress");
      toast({
        title: "Delivery Started",
        description: `You're now delivering order #${order.orderNumber}`,
      });
      navigate(`/map/${order.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start delivery. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleViewRoute = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/map/${order.id}`);
  };

  const handleCompleteDelivery = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/payment/${order.id}`);
  };

  // For upcoming orders
  if (isUpcoming) {
    return (
      <div className="order-card bg-white rounded-lg shadow-sm p-4 mb-3 opacity-75">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-semibold text-[#1F2937]">Order #{order.orderNumber}</h4>
            <p className="text-sm text-[#4B5563]">
              {order.itemCount} items • 
              <span className={getOrderTypeClass()}>
                {' '}{order.orderType === 'both' ? 'Pickup & Delivery' : order.orderType}
              </span>
            </p>
          </div>
          <div className="bg-[#F3F4F6] text-[#4B5563] text-xs font-medium py-1 px-2 rounded-full">
            Scheduled
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-[#F3F4F6]">
          <div className="flex items-start space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#9CA3AF] mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <div>
              <p className="text-sm font-medium text-[#1F2937]">
                {order.scheduledDate ? format(new Date(order.scheduledDate), "EEEE, h:mm a") : "Tomorrow"}
              </p>
              <p className="text-xs text-[#4B5563]">{order.customerAddress}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For active orders
  return (
    <div 
      className="order-card bg-white rounded-lg shadow-sm p-4 mb-3 cursor-pointer" 
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-[#1F2937]">Order #{order.orderNumber}</h4>
          <p className="text-sm text-[#4B5563]">
            {order.itemCount} items • 
            <span className={getOrderTypeClass()}>
              {' '}{order.orderType === 'both' ? 'Pickup & Delivery' : order.orderType}
            </span>
          </p>
        </div>
        <div className={`${getStatusBadgeClass()} text-xs font-medium py-1 px-2 rounded-full`}>
          {getStatusText()}
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-[#F3F4F6]">
        <div className="flex items-start space-x-3">
          <MapPinIcon className="h-5 w-5 text-[#9CA3AF] mt-1" />
          <div>
            <p className="text-sm font-medium text-[#1F2937]">{order.customerName}</p>
            <p className="text-xs text-[#4B5563]">{order.customerAddress}</p>
          </div>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-[#F3F4F6]">
        <div className="flex items-start space-x-3">
          <CreditCardIcon className="h-5 w-5 text-[#9CA3AF] mt-1" />
          <div>
            <p className="text-sm font-medium text-[#1F2937]">
              Payment: {order.paymentMethod || 'Not specified'}
            </p>
            <p className="text-xs text-[#4B5563]">
              Amount: {(order.totalAmount / 100).toFixed(2)} SAR
            </p>
          </div>
        </div>
      </div>
      <div className="mt-3 flex justify-end space-x-2">
        {order.status === "assigned" && (
          <Button 
            className="py-2 px-4 bg-[#22C55E] hover:bg-[#15803D] text-white rounded-lg text-sm font-medium"
            onClick={handleStartDelivery}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            ) : null}
            Start Delivery
          </Button>
        )}
        
        {order.status === "in_progress" && (
          <>
            <Button 
              variant="outline"
              className="py-2 px-4 text-[#4B5563] rounded-lg text-sm font-medium"
              onClick={handleViewRoute}
            >
              View Route
            </Button>
            <Button 
              className="py-2 px-4 bg-[#22C55E] hover:bg-[#15803D] text-white rounded-lg text-sm font-medium"
              onClick={handleCompleteDelivery}
            >
              Complete
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
