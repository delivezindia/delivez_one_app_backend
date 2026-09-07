import type { RequestHandler } from 'express';
import { AppError } from '../../lib/app-error.js';

export interface SupportTicket {
  id: string;
  ticketCode: string;
  subject: string;
  category: 'DELIVERY_DELAY' | 'DAMAGED_PARCEL' | 'ADDRESS_ISSUE' | 'PAYMENT_REFUND' | 'RIDER_SOS' | 'GENERAL';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  orderBookingNumber?: string;
  serviceKey?: string;
  description: string;
  assignedAgent: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

// Seed realistic operational incident tickets
const ticketsStore: SupportTicket[] = [
  {
    id: 'tkt-1',
    ticketCode: 'TKT-8491',
    subject: 'Urgent: High security tamper seal alert during transit',
    category: 'RIDER_SOS',
    priority: 'URGENT',
    status: 'IN_PROGRESS',
    customerName: 'Rohit K. Singhal',
    customerPhone: '+91 98110 44321',
    customerEmail: 'rohit.s@delivez.one',
    orderBookingNumber: 'DLV-29812',
    serviceKey: 'confidential-courier',
    description: 'Armored transit rider reported checkpoint security scan discrepancy at Aerocity gate.',
    assignedAgent: 'Vikram Mehta (Security Lead)',
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: 'tkt-2',
    ticketCode: 'TKT-8490',
    subject: 'Surprise Gift recipient phone unreachable at doorstep',
    category: 'DELIVERY_DELAY',
    priority: 'HIGH',
    status: 'OPEN',
    customerName: 'Ananya Sharma',
    customerPhone: '+91 97234 56789',
    customerEmail: 'ananya.s@delivez.one',
    orderBookingNumber: 'GFT-2026-984',
    serviceKey: 'gift-delivery',
    description: 'Rider Rajesh is waiting outside apartment tower B. Doorbell unanswered, surprise parcel must be delivered before 2 PM.',
    assignedAgent: 'Pooja Verma (Care Desk)',
    createdAt: new Date(Date.now() - 85 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 85 * 60 * 1000).toISOString(),
  },
  {
    id: 'tkt-3',
    ticketCode: 'TKT-8488',
    subject: 'Return pickup merchant barcode verification failed',
    category: 'ADDRESS_ISSUE',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    customerName: 'Kunal Patil',
    customerPhone: '+91 98450 11223',
    customerEmail: 'kunal.p@delivez.one',
    orderBookingNumber: 'RET-55421',
    serviceKey: 'return-pickup',
    description: 'Customer provided Amazon return QR instead of merchant RMA code. Need updated PDF slip from customer.',
    assignedAgent: 'Deepak Kumar (Logistics)',
    createdAt: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
  },
  {
    id: 'tkt-4',
    ticketCode: 'TKT-8485',
    subject: 'Refund processed for cancelled midnight delivery',
    category: 'PAYMENT_REFUND',
    priority: 'LOW',
    status: 'RESOLVED',
    customerName: 'Priya Mehra',
    customerPhone: '+91 98777 66554',
    customerEmail: 'priya.m@delivez.one',
    orderBookingNumber: 'GFT-2026-921',
    serviceKey: 'gift-delivery',
    description: 'Order cancelled due to storm alert. Payment of ₹1,499 reversed to original UPI handle.',
    assignedAgent: 'Finance Auto-Bot',
    resolutionNotes: 'Refund ARN #784210992 generated. Money credited to ICICI account.',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
  },
];

export const listSupportTickets: RequestHandler = (req, res) => {
  const status = typeof req.query.status === 'string' ? req.query.status : 'ALL';
  const priority = typeof req.query.priority === 'string' ? req.query.priority : 'ALL';
  const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';

  let filtered = [...ticketsStore];

  if (status !== 'ALL') {
    filtered = filtered.filter((t) => t.status === status);
  }
  if (priority !== 'ALL') {
    filtered = filtered.filter((t) => t.priority === priority);
  }
  if (search) {
    filtered = filtered.filter(
      (t) =>
        t.ticketCode.toLowerCase().includes(search) ||
        t.subject.toLowerCase().includes(search) ||
        t.customerName.toLowerCase().includes(search) ||
        t.customerPhone.includes(search) ||
        (t.orderBookingNumber && t.orderBookingNumber.toLowerCase().includes(search))
    );
  }

  // Calculate metrics
  const total = ticketsStore.length;
  const openCount = ticketsStore.filter((t) => t.status === 'OPEN').length;
  const inProgressCount = ticketsStore.filter((t) => t.status === 'IN_PROGRESS').length;
  const resolvedCount = ticketsStore.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
  const urgentCount = ticketsStore.filter((t) => t.priority === 'URGENT' && t.status !== 'RESOLVED' && t.status !== 'CLOSED').length;

  res.status(200).json({
    status: 'success',
    data: {
      tickets: filtered,
      stats: {
        total,
        openCount,
        inProgressCount,
        resolvedCount,
        urgentCount,
      },
    },
  });
};

export const createSupportTicket: RequestHandler = (req, res) => {
  const {
    subject,
    category,
    priority,
    customerName,
    customerPhone,
    customerEmail,
    orderBookingNumber,
    serviceKey,
    description,
    assignedAgent,
  } = req.body;

  if (!subject || !customerName || !customerPhone || !description) {
    throw new AppError(400, 'Subject, customer name, customer phone and description are required.');
  }

  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const newTicket: SupportTicket = {
    id: `tkt-${Date.now()}`,
    ticketCode: `TKT-${randomNum}`,
    subject,
    category: category || 'GENERAL',
    priority: priority || 'MEDIUM',
    status: 'OPEN',
    customerName,
    customerPhone,
    customerEmail: customerEmail || '',
    orderBookingNumber: orderBookingNumber || '',
    serviceKey: serviceKey || '',
    description,
    assignedAgent: assignedAgent || 'Unassigned Helpdesk',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  ticketsStore.unshift(newTicket);

  res.status(201).json({
    status: 'success',
    message: `Support ticket ${newTicket.ticketCode} created successfully.`,
    data: { ticket: newTicket },
  });
};

export const updateSupportTicket: RequestHandler = (req, res) => {
  const id = String(req.params.id);
  const { status, priority, assignedAgent, resolutionNotes } = req.body;

  const ticket = ticketsStore.find((t) => t.id === id || t.ticketCode === id);
  if (!ticket) {
    throw new AppError(404, 'Support ticket not found.');
  }

  const isNowResolved = status === 'RESOLVED' || status === 'CLOSED';

  if (status) ticket.status = status;
  if (priority) ticket.priority = priority;
  if (assignedAgent !== undefined) ticket.assignedAgent = assignedAgent;
  if (resolutionNotes !== undefined) ticket.resolutionNotes = resolutionNotes;
  if (isNowResolved && !ticket.resolvedAt) ticket.resolvedAt = new Date().toISOString();
  ticket.updatedAt = new Date().toISOString();

  res.status(200).json({
    status: 'success',
    message: `Support ticket ${ticket.ticketCode} updated.`,
    data: { ticket },
  });
};

export const deleteSupportTicket: RequestHandler = (req, res) => {
  const id = String(req.params.id);
  const ticketIndex = ticketsStore.findIndex((t) => t.id === id || t.ticketCode === id);
  if (ticketIndex === -1) {
    throw new AppError(404, 'Support ticket not found.');
  }

  ticketsStore.splice(ticketIndex, 1);

  res.status(200).json({
    status: 'success',
    message: 'Support ticket deleted.',
  });
};
