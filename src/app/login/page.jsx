"use client";

import { useState } from "react";
import { loginWithEmailAndPassword, loginWithGoogle } from "@/helpers/loginHelp";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import { auth, db } from "@/config/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import "react-toastify/dist/ReactToastify.css";

const toastOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "dark",
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  

  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const user = await loginWithEmailAndPassword(email, password);
      console.log("Logged in as:", user.email);

      if (user) {
        toast.success("Login successful!", toastOptions);
        router.push("/dashboard");
      }
    } catch (error) {
      setError(error.message);
      toast.error("Login failed ", toastOptions);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const user = await loginWithGoogle();
      console.log("Logged in with Google:", user.displayName);

      if (user) {
        toast.success("Logged in with Google!", toastOptions);
        router.push("/dashboard");
      }
    } catch (error) {
      setError(error.message);
      toast.error("Google login failed ", toastOptions);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) return;
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      
      toast.success("Password reset link sent to your email!"); // Show success toast
      setIsDialogOpen(false);
    } catch (error) {
      
      toast.error("Error sending password reset email "); // Show error toast
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0f0f17] text-white">
      <ToastContainer theme="dark" />
      
      {/* Left side with welcome message */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#1a1a2e] to-[#4a0072] p-8 flex-col justify-center items-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-5xl font-bold mb-6 text-white">Welcome Back !</h1>
          <p className="text-lg text-gray-300 mb-8">Glad you're back! Log in to continue your journey with us.</p>
          <div className="animate-pulse">
            <button className="border border-white/30 bg-black/20 hover:bg-black/30 text-white rounded-md px-6 py-2 transition-all duration-300">
              Skip the lag ?
            </button>
          </div>
        </div>
      </div>
      
      {/* Right side with login form */}
      <div className="w-full md:w-1/2 flex justify-center items-center p-8 relative overflow-hidden">
        <div className="absolute top-[-30%] right-[-10%] w-64 h-64 rounded-full bg-purple-700/30 blur-3xl"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 rounded-full bg-purple-900/20 blur-3xl"></div>
        
        <Card className="w-full max-w-md bg-[#1a1a2e]/80 border border-gray-700 shadow-2xl rounded-lg backdrop-blur-sm z-10">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold text-white">Login</CardTitle>
            <p className="text-center text-gray-400 mt-2">Glad you're back!</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-3">
              <Input 
                type="email" 
                placeholder="Username" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="bg-[#1a1a2e]/50 border-gray-700 text-white rounded-md px-4 py-3 focus:border-purple-500 focus:ring-purple-500" 
                required 
              />
              <Input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="bg-[#1a1a2e]/50 border-gray-700 text-white rounded-md px-4 py-3 focus:border-purple-500 focus:ring-purple-500" 
                required 
              />
            </div>
            
            <div className="flex items-center">
              <input type="checkbox" id="remember" className="mr-2 h-4 w-4 rounded border-gray-700 bg-[#1a1a2e]/50 text-purple-600 focus:ring-purple-500" />
              <label htmlFor="remember" className="text-sm text-gray-400">Remember me</label>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-md transition-all duration-300"
            >
              Login
            </Button>
          </form>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#1a1a2e]/80 px-4 text-sm text-gray-400">Or</span>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4 mb-4">
            <button onClick={handleGoogleLogin} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#EA4335">
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1.086-9.5H17v-1h-6.086v-1.5H17v-1h-6.086V7.5H17v-1h-6.086c-.827 0-1.5.673-1.5 1.5v5c0 .827.673 1.5 1.5 1.5z"/>
              </svg>
            </button>
            <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
            </button>
            <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
            </button>
          </div>
          
          <p className="text-center text-sm text-gray-400">
            Don't have an account? <Link href="/register" className="text-purple-400 hover:text-purple-300 hover:underline">Signup</Link>
          </p>

          <div className="text-center mt-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="link" className="text-purple-400 hover:text-purple-300 text-sm">
                  Forgot password ?
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#1a1a2e] border border-gray-700 p-6 rounded-lg shadow-xl">
                <DialogTitle className="text-xl font-semibold mb-4 text-white">Reset Password</DialogTitle>
                <DialogDescription className="text-sm text-gray-400 mb-4">
                  Enter your email to receive a password reset link.
                </DialogDescription>
                <Input
                  type="email"
                  placeholder="Your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mb-4 bg-[#1a1a2e]/50 border-gray-700 text-white rounded-md px-4 py-3 focus:border-purple-500 focus:ring-purple-500"
                />
                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    variant="secondary"
                    onClick={() => setIsDialogOpen(false)}
                    className="bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium py-2 px-4 rounded-md border border-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePasswordReset}
                    disabled={isLoading}
                    className={`${isLoading ? "bg-purple-500/50" : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"} text-sm font-medium py-2 px-4 rounded-md text-white transition-all duration-300`}
                  >
                    {isLoading ? "Sending..." : "Send Link"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default Login;