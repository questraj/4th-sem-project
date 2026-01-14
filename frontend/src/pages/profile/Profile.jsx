import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Lock, Save, Loader2, CreditCard } from "lucide-react";
import api from "@/api/axios";

export default function Profile() {
  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  
  // Profile Data
  const [formData, setFormData] = useState({
    first_name: "", middle_name: "", last_name: "", email: "", bank_name: "", bank_account_no: ""
  });

  // Password Data
  const [passData, setPassData] = useState({ current_password: "", new_password: "", confirm_password: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/user/getProfile.php");
        if (res.data.success) setFormData(res.data.data);
      } catch (e) { console.error(e); }
    };
    fetchProfile();
  }, []);

  // Update Info Handler
  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/user/updateProfile.php", formData);
      alert("Profile updated!");
    } catch (e) { alert("Failed to update"); } finally { setLoading(false); }
  };

  // Change Password Handler
  const handlePassSubmit = async (e) => {
    e.preventDefault();
    if (passData.new_password !== passData.confirm_password) {
        alert("New passwords do not match!");
        return;
    }
    setPassLoading(true);
    try {
      const res = await api.post("/user/changePassword.php", passData);
      if(res.data.success) {
        alert("Password changed!");
        setPassData({ current_password: "", new_password: "", confirm_password: "" });
      } else {
        alert(res.data.message);
      }
    } catch (e) { alert("Error changing password"); } finally { setPassLoading(false); }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>

        <div className="grid gap-6 md:grid-cols-2">
            
            {/* 1. PERSONAL DETAILS CARD */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><User className="h-5 w-5"/> Personal Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleInfoSubmit} className="space-y-4">
                        <div className="grid grid-cols-3 gap-2">
                            <div><Label>First Name</Label><Input value={formData.first_name} onChange={e=>setFormData({...formData, first_name:e.target.value})} /></div>
                            <div><Label>Middle</Label><Input value={formData.middle_name} onChange={e=>setFormData({...formData, middle_name:e.target.value})} /></div>
                            <div><Label>Last Name</Label><Input value={formData.last_name} onChange={e=>setFormData({...formData, last_name:e.target.value})} /></div>
                        </div>
                        <div><Label>Email</Label><Input value={formData.email} disabled className="bg-gray-100" /></div>
                        
                        <div className="pt-2 border-t mt-2"><Label className="flex items-center gap-1 text-gray-600 mb-2"><CreditCard size={14}/> Banking Details</Label></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label>Bank Name</Label><Input value={formData.bank_name} onChange={e=>setFormData({...formData, bank_name:e.target.value})} /></div>
                            <div><Label>Account No</Label><Input value={formData.bank_account_no} onChange={e=>setFormData({...formData, bank_account_no:e.target.value})} /></div>
                        </div>

                        <Button type="submit" className="w-full bg-blue-600" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin"/> : <><Save size={16} className="mr-2"/> Save Details</>}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* 2. CHANGE PASSWORD CARD */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5"/> Security</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handlePassSubmit} className="space-y-4">
                        <div><Label>Current Password</Label><Input type="password" required value={passData.current_password} onChange={e=>setPassData({...passData, current_password:e.target.value})} /></div>
                        <div><Label>New Password</Label><Input type="password" required value={passData.new_password} onChange={e=>setPassData({...passData, new_password:e.target.value})} /></div>
                        <div><Label>Confirm Password</Label><Input type="password" required value={passData.confirm_password} onChange={e=>setPassData({...passData, confirm_password:e.target.value})} /></div>
                        
                        <Button type="submit" variant="destructive" className="w-full" disabled={passLoading}>
                            {passLoading ? <Loader2 className="animate-spin"/> : "Update Password"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}