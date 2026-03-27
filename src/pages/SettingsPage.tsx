import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Page,
  PageHeader,
  PageTitle,
  PageDescription,
  PageBody,
  Button,
  Input,
  Switch,
  Separator,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  toast,
} from '@blinkdotnew/ui'
import { User, Bell, Shield, Lock, Smartphone } from 'lucide-react'

function LabeledField({
  label,
  description,
  children,
}: {
  label: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      {children}
    </div>
  )
}

function ToggleRow({
  title,
  description,
  defaultChecked = false,
}: {
  title: string
  description: string
  defaultChecked?: boolean
}) {
  const [checked, setChecked] = useState(defaultChecked)
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="space-y-0.5 flex-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={setChecked} />
    </div>
  )
}

export function SettingsPage() {
  const [name, setName] = useState('Alex Morgan')
  const [email, setEmail] = useState('alex.morgan@phisudo.io')
  const [role] = useState('Senior Penetration Tester')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
    toast.success('Profile saved successfully')
  }

  return (
    <Page>
      <PageHeader>
        <div>
          <PageTitle>Settings</PageTitle>
          <PageDescription>Manage your account, notifications, and security preferences.</PageDescription>
        </div>
      </PageHeader>

      <PageBody>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="max-w-2xl space-y-6"
        >
          <Tabs defaultValue="profile">
            <TabsList className="mb-6">
              <TabsTrigger value="profile" className="gap-1.5">
                <User size={13} />
                Profile
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-1.5">
                <Bell size={13} />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-1.5">
                <Shield size={13} />
                Security
              </TabsTrigger>
            </TabsList>

            {/* ── Profile Tab ──────────────────────────────────────────────── */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Personal Information</CardTitle>
                  <p className="text-sm text-muted-foreground">Update your profile details.</p>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Avatar row */}
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-accent/10 border-2 border-accent/20 flex items-center justify-center">
                      <User size={28} className="text-accent" />
                    </div>
                    <div>
                      <Button variant="outline" size="sm">Change Avatar</Button>
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF — max 2MB</p>
                    </div>
                  </div>

                  <Separator />

                  <LabeledField label="Full Name">
                    <Input value={name} onChange={(e) => setName(e.target.value)} />
                  </LabeledField>

                  <LabeledField label="Email Address">
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </LabeledField>

                  <LabeledField label="Role" description="Your role is set by your organization administrator.">
                    <Input value={role} disabled className="opacity-60 cursor-not-allowed" />
                  </LabeledField>

                  <LabeledField label="Organization">
                    <Input value="Phisudo Security Ltd" disabled className="opacity-60 cursor-not-allowed" />
                  </LabeledField>

                  <div className="flex justify-end pt-2">
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? 'Saving…' : 'Save Changes'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Notifications Tab ─────────────────────────────────────────── */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Email Notifications</CardTitle>
                  <p className="text-sm text-muted-foreground">Choose what emails you want to receive.</p>
                </CardHeader>
                <CardContent>
                  <div className="divide-y divide-border">
                    <ToggleRow
                      title="Critical Finding Alerts"
                      description="Receive an email when a critical vulnerability is added to an engagement."
                      defaultChecked
                    />
                    <ToggleRow
                      title="Engagement Status Updates"
                      description="Get notified when an engagement changes status or is assigned to you."
                      defaultChecked
                    />
                    <ToggleRow
                      title="Report Ready Notifications"
                      description="Email me when a report is finalized and ready for delivery."
                      defaultChecked
                    />
                    <ToggleRow
                      title="Weekly Summary Digest"
                      description="A weekly summary of findings, open engagements, and metrics."
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-base">In-App Notifications</CardTitle>
                  <p className="text-sm text-muted-foreground">Control real-time notifications inside the platform.</p>
                </CardHeader>
                <CardContent>
                  <div className="divide-y divide-border">
                    <ToggleRow
                      title="Live Finding Alerts"
                      description="Show toast notifications when team members add findings."
                      defaultChecked
                    />
                    <ToggleRow
                      title="Engagement Deadline Reminders"
                      description="Alert me 48 hours before an engagement end date."
                      defaultChecked
                    />
                    <ToggleRow
                      title="Comment Mentions"
                      description="Notify me when someone mentions me in a comment."
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Security Tab ──────────────────────────────────────────────── */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Lock size={15} />
                    Change Password
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Use a strong, unique password for your account.</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <LabeledField label="Current Password">
                    <Input type="password" placeholder="••••••••" />
                  </LabeledField>
                  <LabeledField label="New Password">
                    <Input type="password" placeholder="••••••••" />
                  </LabeledField>
                  <LabeledField
                    label="Confirm New Password"
                    description="Must be at least 12 characters with upper, lower, number, and symbol."
                  >
                    <Input type="password" placeholder="••••••••" />
                  </LabeledField>
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      onClick={() => toast.success('Password updated successfully')}
                    >
                      Update Password
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Smartphone size={15} />
                    Two-Factor Authentication
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account. Highly recommended for security professionals.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted border border-border">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-foreground">Authenticator App (TOTP)</p>
                      <p className="text-xs text-muted-foreground">Use Google Authenticator or Authy</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">Not configured</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toast('2FA setup wizard would open here')}
                      >
                        Enable
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-foreground">Require 2FA for API access</p>
                      <p className="text-xs text-muted-foreground">
                        Enforce two-factor for all API token operations.
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-foreground">Session timeout</p>
                      <p className="text-xs text-muted-foreground">
                        Auto-logout after 8 hours of inactivity.
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </PageBody>
    </Page>
  )
}
