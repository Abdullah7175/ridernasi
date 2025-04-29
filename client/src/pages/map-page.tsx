import { useEffect, useRef, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useOrders } from "@/context/orders-context";
import { ChevronLeft, Loader2, Clock, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Order } from "@shared/schema";

// For OpenStreetMap integration
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

export default function MapPage() {
  const [, navigate] = useLocation();
  const [, params] = useRoute<{ orderId: string }>('/map/:orderId');
  const { getOrderById, updateOrderStatus } = useOrders();
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);

  const [isUpdating, setIsUpdating] = useState(false);
  
  const orderId = params?.orderId ? parseInt(params.orderId) : 0;
  const order = getOrderById(orderId);

  useEffect(() => {
    if (!order?.latitude || !order?.longitude || !mapRef.current) return;
    
    // Only initialize map once
    if (!leafletMap.current) {
      // Initialize the map
      leafletMap.current = L.map(mapRef.current).setView(
        [parseFloat(order.latitude), parseFloat(order.longitude)], 
        15
      );
      
      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(leafletMap.current);
      
      // Add a marker for the delivery location
      L.marker([parseFloat(order.latitude), parseFloat(order.longitude)])
        .addTo(leafletMap.current)
        .bindPopup(`Delivery to: ${order.customerName}`)
        .openPopup();
    }
    
    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [order]);

  const handleBackToOrders = () => {
    navigate('/orders');
  };

  const handleCompleteDelivery = async () => {
    if (!order) return;
    
    setIsUpdating(true);
    
    try {
      await updateOrderStatus(order.id, "completed");
      navigate(`/payment/${order.id}`);
    } catch (error) {
      console.error('Failed to update order status', error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleCallCustomer = () => {
    if (order?.customerPhone) {
      window.location.href = `tel:${order.customerPhone}`;
    }
  };

  if (!order) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <header className="bg-white p-4 shadow-sm flex justify-between items-center sticky top-0 z-10">
        <button 
          className="flex items-center space-x-2 text-[#4B5563]"
          onClick={handleBackToOrders}
        >
          <ChevronLeft className="h-5 w-5" />
          <span>Back to Orders</span>
        </button>
        <div className={`
          ${order.status === 'assigned' ? 'bg-[#86EFAC]/20 text-[#15803D]' : ''}
          ${order.status === 'in_progress' ? 'bg-[#7DD3FC]/20 text-[#0369A1]' : ''}
          text-xs font-medium py-1 px-2 rounded-full
        `}>
          {order.status === 'assigned' ? 'Assigned' : 'In Progress'}
        </div>
      </header>

      {/* Map Container */}
      <div ref={mapRef} className="h-[40vh] bg-[#9CA3AF] relative z-0"></div>

      {/* Delivery Details */}
      <Card className="rounded-none shadow-md">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-[#1F2937]">Order #{order.orderNumber}</h2>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4 text-[#4B5563]" />
              <span className="text-sm text-[#4B5563]">30 min</span>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex items-start space-x-3 mb-4">
              <div className="bg-[#7DD3FC]/30 rounded-full p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#0EA5E9]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-[#4B5563]">Delivery Address</p>
                <p className="text-sm font-medium text-[#1F2937]">{order.customerName}</p>
                <p className="text-xs text-[#4B5563]">{order.customerAddress}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-[#86EFAC]/30 rounded-full p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#22C55E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 4v16l6-4h14V4H2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-[#4B5563]">Order Details</p>
                <div className="text-sm text-[#1F2937] mt-1">
                  <p>• {order.itemCount} items</p>
                  {order.items && Array.isArray(order.items) && 
                    order.items.map((item: any, index: number) => (
                      <p key={index}>• {item.quantity}× {item.name}</p>
                    ))
                  }
                </div>
              </div>
            </div>

            <div className="border-t border-[#F3F4F6] my-4"></div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-[#4B5563]">Payment</p>
                <p className="text-sm font-medium text-[#1F2937]">
                  {order.paymentMethod ? order.paymentMethod : 'Not specified'}
                </p>
                <p className="text-sm font-bold text-[#1F2937]">
                  {(order.totalAmount / 100).toFixed(2)} SAR
                </p>
              </div>
              <div className="flex space-x-2">
                <button 
                  className="flex items-center justify-center w-10 h-10 bg-[#7DD3FC]/20 text-[#0EA5E9] rounded-full"
                  onClick={handleCallCustomer}
                >
                  <Phone className="h-5 w-5" />
                </button>
                <button 
                  className="flex items-center justify-center w-10 h-10 bg-[#86EFAC]/20 text-[#22C55E] rounded-full"
                >
                  <MessageCircle className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="p-4">
        <Button 
          className="w-full py-3 bg-[#22C55E] hover:bg-[#15803D] text-white font-semibold rounded-lg shadow-md"
          onClick={handleCompleteDelivery}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Mark as Delivered
        </Button>
      </div>
    </div>
  );
}
