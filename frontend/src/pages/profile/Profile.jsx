import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Lock, Save, Loader2, CreditCard, Pencil, X } from "lucide-react";
import api from "@/api/axios";

export default function Profile() {
  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "", middle_name: "", last_name: "", email: "", bank_name: "", bank_account_no: ""
  });

  const [originalData, setOriginalData] = useState({});
  const [passData, setPassData] = useState({ current_password: "", new_password: "", confirm_password: "" });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/user/getProfile.php");
      if (res.data.success) {
        setFormData(res.data.data);
        setOriginalData(res.data.data);
      }
    } catch (e) { console.error(e); }
  };

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/user/updateProfile.php", formData);
      setOriginalData(formData);
      setIsEditing(false);
      alert("Profile updated!");
    } catch (e) { 
        alert("Failed to update"); 
    } finally { 
        setLoading(false); 
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
  };

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

  const renderField = (label, key, placeholder = "") => (
    <div>
        <Label className="text-gray-500 text-xs uppercase font-bold tracking-wider">{label}</Label>
        {isEditing ? (
            <Input 
                value={formData[key]} 
                onChange={e => setFormData({...formData, [key]: e.target.value})} 
                placeholder={placeholder}
                className="mt-1"
            />
        ) : (
            <div className="mt-1 p-2 bg-gray-50 border border-gray-100 rounded-md text-gray-900 min-h-[40px] flex items-center">
                {formData[key] || <span className="text-gray-400 italic">Not provided</span>}
            </div>
        )}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>

        <div className="grid gap-6 md:grid-cols-2">
            
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <User className="h-5 w-5 text-blue-600"/> Personal Information
                    </CardTitle>
                    {!isEditing && (
                        <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="text-blue-600 hover:bg-blue-50 hover:text-blue-700">
                            <Pencil size={16} className="mr-2" /> Edit Details
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleInfoSubmit} className="space-y-6">
                        {/* Name Section */}
                        <div className="grid grid-cols-3 gap-3">
                            {renderField("First Name", "first_name")}
                            {renderField("Middle Name", "middle_name")}
                            {renderField("Last Name", "last_name")}
                        </div>

                        <div>
                            <Label className="text-gray-500 text-xs uppercase font-bold tracking-wider">Email Address</Label>
                            <div className="mt-1 p-2 bg-blue-50/50 border border-blue-100 text-blue-800 rounded-md flex items-center">
                                {formData.email}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
                        </div>
                        
                        {/* Bank Section */}
                        <div className="pt-4 border-t">
                            <Label className="flex items-center gap-2 text-gray-900 font-semibold mb-4">
                                <CreditCard size={16} className="text-blue-600"/> Banking Details
                            </Label>
                            <div className="grid grid-cols-2 gap-4">
                                {renderField("Bank Name", "bank_name", "e.g. NIC Asia")}
                                {renderField("Account No", "bank_account_no", "0000...")}
                            </div>
                        </div>

                        {isEditing && (
                            <div className="flex gap-3 pt-2 animate-in fade-in slide-in-from-top-2">
                                <Button type="button" variant="outline" className="flex-1" onClick={handleCancel}>
                                    <X size={16} className="mr-2"/> Cancel
                                </Button>
                                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin mr-2"/> : <Save size={16} className="mr-2"/>}
                                    Save Changes
                                </Button>
                            </div>
                        )}
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="border-b pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Lock className="h-5 w-5 text-orange-600"/> Security
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handlePassSubmit} className="space-y-4">
                        <div>
                            <Label>Current Password</Label>
                            <Input type="password" required value={passData.current_password} onChange={e=>setPassData({...passData, current_password:e.target.value})} className="mt-1"/>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>New Password</Label>
                                <Input type="password" required value={passData.new_password} onChange={e=>setPassData({...passData, new_password:e.target.value})} className="mt-1"/>
                            </div>
                            <div>
                                <Label>Confirm Password</Label>
                                <Input type="password" required value={passData.confirm_password} onChange={e=>setPassData({...passData, confirm_password:e.target.value})} className="mt-1"/>
                            </div>
                        </div>
                        
                        <div className="pt-2">
                            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white" disabled={passLoading}>
                                {passLoading ? <Loader2 className="animate-spin mr-2"/> : "Update Password"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}