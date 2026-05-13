// ============================================================
// VERI-NEST MOCK DATA & SERVICES
// APP_MODE = DEMO | USE_MOCK_SERVICES = true
// ============================================================

// --- Mock Users ---
export const MOCK_USERS = [
  { mobile: '9876577267', otp: '123201', role: 'resident', name: 'Test UserName', residentId: 'RES001', flat: 'A-203', tower: 'A', avatar: null },
  { mobile: '9999999999', otp: '111111', role: 'admin', name: 'Admin User', residentId: 'ADM001', flat: 'Admin Office', tower: '-', avatar: null },
  { mobile: '8888888888', otp: '222222', role: 'guard', name: 'Suresh Kumar', residentId: 'GRD001', flat: 'Gate House', tower: '-', avatar: null },
  { mobile: '7777777777', otp: '333333', role: 'staff', name: 'Mohan Lal', residentId: 'STF001', flat: 'Maintenance', tower: '-', avatar: null },
  { mobile: '6666666666', otp: '444444', role: 'resident', name: 'Priya Singh', residentId: 'RES002', flat: 'B-105', tower: 'B', avatar: null },
];

// --- Mock Aadhaar ---
export const MOCK_AADHAAR = [
  { number: '123412341234', name: 'Test UserName', dob: '12-04-1998', gender: 'Male', address: 'Tower A, Flat 203', faceMatch: 92, status: 'VERIFIED' },
  { number: '987654321098', name: 'Priya Singh', dob: '05-09-2000', gender: 'Female', address: 'Tower B, Flat 105', faceMatch: 89, status: 'VERIFIED' },
  { number: '111122223333', name: 'Amit Kumar', dob: '22-11-1995', gender: 'Male', address: 'Tower C, Flat 908', faceMatch: 42, status: 'FAILED' },
  { number: '444455556666', name: 'Test Resident', dob: '01-01-2000', gender: 'Male', address: 'Tower D, Flat 001', faceMatch: 76, status: 'VERIFIED' },
];

// --- Mock Residents ---
export const MOCK_RESIDENTS = [
  { id: 'RES001', name: 'Test UserName', flat: 'A-203', tower: 'A', status: 'Verified', trustScore: 96, mobile: '9876577267', email: 'testuser@example.com', joinDate: '2024-01-15', verified: true },
  { id: 'RES002', name: 'Priya Singh', flat: 'B-105', tower: 'B', status: 'Verified', trustScore: 89, mobile: '6666666666', email: 'priya@example.com', joinDate: '2024-02-20', verified: true },
  { id: 'RES003', name: 'Amit Kumar', flat: 'C-908', tower: 'C', status: 'Pending', trustScore: 42, mobile: '9123456789', email: 'amit@example.com', joinDate: '2024-03-10', verified: false },
  { id: 'RES004', name: 'Sneha Patel', flat: 'D-412', tower: 'D', status: 'Verified', trustScore: 94, mobile: '9234567890', email: 'sneha@example.com', joinDate: '2024-01-28', verified: true },
  { id: 'RES005', name: 'Vikram Mehta', flat: 'A-501', tower: 'A', status: 'Verified', trustScore: 88, mobile: '9345678901', email: 'vikram@example.com', joinDate: '2024-04-05', verified: true },
  { id: 'RES006', name: 'Anjali Gupta', flat: 'B-302', tower: 'B', status: 'Suspended', trustScore: 30, mobile: '9456789012', email: 'anjali@example.com', joinDate: '2024-02-14', verified: false },
];

