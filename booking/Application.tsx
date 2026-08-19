import React, { useState } from "react";
import { useApplication } from "@/contexts/ApplicationContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, LogOut } from "lucide-react";
import { toast } from "sonner";

export default function Application() {
  const { submitApplication, currentUser, logout } = useApplication();
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    email: "",
    attendees: "1",
    topic: "",
  });
  const [submitted, setSubmitted] = useState(false);

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

    submitApplication({
      name: formData.name,
      department: formData.department,
      email: formData.email,
      attendees: parseInt(formData.attendees),
      topic: formData.topic,
      approved: true,
    });

    setSubmitted(true);
    toast.success("✓ 申請已提交，已自動審核通過");
  };

  if (currentUser && submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-25 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6">
          <div className="text-center">
            <div className="h-12 w-12 rounded-lg bg-success/20 flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-6 w-6 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "Poppins" }}>
              申請已通過
            </h2>
            <p className="text-muted-foreground mb-4">
              歡迎 <span className="font-semibold">{currentUser.name}</span>，您可以開始預約會議室
            </p>
            <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left text-sm">
              <div className="mb-2"><span className="font-semibold">姓名：</span>{currentUser.name}</div>
              <div className="mb-2"><span className="font-semibold">部門：</span>{currentUser.department}</div>
              <div className="mb-2"><span className="font-semibold">參與人數：</span>{currentUser.attendees} 人</div>
              <div><span className="font-semibold">會議主題：</span>{currentUser.topic}</div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setSubmitted(false)} className="flex-1">
                返回申請表
              </Button>
              <Button onClick={logout} variant="outline" className="flex-1">
                <LogOut className="h-4 w-4 mr-2" />
                登出
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-25 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "Poppins" }}>
              會議室預約
            </h1>
            <p className="text-xs text-muted-foreground">申請表</p>
          </div>
        </div>

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
              max="20"
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
              rows={3}
              className="w-full mt-1 rounded border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none"
            />
          </div>

          <Button type="submit" className="w-full">
            提交申請
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-4">
          * 必填項
        </p>
      </Card>
    </div>
  );
}
