"use client";
import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Eye, EyeOff, Upload } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProfileData, profileSchema, SecurityData, securitySchema } from "@/schema/profileSchem";


// ── Password field ────────────────────────────────────────
function PasswordInput({
  placeholder,
  registration,
  error,
}: {
  placeholder: string;
  registration: any;
  error?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          className="bg-[#1a1d27] border-white/10 text-white placeholder:text-white/25 h-12 pr-11 focus-visible:ring-0 focus-visible:border-white/25"
          {...registration}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────
export default function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [avatarName, setAvatarName] = useState<string | null>(null);

  // Profile form
  const profileForm = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "Chefven", email: "chefven@example.com" },
  });

  // Security form
  const securityForm = useForm<SecurityData>({
    resolver: zodResolver(securitySchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  // ── Handlers ─────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file type", {
        description: "Please select a valid image file (JPG, PNG, WebP).",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large", {
        description: "Image must be smaller than 5MB.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarSrc(ev.target?.result as string);
      setAvatarName(file.name);
      toast.success("Photo selected", {
        description: `"${file.name}" is ready. Save your profile to apply.`,
      });
    };
    reader.readAsDataURL(file);

    // reset so same file can be re-selected
    e.target.value = "";
  };

  const onProfileSubmit = (data: ProfileData) => {
    toast.success("Profile updated", {
      description: "Your name and email have been saved successfully.",
    });
  };

  const onSecuritySubmit = (data: SecurityData) => {
    toast.success("Password changed", {
      description: "Your password has been updated. You may log in with your new credentials.",
    });
    securityForm.reset();
  };

  return (
    <div className="max-w-4xl space-y-6 mx-auto">
      {/* ── Profile Card ─────────────────────────────── */}
      <Card className="bg-[#13151e] border-white/5">
        <CardContent className="p-6 md:p-8">
          {/* Avatar section */}
          <div className="flex items-center gap-5 mb-8 pb-7 border-b border-white/5">
            <div className="relative group">
              <Avatar className="w-20 h-20 ring-2 ring-white/10">
                <AvatarImage
                  src={avatarSrc ?? "/avatar.jpg"}
                  alt="Profile"
                  className="object-cover"
                />
                <AvatarFallback className="bg-[#2a2d3e] text-white text-xl font-semibold">
                  CV
                </AvatarFallback>
              </Avatar>

              {/* Hover overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-lg">Profile Photo</h3>
              <p className="text-white/40 text-sm mt-0.5">
                Upload a new photo or change your existing one
              </p>
              {avatarName && (
                <p className="text-[#0099ff] text-xs mt-1.5 truncate max-w-xs">
                  ✓ {avatarName}
                </p>
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2 bg-transparent border-white/15 text-white/60 hover:bg-white/5 hover:text-white hidden sm:flex"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload
            </Button>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Profile form */}
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              <div className="space-y-1.5">
                <label className="text-white/60 text-sm font-medium">
                  Profile name
                </label>
                <Input
                  className="bg-[#1a1d27] border-white/10 text-white placeholder:text-white/25 h-12 focus-visible:ring-0 focus-visible:border-white/25"
                  placeholder="Your name"
                  {...profileForm.register("name")}
                />
                {profileForm.formState.errors.name && (
                  <p className="text-red-400 text-xs">
                    {profileForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-white/60 text-sm font-medium">Email</label>
                <Input
                  className="bg-[#1a1d27] border-white/10 text-white placeholder:text-white/25 h-12 focus-visible:ring-0 focus-visible:border-white/25"
                  placeholder="your@email.com"
                  type="email"
                  {...profileForm.register("email")}
                />
                {profileForm.formState.errors.email && (
                  <p className="text-red-400 text-xs">
                    {profileForm.formState.errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-[#0099ff] hover:bg-[#007acc] text-white font-semibold h-11 px-8"
                disabled={profileForm.formState.isSubmitting}
              >
                Save
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ── Security Card ─────────────────────────────── */}
      <Card className="bg-[#13151e] border-white/5">
        <CardContent className="p-6 md:p-8">
          <div className="mb-7 pb-5 border-b border-white/5">
            <h3 className="text-white font-semibold text-lg">Security</h3>
            <p className="text-white/40 text-sm mt-0.5">
              Keep your account secure by updating your password & enabling extra
              security.
            </p>
          </div>

          <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div className="space-y-1.5">
                <label className="text-white/60 text-sm font-medium">
                  Current Password
                </label>
                <PasswordInput
                  placeholder="Enter current password"
                  registration={securityForm.register("currentPassword")}
                  error={securityForm.formState.errors.currentPassword?.message}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-white/60 text-sm font-medium">
                  New password
                </label>
                <PasswordInput
                  placeholder="Enter new password"
                  registration={securityForm.register("newPassword")}
                  error={securityForm.formState.errors.newPassword?.message}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-7">
              <div className="space-y-1.5">
                <label className="text-white/60 text-sm font-medium">
                  Confirm Password
                </label>
                <PasswordInput
                  placeholder="Retype new password"
                  registration={securityForm.register("confirmPassword")}
                  error={securityForm.formState.errors.confirmPassword?.message}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-[#0099ff] hover:bg-[#007acc] text-white font-semibold h-11 px-8"
                disabled={securityForm.formState.isSubmitting}
              >
                Save
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}