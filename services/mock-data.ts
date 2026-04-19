import { AnnouncementItem, ChatMessage, ChatRoom, NoteItem, TimetableEntry, UserProfile } from './types';

export const demoProfiles: Record<string, UserProfile> = {
  student: {
    id: 'demo-student',
    fullName: 'Mercy Wanjiku',
    email: 'student@chuka.ac.ke',
    role: 'student',
    regNumber: 'CU/SCI/2024/021',
    department: 'Computer Science',
    bio: 'Second year student focused on software engineering and campus life.',
  },
  lecturer: {
    id: 'demo-lecturer',
    fullName: 'Dr. Peter Mwangi',
    email: 'lecturer@chuka.ac.ke',
    role: 'lecturer',
    staffNumber: 'CHU/STAFF/1182',
    department: 'Information Technology',
    bio: 'Unit coordinator for systems analysis and responsible for course communication.',
  },
  admin: {
    id: 'demo-admin',
    fullName: 'Grace Njeri',
    email: 'admin@chuka.ac.ke',
    role: 'admin',
    staffNumber: 'CHU/ADMIN/0001',
    department: 'Registry Office',
    bio: 'Handles announcements, user approvals, and system oversight.',
  },
};

export const demoChatRooms: ChatRoom[] = [
  {
    id: 'room-cs210',
    name: 'CS210 - Data Structures',
    type: 'class',
    courseCode: 'CS210',
    lastMessage: 'Assignment 2 deadline is Friday 5 PM.',
    lastMessageAt: 'Today 8:12 AM',
    unreadCount: 4,
    isOnline: true,
    isTyping: true,
  },
  {
    id: 'room-year2',
    name: 'Year 2 Computer Science',
    type: 'group',
    lastMessage: 'We are meeting at the library at 3 PM.',
    lastMessageAt: 'Yesterday',
    unreadCount: 1,
    isOnline: true,
  },
  {
    id: 'room-it',
    name: 'ICT Department',
    type: 'department',
    lastMessage: 'Timetable changes have been posted.',
    lastMessageAt: 'Monday',
    unreadCount: 0,
    isOnline: false,
    lastSeen: 'Last seen 2h ago',
  },
];

export const demoMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    roomId: 'room-cs210',
    senderName: 'Dr. Peter Mwangi',
    senderRole: 'lecturer',
    message: 'Welcome to CS210. Please review the week 3 slides before class.',
    createdAt: '08:00',
  },
  {
    id: 'msg-2',
    roomId: 'room-cs210',
    senderName: 'Mercy Wanjiku',
    senderRole: 'student',
    message: 'Will the practical be marked as part of the coursework?',
    createdAt: '08:04',
    isMine: true,
    isRead: true,
  },
  {
    id: 'msg-3',
    roomId: 'room-cs210',
    senderName: 'Dr. Peter Mwangi',
    senderRole: 'lecturer',
    message: 'Yes, the lab activity contributes 15% of the final grade.',
    createdAt: '08:06',
  },
];

export const demoTimetable: TimetableEntry[] = [
  {
    id: 'tt-1',
    day: 'Monday',
    time: '08:00 - 10:00',
    title: 'Data Structures',
    venue: 'Lab 3',
    courseCode: 'CS210',
    lecturer: 'Dr. Peter Mwangi',
    status: 'upcoming',
  },
  {
    id: 'tt-2',
    day: 'Monday',
    time: '11:00 - 13:00',
    title: 'Systems Analysis',
    venue: 'Lecture Hall B',
    courseCode: 'IT220',
    lecturer: 'Dr. Amina Ali',
    status: 'live',
  },
  {
    id: 'tt-3',
    day: 'Wednesday',
    time: '14:00 - 16:00',
    title: 'Database Systems',
    venue: 'Room 12',
    courseCode: 'CS215',
    lecturer: 'Dr. Peter Mwangi',
    status: 'upcoming',
  },
];

export const demoAnnouncements: AnnouncementItem[] = [
  {
    id: 'an-1',
    title: 'End of Semester Registration',
    body: 'All students are reminded to clear fees and complete registration before Friday.',
    audience: 'All students',
    publishedAt: 'Today',
    author: 'Registrar',
    priority: 'high',
  },
  {
    id: 'an-2',
    title: 'Lecture Timetable Update',
    body: 'The ICT department has shifted Friday sessions to the digital lab starting next week.',
    audience: 'ICT Faculty',
    publishedAt: 'Yesterday',
    author: 'Dean of Faculty',
  },
];

export const demoNotes: NoteItem[] = [
  {
    id: 'nt-1',
    title: 'CS210 Revision Notes',
    courseCode: 'CS210',
    author: 'Mercy Wanjiku',
    summary: 'Condensed definitions and worked examples for revision week.',
    fileLabel: 'PDF, 2.3 MB',
    uploadedAt: 'Today',
  },
  {
    id: 'nt-2',
    title: 'Database ERD Guide',
    courseCode: 'CS215',
    author: 'Dr. Peter Mwangi',
    summary: 'Reference guide for relationship modelling and normalization.',
    fileLabel: 'PDF, 1.8 MB',
    uploadedAt: 'Monday',
  },
];