// --- Mock Visitors ---
export const MOCK_VISITORS = [
  { id: 'VIS001', name: 'Swiggy Delivery', visiting: 'Test UserName', flat: 'A-203', otp: '7890', time: '10:30 AM', date: '2026-05-13', status: 'Inside', type: 'delivery' },
  { id: 'VIS002', name: 'Amazon Agent', visiting: 'Priya Singh', flat: 'B-105', otp: '4567', time: '11:15 AM', date: '2026-05-13', status: 'Exited', type: 'delivery' },
  { id: 'VIS003', name: 'Ravi Guest', visiting: 'Amit Kumar', flat: 'C-908', otp: '2233', time: '02:00 PM', date: '2026-05-13', status: 'Approved', type: 'guest' },
  { id: 'VIS004', name: 'Plumber Service', visiting: 'Sneha Patel', flat: 'D-412', otp: '5678', time: '03:45 PM', date: '2026-05-12', status: 'Exited', type: 'service' },
  { id: 'VIS005', name: 'Zomato Delivery', visiting: 'Vikram Mehta', flat: 'A-501', otp: '9012', time: '07:20 PM', date: '2026-05-12', status: 'Exited', type: 'delivery' },
];

// --- Mock Complaints ---
export const MOCK_COMPLAINTS = [
  { id: 'CMP001', type: 'Water Leakage', resident: 'Test UserName', flat: 'A-203', status: 'Open', priority: 'High', date: '2026-05-12', description: 'Water leaking from ceiling in bedroom' },
  { id: 'CMP002', type: 'Lift Not Working', resident: 'Priya Singh', flat: 'B-105', status: 'In Progress', priority: 'High', date: '2026-05-11', description: 'Tower B lift is out of order since 2 days' },
  { id: 'CMP003', type: 'Electricity Issue', resident: 'Sneha Patel', flat: 'D-412', status: 'Resolved', priority: 'Medium', date: '2026-05-10', description: 'Power fluctuation in flat' },
  { id: 'CMP004', type: 'Parking Issue', resident: 'Vikram Mehta', flat: 'A-501', status: 'Open', priority: 'Low', date: '2026-05-13', description: 'Unauthorized vehicle in my parking slot' },
  { id: 'CMP005', type: 'Noise Complaint', resident: 'Test UserName', flat: 'A-203', status: 'Resolved', priority: 'Medium', date: '2026-05-09', description: 'Excessive noise from flat above' },
];

// --- Mock Community Feed ---
export const MOCK_FEED = [
  { id: 'FEED001', author: 'Society Admin', avatar: 'SA', type: 'announcement', content: '🔧 Water supply maintenance scheduled tomorrow (May 14) from 10 AM–2 PM. Please store water accordingly.', time: '2 hours ago', likes: 24, comments: 8, pinned: true },
  { id: 'FEED002', author: 'Test UserName', avatar: 'TU', type: 'post', content: '🏏 Society cricket tournament this Sunday at the ground! All residents welcome. Registration open until Saturday.', time: '5 hours ago', likes: 18, comments: 12, pinned: false },
  { id: 'FEED003', author: 'Security Office', avatar: 'SO', type: 'alert', content: '⚠️ Parking rules updated: No parking in fire lane after 8 PM. Violating vehicles will be towed.', time: '1 day ago', likes: 31, comments: 5, pinned: false },
  { id: 'FEED004', author: 'Priya Singh', avatar: 'PS', type: 'post', content: '🎉 Great turnout at yesterday\'s yoga camp! Thanks everyone for joining. Next session April 19th.', time: '2 days ago', likes: 45, comments: 20, pinned: false },
  { id: 'FEED005', author: 'Society Admin', avatar: 'SA', type: 'announcement', content: '📋 Monthly society meeting on April 15th at 6 PM in the clubhouse. Agenda: budget review & amenities upgrade.', time: '3 days ago', likes: 19, comments: 7, pinned: false },
];

