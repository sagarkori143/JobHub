"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ProfileImageUpload } from "@/components/profile-image-upload";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { useRoleAuth } from "@/hooks/use-role-auth";
import { User, Settings, Save, Camera, Shield } from "lucide-react";
import { JobPreferencesModal } from "@/components/job-preferences-modal";
import { TagInput } from "@/components/ui/tag-input";
import { OccupationType } from "@/types/job-search";

export default function ProfilePage() {
  const { user, updateProfile, uploadAvatar, removeAvatar, loading, refreshUserProfile } =
    useAuth();
  const { toast } = useToast();
  
  // Use auth guard to protect this page
  const { isAuthenticated } = useAuthGuard({
    requireAuth: true,
    redirectTo: "/"
  });

  // Get role information for admin features
  const { isAdmin } = useRoleAuth({
    requiredRole: "user", // Allow both admin and user
    allowedRoles: ["admin", "user"]
  });
  
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    gender: user?.gender || "",
    occupation: user?.occupation || "",
    target_field: user?.target_field || "",
    target_companies: user?.target_companies || [], // Array instead of string
    target_positions: user?.target_positions || [], // Array instead of string
    experience_level: user?.experience_level || "",
  });

  const [isJobPreferencesModalOpen, setIsJobPreferencesModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [originalData, setOriginalData] = useState({
    name: "",
    email: "",
    gender: "",
    occupation: "",
    target_field: "",
    target_companies: [] as string[],
    target_positions: [] as string[],
    experience_level: "",
  });

  // Helper function to check if profile has changes
  const hasChanges = () => {
    return (
      profileData.name !== originalData.name ||
      profileData.gender !== originalData.gender ||
      profileData.occupation !== originalData.occupation ||
      profileData.target_field !== originalData.target_field ||
      profileData.experience_level !== originalData.experience_level ||
      JSON.stringify(profileData.target_companies) !== JSON.stringify(originalData.target_companies) ||
      JSON.stringify(profileData.target_positions) !== JSON.stringify(originalData.target_positions)
    );
  };

  // Helper function to capitalize gender for UI display
  const capitalizeGender = (gender: string) => {
    if (!gender) return "";
    if (gender.toLowerCase() === "prefer not to say") return "Prefer not to say";
    return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
  };

  // Helper function to normalize gender for database storage
  const normalizeGender = (gender: string) => {
    if (!gender) return "";
    if (gender === "Prefer not to say") return "prefer not to say";
    return gender.toLowerCase();
  };

  // Update profile data when user changes
  useEffect(() => {
    if (user) {
      const newProfileData = {
        name: user.name || "",
        email: user.email || "",
        gender: capitalizeGender(user.gender || ""), // Capitalize for UI display
        occupation: user.occupation || "",
        target_field: user.target_field || "",
        target_companies: user.target_companies || [], // Keep as array
        target_positions: user.target_positions || [], // Keep as array
        experience_level: user.experience_level || "",
      };
      
      setProfileData(newProfileData);
      // Set original data to track changes
      setOriginalData({
        name: user.name || "",
        email: user.email || "",
        gender: capitalizeGender(user.gender || ""),
        occupation: user.occupation || "",
        target_field: user.target_field || "",
        target_companies: user.target_companies || [],
        target_positions: user.target_positions || [],
        experience_level: user.experience_level || "",
      });
    }
  }, [user, user?.target_field, user?.target_companies, user?.target_positions, user?.experience_level, user?.occupation, user?.gender]);

  const handleSaveProfile = async () => {
    if (!user) {
      return;
    }

    setIsSaving(true); // Set saving state

    try {
      // Prepare the data to be sent - create a clean copy
      // Note: Temporarily excluding 'occupation' until database schema is updated
      const updateData = {
        name: profileData.name?.trim(),
        gender: normalizeGender(profileData.gender), // Normalize gender for database
        occupation: profileData.occupation, 
        target_field: profileData.target_field?.trim(),
        target_companies: [...profileData.target_companies], // Create a fresh array copy
        target_positions: [...profileData.target_positions], // Create a fresh array copy
        experience_level: profileData.experience_level,
      };

      const result = await updateProfile(updateData);

      // Wait a moment for database to process, then refresh
      await new Promise(resolve => setTimeout(resolve, 500));

      // Force a profile refresh to ensure UI is updated with latest data
      await refreshUserProfile();

      // Wait another moment to ensure state updates
      await new Promise(resolve => setTimeout(resolve, 200));

      toast({
        title: "Profile Updated!",
        description: "Your profile has been successfully updated.",
      });

      // Reset original data after successful save
      setOriginalData({
        name: profileData.name,
        email: profileData.email,
        gender: profileData.gender,
        occupation: profileData.occupation,
        target_field: profileData.target_field,
        target_companies: [...profileData.target_companies],
        target_positions: [...profileData.target_positions],
        experience_level: profileData.experience_level,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false); // Reset saving state
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      await uploadAvatar(file);
      toast({
        title: "Avatar updated",
        description: "Your avatar has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update avatar. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAvatarRemove = async () => {
    try {
      await removeAvatar();
      toast({
        title: "Avatar removed",
        description: "Your avatar has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove avatar. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Only render if authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            <Shield className="w-4 h-4" />
            Admin Access
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Profile Image */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Profile Picture
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProfileImageUpload
              currentAvatar={user.avatar}
              userName={user.name || ""}
              onImageUpload={handleAvatarUpload}
              onImageRemove={handleAvatarRemove}
            />
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) => {
                  setProfileData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }}
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={profileData.gender}
                onValueChange={(value) => {
                  setProfileData((prev) => ({ ...prev, gender: value }))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                  <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="userRole">Role</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="userRole"
                  value={user.role || "user"}
                  disabled
                  className="bg-gray-50 capitalize"
                />
                <span className="text-sm text-gray-500">(Contact admin to change role)</span>
              </div>
            </div>

            <div>
              <Label htmlFor="occupation">Occupation</Label>
              <Select
                value={profileData.occupation}
                onValueChange={(value) => {
                  setProfileData((prev) => ({ ...prev, occupation: value }))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your occupation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Software Engineer">Software Engineer</SelectItem>
                  <SelectItem value="Frontend Developer">Frontend Developer</SelectItem>
                  <SelectItem value="Backend Developer">Backend Developer</SelectItem>
                  <SelectItem value="Full Stack Developer">Full Stack Developer</SelectItem>
                  <SelectItem value="DevOps Engineer">DevOps Engineer</SelectItem>
                  <SelectItem value="Data Scientist">Data Scientist</SelectItem>
                  <SelectItem value="Data Analyst">Data Analyst</SelectItem>
                  <SelectItem value="Product Manager">Product Manager</SelectItem>
                  <SelectItem value="UI/UX Designer">UI/UX Designer</SelectItem>
                  <SelectItem value="Marketing Manager">Marketing Manager</SelectItem>
                  <SelectItem value="Sales Representative">Sales Representative</SelectItem>
                  <SelectItem value="Business Analyst">Business Analyst</SelectItem>
                  <SelectItem value="Project Manager">Project Manager</SelectItem>
                  <SelectItem value="HR Manager">HR Manager</SelectItem>
                  <SelectItem value="Finance Analyst">Finance Analyst</SelectItem>
                  <SelectItem value="Customer Support">Customer Support</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Job Preferences */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Job Search Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="target_field">Target Field/Industry</Label>
              <Input
                id="target_field"
                value={profileData.target_field}
                onChange={(e) =>
                  setProfileData((prev) => ({
                    ...prev,
                    target_field: e.target.value,
                  }))
                }
                placeholder="e.g. Software Engineering, Data Science"
              />
            </div>

            <div>
              <Label htmlFor="target_companies">Target Companies</Label>
              <TagInput
                tags={profileData.target_companies}
                onTagsChange={(tags) => {
                  setProfileData((prev) => ({
                    ...prev,
                    target_companies: tags,
                  }))
                }}
                placeholder="e.g. Google, Microsoft, Amazon"
              />
            </div>

            <div>
              <Label htmlFor="target_positions">Target Positions</Label>
              <TagInput
                tags={profileData.target_positions}
                onTagsChange={(tags) => {
                  setProfileData((prev) => ({
                    ...prev,
                    target_positions: tags,
                  }))
                }}
                placeholder="e.g. Software Engineer, Data Analyst"
              />
            </div>

            <div>
              <Label htmlFor="experience_level">Experience Level</Label>
              <Select
                value={profileData.experience_level}
                onValueChange={(value) => {
                  setProfileData((prev) => ({
                    ...prev,
                    experience_level: value,
                  }))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Entry">Entry</SelectItem>
                  <SelectItem value="Mid">Mid</SelectItem>
                  <SelectItem value="Senior">Senior</SelectItem>
                  <SelectItem value="Lead">Lead</SelectItem>
                  <SelectItem value="Director">Director</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSaveProfile}
              disabled={loading || isSaving || !hasChanges()}
              className="w-full"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        {/* Job Preferences Link */}
        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Job Preferences</h3>
              <p className="text-gray-600 mb-4">
                Customize your job search preferences and notification settings
              </p>
              <Button
                variant="outline"
                onClick={() => setIsJobPreferencesModalOpen(true)}
              >
                Manage Job Preferences
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Render Job Preferences Modal */}
      <JobPreferencesModal
        isOpen={isJobPreferencesModalOpen}
        onClose={() => setIsJobPreferencesModalOpen(false)}
      />
    </div>
  );
}
