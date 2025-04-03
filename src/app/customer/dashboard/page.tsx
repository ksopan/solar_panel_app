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

export default function CustomerDashboard() {
  const { data: session } = useSession();
  const [quotationRequests, setQuotationRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state for new quotation request
  const [address, setAddress] = useState("");
  const [numDevices, setNumDevices] = useState("");
  const [monthlyBill, setMonthlyBill] = useState("");
  const [additionalRequirements, setAdditionalRequirements] = useState("");

  useEffect(() => {
    // Fetch customer's quotation requests
    const fetchQuotationRequests = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/quotations/customer');
        
        if (!response.ok) {
          throw new Error('Failed to fetch quotation requests');
        }
        
        const data = await response.json();
        setQuotationRequests(data.quotationRequests);
      } catch (error) {
        console.error('Error fetching quotation requests:', error);
        setError('Failed to load your quotation requests. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchQuotationRequests();
    }
  }, [session]);

  const handleSubmitQuotationRequest = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/quotations/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          num_electronic_devices: parseInt(numDevices),
          monthly_electricity_bill: parseFloat(monthlyBill),
          additional_requirements: additionalRequirements,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit quotation request');
      }
      
      // Reset form and close dialog
      setAddress("");
      setNumDevices("");
      setMonthlyBill("");
      setAdditionalRequirements("");
      setIsDialogOpen(false);
      
      // Refresh quotation requests
      const updatedResponse = await fetch('/api/quotations/customer');
      const updatedData = await updatedResponse.json();
      setQuotationRequests(updatedData.quotationRequests);
      
    } catch (error) {
      console.error('Error submitting quotation request:', error);
      setError('Failed to submit your quotation request. Please try again.');
    }
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
        <h1 className="text-3xl font-bold">Customer Dashboard</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Request New Quotation</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request for Quotation</DialogTitle>
              <DialogDescription>
                Fill in the details below to request quotations from solar panel vendors.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitQuotationRequest}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Installation Address</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter the address for installation"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numDevices">Number of Electronic Devices</Label>
                  <Input
                    id="numDevices"
                    type="number"
                    value={numDevices}
                    onChange={(e) => setNumDevices(e.target.value)}
                    placeholder="Enter the number of electronic devices"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyBill">Monthly Electricity Bill ($)</Label>
                  <Input
                    id="monthlyBill"
                    type="number"
                    step="0.01"
                    value={monthlyBill}
                    onChange={(e) => setMonthlyBill(e.target.value)}
                    placeholder="Enter your average monthly electricity bill"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="additionalRequirements">Additional Requirements</Label>
                  <Textarea
                    id="additionalRequirements"
                    value={additionalRequirements}
                    onChange={(e) => setAdditionalRequirements(e.target.value)}
                    placeholder="Any specific requirements or questions"
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Submit Request</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Quotation Requests</CardTitle>
            <CardDescription>
              View and manage your solar panel installation quotation requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Loading your quotation requests...</div>
            ) : quotationRequests.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500">You haven't submitted any quotation requests yet.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setIsDialogOpen(true)}
                >
                  Request Your First Quotation
                </Button>
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
                            Submitted on {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            request.status === 'open' 
                              ? 'bg-blue-100 text-blue-800' 
                              : request.status === 'in_progress' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {request.status.replace('_', ' ')}
                          </span>
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
                        <Button variant="outline" className="w-full">
                          View Quotations ({request.quotations_count || 0})
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
