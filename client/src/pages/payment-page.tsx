import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useOrders } from "@/context/orders-context";
import { ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { UpdatePayment } from "@shared/schema";

export default function PaymentPage() {
  const [, navigate] = useLocation();
  const [, params] = useRoute<{ orderId: string }>('/payment/:orderId');
  const { getOrderById, updatePayment } = useOrders();
  const { toast } = useToast();
  
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const orderId = params?.orderId ? parseInt(params.orderId) : 0;
  const order = getOrderById(orderId);

  const handleBackToMap = () => {
    navigate(`/map/${orderId}`);
  };

  const handleConfirmPayment = async () => {
    if (!order) return;
    
    setIsSubmitting(true);
    
    try {
      const paymentData: UpdatePayment = {
        paymentMethod: paymentMethod as "cash" | "card" | "online",
        paymentStatus: "completed",
        notes: notes || undefined
      };
      
      await updatePayment(order.id, paymentData);
      
      toast({
        title: "Payment Confirmed",
        description: "The delivery has been successfully completed.",
      });
      
      navigate('/orders');
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Failed to confirm payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
          onClick={handleBackToMap}
        >
          <ChevronLeft className="h-5 w-5" />
          <span>Back to Map</span>
        </button>
        <h1 className="text-lg font-semibold text-[#1F2937]">Payment</h1>
        <div className="w-6"></div>
      </header>

      <div className="p-4">
        <Card className="mb-6">
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold text-[#1F2937] mb-4">Confirm Payment</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-[#F3F4F6]">
                <span className="text-[#4B5563]">Order ID</span>
                <span className="font-medium text-[#1F2937]">#{order.orderNumber}</span>
              </div>
              
              <div className="flex justify-between items-center pb-2 border-b border-[#F3F4F6]">
                <span className="text-[#4B5563]">Items</span>
                <span className="font-medium text-[#1F2937]">{order.itemCount}</span>
              </div>
              
              <div className="flex justify-between items-center pb-2 border-b border-[#F3F4F6]">
                <span className="text-[#4B5563]">Customer</span>
                <span className="font-medium text-[#1F2937]">{order.customerName.split(' ')[0]} {order.customerName.split(' ')[1]?.[0]}.</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-[#4B5563]">Total Amount</span>
                <span className="font-bold text-[#1F2937] text-lg">
                  {(order.totalAmount / 100).toFixed(2)} SAR
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardContent className="p-4">
            <h3 className="font-medium text-[#1F2937] mb-3">Payment Method</h3>
            
            <RadioGroup 
              defaultValue="cash" 
              value={paymentMethod}
              onValueChange={setPaymentMethod}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-3 border border-[#F3F4F6] rounded-lg">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash" className="flex-grow cursor-pointer">
                  <div>
                    <p className="font-medium text-[#1F2937]">Cash</p>
                    <p className="text-xs text-[#4B5563]">Cash on delivery</p>
                  </div>
                </Label>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#4B5563]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                  <circle cx="12" cy="12" r="2" />
                  <path d="M6 12h.01M18 12h.01" />
                </svg>
              </div>
              
              <div className="flex items-center space-x-3 p-3 border border-[#F3F4F6] rounded-lg">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex-grow cursor-pointer">
                  <div>
                    <p className="font-medium text-[#1F2937]">Card Machine</p>
                    <p className="text-xs text-[#4B5563]">Customer pays by card</p>
                  </div>
                </Label>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#4B5563]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
              </div>
              
              <div className="flex items-center space-x-3 p-3 border border-[#F3F4F6] rounded-lg">
                <RadioGroupItem value="online" id="online" />
                <Label htmlFor="online" className="flex-grow cursor-pointer">
                  <div>
                    <p className="font-medium text-[#1F2937]">Already Paid Online</p>
                    <p className="text-xs text-[#4B5563]">Pre-paid order</p>
                  </div>
                </Label>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#4B5563]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
        
        <div className="mb-4">
          <Label htmlFor="payment-notes" className="block text-sm font-medium text-[#4B5563] mb-1">
            Notes (Optional)
          </Label>
          <Textarea 
            id="payment-notes" 
            className="w-full p-3 border border-[#9CA3AF] rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Add any payment related notes here"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        
        <Button 
          className="w-full py-3 bg-[#22C55E] hover:bg-[#15803D] text-white font-semibold rounded-lg shadow-md"
          onClick={handleConfirmPayment}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Confirm Payment & Complete Delivery
        </Button>
      </div>
    </div>
  );
}
