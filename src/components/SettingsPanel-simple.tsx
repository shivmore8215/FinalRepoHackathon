import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "@/components/theme-provider"
import { useState } from "react"
import { useTranslation } from 'react-i18next'
import { 
  Settings as SettingsIcon, 
  Save, 
  RotateCcw, 
  Shield, 
  Bell, 
  Database,
  Brain,
  Wrench,
  Monitor,
  AlertTriangle,
  Moon,
  Sun
} from "lucide-react"

export function SettingsPanel() {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()
  const [settings, setSettings] = useState({
    // System Settings
    autoRefresh: true,
    refreshInterval: 30,
    enableNotifications: true,
    darkMode: false,
    
    // AI Settings
    aiEnabled: true,
    aiTemperature: 0.2,
    aiConfidenceThreshold: 0.8,
    aiMaxTokens: 4000,
    enableFallback: true,
    
    // Fleet Settings
    targetPunctuality: 99.5,
    minFleetAvailability: 90,
    maxServiceHours: 16,
    maintenanceInterval: 24,
    
    // Alert Settings
    enableCriticalAlerts: true,
    enableMaintenanceAlerts: true,
    enablePerformanceAlerts: true,
    emailNotifications: true,
    slackNotifications: false,
    
    // Database Settings
    connectionTimeout: 30,
    queryTimeout: 15,
    enableBackups: true,
    backupFrequency: 'daily',
    
    // Security Settings
    enableAuditLog: true,
    sessionTimeout: 30,
    requireMFA: false,
    allowRemoteAccess: true
  })

  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const handleSave = async () => {
    setIsSaving(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setLastSaved(new Date())
    setIsSaving(false)
    
    console.log('Settings saved:', settings)
  }

  const handleReset = () => {
    setSettings({
      autoRefresh: true,
      refreshInterval: 30,
      enableNotifications: true,
      darkMode: false,
      aiEnabled: true,
      aiTemperature: 0.2,
      aiConfidenceThreshold: 0.8,
      aiMaxTokens: 4000,
      enableFallback: true,
      targetPunctuality: 99.5,
      minFleetAvailability: 90,
      maxServiceHours: 16,
      maintenanceInterval: 24,
      enableCriticalAlerts: true,
      enableMaintenanceAlerts: true,
      enablePerformanceAlerts: true,
      emailNotifications: true,
      slackNotifications: false,
      connectionTimeout: 30,
      queryTimeout: 15,
      enableBackups: true,
      backupFrequency: 'daily',
      enableAuditLog: true,
      sessionTimeout: 30,
      requireMFA: false,
      allowRemoteAccess: true
    })
  }

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const CheckboxInput = ({ id, checked, onChange, label }: any) => (
    <div className="flex items-center justify-between">
      <Label htmlFor={id}>{label}</Label>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
      />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900/50 dark:via-gray-800/50 dark:to-slate-800/50 border-0 backdrop-blur-sm">
        <CardHeader className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <SettingsIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent font-semibold">{t('settings.title')}</span>
            </div>
            <div className="flex items-center space-x-2">
              {lastSaved && (
                <Badge variant="secondary" className="text-xs">
                  Saved: {lastSaved.toLocaleTimeString()}
                </Badge>
              )}
              <Button 
                onClick={handleReset} 
                variant="outline" 
                size="sm"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isSaving ? t('common.loading') : t('common.save')}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Settings Tabs */}
      <Tabs defaultValue="system" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
          <TabsTrigger value="system" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-300">{t('settings.system')}</TabsTrigger>
          <TabsTrigger value="ai" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-300">{t('settings.aiSettings')}</TabsTrigger>
          <TabsTrigger value="fleet" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-300">{t('settings.fleet')}</TabsTrigger>
          <TabsTrigger value="alerts" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-300">{t('settings.alerts')}</TabsTrigger>
          <TabsTrigger value="database" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-300">{t('settings.database')}</TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-300">{t('settings.security')}</TabsTrigger>
        </TabsList>

        {/* System Settings */}
        <TabsContent value="system">
          <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-gray-200/50 dark:border-gray-700/50">
              <CardTitle className="flex items-center space-x-2">
                <Monitor className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent font-semibold">{t('settings.systemConfiguration')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <CheckboxInput
                    id="autoRefresh"
                    label={t('settings.autoRefresh')}
                    checked={settings.autoRefresh}
                    onChange={(checked: boolean) => updateSetting('autoRefresh', checked)}
                  />
                  
                  <div className="space-y-2">
                    <Label htmlFor="refreshInterval">{t('settings.refreshInterval')}</Label>
                    <Input
                      id="refreshInterval"
                      type="number"
                      value={settings.refreshInterval}
                      onChange={(e) => updateSetting('refreshInterval', parseInt(e.target.value))}
                      min={5}
                      max={300}
                    />
                  </div>
                  
                  <CheckboxInput
                    id="notifications"
                    label={t('settings.enableNotifications')}
                    checked={settings.enableNotifications}
                    onChange={(checked: boolean) => updateSetting('enableNotifications', checked)}
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <Label htmlFor="darkMode" className="flex items-center space-x-3">
                      {theme === 'dark' ? 
                        <Moon className="h-5 w-5 text-blue-600 dark:text-blue-400" /> : 
                        <Sun className="h-5 w-5 text-yellow-600" />
                      }
                      <div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">Dark Mode</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {theme === 'dark' ? 'Dark theme enabled' : 'Light theme enabled'}
                        </p>
                      </div>
                    </Label>
                    <Switch
                      id="darkMode"
                      checked={theme === 'dark'}
                      onCheckedChange={(checked) => {
                        const newTheme = checked ? 'dark' : 'light';
                        setTheme(newTheme);
                        console.log('Theme changed to:', newTheme);
                      }}
                      className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200"
                    />
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-200/50 dark:border-blue-700/50 backdrop-blur-sm">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">System Status</h4>
                    <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                      <div className="flex justify-between">
                        <span>Version:</span>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">v2.1.0</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Uptime:</span>
                        <span className="text-green-600 dark:text-green-400 font-medium">2h 45m</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Update:</span>
                        <span className="dark:text-gray-300">{new Date().toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Settings */}
        <TabsContent value="ai">
          <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-b border-gray-200/50 dark:border-gray-700/50">
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <span className="bg-gradient-to-r from-purple-600 to-violet-600 dark:from-purple-400 dark:to-violet-400 bg-clip-text text-transparent font-semibold">AI Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <CheckboxInput
                    id="aiEnabled"
                    label="Enable AI Scheduling"
                    checked={settings.aiEnabled}
                    onChange={(checked: boolean) => updateSetting('aiEnabled', checked)}
                  />
                  
                  <div className="space-y-2">
                    <Label htmlFor="aiTemperature">AI Temperature</Label>
                    <Input
                      id="aiTemperature"
                      type="number"
                      step="0.1"
                      value={settings.aiTemperature}
                      onChange={(e) => updateSetting('aiTemperature', parseFloat(e.target.value))}
                      min={0}
                      max={1}
                    />
                    <p className="text-xs text-gray-500">Lower = more conservative, Higher = more creative</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="aiConfidence">Confidence Threshold</Label>
                    <Input
                      id="aiConfidence"
                      type="number"
                      step="0.1"
                      value={settings.aiConfidenceThreshold}
                      onChange={(e) => updateSetting('aiConfidenceThreshold', parseFloat(e.target.value))}
                      min={0.1}
                      max={1}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="aiMaxTokens">Max Tokens</Label>
                    <Input
                      id="aiMaxTokens"
                      type="number"
                      value={settings.aiMaxTokens}
                      onChange={(e) => updateSetting('aiMaxTokens', parseInt(e.target.value))}
                      min={1000}
                      max={8000}
                    />
                  </div>
                  
                  <CheckboxInput
                    id="enableFallback"
                    label="Enable Rule-based Fallback"
                    checked={settings.enableFallback}
                    onChange={(checked: boolean) => updateSetting('enableFallback', checked)}
                  />
                  
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-lg border border-purple-200/50 dark:border-purple-700/50 backdrop-blur-sm">
                    <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">AI Performance</h4>
                    <div className="space-y-1 text-sm text-purple-700 dark:text-purple-300">
                      <div className="flex justify-between">
                        <span>Accuracy:</span>
                        <span className="font-medium">94%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Response Time:</span>
                        <span className="font-medium">2.3s</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Success Rate:</span>
                        <span className="font-medium">87%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fleet Settings */}
        <TabsContent value="fleet">
          <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-b border-gray-200/50 dark:border-gray-700/50">
              <CardTitle className="flex items-center space-x-2">
                <Wrench className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <span className="bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400 bg-clip-text text-transparent font-semibold">Fleet Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="punctuality">Target Punctuality (%)</Label>
                    <Input
                      id="punctuality"
                      type="number"
                      step="0.1"
                      value={settings.targetPunctuality}
                      onChange={(e) => updateSetting('targetPunctuality', parseFloat(e.target.value))}
                      min={90}
                      max={100}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fleetAvail">Min Fleet Availability (%)</Label>
                    <Input
                      id="fleetAvail"
                      type="number"
                      value={settings.minFleetAvailability}
                      onChange={(e) => updateSetting('minFleetAvailability', parseInt(e.target.value))}
                      min={70}
                      max={100}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="serviceHours">Max Service Hours</Label>
                    <Input
                      id="serviceHours"
                      type="number"
                      value={settings.maxServiceHours}
                      onChange={(e) => updateSetting('maxServiceHours', parseInt(e.target.value))}
                      min={12}
                      max={24}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="maintenance">Maintenance Interval (hours)</Label>
                    <Input
                      id="maintenance"
                      type="number"
                      value={settings.maintenanceInterval}
                      onChange={(e) => updateSetting('maintenanceInterval', parseInt(e.target.value))}
                      min={12}
                      max={168}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alert Settings */}
        <TabsContent value="alerts">
          <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-b border-gray-200/50 dark:border-gray-700/50">
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <span className="bg-gradient-to-r from-yellow-600 to-orange-600 dark:from-yellow-400 dark:to-orange-400 bg-clip-text text-transparent font-semibold">Alert Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Alert Types</h4>
                  <div className="space-y-3">
                    <CheckboxInput
                      id="criticalAlerts"
                      label="Critical Alerts"
                      checked={settings.enableCriticalAlerts}
                      onChange={(checked: boolean) => updateSetting('enableCriticalAlerts', checked)}
                    />
                    
                    <CheckboxInput
                      id="maintenanceAlerts"
                      label="Maintenance Alerts"
                      checked={settings.enableMaintenanceAlerts}
                      onChange={(checked: boolean) => updateSetting('enableMaintenanceAlerts', checked)}
                    />
                    
                    <CheckboxInput
                      id="performanceAlerts"
                      label="Performance Alerts"
                      checked={settings.enablePerformanceAlerts}
                      onChange={(checked: boolean) => updateSetting('enablePerformanceAlerts', checked)}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Notification Channels</h4>
                  <div className="space-y-3">
                    <CheckboxInput
                      id="emailNotif"
                      label="Email Notifications"
                      checked={settings.emailNotifications}
                      onChange={(checked: boolean) => updateSetting('emailNotifications', checked)}
                    />
                    
                    <CheckboxInput
                      id="slackNotif"
                      label="Slack Notifications"
                      checked={settings.slackNotifications}
                      onChange={(checked: boolean) => updateSetting('slackNotifications', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Database Settings */}
        <TabsContent value="database">
          <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-b border-gray-200/50 dark:border-gray-700/50">
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent font-semibold">Database Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="connTimeout">Connection Timeout (seconds)</Label>
                    <Input
                      id="connTimeout"
                      type="number"
                      value={settings.connectionTimeout}
                      onChange={(e) => updateSetting('connectionTimeout', parseInt(e.target.value))}
                      min={5}
                      max={120}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="queryTimeout">Query Timeout (seconds)</Label>
                    <Input
                      id="queryTimeout"
                      type="number"
                      value={settings.queryTimeout}
                      onChange={(e) => updateSetting('queryTimeout', parseInt(e.target.value))}
                      min={5}
                      max={60}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <CheckboxInput
                    id="backups"
                    label="Enable Backups"
                    checked={settings.enableBackups}
                    onChange={(checked: boolean) => updateSetting('enableBackups', checked)}
                  />
                  
                  <div className="space-y-2">
                    <Label htmlFor="backupFreq">Backup Frequency</Label>
                    <select 
                      id="backupFreq"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={settings.backupFrequency}
                      onChange={(e) => updateSetting('backupFrequency', e.target.value)}
                    >
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-b border-gray-200/50 dark:border-gray-700/50">
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
                <span className="bg-gradient-to-r from-red-600 to-pink-600 dark:from-red-400 dark:to-pink-400 bg-clip-text text-transparent font-semibold">Security Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <CheckboxInput
                    id="auditLog"
                    label="Enable Audit Logging"
                    checked={settings.enableAuditLog}
                    onChange={(checked: boolean) => updateSetting('enableAuditLog', checked)}
                  />
                  
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                      min={5}
                      max={480}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <CheckboxInput
                    id="mfa"
                    label="Require MFA"
                    checked={settings.requireMFA}
                    onChange={(checked: boolean) => updateSetting('requireMFA', checked)}
                  />
                  
                  <CheckboxInput
                    id="remoteAccess"
                    label="Allow Remote Access"
                    checked={settings.allowRemoteAccess}
                    onChange={(checked: boolean) => updateSetting('allowRemoteAccess', checked)}
                  />
                </div>
              </div>
              
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-900">Security Notice</h4>
                    <p className="text-sm text-red-700 mt-1">
                      Changes to security settings require admin approval and system restart.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}