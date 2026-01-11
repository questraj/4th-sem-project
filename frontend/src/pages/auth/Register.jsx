import { useState } from "react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import AuthLayout from "@/components/layout/AuthLayout";

export default function Register() {
  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    password: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  // RAW RegEx (simple & safe)
  const nameRegex = /^[A-Za-z]+$/; 
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^.{6,}$/; // minimum 6 characters

  // First Name
  if (!nameRegex.test(formData.first_name)) {
    setMessage("First name should contain only letters.");
    return;
  }

  // Middle Name (optional)
  if (
    formData.middle_name !== "" &&
    !nameRegex.test(formData.middle_name)
  ) {
    setMessage("Middle name should contain only letters.");
    return;
  }

  // Last Name
  if (!nameRegex.test(formData.last_name)) {
    setMessage("Last name should contain only letters.");
    return;
  }

  // Email
  if (!emailRegex.test(formData.email)) {
    setMessage("Please enter a valid email address.");
    return;
  }

  // Password (simple length check)
  if (!passwordRegex.test(formData.password)) {
    setMessage("Password must be at least 6 characters long.");
    return;
  }

  try {
    const data = new FormData();
    Object.keys(formData).forEach((key) =>
      data.append(key, formData[key])
    );

    const res = await api.post("/auth/register.php", data);

    if (res.data.success || res.data.message === "Registration successful") {
      navigate("/login");
    } else {
      setMessage(res.data.message || "Registration failed");
    }
  } catch (error) {
    setMessage("An error occurred during registration.");
  }
};


  const inputClasses =
    "bg-gray-800 border-gray-700 text-white h-12 placeholder:text-gray-500";

  return (
    <AuthLayout title="Create Account">
      <form onSubmit={handleSubmit} className="space-y-4">
        {message && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 text-sm p-3 rounded-md">
            {message}
          </div>
        )}

        {/* Name Fields */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name" className="text-gray-300 font-normal">
              First Name
            </Label>
            <Input
              id="first_name"
              onChange={handleChange}
              required
              className={inputClasses}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="middle_name" className="text-gray-300 font-normal">
              Middle Name
            </Label>
            <Input
              id="middle_name"
              onChange={handleChange}
              className={inputClasses}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name" className="text-gray-300 font-normal">
              Last Name
            </Label>
            <Input
              id="last_name"
              onChange={handleChange}
              required
              className={inputClasses}
            />
          </div>
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-300 font-normal">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            onChange={handleChange}
            required
            className={inputClasses}
          />
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-300 font-normal">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              onChange={handleChange}
              required
              className={`${inputClasses} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white bg-transparent focus:outline-none"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-12 mt-6 text-base"
        >
          Register
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-blue-500 hover:text-blue-400 font-medium"
        >
          Login
        </Link>
      </p>
    </AuthLayout>
  );
}
