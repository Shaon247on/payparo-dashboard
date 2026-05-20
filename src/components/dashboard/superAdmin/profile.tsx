"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Camera, Eye, EyeOff, Upload } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  profileSchema,
  securitySchema,
  type ProfileFormValues,
  type SecurityFormValues,
} from "@/schema/profile.schema";
import {
  updateProfileAction,
  changePasswordAction,
} from "@/actions/profile.action";
import type { ProfileResponse } from "@/types/profile.type";

// ── Password input with show/hide toggle ─────────────────────────────────────

function PasswordInput({
  id,
  placeholder,
  registration,
  error,
}: {
  id: string;
  placeholder: string;
  registration: object;
  error?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          className="bg-[#1a1d27] border-white/10 text-white placeholder:text-white/25 h-12 pr-11 focus-visible:ring-0 focus-visible:border-white/25"
          {...registration}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface ProfilePageProps {
  profile: ProfileResponse;
}

export default function ProfilePage({ profile }: ProfilePageProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local preview state — only for avatar
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    profile?.profile_photo.url
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarName, setAvatarName] = useState<string | null>(null);

  // ── Profile form ─────────────────────────────────────────────────────────
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
    defaultValues: {
      name: profile?.name,
      email: profile?.email,
    },
  });

  // ── Security form ────────────────────────────────────────────────────────
  const securityForm = useForm<SecurityFormValues>({
    resolver: zodResolver(securitySchema),
    mode: "onChange",
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  // ── File picker ──────────────────────────────────────────────────────────
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
        description: "Image must be smaller than 5 MB.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarPreview(ev.target?.result as string);
      setAvatarFile(file);
      setAvatarName(file.name);
      toast.success("Photo selected", {
        description: `"${file.name}" is ready — save your profile to apply.`,
      });
    };
    reader.readAsDataURL(file);
    // Reset so same file can be re-selected
    e.target.value = "";
  };

  // ── Profile submit ────────────────────────────────────────────────────────
  // Build FormData here in the client, pass it to the server action.
  // Server action adds the auth token — client never touches tokens.
  const onProfileSubmit = async (data: ProfileFormValues) => {
    const fd = new FormData();
    fd.append("name", data.name);
    if (avatarFile) fd.append("profile_pic", avatarFile);

    const result = await updateProfileAction(fd);

    if (!result.success) {
      profileForm.setError("root", { message: result.error });
      return;
    }

    toast.success("Profile updated", {
      description: result.data.detail,
    });
    setAvatarFile(null);
    setAvatarName(null);
    // Refresh RSC data so the name reflects in the layout/nav immediately
    router.refresh();
  };

  // ── Password submit ───────────────────────────────────────────────────────
  const onSecuritySubmit = async (data: SecurityFormValues) => {
    const result = await changePasswordAction({
      current_password: data.current_password,
      new_password: data.new_password,
      confirm_password: data.confirm_password,
    });

    if (!result.success) {
      securityForm.setError("root", { message: result.error });
      return;
    }

    toast.success("Password changed", {
      description: result.data.detail,
    });
    securityForm.reset();
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl space-y-6 mx-auto">
      {/* ── Profile Card ─────────────────────────────── */}
      <Card className="bg-[#13151e] border-white/5">
        <CardContent className="p-6 md:p-8">
          {/* Avatar section */}
          <div className="flex items-center gap-5 mb-8 pb-7 border-b border-white/5">
            <div className="relative group shrink-0">
              <Avatar className="w-20 h-20 ring-2 ring-white/10">
                {avatarPreview ? (
                  <AvatarImage
                    src={avatarPreview}
                    alt="Profile"
                    className="object-cover"
                  />
                ) : null}
                <AvatarFallback className="bg-[#2a2d3e] text-white text-xl font-semibold">
                  {profile?.profile_photo.initials}
                </AvatarFallback>
              </Avatar>

              {/* Hover overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                aria-label="Change profile photo"
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
              className="gap-2 bg-transparent border-white/15 text-white/60 hover:bg-white/5 hover:text-white hidden sm:flex shrink-0"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Profile form */}
          <form
            id="profile-form"
            onSubmit={profileForm.handleSubmit(onProfileSubmit)}
          >
            <FieldGroup>
              {profileForm.formState.errors.root && (
                <p className="text-red-400 text-sm">
                  {profileForm.formState.errors.root.message}
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field>
                  <FieldLabel htmlFor="profile-name">Profile Name</FieldLabel>
                  <Input
                    id="profile-name"
                    className="bg-[#1a1d27] border-white/10 text-white placeholder:text-white/25 h-12 focus-visible:ring-0 focus-visible:border-white/25"
                    placeholder="Your name"
                    {...profileForm.register("name")}
                  />
                  {profileForm.formState.errors.name && (
                    <p className="text-red-400 text-xs mt-1">
                      {profileForm.formState.errors.name.message}
                    </p>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="profile-email">Email</FieldLabel>
                  <Input
                    id="profile-email"
                    type="email"
                    // Email is read-only — the API doesn't accept email updates
                    readOnly
                    className="bg-white/5 border-white/10 text-white/40 h-12 cursor-not-allowed focus-visible:ring-0"
                    {...profileForm.register("email")}
                  />
                  <p className="text-white/25 text-xs mt-1">
                    Email cannot be changed
                  </p>
                </Field>
              </div>
            </FieldGroup>

            <div className="flex justify-end mt-6">
              <Button
                form="profile-form"
                type="submit"
                className="bg-[#0099ff] hover:bg-[#007acc] text-white font-semibold h-11 px-8"
                disabled={profileForm.formState.isSubmitting}
              >
                {profileForm.formState.isSubmitting ? "Saving…" : "Save"}
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
              Keep your account secure by updating your password regularly.
            </p>
          </div>

          <form
            id="security-form"
            onSubmit={securityForm.handleSubmit(onSecuritySubmit)}
          >
            <FieldGroup>
              {securityForm.formState.errors.root && (
                <p className="text-red-400 text-sm">
                  {securityForm.formState.errors.root.message}
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field>
                  <FieldLabel htmlFor="current-password">
                    Current Password
                  </FieldLabel>
                  <PasswordInput
                    id="current-password"
                    placeholder="Enter current password"
                    registration={securityForm.register("current_password")}
                    error={
                      securityForm.formState.errors.current_password?.message
                    }
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="new-password">New Password</FieldLabel>
                  <PasswordInput
                    id="new-password"
                    placeholder="At least 8 characters"
                    registration={securityForm.register("new_password")}
                    error={securityForm.formState.errors.new_password?.message}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field>
                  <FieldLabel htmlFor="confirm-password">
                    Confirm Password
                  </FieldLabel>
                  <PasswordInput
                    id="confirm-password"
                    placeholder="Repeat new password"
                    registration={securityForm.register("confirm_password")}
                    error={
                      securityForm.formState.errors.confirm_password?.message
                    }
                  />
                </Field>
              </div>
            </FieldGroup>

            <div className="flex justify-end mt-6">
              <Button
                form="security-form"
                type="submit"
                className="bg-[#0099ff] hover:bg-[#007acc] text-white font-semibold h-11 px-8"
                disabled={securityForm.formState.isSubmitting}
              >
                {securityForm.formState.isSubmitting
                  ? "Updating…"
                  : "Update Password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}