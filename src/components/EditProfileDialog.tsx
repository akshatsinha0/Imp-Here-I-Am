import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Edit3 } from "lucide-react";
interface EditProfileDialogProps {
  title: string;
  fields: {
    name: string;
    label: string;
    value: string;
    type?: 'input' | 'textarea';
    placeholder?: string;
  }[];
  onSave: (data: Record<string, string>) => void;
  trigger?: React.ReactNode;
}
export function EditProfileDialog({ title, fields, onSave, trigger }: EditProfileDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>(
    fields.reduce((acc, field) => ({ ...acc, [field.name]: field.value }), {})
  );
  const handleSave = () => {
    onSave(formData);
    setOpen(false);
  };
  const handleFieldChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="icon" variant="ghost" className="w-8 h-8 touch-target">
            <Edit3 className="w-4 h-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-md mx-auto rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-responsive-lg">Edit {title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name} className="text-responsive-sm">{field.label}</Label>
              {field.type === 'textarea' ? (
                <Textarea
                  id={field.name}
                  value={formData[field.name]}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  rows={3}
                  className="text-base"
                />
              ) : (
                <Input
                  id={field.name}
                  value={formData[field.name]}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  className="text-base"
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="w-full sm:w-auto touch-target"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="w-full sm:w-auto touch-target"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}