// --- Mock Marketplace ---
export const MOCK_MARKETPLACE = [
  { id: 'MKT001', title: 'Study Table', price: 2500, category: 'Furniture', seller: 'Test UserName', flat: 'A-203', status: 'Available', description: 'Wooden study table, good condition, 4 years old', date: '2026-05-10' },
  { id: 'MKT002', title: 'Bicycle', price: 4500, category: 'Sports', seller: 'Priya Singh', flat: 'B-105', status: 'Available', description: 'Hero cycle, slightly used, all parts working', date: '2026-05-11' },
  { id: 'MKT003', title: 'Sofa Set', price: 8000, category: 'Furniture', seller: 'Sneha Patel', flat: 'D-412', status: 'Sold', description: '3+1+1 sofa set, 2 years old, excellent condition', date: '2026-05-08' },
  { id: 'MKT004', title: 'Washing Machine', price: 6500, category: 'Appliance', seller: 'Vikram Mehta', flat: 'A-501', status: 'Available', description: 'LG 7kg semi-automatic, working perfectly', date: '2026-05-12' },
  { id: 'MKT005', title: 'Refrigerator', price: 9000, category: 'Appliance', seller: 'Amit Kumar', flat: 'C-908', status: 'Available', description: 'Samsung 250L double door, minor dent on side', date: '2026-05-09' },
  { id: 'MKT006', title: 'Books - UPSC', price: 500, category: 'Books', seller: 'Test UserName', flat: 'A-203', status: 'Available', description: 'Complete UPSC preparation set, very good condition', date: '2026-05-13' },
];

// --- Mock Events ---
export const MOCK_EVENTS = [
  { id: 'EVT001', title: 'Holi Celebration', date: '2026-03-12', time: '6:00 PM', venue: 'Society Ground', organizer: 'Society Admin', rsvp: 45, capacity: 100, status: 'Upcoming', description: 'Annual Holi celebration with colors, music and food.' },
  { id: 'EVT002', title: 'Yoga Camp', date: '2026-04-05', time: '7:00 AM', venue: 'Terrace Garden', organizer: 'Priya Singh', rsvp: 22, capacity: 30, status: 'Upcoming', description: 'Morning yoga session for all age groups.' },
  { id: 'EVT003', title: 'Society Meeting', date: '2026-04-15', time: '6:00 PM', venue: 'Clubhouse Hall', organizer: 'Society Admin', rsvp: 38, capacity: 80, status: 'Upcoming', description: 'Monthly meeting: budget review and amenities upgrade.' },
  { id: 'EVT004', title: 'Cricket Tournament', date: '2026-05-18', time: '9:00 AM', venue: 'Society Ground', organizer: 'Test UserName', rsvp: 16, capacity: 22, status: 'Open', description: 'Inter-tower cricket tournament. Form your team!' },
  { id: 'EVT005', title: 'Diwali Night', date: '2026-11-01', time: '7:00 PM', venue: 'Common Area', organizer: 'Society Admin', rsvp: 0, capacity: 200, status: 'Planning', description: 'Grand Diwali celebration with fireworks and dinner.' },
];

// --- Mock Notifications ---
export const MOCK_NOTIFICATIONS = [
  { id: 'NTF001', title: 'Visitor Arrived', body: 'Swiggy Delivery is at the gate for you.', time: '10:30 AM', read: false, type: 'visitor' },
  { id: 'NTF002', title: 'Complaint Update', body: 'Your complaint CMP002 is now In Progress.', time: '09:15 AM', read: false, type: 'complaint' },
  { id: 'NTF003', title: 'Society Announcement', body: 'Water supply maintenance tomorrow 10AM-2PM', time: 'Yesterday', read: true, type: 'announcement' },
  { id: 'NTF004', title: 'Event Reminder', body: 'Yoga Camp tomorrow at 7 AM – Terrace.', time: 'Yesterday', read: true, type: 'event' },
  { id: 'NTF005', title: 'New Marketplace Item', body: 'New item listed: UPSC Books ₹500', time: '2 days ago', read: true, type: 'marketplace' },
];

