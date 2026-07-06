"use client";

import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { upload } from "@vercel/blob/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateProfile } from "@/actions/user-actions";
import { uploadProfilePicture } from "@/actions/profile-actions";
import { toast } from "sonner";

interface User {
  id: string;
  name: string | null;
  email: string;
  imageUrl: string | null;
  bio: string | null;
}

export function ProfileForm({ user }: { user: User }) {
  const [name, setName] = useState(user.name || "");
  const [bio, setBio] = useState(user.bio || "");
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState(user.imageUrl);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSave() {
    setSaving(true);
    const result = await updateProfile({ name, bio });
    if (result.error) toast.error(result.error);
    else toast.success("Profile updated");
    setSaving(false);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });

      const result = await uploadProfilePicture(blob.url);
      if (result.error) {
        toast.error(result.error);
      } else {
        setImageUrl(blob.url);
        toast.success("Profile picture updated");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="card space-y-6">
        {/* Avatar with upload */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-brand-100 text-2xl font-bold text-brand-700 dark:bg-brand-900 dark:text-brand-300">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt={name || user.email}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                name?.[0]?.toUpperCase() || user.email[0].toUpperCase()
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-brand-600 text-white transition-colors hover:bg-brand-700 disabled:opacity-50 dark:border-gray-900"
              aria-label="Upload profile picture"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleImageUpload}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {name || "Set your name"}
            </p>
            <p className="text-xs text-gray-500">{user.email}</p>
            {uploading && (
              <p className="mt-1 text-xs text-brand-600">Uploading...</p>
            )}
          </div>
        </div>

        {/* Fields */}
        <Input
          label="Display Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
        />

        <Input
          label="Email"
          value={user.email}
          disabled
          className="opacity-60"
        />

        <Textarea
          label="Bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about yourself..."
          rows={3}
        />

        <Button onClick={handleSave} loading={saving}>
          Save Profile
        </Button>
      </div>
    </div>
  );
}
