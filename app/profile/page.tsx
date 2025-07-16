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
import { User, Settings, Save, Camera } from "lucide-react";
import { JobPreferencesModal } from "@/components/job-preferences-modal";

export default function ProfilePage() {
  const { user, updateProfile, uploadAvatar, removeAvatar, loading } =
    useAuth();
  const { toast } = useToast();
  
  // Use auth guard to protect this page
  const { isAuthenticated } = useAuthGuard({
    requireAuth: true,
    redirectTo: "/"
  });
  
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    gender: user?.gender || "",
    role: user?.role || "",
    target_field: user?.target_field || "",
    target_companies: user?.target_companies?.join(", ") || "",
    target_positions: user?.target_positions?.join(", ") || "",
    experience_level: user?.experience_level || "",
  });

  const [isJobPreferencesModalOpen, setIsJobPreferencesModalOpen] =
    useState(false);

  // Update profile data when user changes
  useEffect(() => {
    console.log("🔄 Profile useEffect: User changed:", user);
    if (user) {
      const newProfileData = {
        name: user.name || "",
        email: user.email || "",
        gender: user.gender || "",
        role: user.role || "",
        target_field: user.target_field || "",
        target_companies: user.target_companies?.join(", ") || "",
        target_positions: user.target_positions?.join(", ") || "",
        experience_level: user.experience_level || "",
      };
      console.log("🔄 Profile useEffect: Setting new profile data:", newProfileData);
      setProfileData(newProfileData);
    } else {
      console.log("🔄 Profile useEffect: No user, clearing profile data");
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) {
      console.log("❌ handleSaveProfile: No user found, returning early");
      return;
    }

    console.log("🚀 handleSaveProfile: Starting profile update");
    console.log("📊 Current profileData:", profileData);
    console.log("👤 Current user:", user);

    try {
      // Prepare the data to be sent
      const updateData = {
        name: profileData.name,
        gender: profileData.gender,
        role: profileData.role,
        target_field: profileData.target_field,
        target_companies: profileData.target_companies
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
        target_positions: profileData.target_positions
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean),
        experience_level: profileData.experience_level,
      };

      console.log("📤 handleSaveProfile: Sending update data:", updateData);

      const result = await updateProfile(updateData);
      
      console.log("✅ handleSaveProfile: updateProfile result:", result);

      toast({
        title: "Profile Updated!",
        description: "Your profile has been successfully updated.",
      });
      
      console.log("🎉 handleSaveProfile: Profile update completed successfully");
    } catch (error) {
      console.error("❌ handleSaveProfile: Error updating profile:", error);
      console.error("❌ handleSaveProfile: Error details:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      });
      
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      await uploadAvatar(file);
      toast({
        title: "Avatar Updated!",
        description: "Your profile picture has been successfully uploaded.",
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Error",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleAvatarRemove = async () => {
    try {
      await removeAvatar();
      toast({
        title: "Avatar Removed!",
        description: "Your profile picture has been removed.",
      });
    } catch (error) {
      console.error("Error removing avatar:", error);
      toast({
        title: "Error",
        description: "Failed to remove avatar. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <User className="w-12 h-12 text-gray-400 mx-auto" />
          <h2 className="text-xl font-semibold">Please Sign In</h2>
          <p className="text-gray-600">
            You need to sign in to view your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <Settings className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Profile Settings
            </h1>
            <p className="text-gray-600">
              Manage your account information and preferences
            </p>
          </div>
        </div>

                  <div className="grid gap-6 md:grid-cols-2">
            {/* Profile Picture Section */}
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Camera className="w-5 h-5 text-blue-600" />
                    <span>Profile Picture</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ProfileImageUpload
                    currentAvatar={user.avatar}
                    userName={user.name}
                    onImageUpload={handleAvatarUpload}
                    onImageRemove={handleAvatarRemove}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Account Information */}
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>User ID</Label>
                    <Input value={user.id} disabled className="bg-gray-50" />
                  </div>

                  <div>
                    <Label>Role</Label>
                    <Input value={user.role} disabled className="bg-gray-50" />
                  </div>

                  <div>
                    <Label>Joined Date</Label>
                    <Input
                      value={new Date(user.joinedDate).toLocaleDateString()}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>

                  <Separator />

                  <div className="text-sm text-gray-600">
                    <p>
                      <strong>Account Status:</strong> Active
                    </p>
                    <p>
                      <strong>Last Login:</strong> {new Date().toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5 text-blue-600" />
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profileData.email}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed
                </p>
              </div>

              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={profileData.gender}
                  onValueChange={(value) =>
                    setProfileData((prev) => ({ ...prev, gender: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">
                      Prefer not to say
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="role">Role/Occupation</Label>
                <Select
                  value={profileData.role}
                  onValueChange={(value) =>
                    setProfileData((prev) => ({ ...prev, role: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Software Engineer">
                      Software Engineer
                    </SelectItem>
                    <SelectItem value="Frontend Developer">
                      Frontend Developer
                    </SelectItem>
                    <SelectItem value="Backend Developer">
                      Backend Developer
                    </SelectItem>
                    <SelectItem value="Full Stack Developer">
                      Full Stack Developer
                    </SelectItem>
                    <SelectItem value="Data Scientist">
                      Data Scientist
                    </SelectItem>
                    <SelectItem value="Product Manager">
                      Product Manager
                    </SelectItem>
                    <SelectItem value="UI/UX Designer">
                      UI/UX Designer
                    </SelectItem>
                    <SelectItem value="DevOps Engineer">
                      DevOps Engineer
                    </SelectItem>
                    <SelectItem value="QA Engineer">QA Engineer</SelectItem>
                    <SelectItem value="Project Manager">
                      Project Manager
                    </SelectItem>
                    <SelectItem value="Business Analyst">
                      Business Analyst
                    </SelectItem>
                    <SelectItem value="Marketing Manager">
                      Marketing Manager
                    </SelectItem>
                    <SelectItem value="Sales Representative">
                      Sales Representative
                    </SelectItem>
                    <SelectItem value="Human Resources">
                      Human Resources
                    </SelectItem>
                    <SelectItem value="Finance Analyst">
                      Finance Analyst
                    </SelectItem>
                    <SelectItem value="Student">Student</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                <Input
                  id="target_companies"
                  value={profileData.target_companies}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      target_companies: e.target.value,
                    }))
                  }
                  placeholder="e.g. Google, Microsoft, Amazon (comma separated)"
                />
              </div>
              <div>
                <Label htmlFor="target_positions">Target Positions</Label>
                <Input
                  id="target_positions"
                  value={profileData.target_positions}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      target_positions: e.target.value,
                    }))
                  }
                  placeholder="e.g. Software Engineer, Data Analyst (comma separated)"
                />
              </div>
              <div>
                <Label htmlFor="experience_level">Experience Level</Label>
                <Select
                  value={profileData.experience_level}
                  onValueChange={(value) =>
                    setProfileData((prev) => ({
                      ...prev,
                      experience_level: value,
                    }))
                  }
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
                disabled={loading}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

        {/* Job Preferences Link */}
        <Card>
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
