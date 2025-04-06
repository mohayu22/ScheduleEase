// Initialize localStorage with default data
export const initializeLocalStorage = () => {
  // Check if data already exists
  if (!localStorage.getItem("scheduleEaseData")) {
    // User data
    const user = {
      id: 1,
      username: "sarahjohnson",
      name: "Sarah Johnson",
      email: "sarahjohnson@example.com",
      profileImage: "https://images.unsplash.com/photo-1550525811-e5869dd03032"
    };

    // Services data
    const services = [
      {
        id: 1,
        userId: 1,
        name: "Career Coaching Session",
        description: "One-on-one career development coaching",
        duration: 60,
        price: 12000 // $120.00
      },
      {
        id: 2,
        userId: 1,
        name: "Business Strategy Consultation",
        description: "In-depth business planning and strategy",
        duration: 90,
        price: 17500 // $175.00
      },
      {
        id: 3,
        userId: 1,
        name: "Resume Review & Optimization",
        description: "Professional resume feedback and improvements",
        duration: 45,
        price: 8500 // $85.00
      }
    ];

    // Availability data
    const availabilities = [
      { id: 1, userId: 1, dayOfWeek: 1, isActive: true, startTime: "09:00", endTime: "17:00" }, // Monday
      { id: 2, userId: 1, dayOfWeek: 2, isActive: true, startTime: "09:00", endTime: "17:00" }, // Tuesday
      { id: 3, userId: 1, dayOfWeek: 3, isActive: true, startTime: "09:00", endTime: "17:00" }, // Wednesday
      { id: 4, userId: 1, dayOfWeek: 4, isActive: true, startTime: "09:00", endTime: "17:00" }, // Thursday
      { id: 5, userId: 1, dayOfWeek: 5, isActive: true, startTime: "09:00", endTime: "17:00" }, // Friday
      { id: 6, userId: 1, dayOfWeek: 6, isActive: false, startTime: "10:00", endTime: "14:00" }, // Saturday
      { id: 7, userId: 1, dayOfWeek: 0, isActive: false, startTime: "10:00", endTime: "14:00" } // Sunday
    ];

    // Settings data
    const settings = {
      id: 1,
      userId: 1,
      bufferBefore: 10,
      bufferAfter: 10,
      minNotice: 240, // 4 hours
      maxAdvance: 30 // 30 days
    };

    // Today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];
    
    // Tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];
    
    // Next week's date
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split("T")[0];

    // Appointments data
    const appointments = [
      {
        id: 1,
        userId: 1,
        serviceId: 1,
        clientName: "Alex Thompson",
        clientEmail: "alex@example.com",
        clientPhone: "555-123-4567",
        notes: "Looking to switch careers",
        date: today,
        startTime: "10:00",
        endTime: "11:00",
        status: "confirmed",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // yesterday
      },
      {
        id: 2,
        userId: 1,
        serviceId: 2,
        clientName: "Maria Rodriguez",
        clientEmail: "maria@example.com",
        clientPhone: "555-234-5678",
        notes: "Startup strategy session",
        date: today,
        startTime: "14:30",
        endTime: "16:00",
        status: "confirmed",
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000) // 2 days ago
      },
      {
        id: 3,
        userId: 1,
        serviceId: 1,
        clientName: "David Chen",
        clientEmail: "david@example.com",
        clientPhone: "555-345-6789",
        notes: "Preparing for job interview",
        date: today,
        startTime: "16:00",
        endTime: "17:00",
        status: "confirmed",
        createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000) // 3 days ago
      },
      {
        id: 4,
        userId: 1,
        serviceId: 3,
        clientName: "Emma Wilson",
        clientEmail: "emma@example.com",
        clientPhone: "555-456-7890",
        notes: "Resume help for senior position",
        date: tomorrowStr,
        startTime: "11:00",
        endTime: "11:45",
        status: "confirmed",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // yesterday
      },
      {
        id: 5,
        userId: 1,
        serviceId: 2,
        clientName: "James Brown",
        clientEmail: "james@example.com",
        clientPhone: "555-567-8901",
        notes: "Business expansion planning",
        date: nextWeekStr,
        startTime: "13:00",
        endTime: "14:30",
        status: "confirmed",
        createdAt: new Date(Date.now() - 120 * 60 * 60 * 1000) // 5 days ago
      }
    ];

    // Combine all data
    const initialData = {
      user,
      services,
      availabilities,
      settings,
      appointments,
      stats: {
        pageViews: 143
      }
    };

    // Store in localStorage
    localStorage.setItem("scheduleEaseData", JSON.stringify(initialData));
  }
};

// Get user data
export const getUser = () => {
  const data = JSON.parse(localStorage.getItem("scheduleEaseData") || "{}");
  return data.user;
};

// Update user data
export const updateUser = (updatedUser: Partial<any>) => {
  const data = JSON.parse(localStorage.getItem("scheduleEaseData") || "{}");
  
  data.user = {
    ...data.user,
    ...updatedUser
  };
  
  localStorage.setItem("scheduleEaseData", JSON.stringify(data));
  return data.user;
};

// Get all services
export const getServices = () => {
  const data = JSON.parse(localStorage.getItem("scheduleEaseData") || "{}");
  return data.services || [];
};

// Get all availabilities
export const getAvailabilities = () => {
  const data = JSON.parse(localStorage.getItem("scheduleEaseData") || "{}");
  return data.availabilities || [];
};

// Get user settings
export const getSettings = () => {
  const data = JSON.parse(localStorage.getItem("scheduleEaseData") || "{}");
  return data.settings;
};

// Get all appointments
export const getAppointments = () => {
  const data = JSON.parse(localStorage.getItem("scheduleEaseData") || "{}");
  return data.appointments || [];
};

// Get appointments for a specific date
export const getAppointmentsByDate = (date: string) => {
  const data = JSON.parse(localStorage.getItem("scheduleEaseData") || "{}");
  return (data.appointments || []).filter((app: any) => app.date === date);
};

// Create a new appointment
export const createAppointment = (appointment: any) => {
  const data = JSON.parse(localStorage.getItem("scheduleEaseData") || "{}");
  
  // Generate a new id
  const newId = Math.max(0, ...data.appointments.map((a: any) => a.id)) + 1;
  
  const newAppointment = {
    ...appointment,
    id: newId,
    createdAt: new Date()
  };
  
  data.appointments = [...data.appointments, newAppointment];
  localStorage.setItem("scheduleEaseData", JSON.stringify(data));
  
  return newAppointment;
};

// Update an appointment
export const updateAppointment = (id: number, updates: Partial<any>) => {
  const data = JSON.parse(localStorage.getItem("scheduleEaseData") || "{}");
  
  data.appointments = data.appointments.map((app: any) => {
    if (app.id === id) {
      return { ...app, ...updates };
    }
    return app;
  });
  
  localStorage.setItem("scheduleEaseData", JSON.stringify(data));
  
  return data.appointments.find((app: any) => app.id === id);
};