// --- Mock Analytics ---
export const MOCK_ANALYTICS = {
  verificationStats: [
    { month: 'Jan', verified: 45, pending: 8, failed: 3 },
    { month: 'Feb', verified: 52, pending: 6, failed: 2 },
    { month: 'Mar', verified: 61, pending: 9, failed: 4 },
    { month: 'Apr', verified: 58, pending: 5, failed: 1 },
    { month: 'May', verified: 70, pending: 7, failed: 2 },
  ],
  visitorTrends: [
    { day: 'Mon', visitors: 24 },
    { day: 'Tue', visitors: 18 },
    { day: 'Wed', visitors: 32 },
    { day: 'Thu', visitors: 28 },
    { day: 'Fri', visitors: 41 },
    { day: 'Sat', visitors: 55 },
    { day: 'Sun', visitors: 38 },
  ],
  complaintResolution: [
    { category: 'Water', open: 3, resolved: 12 },
    { category: 'Electric', open: 2, resolved: 8 },
    { category: 'Lift', open: 1, resolved: 5 },
    { category: 'Parking', open: 4, resolved: 7 },
    { category: 'Noise', open: 1, resolved: 9 },
  ],
  trustScoreDistribution: [
    { range: '90-100', count: 28 },
    { range: '75-89', count: 35 },
    { range: '60-74', count: 14 },
    { range: '40-59', count: 6 },
    { range: '<40', count: 3 },
  ],
  summary: {
    totalResidents: 86,
    verifiedResidents: 74,
    pendingVerification: 9,
    suspendedAccounts: 3,
    todayVisitors: 12,
    openComplaints: 10,
    resolvedComplaints: 41,
    upcomingEvents: 4,
    fraudAttempts: 7,
    avgTrustScore: 84,
  }
};

// --- Mock Society ---
export const MOCK_SOCIETY = {
  name: 'Green Valley Residency',
  code: 'GVR2024',
  address: 'Sector 45, Gurugram, Haryana 122003',
  lat: 28.6139,
  lng: 77.2090,
  totalFlats: 120,
  towers: ['A', 'B', 'C', 'D'],
  amenities: ['Swimming Pool', 'Gym', 'Clubhouse', 'Tennis Court', 'Kids Play Area', 'Jogging Track'],
  emergencyContacts: [
    { name: 'Security Office', number: '9876500001', type: 'security' },
    { name: 'Fire Station', number: '101', type: 'fire' },
    { name: 'Ambulance', number: '108', type: 'medical' },
    { name: 'Police', number: '100', type: 'police' },
    { name: 'Society Manager', number: '9876500002', type: 'manager' },
  ]
};

// ---- AI CHATBOT RESPONSES ---
export const CHATBOT_RESPONSES = {
  'book plumber': { text: '✅ Complaint raised! A plumber will visit within 4 hours. Ticket: CMP006', action: 'complaint_created' },
  'visitor status': { text: '📋 You have 2 visitors today:\n• Swiggy Delivery (10:30 AM) - Inside\n• Amazon Agent (11:15 AM) - Exited', action: null },
  'upcoming event': { text: '🎉 Upcoming Events:\n• Cricket Tournament – May 18, 9 AM\n• Diwali Night – Nov 1, 7 PM', action: null },
  'emergency': { text: '🚨 Emergency Contacts:\n• Security: 9876500001\n• Fire: 101\n• Ambulance: 108\n• Police: 100', action: 'emergency' },
  'complaints': { text: '📋 Your open complaints:\n• CMP001 - Water Leakage (High Priority)\n• CMP004 - Parking Issue (Low Priority)', action: null },
  'maintenance': { text: '🔧 Raise a maintenance request:\nType your issue and I\'ll create a ticket for you.', action: null },
  'announcements': { text: '📢 Latest Announcement:\nWater supply maintenance tomorrow (May 14) 10 AM–2 PM. Please store water.', action: null },
  'marketplace': { text: '🛒 Recent Listings:\n• Study Table – ₹2500 (A-203)\n• Bicycle – ₹4500 (B-105)\n• Washing Machine – ₹6500 (A-501)', action: null },
  'sos': { text: '🆘 SOS ALERT SENT! Security has been notified. Help is on the way.', action: 'sos' },
  'hello': { text: '👋 Hello! I\'m VeriBot, your AI community assistant. How can I help you today?\n\nYou can ask me about:\n• Visitors & deliveries\n• Complaints & maintenance\n• Events & announcements\n• Emergency contacts\n• Marketplace listings', action: null },
  'default': { text: '🤖 I understand you need help. Could you be more specific? Try asking about:\n• "Book plumber"\n• "Visitor status"\n• "Upcoming events"\n• "Emergency contacts"\n• "My complaints"', action: null },
};
