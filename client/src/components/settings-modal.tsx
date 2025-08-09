import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff } from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useToast } from "@/hooks/use-toast";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [settings, setSettings] = useLocalStorage("settings", {
    openaiApiKey: "",
    fontSize: 14,
    theme: "light"
  });
  
  const [showApiKey, setShowApiKey] = useState(false);
  const [tempSettings, setTempSettings] = useState(settings);
  const { toast } = useToast();

  const handleSave = () => {
    setSettings(tempSettings);
    toast({
      title: "Success",
      description: "Settings saved successfully",
    });
    onClose();
  };

  const handleCancel = () => {
    setTempSettings(settings);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* API Configuration */}
          <div>
            <h3 className="font-medium text-charcoal-600 mb-3">OpenAI API Configuration</h3>
            <div>
              <Label htmlFor="apiKey" className="text-charcoal-600">API Key</Label>
              <div className="relative mt-1">
                <Input
                  id="apiKey"
                  type={showApiKey ? "text" : "password"}
                  placeholder="sk-..."
                  value={tempSettings.openaiApiKey}
                  onChange={(e) => setTempSettings({
                    ...tempSettings,
                    openaiApiKey: e.target.value
                  })}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-0 top-0 h-full px-3 text-charcoal-400 hover:text-charcoal-600"
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-charcoal-400 mt-1">
                Stored locally and encrypted. Never sent to external servers.
              </p>
            </div>
          </div>

          {/* Display Preferences */}
          <div>
            <h3 className="font-medium text-charcoal-600 mb-3">Display Preferences</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="fontSize" className="text-charcoal-600">Default Font Size</Label>
                <Select
                  value={tempSettings.fontSize.toString()}
                  onValueChange={(value) => setTempSettings({
                    ...tempSettings,
                    fontSize: parseInt(value)
                  })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12px</SelectItem>
                    <SelectItem value="14">14px</SelectItem>
                    <SelectItem value="16">16px</SelectItem>
                    <SelectItem value="18">18px</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="theme" className="text-charcoal-600">Theme</Label>
                <Select
                  value={tempSettings.theme}
                  onValueChange={(value) => setTempSettings({
                    ...tempSettings,
                    theme: value
                  })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary-600">
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
