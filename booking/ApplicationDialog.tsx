import React, { useState } from "react";
import { useApplication } from "@/contexts/ApplicationContext";
import { useBooking } from "@/contexts/BookingContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface ApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSlotId?: string;
  selectedDate?: string;
}

export function ApplicationDialog({ 
  open, 
  onOpenChange, 
  selectedSlotId,
  selectedDate 
}: ApplicationDialogProps) {
  const { submitApplication } = useApplication();
  const { bookRoom } = useBooking();
  const [step, setStep] = useState<"form" | "confirm">("form");
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    email: "",
    attendees: "1",
    topic: "",
  });
  const [bookedRoom, setBookedRoom] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.department.trim() || !formData.email.trim() || !formData.topic.trim()) {
      toast.error("請填寫所有必填項");
      return;
    }

    // 提交申請
    submitApplication({
      name: formData.name,
      department: formData.department,
      email: formData.email,
      attendees: parseInt(formData.attendees),
      topic: formData.topic,
      approved: true,
    });

    // 如果有選擇時間槽，立即預約
    if (selectedSlotId && selectedDate) {
      const response = bookRoom({
        timeSlotId: selectedSlotId,
        bookedBy: formData.name,
        date: selectedDate,
      });
      if (response.success) {
        setBookedRoom(response.assignedRoom || "A");
        setStep("confirm");
        toast.success("✓ 預約成功");
      } else {
        toast.error(response.message || "該時間槽已被預約");
      }
    } else {
      setStep("confirm");
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setStep("form");
    setBookedRoom(null);
    setFormData({
      name: "",
      department: "",
      email: "",
      attendees: "1",
      topic: "",
    });
  };

  if (!open) return null;

  return (
    <>
      {/* 申請表單 */}
      {step === "form" && (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="w-full max-w-md">
            <DialogHeader>
              <DialogTitle>預約申請</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">姓名 *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="請輸入您的姓名"
                  className="w-full mt-1 rounded border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">部門 *</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="例如：市場部"
                  className="w-full mt-1 rounded border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">電郵 *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="w-full mt-1 rounded border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">參與人數 *</label>
                <input
                  type="number"
                  name="attendees"
                  value={formData.attendees}
                  onChange={handleChange}
                  min="1"
                  max="40"
                  className="w-full mt-1 rounded border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">會議主題 *</label>
                <textarea
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  placeholder="請簡述會議主題"
                  rows={2}
                  className="w-full mt-1 rounded border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                  取消
                </Button>
                <Button type="submit" className="flex-1">
                  提交申請
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* 成功確認 */}
      {step === "confirm" && (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="w-full max-w-md">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">預約申請已提交</h2>
              <p className="text-sm text-muted-foreground mb-4">
                {bookedRoom 
                  ? `您的預約已成功，分配房間：${bookedRoom}`
                  : "您的申請已審核通過，現在可以選擇時間槽進行預約"
                }
              </p>
              
              <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left text-sm">
                <div className="mb-2"><span className="font-semibold">姓名：</span>{formData.name}</div>
                <div className="mb-2"><span className="font-semibold">部門：</span>{formData.department}</div>
                <div className="mb-2"><span className="font-semibold">參與人數：</span>{formData.attendees} 人</div>
                <div><span className="font-semibold">會議主題：</span>{formData.topic}</div>
              </div>

              <Button onClick={handleClose} className="w-full">
                {bookedRoom ? "返回預約系統" : "開始預約"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
