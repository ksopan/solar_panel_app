// src/lib/quotation-utils.ts
import { nanoid } from 'nanoid';

/**
 * Function to handle file upload to storage
 * In a real production app, this would upload to S3, GCS, or similar
 * For this demo, we're simulating the upload process
 */
export async function uploadQuotationPDF(file: File): Promise<{ success: boolean; url?: string; message?: string }> {
  try {
    // Validate file type
    if (!file.type || file.type !== 'application/pdf') {
      return { 
        success: false, 
        message: 'Only PDF files are allowed for quotation uploads'
      };
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return { 
        success: false, 
        message: 'File size exceeds 5MB limit'
      };
    }
    
    // In production, this would upload to cloud storage
    // For this demo, we'll simulate a successful upload
    
    // Create a unique ID for the file
    const fileId = nanoid(12);
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    // Construct a simulated URL
    // In development mode, we'll just use a fake URL
    // In production, this would be the actual URL of the uploaded file
    const url = `/api/quotations/pdf/${fileId}/${safeFileName}`;
    
    return {
      success: true,
      url
    };
  } catch (error) {
    console.error('Error uploading quotation PDF:', error);
    return {
      success: false,
      message: 'Failed to upload quotation PDF'
    };
  }
}

/**
 * Format a price to a standardized format
 */
export function formatPrice(price: number | string): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return numPrice.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Calculate the best quotation based on price and warranty
 */
export function findBestQuotation(quotations: any[]): any | null {
  if (!quotations || quotations.length === 0) {
    return null;
  }
  
  // Simple algorithm: rank quotations by price and warranty
  // Lower price is better, longer warranty is better
  return quotations.map(quotation => {
    // Extract warranty years as a number
    const warrantyMatch = quotation.warranty_period.match(/(\d+)/);
    const warrantyYears = warrantyMatch ? parseInt(warrantyMatch[1], 10) : 0;
    
    // Normalize price and warranty to scores between 0-100
    // Find max price and max warranty for normalization
    const maxPrice = Math.max(...quotations.map(q => parseFloat(q.price)));
    const maxWarranty = Math.max(...quotations.map(q => {
      const match = q.warranty_period.match(/(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    }));
    
    // Price score (lower is better, so we invert it)
    const priceScore = 100 - ((parseFloat(quotation.price) / maxPrice) * 100);
    
    // Warranty score (higher is better)
    const warrantyScore = (warrantyYears / (maxWarranty || 1)) * 100;
    
    // Overall score (weight price more heavily)
    const overallScore = (priceScore * 0.7) + (warrantyScore * 0.3);
    
    return {
      ...quotation,
      warrantyYears,
      priceScore,
      warrantyScore,
      overallScore
    };
  })
  .sort((a, b) => b.overallScore - a.overallScore)[0];
}