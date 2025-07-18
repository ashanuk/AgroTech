"use client";

import { useState, useEffect, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { PlusCircle, Search, MoreHorizontal, Edit, Trash2, Package, DollarSign, Scale, Filter, UploadCloud, X, Loader2, MapPin, ShoppingBag, User, Phone, Mail, CheckCircle, Clock, XCircle, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea1";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { IProduct, ILocation } from "@/models/product";

// Types
type Product = Partial<IProduct>;

type Order = {
  _id: string;
  buyerId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  productId: {
    _id: string;
    title: string;
    description: string;
    cropType: string;
    pricePerKg: number;
    unit: string;
    images: string[];
    address: string;
    location?: {
      type: 'Point';
      coordinates: [number, number];
    };
  };
  quantityKg: number;
  status: "reserved" | "cancelled" | "fulfilled";
  reservedAt: Date;
  fulfilledAt?: Date;
  totalPrice: number;
};

const getOrderStatusStyles = (status: Order['status']) => {
  switch (status) {
    case "reserved":
      return { variant: "default" as const, icon: <Clock className="h-3 w-3" />, label: "Pending", className: "bg-yellow-100 text-yellow-800" };
    case "fulfilled":
      return { variant: "secondary" as const, icon: <CheckCircle className="h-3 w-3" />, label: "Fulfilled", className: "bg-green-100 text-green-800" };
    case "cancelled":
      return { variant: "destructive" as const, icon: <XCircle className="h-3 w-3" />, label: "Cancelled", className: "bg-red-100 text-red-800" };
    default:
      return { variant: "outline" as const, icon: <Clock className="h-3 w-3" />, label: "Unknown", className: "bg-gray-100 text-gray-800" };
  }
};

export default function SellProductsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [orderFilter, setOrderFilter] = useState("all");
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [currentFormData, setCurrentFormData] = useState<Product>({});
  const [activeTab, setActiveTab] = useState("products");

  // Fetch products when the component mounts or session changes
  useEffect(() => {
    const fetchProducts = async () => {
      if (sessionStatus === "authenticated" && session?.user?.id) {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/product?farmerId=${session.user.id}&title=${searchQuery}`);
          if (!response.ok) throw new Error("Failed to fetch products.");
          const data = await response.json();
          setProducts(data.data.products);
        } catch (error) {
          toast.error((error as Error).message);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchProducts();
  }, [session, sessionStatus, searchQuery]);

// Fetch orders when the component mounts or session changes
useEffect(() => {
  const fetchOrders = async () => {
    if (sessionStatus === "authenticated" && session?.user?.id) {
      setIsOrdersLoading(true);
      try {
        const statusParam = orderFilter !== "all" ? `&status=${orderFilter}` : "";
        
        // Change this line - use reservations endpoint and filter by farmerId through products
        const response = await fetch(`/api/reservations?farmerId=${session.user.id}${statusParam}`);
        
        if (!response.ok) throw new Error("Failed to fetch orders.");
        const data = await response.json();
        
        // Convert date strings to Date objects and add totalPrice calculation
        const formattedOrders = data.data.map((order: any) => ({
          ...order,
          reservedAt: new Date(order.reservedAt),
          fulfilledAt: order.fulfilledAt ? new Date(order.fulfilledAt) : undefined,
          // Calculate totalPrice if not already present
          totalPrice: order.totalPrice || (order.quantityKg * order.productId.pricePerKg),
        }));
        
        setOrders(formattedOrders);
      } catch (error) {
        toast.error((error as Error).message);
      } finally {
        setIsOrdersLoading(false);
      }
    }
  };

  fetchOrders();
}, [session, sessionStatus, orderFilter]);

  const handleAddNew = () => {
    setEditingProduct(null);
    setCurrentFormData({});
    setIsSheetOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setCurrentFormData(product);
    setIsSheetOpen(true);
  };

  const handleDelete = async (productId: string) => {
    toast.promise(
      async () => {
        const response = await fetch(`/api/product?id=${productId}`, { method: 'DELETE' });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete product.");
        }
        setProducts(prev => prev.filter(p => p._id !== productId));
        return { success: true };
      },
      {
        loading: 'Deleting product...',
        success: 'Product deleted successfully!',
        error: (err) => err.message,
      }
    );
  };

  const handleOrderStatusUpdate = async (orderId: string, newStatus: string) => {
  try {
    // Use reservations endpoint for updates
    const response = await fetch(`/api/reservations?id=${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!response.ok) {
      throw new Error('Failed to update order status');
    }

    setOrders(prev =>
      prev.map(order =>
        order._id === orderId 
          ? { ...order, status: newStatus as "reserved" | "cancelled" | "fulfilled", fulfilledAt: newStatus === 'fulfilled' ? new Date() : order.fulfilledAt }
          : order
      )
    );
    
    toast.success(`Order ${newStatus} successfully!`);
  } catch (error) {
    console.error("Error updating order status:", error);
    toast.error("Failed to update order status. Please try again.");
  }
};

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setIsFetchingLocation(true);
    toast.info("Fetching your location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const location: ILocation = { type: 'Point', coordinates: [longitude, latitude] };

        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          if (data && data.display_name) {
            setCurrentFormData(prev => ({ ...prev, address: data.display_name, location }));
            toast.success("Location found!");
          } else {
            setCurrentFormData(prev => ({ ...prev, location }));
            toast.warning("Coordinates found, but could not fetch address.");
          }
        } catch (error) {
          setCurrentFormData(prev => ({ ...prev, location }));
          toast.error("Failed to fetch address from coordinates.");
        } finally {
          setIsFetchingLocation(false);
        }
      },
      (error) => {
        toast.error(`Could not get location: ${error.message}`);
        setIsFetchingLocation(false);
      }
    );
  };

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user?.id) {
      toast.error("You must be logged in to manage products.");
      return;
    }
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const productData: Partial<IProduct> = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      cropType: formData.get('cropType') as string,
      pricePerKg: parseFloat(formData.get('pricePerKg') as string),
      totalQuantityKg: parseInt(formData.get('totalQuantityKg') as string),
      unit: formData.get('unit') as string,
      address: formData.get('address') as string,
      location: currentFormData.location,
      farmerId: session.user.id,
    };
    
    if (!editingProduct) {
      productData.availableQuantityKg = productData.totalQuantityKg;
    } else {
      productData.availableQuantityKg = parseInt(formData.get('availableQuantityKg') as string);
    }

    const apiEndpoint = editingProduct
      ? `/api/product?id=${editingProduct._id}`
      : '/api/product';
    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const response = await fetch(apiEndpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || `Failed to ${editingProduct ? 'update' : 'add'} product.`);
      }

      toast.success(`Product ${editingProduct ? 'updated' : 'added'} successfully!`);
      if (editingProduct) {
        setProducts(prev => prev.map(p => p!._id === result.data._id ? result.data : p));
      } else {
        setProducts(prev => [result.data, ...prev]);
      }
      setIsSheetOpen(false);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && sessionStatus === 'loading') {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  const pendingOrders = orders.filter(o => o.status === 'reserved').length;
  const totalRevenue = orders.filter(o => o.status === 'fulfilled').reduce((sum, o) => sum + o.totalPrice, 0);
  const completedOrders = orders.filter(o => o.status === 'fulfilled').length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Products & Orders</h1>
          <p className="text-muted-foreground mt-1">Manage your products and track your orders from customers.</p>
        </div>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Product
        </Button>
      </div>

      {/* Tabs for Products and Orders */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Orders ({pendingOrders})
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.length}</div>
                <p className="text-xs text-muted-foreground">Active listings</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Inventory (Kg)</CardTitle>
                <Scale className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {products.reduce((sum, p) => sum + (p.availableQuantityKg || 0), 0).toLocaleString()} Kg
                </div>
                <p className="text-xs text-muted-foreground">Across all products</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Est. Inventory Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${products.reduce((sum, p) => sum + (p.availableQuantityKg || 0) * (p.pricePerKg || 0), 0).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Based on current prices</p>
              </CardContent>
            </Card>
          </div>

          {/* Product List */}
          <Card>
            <CardHeader>
              <CardTitle>Your Listings</CardTitle>
              <CardDescription>A list of all products you are currently selling.</CardDescription>
              <div className="pt-4 flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search products by title..." 
                    className="pl-10" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card key={product._id?.toString()} className="flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{product.title}</CardTitle>
                          <Badge variant="outline" className="mt-2 capitalize">{product.cropType}</Badge>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEdit(product)}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Delete</span>
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the product "{product.title}".
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(product._id?.toString() || '')} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm text-muted-foreground line-clamp-3">{product.description}</p>
                    </CardContent>
                    <CardFooter className="flex justify-between text-sm">
                      <div className="font-semibold">
                        ${product.pricePerKg?.toFixed(2)} / {product.unit}
                      </div>
                      <div className="text-muted-foreground">
                        {product.availableQuantityKg} {product.unit} left
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          {/* Order Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingOrders}</div>
                <p className="text-xs text-muted-foreground">Awaiting fulfillment</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">From completed orders</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedOrders}</div>
                <p className="text-xs text-muted-foreground">Successfully fulfilled</p>
              </CardContent>
            </Card>
          </div>

          {/* Orders List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Customer Orders</CardTitle>
                  <CardDescription>Manage orders placed by customers for your products.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={orderFilter} onValueChange={setOrderFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Orders</SelectItem>
                      <SelectItem value="reserved">Pending</SelectItem>
                      <SelectItem value="fulfilled">Fulfilled</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isOrdersLoading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : orders.length > 0 ? (
                orders.map((order) => {
                  const statusInfo = getOrderStatusStyles(order.status);
                  return (
                    <Card key={order._id} className="p-4">
                      <div className="flex flex-col sm:flex-row items-start gap-4">
                        <Avatar className="w-16 h-16 rounded-md">
                          <AvatarImage src={order.productId.images?.[0]} alt={order.productId.title} />
                          <AvatarFallback>{order.productId.title.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-lg">{order.productId.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                Order #{order._id.slice(-8).toUpperCase()}
                              </p>
                            </div>
                            <Badge className={`flex items-center gap-1.5 ${statusInfo.className}`}>
                              {statusInfo.icon}
                              {statusInfo.label}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Customer</p>
                              <p className="font-medium">{order.buyerId.name}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Quantity</p>
                              <p className="font-medium">{order.quantityKg} {order.productId.unit}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Total Price</p>
                              <p className="font-medium">${order.totalPrice.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Ordered On</p>
                              <p className="font-medium">{order.reservedAt.toLocaleDateString()}</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                  <DialogTitle>Order Details</DialogTitle>
                                  <DialogDescription>
                                    Complete information about this order.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-medium mb-2">Customer Information</h4>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span>{order.buyerId.name}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span>{order.buyerId.email}</span>
                                      </div>
                                      {order.buyerId.phone && (
                                        <div className="flex items-center gap-2">
                                          <Phone className="h-4 w-4 text-muted-foreground" />
                                          <span>{order.buyerId.phone}</span>
                                        </div>
                                      )}
                                      {order.buyerId.address && (
                                        <div className="flex items-start gap-2">
                                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                          <span>{order.buyerId.address}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <Separator />
                                  
                                  <div>
                                    <h4 className="font-medium mb-2">Product Information</h4>
                                    <div className="space-y-2 text-sm">
                                      <p><span className="font-medium">Product:</span> {order.productId.title}</p>
                                      <p><span className="font-medium">Type:</span> {order.productId.cropType}</p>
                                      <p><span className="font-medium">Quantity:</span> {order.quantityKg} {order.productId.unit}</p>
                                      <p><span className="font-medium">Price per unit:</span> ${order.productId.pricePerKg.toFixed(2)}</p>
                                      <p><span className="font-medium">Total:</span> ${order.totalPrice.toFixed(2)}</p>
                                    </div>
                                  </div>
                                  
                                  {order.productId.address && (
                                    <>
                                      <Separator />
                                      <div>
                                        <h4 className="font-medium mb-2">Pickup Location</h4>
                                        <p className="text-sm">{order.productId.address}</p>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>

                            {order.status === "reserved" && (
                              <>
                                <Button 
                                  onClick={() => handleOrderStatusUpdate(order._id, "fulfilled")}
                                  size="sm"
                                  // className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Mark as Fulfilled
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                      <XCircle className="mr-2 h-4 w-4" />
                                      Cancel Order
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will cancel the order and return the quantity to your inventory. This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Keep Order</AlertDialogCancel>
                                      <AlertDialogAction
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        onClick={() => handleOrderStatusUpdate(order._id, "cancelled")}
                                      >
                                        Yes, Cancel Order
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })
              ) : (
                <div className="text-center py-10 border-2 border-dashed border-border rounded-lg">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {orderFilter === 'all' ? 'No orders yet.' : `No ${orderFilter} orders found.`}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Orders will appear here when customers reserve your products.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Product Drawer - keeping the same as before */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] flex flex-col p-4 sm:max-w-[520px] rounded-l-sm">
          <SheetHeader className="pb-4">
            <SheetTitle>{editingProduct ? "Edit Product" : "Add a New Product"}</SheetTitle>
            <SheetDescription>
              {editingProduct ? "Update the details of your existing product." : "Fill in the details below to list a new product on the marketplace."}
            </SheetDescription>
          </SheetHeader>
          
          <form onSubmit={handleFormSubmit} className="flex flex-col flex-1">
            <ScrollArea className="p-4 pr-4 h-[calc(100vh-200px)]">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Product Title</Label>
                  <Input id="title" name="title" placeholder="e.g., Organic Red Bananas" defaultValue={currentFormData?.title} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" placeholder="Describe your product, its quality, and origin." rows={4} defaultValue={currentFormData?.description} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cropType">Crop Type</Label>
                    <Select name="cropType" defaultValue={currentFormData?.cropType}>
                      <SelectTrigger id="cropType"><SelectValue placeholder="Select a type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fruit">Fruit</SelectItem>
                        <SelectItem value="vegetable">Vegetable</SelectItem>
                        <SelectItem value="grain">Grain</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pricePerKg">Price per Unit ($)</Label>
                    <Input id="pricePerKg" name="pricePerKg" type="number" step="0.01" placeholder="e.g., 3.50" defaultValue={currentFormData?.pricePerKg} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="totalQuantityKg">Total Quantity</Label>
                    <Input id="totalQuantityKg" name="totalQuantityKg" type="number" placeholder="e.g., 200" defaultValue={currentFormData?.totalQuantityKg} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Select name="unit" defaultValue={currentFormData?.unit || "kg"}>
                      <SelectTrigger id="unit"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Kilogram (kg)</SelectItem>
                        <SelectItem value="ton">Tonne (ton)</SelectItem>
                        <SelectItem value="item">Item (per piece)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {editingProduct && (
                  <div className="space-y-2">
                    <Label htmlFor="availableQuantityKg">Available Quantity</Label>
                    <Input id="availableQuantityKg" name="availableQuantityKg" type="number" placeholder="e.g., 150" defaultValue={currentFormData?.availableQuantityKg} required />
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="address">Pickup Location Address</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleGetCurrentLocation}
                      disabled={isFetchingLocation}
                    >
                      {isFetchingLocation ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <MapPin className="mr-2 h-4 w-4" />
                      )}
                      Use current location
                    </Button>
                  </div>
                  <Input 
                    id="address" 
                    name="address" 
                    placeholder="Click button above or enter manually" 
                    value={currentFormData.address || ''} 
                    onChange={(e) => setCurrentFormData(prev => ({...prev, address: e.target.value}))}
                  />
                </div>
              </div>
            </ScrollArea>
            
            <Separator className="my-4" />
            
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => setIsSheetOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingProduct ? "Save Changes" : "Add Product"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}