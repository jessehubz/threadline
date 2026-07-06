"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateProfile } from "@/actions/user-actions";
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

  async function handleSave() {
    setSaving(true);
    const result = await updateProfile({ name, bio });
    if (result.error) toast.error(result.error);
    else toast.success("Profile updated");
    setSaving(false);
  }

  return (
    <div className="max-w-2xl">
      <div className="card space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-700 dark:bg-brand-900 dark:text-brand-300">
            {name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {name || "Set your name"}
            </p>
            <p className="text-xs text-gray-500">{user.email}</p>
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
