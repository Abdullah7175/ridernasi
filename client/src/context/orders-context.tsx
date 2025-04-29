import { createContext, ReactNode, useContext } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Order, UpdateOrderStatus, UpdatePayment } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Type for the OrdersContext
type OrdersContextType = {
  orders: Order[];
  isLoading: boolean;
  error: Error | null;
  fetchOrders: () => void;
  getOrderById: (id: number) => Order | undefined;
  updateOrderStatus: (id: number, status: "assigned" | "in_progress" | "completed") => Promise<Order>;
  updatePayment: (id: number, paymentData: UpdatePayment) => Promise<Order>;
};

// Create context with default values
const OrdersContext = createContext<OrdersContextType>({
  orders: [],
  isLoading: false,
  error: null,
  fetchOrders: () => {},
  getOrderById: () => undefined,
  updateOrderStatus: async () => {
    throw new Error("Not implemented");
  },
  updatePayment: async () => {
    throw new Error("Not implemented");
  },
});

// Provider component that wraps the app
export function OrdersProvider({ children }: { children: ReactNode }) {
  // Fetch orders
  const {
    data: orders = [],
    isLoading,
    error,
    refetch: fetchOrders,
  } = useQuery<Order[], Error>({
    queryKey: ["/api/orders"],
    refetchOnWindowFocus: false,
  });

  // Get order by ID
  const getOrderById = (id: number) => {
    return orders.find((order) => order.id === id);
  };

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: "assigned" | "in_progress" | "completed" }) => {
      const res = await apiRequest("PATCH", `/api/orders/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
  });

  // Update payment mutation
  const updatePaymentMutation = useMutation({
    mutationFn: async ({ id, paymentData }: { id: number; paymentData: UpdatePayment }) => {
      const res = await apiRequest("PATCH", `/api/orders/${id}/payment`, paymentData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
  });

  // Expose these functions with simpler signatures
  const updateOrderStatus = async (id: number, status: "assigned" | "in_progress" | "completed") => {
    return updateOrderStatusMutation.mutateAsync({ id, status });
  };

  const updatePayment = async (id: number, paymentData: UpdatePayment) => {
    return updatePaymentMutation.mutateAsync({ id, paymentData });
  };

  return (
    <OrdersContext.Provider
      value={{
        orders,
        isLoading,
        error: error || null,
        fetchOrders,
        getOrderById,
        updateOrderStatus,
        updatePayment,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
}

// Hook to use the orders context
export function useOrders() {
  const context = useContext(OrdersContext);
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrdersProvider");
  }
  return context;
}
