import { DrizzleD1Database } from 'drizzle-orm/d1';
import { nanoid } from 'nanoid';

// Types
export interface QuotationRequest {
  id: string;
  customer_id: string;
  address: string;
  num_electronic_devices: number;
  monthly_electricity_bill: number;
  additional_requirements: string;
  status: 'open' | 'in_progress' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface VendorQuotation {
  id: string;
  quotation_request_id: string;
  vendor_id: string;
  price: number;
  installation_timeframe: string;
  warranty_period: string;
  quotation_pdf_url: string;
  additional_notes: string;
  status: 'submitted' | 'viewed' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

// Quotation functions
export async function createQuotationRequest(
  db: DrizzleD1Database,
  customerId: string,
  data: {
    address: string;
    num_electronic_devices: number;
    monthly_electricity_bill: number;
    additional_requirements?: string;
  }
) {
  try {
    const id = nanoid();
    const now = new Date().toISOString();
    
    await db.prepare(
      `INSERT INTO quotation_requests 
       (id, customer_id, address, num_electronic_devices, monthly_electricity_bill, additional_requirements, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      customerId,
      data.address,
      data.num_electronic_devices,
      data.monthly_electricity_bill,
      data.additional_requirements || null,
      'open',
      now,
      now
    ).run();
    
    // Notify all vendors about the new quotation request
    await notifyVendorsAboutNewRequest(db, id);
    
    return { success: true, requestId: id };
  } catch (error) {
    console.error('Error creating quotation request:', error);
    return { success: false, message: 'Failed to create quotation request' };
  }
}

export async function getQuotationRequestsByCustomer(
  db: DrizzleD1Database,
  customerId: string
) {
  try {
    const requests = await db.prepare(
      'SELECT * FROM quotation_requests WHERE customer_id = ? ORDER BY created_at DESC'
    ).bind(customerId).all<QuotationRequest>();
    
    return { success: true, requests: requests.results };
  } catch (error) {
    console.error('Error getting quotation requests:', error);
    return { success: false, message: 'Failed to get quotation requests' };
  }
}

export async function getQuotationRequestById(
  db: DrizzleD1Database,
  requestId: string
) {
  try {
    const request = await db.prepare(
      'SELECT * FROM quotation_requests WHERE id = ?'
    ).bind(requestId).first<QuotationRequest>();
    
    if (!request) {
      return { success: false, message: 'Quotation request not found' };
    }
    
    return { success: true, request };
  } catch (error) {
    console.error('Error getting quotation request:', error);
    return { success: false, message: 'Failed to get quotation request' };
  }
}

export async function getOpenQuotationRequests(db: DrizzleD1Database) {
  try {
    const requests = await db.prepare(
      'SELECT * FROM quotation_requests WHERE status = ? ORDER BY created_at DESC'
    ).bind('open').all<QuotationRequest>();
    
    return { success: true, requests: requests.results };
  } catch (error) {
    console.error('Error getting open quotation requests:', error);
    return { success: false, message: 'Failed to get open quotation requests' };
  }
}

// Notification functions
async function notifyVendorsAboutNewRequest(
  db: DrizzleD1Database,
  requestId: string
) {
  try {
    // Get all active vendors
    const vendors = await db.prepare(
      'SELECT id FROM users WHERE user_type = ? AND is_active = ?'
    ).bind('vendor', true).all<{ id: string }>();
    
    if (!vendors.results.length) {
      return;
    }
    
    // Get request details for notification
    const request = await db.prepare(
      'SELECT * FROM quotation_requests WHERE id = ?'
    ).bind(requestId).first<QuotationRequest>();
    
    if (!request) {
      return;
    }
    
    // Create notifications for all vendors
    for (const vendor of vendors.results) {
      const notificationId = nanoid();
      
      await db.prepare(
        `INSERT INTO notifications 
         (id, user_id, title, message, is_read, notification_type, related_id, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        notificationId,
        vendor.id,
        'New Quotation Request',
        `A new quotation request has been submitted for a property with a monthly electricity bill of $${request.monthly_electricity_bill}. Click to view details and submit your quotation.`,
        false,
        'new_request',
        requestId,
        new Date().toISOString()
      ).run();
    }
  } catch (error) {
    console.error('Error notifying vendors:', error);
  }
}

export async function notifyCustomerAboutNewQuotation(
  db: DrizzleD1Database,
  quotationId: string,
  vendorId: string,
  requestId: string
) {
  try {
    // Get request details to find customer
    const request = await db.prepare(
      'SELECT customer_id FROM quotation_requests WHERE id = ?'
    ).bind(requestId).first<{ customer_id: string }>();
    
    if (!request) {
      return;
    }
    
    // Get vendor details for notification
    const vendor = await db.prepare(
      'SELECT v.company_name FROM vendors v JOIN users u ON v.id = u.id WHERE v.id = ?'
    ).bind(vendorId).first<{ company_name: string }>();
    
    if (!vendor) {
      return;
    }
    
    const notificationId = nanoid();
    
    await db.prepare(
      `INSERT INTO notifications 
       (id, user_id, title, message, is_read, notification_type, related_id, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      notificationId,
      request.customer_id,
      'New Quotation Received',
      `${vendor.company_name} has submitted a quotation for your request. Click to view details.`,
      false,
      'new_quotation',
      quotationId,
      new Date().toISOString()
    ).run();
  } catch (error) {
    console.error('Error notifying customer:', error);
  }
}

export async function getUnreadNotificationsCount(
  db: DrizzleD1Database,
  userId: string
) {
  try {
    const result = await db.prepare(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = ?'
    ).bind(userId, false).first<{ count: number }>();
    
    return { success: true, count: result?.count || 0 };
  } catch (error) {
    console.error('Error getting unread notifications count:', error);
    return { success: false, message: 'Failed to get notifications count' };
  }
}

export async function getUserNotifications(
  db: DrizzleD1Database,
  userId: string
) {
  try {
    const notifications = await db.prepare(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20'
    ).bind(userId).all();
    
    return { success: true, notifications: notifications.results };
  } catch (error) {
    console.error('Error getting user notifications:', error);
    return { success: false, message: 'Failed to get notifications' };
  }
}

export async function markNotificationAsRead(
  db: DrizzleD1Database,
  notificationId: string
) {
  try {
    await db.prepare(
      'UPDATE notifications SET is_read = ? WHERE id = ?'
    ).bind(true, notificationId).run();
    
    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, message: 'Failed to mark notification as read' };
  }
}
