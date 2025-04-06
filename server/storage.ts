import { 
  users, type User, type InsertUser,
  services, type Service, type InsertService,
  availabilities, type Availability, type InsertAvailability,
  settings, type Settings, type InsertSettings,
  appointments, type Appointment, type InsertAppointment
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Service operations
  getServices(userId: number): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: number): Promise<boolean>;

  // Availability operations
  getAvailabilities(userId: number): Promise<Availability[]>;
  createAvailability(availability: InsertAvailability): Promise<Availability>;
  updateAvailability(id: number, availability: Partial<InsertAvailability>): Promise<Availability | undefined>;
  deleteAvailability(id: number): Promise<boolean>;

  // Settings operations
  getSettings(userId: number): Promise<Settings | undefined>;
  createSettings(settings: InsertSettings): Promise<Settings>;
  updateSettings(userId: number, settings: Partial<InsertSettings>): Promise<Settings | undefined>;

  // Appointment operations
  getAppointments(userId: number): Promise<Appointment[]>;
  getAppointment(id: number): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined>;
  getAppointmentsByDate(userId: number, date: string): Promise<Appointment[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private services: Map<number, Service>;
  private availabilities: Map<number, Availability>;
  private settings: Map<number, Settings>;
  private appointments: Map<number, Appointment>;
  
  private userId: number = 1;
  private serviceId: number = 1;
  private availabilityId: number = 1;
  private settingsId: number = 1;
  private appointmentId: number = 1;

  constructor() {
    this.users = new Map();
    this.services = new Map();
    this.availabilities = new Map();
    this.settings = new Map();
    this.appointments = new Map();

    // Add seed data
    this.seedSampleData();
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
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Service operations
  async getServices(userId: number): Promise<Service[]> {
    return Array.from(this.services.values()).filter(
      (service) => service.userId === userId
    );
  }

  async getService(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async createService(insertService: InsertService): Promise<Service> {
    const id = this.serviceId++;
    const service: Service = { ...insertService, id };
    this.services.set(id, service);
    return service;
  }

  async updateService(id: number, serviceData: Partial<InsertService>): Promise<Service | undefined> {
    const existingService = this.services.get(id);
    if (!existingService) return undefined;

    const updatedService = { ...existingService, ...serviceData };
    this.services.set(id, updatedService);
    return updatedService;
  }

  async deleteService(id: number): Promise<boolean> {
    return this.services.delete(id);
  }

  // Availability operations
  async getAvailabilities(userId: number): Promise<Availability[]> {
    return Array.from(this.availabilities.values()).filter(
      (availability) => availability.userId === userId
    );
  }

  async createAvailability(insertAvailability: InsertAvailability): Promise<Availability> {
    const id = this.availabilityId++;
    const availability: Availability = { ...insertAvailability, id };
    this.availabilities.set(id, availability);
    return availability;
  }

  async updateAvailability(id: number, availabilityData: Partial<InsertAvailability>): Promise<Availability | undefined> {
    const existingAvailability = this.availabilities.get(id);
    if (!existingAvailability) return undefined;

    const updatedAvailability = { ...existingAvailability, ...availabilityData };
    this.availabilities.set(id, updatedAvailability);
    return updatedAvailability;
  }

  async deleteAvailability(id: number): Promise<boolean> {
    return this.availabilities.delete(id);
  }

  // Settings operations
  async getSettings(userId: number): Promise<Settings | undefined> {
    return Array.from(this.settings.values()).find(
      (setting) => setting.userId === userId
    );
  }

  async createSettings(insertSettings: InsertSettings): Promise<Settings> {
    const id = this.settingsId++;
    const settings: Settings = { ...insertSettings, id };
    this.settings.set(id, settings);
    return settings;
  }

  async updateSettings(userId: number, settingsData: Partial<InsertSettings>): Promise<Settings | undefined> {
    const existingSettings = Array.from(this.settings.values()).find(
      (setting) => setting.userId === userId
    );
    
    if (!existingSettings) return undefined;

    const updatedSettings = { ...existingSettings, ...settingsData };
    this.settings.set(existingSettings.id, updatedSettings);
    return updatedSettings;
  }

  // Appointment operations
  async getAppointments(userId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.userId === userId
    );
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = this.appointmentId++;
    const now = new Date();
    const appointment: Appointment = {
      ...insertAppointment,
      id,
      createdAt: now
    };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async updateAppointment(id: number, appointmentData: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const existingAppointment = this.appointments.get(id);
    if (!existingAppointment) return undefined;

    const updatedAppointment = { ...existingAppointment, ...appointmentData };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  async getAppointmentsByDate(userId: number, date: string): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.userId === userId && appointment.date === date
    );
  }

  // Seed data function (for development)
  private seedSampleData(): void {
    // Create sample user
    const user: User = {
      id: 1,
      username: 'sarahjohnson',
      password: 'password123', // In a real app, this would be hashed
      name: 'Sarah Johnson',
      email: 'sarahjohnson@example.com',
      profileImage: 'https://images.unsplash.com/photo-1550525811-e5869dd03032'
    };
    this.users.set(user.id, user);
    this.userId++;

    // Create sample services
    const services: Service[] = [
      {
        id: 1,
        userId: 1,
        name: 'Career Coaching Session',
        description: 'One-on-one career development coaching',
        duration: 60,
        price: 12000 // $120.00
      },
      {
        id: 2,
        userId: 1,
        name: 'Business Strategy Consultation',
        description: 'In-depth business planning and strategy',
        duration: 90,
        price: 17500 // $175.00
      },
      {
        id: 3,
        userId: 1,
        name: 'Resume Review & Optimization',
        description: 'Professional resume feedback and improvements',
        duration: 45,
        price: 8500 // $85.00
      }
    ];
    
    services.forEach(service => {
      this.services.set(service.id, service);
      this.serviceId++;
    });

    // Create sample availabilities
    const availabilities: Availability[] = [
      { id: 1, userId: 1, dayOfWeek: 1, isActive: true, startTime: '09:00', endTime: '17:00' }, // Monday
      { id: 2, userId: 1, dayOfWeek: 2, isActive: true, startTime: '09:00', endTime: '17:00' }, // Tuesday
      { id: 3, userId: 1, dayOfWeek: 3, isActive: true, startTime: '09:00', endTime: '17:00' }, // Wednesday
      { id: 4, userId: 1, dayOfWeek: 4, isActive: true, startTime: '09:00', endTime: '17:00' }, // Thursday
      { id: 5, userId: 1, dayOfWeek: 5, isActive: true, startTime: '09:00', endTime: '17:00' }, // Friday
      { id: 6, userId: 1, dayOfWeek: 6, isActive: false, startTime: '10:00', endTime: '14:00' }, // Saturday
      { id: 7, userId: 1, dayOfWeek: 0, isActive: false, startTime: '10:00', endTime: '14:00' }, // Sunday
    ];
    
    availabilities.forEach(availability => {
      this.availabilities.set(availability.id, availability);
      this.availabilityId++;
    });

    // Create user settings
    const userSettings: Settings = {
      id: 1,
      userId: 1,
      bufferBefore: 10,
      bufferAfter: 10,
      minNotice: 240, // 4 hours
      maxAdvance: 30 // 30 days
    };
    
    this.settings.set(userSettings.id, userSettings);
    this.settingsId++;

    // Create sample appointments (for today and upcoming days)
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const appointments: Appointment[] = [
      {
        id: 1,
        userId: 1,
        serviceId: 1,
        clientName: 'Alex Thompson',
        clientEmail: 'alex@example.com',
        clientPhone: '555-123-4567',
        notes: 'Looking to switch careers',
        date: todayStr,
        startTime: '10:00',
        endTime: '11:00',
        status: 'confirmed',
        createdAt: new Date(today.getTime() - 24 * 60 * 60 * 1000) // yesterday
      },
      {
        id: 2,
        userId: 1,
        serviceId: 2,
        clientName: 'Maria Rodriguez',
        clientEmail: 'maria@example.com',
        clientPhone: '555-234-5678',
        notes: 'Startup strategy session',
        date: todayStr,
        startTime: '14:30',
        endTime: '16:00',
        status: 'confirmed',
        createdAt: new Date(today.getTime() - 48 * 60 * 60 * 1000) // 2 days ago
      },
      {
        id: 3,
        userId: 1,
        serviceId: 1,
        clientName: 'David Chen',
        clientEmail: 'david@example.com',
        clientPhone: '555-345-6789',
        notes: 'Preparing for job interview',
        date: todayStr,
        startTime: '16:00',
        endTime: '17:00',
        status: 'confirmed',
        createdAt: new Date(today.getTime() - 72 * 60 * 60 * 1000) // 3 days ago
      }
    ];
    
    // Add some future appointments
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    appointments.push({
      id: 4,
      userId: 1,
      serviceId: 3,
      clientName: 'Emma Wilson',
      clientEmail: 'emma@example.com',
      clientPhone: '555-456-7890',
      notes: 'Resume help for senior position',
      date: tomorrowStr,
      startTime: '11:00',
      endTime: '11:45',
      status: 'confirmed',
      createdAt: new Date(today.getTime() - 24 * 60 * 60 * 1000) // yesterday
    });
    
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];
    
    appointments.push({
      id: 5,
      userId: 1,
      serviceId: 2,
      clientName: 'James Brown',
      clientEmail: 'james@example.com',
      clientPhone: '555-567-8901',
      notes: 'Business expansion planning',
      date: nextWeekStr,
      startTime: '13:00',
      endTime: '14:30',
      status: 'confirmed',
      createdAt: new Date(today.getTime() - 120 * 60 * 60 * 1000) // 5 days ago
    });
    
    appointments.forEach(appointment => {
      this.appointments.set(appointment.id, appointment);
      this.appointmentId++;
    });
  }
}

export const storage = new MemStorage();
