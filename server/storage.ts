import { 
  users, type User, type InsertUser,
  vendors, type Vendor, type InsertVendor,
  orders, type Order, type InsertOrder,
  UpdateOrderStatus, UpdatePayment, UpdateProfile
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: UpdateProfile): Promise<User>;
  
  // Vendor operations
  getVendor(id: number): Promise<Vendor | undefined>;
  getVendorByName(name: string): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  
  // Order operations
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByRiderId(riderId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: "assigned" | "in_progress" | "completed"): Promise<Order>;
  updateOrderPayment(id: number, paymentData: UpdatePayment): Promise<Order>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private vendors: Map<number, Vendor>;
  private orders: Map<number, Order>;
  private userIdCounter: number;
  private vendorIdCounter: number;
  private orderIdCounter: number;
  
  public sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.vendors = new Map();
    this.orders = new Map();
    this.userIdCounter = 1;
    this.vendorIdCounter = 1;
    this.orderIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    // Initialize with some sample data
    this.initializeSampleData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: UpdateProfile): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Update the user with new data
    const updatedUser: User = {
      ...user,
      ...userData
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Vendor operations
  async getVendor(id: number): Promise<Vendor | undefined> {
    return this.vendors.get(id);
  }

  async getVendorByName(name: string): Promise<Vendor | undefined> {
    return Array.from(this.vendors.values()).find(
      (vendor) => vendor.name === name,
    );
  }

  async createVendor(insertVendor: InsertVendor): Promise<Vendor> {
    const id = this.vendorIdCounter++;
    const vendor: Vendor = { ...insertVendor, id };
    this.vendors.set(id, vendor);
    return vendor;
  }

  // Order operations
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrdersByRiderId(riderId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.riderId === riderId,
    );
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.orderIdCounter++;
    const order: Order = { 
      ...insertOrder, 
      id, 
      createdAt: new Date(), 
      completedAt: undefined 
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: number, status: "assigned" | "in_progress" | "completed"): Promise<Order> {
    const order = await this.getOrder(id);
    if (!order) {
      throw new Error("Order not found");
    }
    
    // Update the order status
    const updatedOrder: Order = {
      ...order,
      status,
      completedAt: status === "completed" ? new Date() : order.completedAt,
    };
    
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  async updateOrderPayment(id: number, paymentData: UpdatePayment): Promise<Order> {
    const order = await this.getOrder(id);
    if (!order) {
      throw new Error("Order not found");
    }
    
    // Update the order payment info
    const updatedOrder: Order = {
      ...order,
      paymentMethod: paymentData.paymentMethod,
      paymentStatus: paymentData.paymentStatus,
      notes: paymentData.notes !== undefined ? paymentData.notes : order.notes,
    };
    
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
  
  // Helper method to initialize sample data
  private async initializeSampleData() {
    // Create a main vendor: Nasi Cleaning
    const nasiCleaning = await this.createVendor({
      name: "Nasi Cleaning",
      isMainAdmin: true
    });
    
    // Create a partner vendor
    const luxCleaning = await this.createVendor({
      name: "Lux Cleaning",
      isMainAdmin: false
    });
    
    // Create sample riders
    const password = await this.hashPassword("password123");
    
    const rider1 = await this.createUser({
      username: "rider1",
      password,
      name: "Abdullah Khan",
      role: "rider",
      vendorId: nasiCleaning.id
    });
    
    const rider2 = await this.createUser({
      username: "rider2",
      password,
      name: "Ahmed Mohammed",
      role: "rider",
      vendorId: luxCleaning.id
    });
    
    // Create sample orders
    await this.createOrder({
      orderNumber: "ORD-12345",
      status: "assigned",
      vendorId: nasiCleaning.id,
      riderId: rider1.id,
      customerName: "Ahmed Residence",
      customerAddress: "123 Main St, Riyadh, Saudi Arabia",
      customerPhone: "123-456-7890",
      totalAmount: 7500, // 75.00 SAR
      itemCount: 3,
      orderType: "pickup",
      paymentMethod: "cash",
      paymentStatus: "pending",
      items: [
        { name: "Queen Bedsheet", quantity: 2 },
        { name: "Pillow Covers", quantity: 1 }
      ],
      latitude: "24.7136",
      longitude: "46.6753"
    });
    
    await this.createOrder({
      orderNumber: "ORD-12346",
      status: "in_progress",
      vendorId: nasiCleaning.id,
      riderId: rider1.id,
      customerName: "Mohammed Apartment",
      customerAddress: "456 Second Ave, Jeddah, Saudi Arabia",
      customerPhone: "987-654-3210",
      totalAmount: 12000, // 120.00 SAR
      itemCount: 2,
      orderType: "delivery",
      paymentMethod: "card",
      paymentStatus: "pending",
      items: [
        { name: "Queen Bedsheet Set", quantity: 1 },
        { name: "Duvet Cover", quantity: 1 }
      ],
      latitude: "21.5433",
      longitude: "39.1728"
    });
    
    // Scheduled order for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    
    await this.createOrder({
      orderNumber: "ORD-12347",
      status: "assigned",
      vendorId: nasiCleaning.id,
      riderId: rider1.id,
      customerName: "Elite Garden Residence",
      customerAddress: "789 Garden Street, Dammam, Saudi Arabia",
      customerPhone: "555-123-4567",
      totalAmount: 15000, // 150.00 SAR
      itemCount: 5,
      orderType: "both",
      scheduledDate: tomorrow,
      paymentMethod: "online",
      paymentStatus: "completed",
      items: [
        { name: "King Bedsheet Set", quantity: 1 },
        { name: "Pillow Cases", quantity: 4 }
      ],
      latitude: "26.3927",
      longitude: "50.1815"
    });
  }
  
  // Helper method to hash passwords
  private async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
  }
}

export const storage = new MemStorage();
