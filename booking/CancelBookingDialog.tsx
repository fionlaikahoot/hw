import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface CancelBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  bookingInfo?: {
    time: string;
    room: string;
    bookedBy: string;
  };
}

export function CancelBookingDialog({
  open,
  onOpenChange,
  onConfirm,
  bookingInfo,
}: CancelBookingDialogProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleCancel = () => {
    if (password === "admin") {
      toast.success("✓ 預約已撤銷");
      onConfirm();
      handleClose();
    } else {
      toast.error("密碼錯誤");
      setPassword("");
    }
  };

  const handleClose = () => {
    setPassword("");
    setShowPassword(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            撤銷預約
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {bookingInfo && (
            <div className="rounded-lg bg-yellow-50 p-4 border border-yellow-200">
              <div className="text-sm space-y-2">
                <div>
                  <span className="font-medium text-foreground">時間：</span>
                  <span className="text-muted-foreground">{bookingInfo.time}</span>
                </div>
                <div>
                  <span className="font-medium text-foreground">房間：</span>
                  <span className="text-muted-foreground">{bookingInfo.room}</span>
                </div>
                <div>
                  <span className="font-medium text-foreground">預約者：</span>
                  <span className="text-muted-foreground">{bookingInfo.bookedBy}</span>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-foreground">
              請輸入密碼以確認撤銷 *
            </label>
            <div className="relative mt-2">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="輸入密碼"
                className="w-full rounded border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCancel();
                  }
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-xs text-muted-foreground hover:text-foreground"
              >
                {showPassword ? "隱藏" : "顯示"}
              </button>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleCancel}
              className="flex-1"
            >
              確認撤銷
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
