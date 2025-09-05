

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InfoIcon, User, Mail, Calendar } from "lucide-react";
import dynamic from "next/dynamic";

const ProfileClient = dynamic(() => import('./ProfileClient'));

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect("/auth/login");
  }

  // For now, only allow viewing own profile

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          This is a protected page that you can only see as an authenticated
          user
        </div>
      </div>
      <div className="flex flex-col gap-2 px-10 items-start">
        <h2 className="font-bold text-3xl mb-4">Your Profile</h2>
        <div className="bg-card p-12 rounded-lg border shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <User size="90" className="text-primary" />
            <div>
              <h3 className="text-2xl font-semibold">
                {user.user_metadata?.username || user.email?.split('@')[0] || 'User'}
              </h3>
              <p className="text-muted-foreground">Welcome back!</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail size="20" className="text-muted-foreground" />
              <span className="text">{user.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar size="20" className="text-muted-foreground" />
              <span className="text">
                Joined {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <InfoIcon size="20" className="text-muted-foreground" />
              <span className="text">
                Last updated {user.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>
        <ProfileClient />
      </div>
    </div>
  );
}
