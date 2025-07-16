"use client";

import { useState, useEffect, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { PlusCircle, Search, MoreHorizontal, Edit, Trash2, Package, DollarSign, Scale, Filter, UploadCloud, X, Loader2, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import { IProduct, ILocation } from "@/models/product";
import { Types } from "mongoose";

// Use the IProduct interface from your models
type Product = Partial<IProduct>;

export default function SellProductsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [currentFormData, setCurrentFormData] = useState<Product>({});

  // Fetch products when the component mounts or session changes
  useEffect(() => {
    const fetchProducts = async () => {
      if (sessionStatus === "authenticated" && session?.user?.id) {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/product?farmerId=${session.user.id}&title=${searchQuery}`);
          if (!response.ok) throw new Error("Failed to fetch products.");
          const data = await response.json();
          console.log(data.data);
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

  const handleAddNew = () => {
    setEditingProduct(null);
    setCurrentFormData({}); // Reset form data for a new product
    setIsSheetOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setCurrentFormData(product); // Load existing product data into the form
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
      location: currentFormData.location, // Get location object from state
      farmerId: session.user.id, // Ensure farmerId is set from session
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Your Products</h1>
          <p className="text-muted-foreground mt-1">Add, view, and update your product listings for the marketplace.</p>
        </div>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Product
        </Button>
      </div>

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

      {/* Add/Edit Product Drawer */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}> 
        <SheetContent className="w-[400px] sm:w-[540px] p-4 sm:max-w-[520px] rounded-l-sm scroll-auto">
          <form onSubmit={handleFormSubmit}>
            <SheetHeader className="p-6">
              <SheetTitle>{editingProduct ? "Edit Product" : "Add a New Product"}</SheetTitle>
              <SheetDescription>
                {editingProduct ? "Update the details of your existing product." : "Fill in the details below to list a new product on the marketplace."}
              </SheetDescription>
            </SheetHeader>
            <Separator />
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="p-6 space-y-6">
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
            <Separator />
            <div className="p-6 flex justify-end gap-4">
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