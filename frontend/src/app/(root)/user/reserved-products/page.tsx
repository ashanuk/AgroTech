"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PackageCheck, XCircle, History, DollarSign, Filter, MessageSquare, Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation } from "@apollo/client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { GET_MY_RESERVATIONS, CANCEL_RESERVATION_MUTATION } from "@/lib/graphql/queries";

// Utility function to safely format dates
const formatDate = (dateString: string): string => {
  try {
    // Check if it's a Unix timestamp (number as string)
    const timestamp = parseInt(dateString);
    if (!isNaN(timestamp) && timestamp.toString() === dateString) {
      // It's a timestamp, convert it
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    }
    
    // Handle various date formats
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      // Try parsing as ISO string or other common formats
      const isoDate = new Date(dateString.replace(' ', 'T'));
      if (!isNaN(isoDate.getTime())) {
        return isoDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
      // If still invalid, return the original string
      return dateString;
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return dateString;
  }
};

// Type for reservation with product details - Updated to match GraphQL response
type ReservedProduct = {
  id: string;
  buyerId: string;
  productId: string;
  quantityKg: number;
  status: "reserved" | "cancelled" | "fulfilled";
  reservedAt: string;
  fulfilledAt?: string;
  updatedAt: string;
  canCancel: boolean;
  product: {
    id: string;
    title: string;
    description: string;
    cropType: string;
    pricePerKg: number;
    unit: string;
    images: string[];
    address?: string;
    farmer: {
      id: string;
      name?: string;
      username?: string;
      email: string;
      is_verified: boolean;
    };
  };
};

const getStatusStyles = (status: ReservedProduct['status']) => {
  switch (status) {
    case "reserved":
      return { variant: "default" as const, icon: <History className="h-3 w-3" />, label: "Reserved" };
    case "fulfilled":
      return { variant: "secondary" as const, icon: <PackageCheck className="h-3 w-3" />, label: "Fulfilled" };
    case "cancelled":
      return { variant: "destructive" as const, icon: <XCircle className="h-3 w-3" />, label: "Cancelled" };
    default:
      return { variant: "outline" as const, icon: <History className="h-3 w-3" />, label: "Unknown" };
  }
};

export default function ReservedProductsPage() {
  const [filter, setFilter] = useState("all");
  const router = useRouter();

  // GraphQL queries and mutations
  const { 
    loading, 
    error, 
    data, 
    refetch 
  } = useQuery(GET_MY_RESERVATIONS);

  const [cancelReservation] = useMutation(CANCEL_RESERVATION_MUTATION, {
    onCompleted: () => {
      toast.success("Reservation cancelled successfully!");
      refetch(); // Refetch the reservations list
    },
    onError: (error) => {
      console.error("Error cancelling reservation:", error);
      toast.error("Failed to cancel reservation. Please try again.");
    }
  });

  const reservations: ReservedProduct[] = data?.myReservations || [];

  const handleCancelReservation = async (reservationId: string) => {
    try {
      await cancelReservation({
        variables: { id: reservationId }
      });
    } catch (error) {
      console.error("Error cancelling reservation:", error);
    }
  };

  const filteredReservations = reservations.filter(res =>
    filter === "all" || res.status === filter
  );

  const activeReservations = reservations.filter(r => r.status === 'reserved').length;
  const totalSpent = reservations
    .filter(r => r.status === 'fulfilled')
    .reduce((sum, r) => sum + r.quantityKg * r.product.pricePerKg, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Your Reserved Products</h1>
        <p className="text-muted-foreground mt-1">Track the status of products you have reserved from the marketplace.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Reservations</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeReservations}</div>
            <p className="text-xs text-muted-foreground">Items waiting for fulfillment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">LKR {totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">On fulfilled orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Fulfilled</CardTitle>
            <PackageCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reservations.filter(r => r.status === 'fulfilled').length}</div>
            <p className="text-xs text-muted-foreground">Completed transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Reservation History</CardTitle>
              <CardDescription>A list of all your past and present reservations.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="fulfilled">Fulfilled</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredReservations.length > 0 ? (
            filteredReservations.map((reservation) => {
              const statusInfo = getStatusStyles(reservation.status);
              const totalPrice = reservation.quantityKg * reservation.product.pricePerKg;
              const product = reservation.product;
              
              return (
                <Card key={reservation.id} className="p-4 flex flex-col sm:flex-row items-start gap-4">
                  <Avatar className="w-24 h-24 rounded-md">
                    <AvatarImage src={product.images?.[0]} alt={product.title} />
                    <AvatarFallback>{product.title.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{product.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          From: {product.address || 'Location not specified'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Farmer: {product.farmer?.name || product.farmer?.username || 'Unknown'}
                        </p>
                      </div>
                      <Badge variant={statusInfo.variant} className="flex items-center gap-1.5">
                        {statusInfo.icon}
                        {statusInfo.label}
                      </Badge>
                    </div>
                    <Separator className="my-3" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Quantity</p>
                        <p className="font-medium">{reservation.quantityKg} {product.unit}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Price</p>
                        <p className="font-medium">LKR {totalPrice.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Reserved On</p>
                        <p className="font-medium">{formatDate(reservation.reservedAt)}</p>
                      </div>
                    </div>
                  </div>
                  {reservation.status === "reserved" && reservation.canCancel && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full sm:w-auto">Cancel</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure you want to cancel?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently cancel your reservation for
                            <span className="font-semibold"> {reservation.quantityKg} {product.unit} of {product.title}</span>.
                            <br />
                            <span className="text-xs text-muted-foreground mt-2 block">
                              Note: Reservations can only be cancelled within 30 minutes of booking.
                            </span>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep Reservation</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleCancelReservation(reservation.id)}
                          >
                            Yes, Cancel
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                  {reservation.status === "reserved" && !reservation.canCancel && (
                    <div className="text-center p-2">
                      <p className="text-xs text-muted-foreground">
                        Cancellation period expired
                      </p>
                    </div>
                  )}
                  {reservation.status === "fulfilled" && (
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      <Star className="mr-2 h-4 w-4" />
                      Leave a Review
                    </Button>
                  )}
                </Card>
              );
            })
          ) : (
            <div className="text-center py-10 border-2 border-dashed border-border rounded-lg">
              <p className="text-muted-foreground">
                {filter === 'all' ? 'You have no reservations.' : `No reservations found for status: ${filter}.`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}