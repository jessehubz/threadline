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
  githubUrl?: string | null;
  twitterUrl?: string | null;
  linkedinUrl?: string | null;
  websiteUrl?: string | null;
}

export function ProfileForm({ user }: { user: User }) {
  const [name, setName] = useState(user.name || "");
  const [bio, setBio] = useState(user.bio || "");
  const [githubUrl, setGithubUrl] = useState(user.githubUrl || "");
  const [twitterUrl, setTwitterUrl] = useState(user.twitterUrl || "");
  const [linkedinUrl, setLinkedinUrl] = useState(user.linkedinUrl || "");
  const [websiteUrl, setWebsiteUrl] = useState(user.websiteUrl || "");
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState(user.imageUrl);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSave() {
    setSaving(true);
    const result = await updateProfile({
      name,
      bio,
      githubUrl,
      twitterUrl,
      linkedinUrl,
      websiteUrl,
    });
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
    <div className="card p-8">
      <div className="space-y-8">
        {/* Avatar with upload */}
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl accent-bg text-2xl font-bold accent-color">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt={name || user.email}
                  className="h-20 w-20 rounded-2xl object-cover"
                />
              ) : (
                name?.[0]?.toUpperCase() || user.email[0].toUpperCase()
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-xl border-2 border-card bg-[var(--accent)] text-white transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-50"
              aria-label="Upload profile picture"
            >
              <Camera className="h-4 w-4" />
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
            <p className="text-card-title text-[16px]">
              {name || "Set your name"}
            </p>
            <p className="text-sm text-body">{user.email}</p>
            {uploading && (
              <p className="mt-1 text-xs accent-color">Uploading...</p>
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

        {/* Social Links */}
        <Input
          label="GitHub URL"
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
          placeholder="https://github.com/username"
        />

        <Input
          label="Twitter URL"
          value={twitterUrl}
          onChange={(e) => setTwitterUrl(e.target.value)}
          placeholder="https://twitter.com/username"
        />

        <Input
          label="LinkedIn URL"
          value={linkedinUrl}
          onChange={(e) => setLinkedinUrl(e.target.value)}
          placeholder="https://linkedin.com/in/username"
        />

        <Input
          label="Website URL"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          placeholder="https://yourwebsite.com"
        />

        <Button onClick={handleSave} loading={saving}>
          Save Profile
        </Button>
      </div>
    </div>
  );
}
