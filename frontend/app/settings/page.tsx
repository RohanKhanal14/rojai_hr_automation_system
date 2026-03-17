'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { User, Lock, Bell, Trash2, Save } from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [profileData, setProfileData] = useState({
    name: 'Alice Johnson',
    email: 'alice@techcorp.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    bio: 'HR Manager at TechCorp',
    photo: '',
  })

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  })

  const [notifications, setNotifications] = useState({
    emailApplications: true,
    emailInterviews: true,
    emailRejections: true,
    emailNewJobs: false,
    smsNotifications: false,
    digestEmail: true,
  })

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleNotificationChange = (key: string) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof notifications],
    }))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border sticky top-0 z-50 bg-card/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your account and preferences</p>
          </div>
          <Link href="/candidate/dashboard">
            <Button variant="outline" className="border-border bg-background hover:bg-secondary text-foreground">
              Back
            </Button>
          </Link>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="border-b border-border rounded-none bg-transparent p-0 w-full justify-start h-auto gap-8 mb-8">
            <TabsTrigger
              value="profile"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-0 py-3 gap-2 text-foreground"
            >
              <User size={18} />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="account"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-0 py-3 gap-2 text-foreground"
            >
              <Lock size={18} />
              Account
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-0 py-3 gap-2 text-foreground"
            >
              <Bell size={18} />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="p-8 border-border">
              <h3 className="text-xl font-bold text-foreground mb-6">Personal Information</h3>

              <div className="space-y-6">
                {/* Avatar */}
                <div>
                  <Label className="text-foreground font-semibold mb-4 block">Profile Photo</Label>
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-3xl font-bold text-accent">AJ</span>
                    </div>
                    <Button
                      variant="outline"
                      className="border-border bg-background hover:bg-secondary text-foreground"
                    >
                      Change Photo
                    </Button>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <Label className="text-foreground font-semibold mb-2 block">Full Name</Label>
                  <Input
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    className="bg-input border-0 text-foreground h-11"
                  />
                </div>

                {/* Email */}
                <div>
                  <Label className="text-foreground font-semibold mb-2 block">Email Address</Label>
                  <Input
                    name="email"
                    type="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    className="bg-input border-0 text-foreground h-11"
                  />
                </div>

                {/* Phone */}
                <div>
                  <Label className="text-foreground font-semibold mb-2 block">Phone Number</Label>
                  <Input
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    className="bg-input border-0 text-foreground h-11"
                  />
                </div>

                {/* Location */}
                <div>
                  <Label className="text-foreground font-semibold mb-2 block">Location</Label>
                  <Input
                    name="location"
                    value={profileData.location}
                    onChange={handleProfileChange}
                    className="bg-input border-0 text-foreground h-11"
                  />
                </div>

                {/* Bio */}
                <div>
                  <Label className="text-foreground font-semibold mb-2 block">Bio</Label>
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        bio: e.target.value,
                      }))
                    }
                    className="w-full bg-input border-0 text-foreground placeholder:text-muted-foreground rounded-lg p-3 resize-none h-24"
                  />
                </div>

                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
                  <Save size={18} />
                  Save Changes
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            {/* Change Password */}
            <Card className="p-8 border-border">
              <h3 className="text-xl font-bold text-foreground mb-6">Change Password</h3>

              <div className="space-y-6 max-w-md">
                <div>
                  <Label className="text-foreground font-semibold mb-2 block">Current Password</Label>
                  <Input
                    name="current"
                    type="password"
                    placeholder="••••••••"
                    value={passwordData.current}
                    onChange={handlePasswordChange}
                    className="bg-input border-0 text-foreground h-11"
                  />
                </div>

                <div>
                  <Label className="text-foreground font-semibold mb-2 block">New Password</Label>
                  <Input
                    name="new"
                    type="password"
                    placeholder="••••••••"
                    value={passwordData.new}
                    onChange={handlePasswordChange}
                    className="bg-input border-0 text-foreground h-11"
                  />
                </div>

                <div>
                  <Label className="text-foreground font-semibold mb-2 block">Confirm Password</Label>
                  <Input
                    name="confirm"
                    type="password"
                    placeholder="••••••••"
                    value={passwordData.confirm}
                    onChange={handlePasswordChange}
                    className="bg-input border-0 text-foreground h-11"
                  />
                </div>

                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
                  <Save size={18} />
                  Update Password
                </Button>
              </div>
            </Card>

            {/* Connected Accounts */}
            <Card className="p-8 border-border">
              <h3 className="text-xl font-bold text-foreground mb-6">Connected Accounts</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div>
                    <p className="font-semibold text-foreground">Google</p>
                    <p className="text-sm text-muted-foreground">Connected on Jan 15, 2025</p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-border bg-background hover:bg-secondary text-foreground text-sm"
                  >
                    Disconnect
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div>
                    <p className="font-semibold text-foreground">LinkedIn</p>
                    <p className="text-sm text-muted-foreground">Not connected</p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-border bg-background hover:bg-secondary text-foreground text-sm"
                  >
                    Connect
                  </Button>
                </div>
              </div>
            </Card>

            {/* Danger Zone */}
            <Card className="p-8 border-red-500/30 border-2">
              <h3 className="text-xl font-bold text-red-600 mb-6">Danger Zone</h3>

              <div>
                <p className="text-muted-foreground mb-4">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="bg-red-600 hover:bg-red-700 text-white gap-2">
                      <Trash2 size={18} />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-card border-border">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-foreground">Delete Account?</AlertDialogTitle>
                      <AlertDialogDescription className="text-muted-foreground">
                        This will permanently delete your account and all your data. This action cannot be
                        undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4">
                      <AlertDialogCancel className="border-border bg-background hover:bg-secondary text-foreground">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white">
                        Delete Permanently
                      </AlertDialogAction>
                    </div>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="p-8 border-border">
              <h3 className="text-xl font-bold text-foreground mb-6">Email Notifications</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div>
                    <p className="font-semibold text-foreground">New Applications</p>
                    <p className="text-sm text-muted-foreground">Get notified when you receive new applications</p>
                  </div>
                  <Switch
                    checked={notifications.emailApplications}
                    onCheckedChange={() => handleNotificationChange('emailApplications')}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div>
                    <p className="font-semibold text-foreground">Interview Updates</p>
                    <p className="text-sm text-muted-foreground">Get notified about interview schedules</p>
                  </div>
                  <Switch
                    checked={notifications.emailInterviews}
                    onCheckedChange={() => handleNotificationChange('emailInterviews')}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div>
                    <p className="font-semibold text-foreground">Rejections</p>
                    <p className="text-sm text-muted-foreground">Get notified when you're not selected</p>
                  </div>
                  <Switch
                    checked={notifications.emailRejections}
                    onCheckedChange={() => handleNotificationChange('emailRejections')}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div>
                    <p className="font-semibold text-foreground">New Jobs</p>
                    <p className="text-sm text-muted-foreground">Get notified about new job postings</p>
                  </div>
                  <Switch
                    checked={notifications.emailNewJobs}
                    onCheckedChange={() => handleNotificationChange('emailNewJobs')}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div>
                    <p className="font-semibold text-foreground">Weekly Digest</p>
                    <p className="text-sm text-muted-foreground">Receive a weekly summary of your activity</p>
                  </div>
                  <Switch
                    checked={notifications.digestEmail}
                    onCheckedChange={() => handleNotificationChange('digestEmail')}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-8 border-border">
              <h3 className="text-xl font-bold text-foreground mb-6">SMS Notifications</h3>

              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                <div>
                  <p className="font-semibold text-foreground">SMS Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive important updates via SMS</p>
                </div>
                <Switch
                  checked={notifications.smsNotifications}
                  onCheckedChange={() => handleNotificationChange('smsNotifications')}
                />
              </div>
            </Card>

            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
              <Save size={18} />
              Save Preferences
            </Button>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
