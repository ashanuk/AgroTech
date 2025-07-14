"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PackageCheck, XCircle, History, DollarSign, Filter, MessageSquare, Star } from "lucide-react";

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

// Combined type for reservation with product details
type ReservedProduct = {
  _id: string;
  buyerId: string;
  product: {
    _id: string;
    farmerId: string;
    title: string;
    pricePerKg: number;
    unit: string;
    images: string[];
    location: string;
  };
  quantityKg: number;
  status: "reserved" | "cancelled" | "fulfilled";
  reservedAt: Date;
  fulfilledAt?: Date;
};

// Dummy data combining reservations and products
const dummyReservations: ReservedProduct[] = [
  {
    _id: "res_1",
    buyerId: "user_456",
    product: {
      _id: "prod_1",
      farmerId: "user_123",
      title: "Organic Red Bananas",
      pricePerKg: 3.50,
      unit: "kg",
      images: ["/placeholder.svg"],
      location: "Green Valley Farms, Farmtown",
    },
    quantityKg: 10,
    status: "reserved",
    reservedAt: new Date("2025-07-13T10:00:00Z"),
  },
  {
    _id: "res_2",
    buyerId: "user_456",
    product: {
      _id: "prod_2",
      farmerId: "user_789",
      title: "Heirloom Tomatoes",
      pricePerKg: 4.20,
      unit: "kg",
      images: ["/placeholder.svg"],
      location: "Sunnyvale Gardens, Oakhaven",
    },
    quantityKg: 5,
    status: "fulfilled",
    reservedAt: new Date("2025-07-10T14:00:00Z"),
    fulfilledAt: new Date("2025-07-12T11:00:00Z"),
  },
  {
    _id: "res_3",
    buyerId: "user_456",
    product: {
      _id: "prod_3",
      farmerId: "user_123",
      title: "Basmati Rice",
      pricePerKg: 2.80,
      unit: "kg",
      images: ["/placeholder.svg"],
      location: "Sunrise Paddy Fields, Rivertown",
    },
    quantityKg: 25,
    status: "cancelled",
    reservedAt: new Date("2025-07-09T18:00:00Z"),
  },
  {
    _id: "res_4",
    buyerId: "user_456",
    product: {
      _id: "prod_4",
      farmerId: "user_789",
      title: "Fresh Spinach",
      pricePerKg: 2.00,
      unit: "kg",
      images: ["/placeholder.svg"],
      location: "Sunnyvale Gardens, Oakhaven",
    },
    quantityKg: 2,
    status: "reserved",
    reservedAt: new Date("2025-07-14T08:30:00Z"),
  },
];

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
  const [reservations, setReservations] = useState(dummyReservations);
  const [filter, setFilter] = useState("all");

  const handleCancelReservation = (reservationId: string) => {
    setReservations(prev =>
      prev.map(res =>
        res._id === reservationId ? { ...res, status: "cancelled" } : res
      )
    );
  };

  const filteredReservations = reservations.filter(res =>
    filter === "all" || res.status === filter
  );

  const activeReservations = reservations.filter(r => r.status === 'reserved').length;
  const totalSpent = reservations
    .filter(r => r.status === 'fulfilled')
    .reduce((sum, r) => sum + r.quantityKg * r.product.pricePerKg, 0);

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
            <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
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
              return (
                <Card key={reservation._id} className="p-4 flex flex-col sm:flex-row items-start gap-4">
                  <Avatar className="w-24 h-24 rounded-md">
                    <AvatarImage src={reservation.product.images[0]} alt={reservation.product.title} />
                    <AvatarFallback>{reservation.product.title.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{reservation.product.title}</h3>
                        <p className="text-sm text-muted-foreground">From: {reservation.product.location}</p>
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
                        <p className="font-medium">{reservation.quantityKg} {reservation.product.unit}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Price</p>
                        <p className="font-medium">${totalPrice.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Reserved On</p>
                        <p className="font-medium">{reservation.reservedAt.toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  {reservation.status === "reserved" && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full sm:w-auto">Cancel</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure you want to cancel?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently cancel your reservation for
                            <span className="font-semibold"> {reservation.quantityKg}{reservation.product.unit} of {reservation.product.title}</span>.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep Reservation</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleCancelReservation(reservation._id)}
                          >
                            Yes, Cancel
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
              <p className="text-muted-foreground">No reservations found for this status.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}