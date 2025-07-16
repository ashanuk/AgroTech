"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User, Edit, Save, Loader2, ShoppingCart, Package, KeyRound, Shield, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IUser } from "@/models/user";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState<Partial<IUser>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  // Fetch full user profile on component mount
  useEffect(() => {
    if (status === "authenticated") {
      const fetchProfile = async () => {
        try {
          const res = await fetch('/api/user/profile');
          if (!res.ok) throw new Error("Failed to fetch profile");
          const data = await res.json();
          setProfile(data);
        } catch (error) {
          toast.error("Could not load your profile data.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchProfile();
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setProfile(prev => ({ ...prev, role: value }));
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
        
        // Update coordinates in state
        setProfile(prev => ({
          ...prev,
          location: { type: 'Point', coordinates: [longitude, latitude] }
        }));

        // Reverse geocode to get a human-readable address
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          if (data && data.display_name) {
            setProfile(prev => ({ ...prev, address: data.display_name }));
            toast.success("Location found!");
          } else {
            toast.warning("Coordinates found, but could not fetch address.");
          }
        } catch (error) {
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


  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          username: profile.username,
          phone: profile.phone,
          address: profile.address,
          role: profile.role,
          location: profile.location,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Failed to update profile");
      }
      
      toast.success("Profile updated successfully!");
      setProfile(result.user); // Update state with the returned user data
      setIsEditing(false);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };



  if (isLoading || status === "loading") {
    return <ProfileSkeleton />;
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={session?.user?.image || ''} alt={profile.name} />
          <AvatarFallback className="text-2xl">
            {profile.name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{profile.name}</h1>
          <p className="text-muted-foreground">{profile.email}</p>
        </div>
      </div>

      {/* Profile Details Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>View and edit your personal details.</CardDescription>
          </div>
          <Button variant="outline" size="icon" onClick={() => setIsEditing(!isEditing)}>
            <Edit className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" value={profile.name || ''} onChange={handleInputChange} disabled={!isEditing} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" value={profile.username || ''} onChange={handleInputChange} disabled={!isEditing} placeholder="e.g., johnfarmer" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" value={profile.email || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" value={profile.phone || ''} onChange={handleInputChange} disabled={!isEditing} placeholder="e.g., +1234567890" />
            </div>
            {/* <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" value={profile.address || ''} onChange={handleInputChange} disabled={!isEditing} placeholder="e.g., 123 Green Valley, Farmtown" />
            </div> */}

                        <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="address">Address</Label>
                {isEditing && (
                  <Button
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
                    Use my current location
                  </Button>
                )}
              </div>
              <Input id="address" name="address" value={profile.address || ''} onChange={handleInputChange} disabled={!isEditing} placeholder="Click 'use my location' button above or enter manually" />
            </div>

            {/* <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={profile.role || 'user'} onValueChange={handleRoleChange} disabled={!isEditing}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="farmer">Farmer</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div> */}
          </div>
          {isEditing && (
            <div className="flex justify-end">
              <Button onClick={handleSaveChanges} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Actions Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Manage Your Products
            </CardTitle>
            <CardDescription>Add new products to sell or manage your existing listings.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="cursor-pointer" onClick={() => router.push('/user/sell-products')}>Sell Products</Button>
          </CardContent>
        </Card>
        <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              View Your Reservations
            </CardTitle>
            <CardDescription>Check the status of products you have reserved from other sellers.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="cursor-pointer" onClick={() => router.push('/user/reserved-products')}>View Reservations</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Skeleton component for loading state
const ProfileSkeleton = () => (
  <div className="container mx-auto p-6 space-y-8">
    <div className="flex items-center gap-4">
      <Skeleton className="h-16 w-16 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
    </div>
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
          <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
          <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
          <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
        </div>
      </CardContent>
    </Card>
    <Separator />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  </div>
);