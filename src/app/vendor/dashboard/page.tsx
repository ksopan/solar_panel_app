"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function VendorDashboard() {
  const { data: session } = useSession();
  const [quotationRequests, setQuotationRequests] = useState([]);
  const [vendorQuotations, setVendorQuotations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state for new quotation submission
  const [price, setPrice] = useState("");
  const [installationTimeframe, setInstallationTimeframe] = useState("");
  const [warrantyPeriod, setWarrantyPeriod] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [pdfFile, setPdfFile] = useState(null);

  useEffect(() => {
    // Fetch open quotation requests and vendor's submitted quotations
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch open quotation requests
        const requestsResponse = await fetch('/api/quotations/open');
        if (!requestsResponse.ok) {
          throw new Error('Failed to fetch open quotation requests');
        }
        const requestsData = await requestsResponse.json();
        setQuotationRequests(requestsData.quotationRequests);
        
        // Fetch vendor's submitted quotations
        const quotationsResponse = await fetch('/api/quotations/vendor');
        if (!quotationsResponse.ok) {
          throw new Error('Failed to fetch vendor quotations');
        }
        const quotationsData = await quotationsResponse.json();
        setVendorQuotations(quotationsData.vendorQuotations);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchData();
    }
  }, [session]);

  const handleSubmitQuotation = async (e) => {
    e.preventDefault();
    
    if (!selectedRequest) return;
    
    try {
      const formData = new FormData();
      formData.append('quotation_request_id', selectedRequest.id);
      formData.append('price', price);
      formData.append('installation_timeframe', installationTimeframe);
      formData.append('warranty_period', warrantyPeriod);
      formData.append('additional_notes', additionalNotes);
      if (pdfFile) {
        formData.append('quotation_pdf', pdfFile);
      }
      
      const response = await fetch('/api/quotations/submit', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit quotation');
      }
      
      // Reset form and close dialog
      setPrice("");
      setInstallationTimeframe("");
      setWarrantyPeriod("");
      setAdditionalNotes("");
      setPdfFile(null);
      setSelectedRequest(null);
      setIsDialogOpen(false);
      
      // Refresh data
      const requestsResponse = await fetch('/api/quotations/open');
      const requestsData = await requestsResponse.json();
      setQuotationRequests(requestsData.quotationRequests);
      
      const quotationsResponse = await fetch('/api/quotations/vendor');
      const quotationsData = await quotationsResponse.json();
      setVendorQuotations(quotationsData.vendorQuotations);
      
    } catch (error) {
      console.error('Error submitting quotation:', error);
      setError('Failed to submit your quotation. Please try again.');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
    }
  };

  const openQuotationDialog = (request) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
  };

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please sign in to view your dashboard</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Open Quotation Requests</CardTitle>
            <CardDescription>
              View and respond to customer requests for solar panel installation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Loading open requests...</div>
            ) : quotationRequests.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500">There are no open quotation requests at the moment.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {quotationRequests.map((request) => (
                  <Card key={request.id} className="overflow-hidden">
                    <div className="bg-muted p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{request.address}</h3>
                          <p className="text-sm text-gray-500">
                            Requested on {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Devices</p>
                          <p>{request.num_electronic_devices}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Monthly Bill</p>
                          <p>${request.monthly_electricity_bill.toFixed(2)}</p>
                        </div>
                      </div>
                      {request.additional_requirements && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-500">Additional Requirements</p>
                          <p className="text-sm">{request.additional_requirements}</p>
                        </div>
                      )}
                      <div className="mt-4">
                        <Button 
                          className="w-full"
                          onClick={() => openQuotationDialog(request)}
                        >
                          Submit Quotation
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Submitted Quotations</CardTitle>
            <CardDescription>
              Track the status of quotations you've submitted to customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Loading your quotations...</div>
            ) : vendorQuotations.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500">You haven't submitted any quotations yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {vendorQuotations.map((quotation) => (
                  <Card key={quotation.id} className="overflow-hidden">
                    <div className="bg-muted p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{quotation.address}</h3>
                          <p className="text-sm text-gray-500">
                            Submitted on {new Date(quotation.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            quotation.status === 'submitted' 
                              ? 'bg-blue-100 text-blue-800' 
                              : quotation.status === 'viewed' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : quotation.status === 'accepted'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {quotation.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Price</p>
                          <p>${quotation.price.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Installation</p>
                          <p>{quotation.installation_timeframe}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Warranty</p>
                          <p>{quotation.warranty_period}</p>
                        </div>
                        {quotation.quotation_pdf_url && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">PDF</p>
                            <a 
                              href={quotation.quotation_pdf_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              View PDF
                            </a>
                          </div>
                        )}
                      </div>
                      {quotation.additional_notes && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-500">Notes</p>
                          <p className="text-sm">{quotation.additional_notes}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quotation Submission Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Quotation</DialogTitle>
            <DialogDescription>
              {selectedRequest && (
                <span>
                  Provide your quotation details for the request at {selectedRequest.address}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitQuotation}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Enter your quotation price"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="installationTimeframe">Installation Timeframe</Label>
                <Input
                  id="installationTimeframe"
                  value={installationTimeframe}
                  onChange={(e) => setInstallationTimeframe(e.target.value)}
                  placeholder="e.g., 2-3 weeks"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="warrantyPeriod">Warranty Period</Label>
                <Input
                  id="warrantyPeriod"
                  value={warrantyPeriod}
                  onChange={(e) => setWarrantyPeriod(e.target.value)}
                  placeholder="e.g., 5 years"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="additionalNotes">Additional Notes</Label>
                <Textarea
                  id="additionalNotes"
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Any additional information about your quotation"
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pdfFile">Quotation PDF (Optional)</Label>
                <Input
                  id="pdfFile"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                />
                <p className="text-xs text-gray-500">Upload a detailed quotation document (PDF format)</p>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Submit Quotation</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
