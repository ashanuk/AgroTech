"use client";

import { useState } from "react";
import { PlusCircle, Search, MoreHorizontal, Edit, Trash2, Package, DollarSign, Scale, Filter, UploadCloud, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
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

// Dummy data based on your schema
const dummyProducts = [
  {
    _id: "prod_1",
    farmerId: "user_123",
    title: "Organic Red Bananas",
    description: "Freshly harvested organic red bananas, known for their sweet taste and creamy texture. Grown without any chemical pesticides.",
    cropType: "fruit",
    pricePerKg: 3.50,
    totalQuantityKg: 200,
    availableQuantityKg: 150,
    unit: "kg",
    images: ["/placeholder.svg"],
    location: "Green Valley Farms, Farmtown",
    createdAt: new Date("2025-07-10T09:00:00Z"),
    updatedAt: new Date("2025-07-12T14:30:00Z"),
  },
  {
    _id: "prod_2",
    farmerId: "user_123",
    title: "Heirloom Tomatoes",
    description: "A colorful mix of heirloom tomatoes, perfect for salads, sauces, and sandwiches. Bursting with flavor.",
    cropType: "vegetable",
    pricePerKg: 4.20,
    totalQuantityKg: 300,
    availableQuantityKg: 50,
    unit: "kg",
    images: ["/placeholder.svg"],
    location: "Green Valley Farms, Farmtown",
    createdAt: new Date("2025-07-08T11:00:00Z"),
    updatedAt: new Date("2025-07-11T18:00:00Z"),
  },
  {
    _id: "prod_3",
    farmerId: "user_123",
    title: "Basmati Rice",
    description: "Premium quality long-grain Basmati rice, aged for a year to enhance its aroma and flavor. Ideal for biryani and pilaf.",
    cropType: "grain",
    pricePerKg: 2.80,
    totalQuantityKg: 1000,
    availableQuantityKg: 850,
    unit: "kg",
    images: ["/placeholder.svg"],
    location: "Sunrise Paddy Fields, Rivertown",
    createdAt: new Date("2025-06-20T15:00:00Z"),
    updatedAt: new Date("2025-07-10T10:00:00Z"),
  },
];

type Product = typeof dummyProducts[0];

export default function SellProductsPage() {
  const [products, setProducts] = useState(dummyProducts);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsSheetOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsSheetOpen(true);
  };

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
              {products.reduce((sum, p) => sum + p.availableQuantityKg, 0).toLocaleString()} Kg
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
              ${products.reduce((sum, p) => sum + p.availableQuantityKg * p.pricePerKg, 0).toFixed(2)}
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
              <Input placeholder="Search products by title..." className="pl-10" />
            </div>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="fruit">Fruit</SelectItem>
                <SelectItem value="vegetable">Vegetable</SelectItem>
                <SelectItem value="grain">Grain</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product._id} className="flex flex-col">
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
                        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground line-clamp-3">{product.description}</p>
                </CardContent>
                <CardFooter className="flex justify-between text-sm">
                  <div className="font-semibold">
                    ${product.pricePerKg.toFixed(2)} / {product.unit}
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
        <SheetContent className="w-[400px] sm:w-[540px] p-0">
          <SheetHeader className="p-6">
            <SheetTitle>{editingProduct ? "Edit Product" : "Add a New Product"}</SheetTitle>
            <SheetDescription>
              {editingProduct ? "Update the details of your existing product." : "Fill in the details below to list a new product on the marketplace."}
            </SheetDescription>
          </SheetHeader>
          <Separator />
          <ScrollArea className="h-[calc(100vh-150px)]">
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Product Title</Label>
                <Input id="title" placeholder="e.g., Organic Red Bananas" defaultValue={editingProduct?.title} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Describe your product, its quality, and origin." rows={4} defaultValue={editingProduct?.description} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cropType">Crop Type</Label>
                  <Select defaultValue={editingProduct?.cropType}>
                    <SelectTrigger id="cropType">
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fruit">Fruit</SelectItem>
                      <SelectItem value="vegetable">Vegetable</SelectItem>
                      <SelectItem value="grain">Grain</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pricePerKg">Price per Unit</Label>
                  <Input id="pricePerKg" type="number" placeholder="e.g., 3.50" defaultValue={editingProduct?.pricePerKg} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="availableQuantityKg">Available Quantity</Label>
                  <Input id="availableQuantityKg" type="number" placeholder="e.g., 150" defaultValue={editingProduct?.availableQuantityKg} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Select defaultValue={editingProduct?.unit || "kg"}>
                    <SelectTrigger id="unit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kilogram (kg)</SelectItem>
                      <SelectItem value="ton">Tonne (ton)</SelectItem>
                      <SelectItem value="item">Item (per piece)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Pickup Location</Label>
                <Input id="location" placeholder="e.g., Green Valley Farms, Farmtown" defaultValue={editingProduct?.location} />
              </div>
              <div className="space-y-2">
                <Label>Product Images</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary">
                  <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>
          </ScrollArea>
          <Separator />
          <div className="p-6 flex justify-end gap-4">
            <Button variant="outline" onClick={() => setIsSheetOpen(false)}>Cancel</Button>
            <Button>{editingProduct ? "Save Changes" : "Add Product"}</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}