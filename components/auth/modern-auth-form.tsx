"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail, Loader2, ArrowLeft, Building2 } from "lucide-react";
import Link from "next/link";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { login } from "@/actions/login";
import { register } from "@/actions/register";

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const RegisterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthMode = "login" | "register";

export function ModernAuthForm() {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loginForm = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const handleLogin = async (values: z.infer<typeof LoginSchema>) => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await login(values);

      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccess(result.success);
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (values: z.infer<typeof RegisterSchema>) => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await register(values);

      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccess(result.success);
        // Switch to login mode after successful registration
        setTimeout(() => {
          setAuthMode("login");
          setSuccess("");
        }, 2000);
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setAuthMode(authMode === "login" ? "register" : "login");
    setError("");
    setSuccess("");
    loginForm.reset();
    registerForm.reset();
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center space-x-2 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900">ERP Compta</span>
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {authMode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="text-gray-600">
          {authMode === "login"
            ? "Sign in to continue to your dashboard"
            : "Start managing your accounting with our ERP system"}
        </p>
      </div>

      {/* Auth Mode Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-xl p-1 mb-6">
        <button
          onClick={() => setAuthMode("login")}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            authMode === "login"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => setAuthMode("register")}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            authMode === "register"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Sign Up
        </button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4">
          <FormError message={error} />
        </div>
      )}
      {success && (
        <div className="mb-4">
          <FormSuccess message={success} />
        </div>
      )}

      {/* Login Form */}
      {authMode === "login" && (
        <form
          onSubmit={loginForm.handleSubmit(handleLogin)}
          className="space-y-4"
        >
          <div>
            <Label
              htmlFor="login-email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email address
            </Label>
            <Input
              id="login-email"
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              {...loginForm.register("email")}
              disabled={isLoading}
            />
            {loginForm.formState.errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {loginForm.formState.errors.email.message}
              </p>
            )}
          </div>

          <div>
            <Label
              htmlFor="login-password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </Label>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                {...loginForm.register("password")}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {loginForm.formState.errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {loginForm.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Link
              href="/auth/reset"
              className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            <span>Sign In</span>
          </Button>
        </form>
      )}

      {/* Register Form */}
      {authMode === "register" && (
        <form
          onSubmit={registerForm.handleSubmit(handleRegister)}
          className="space-y-4"
        >
          <div>
            <Label
              htmlFor="register-name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Full Name
            </Label>
            <Input
              id="register-name"
              type="text"
              placeholder="Enter your full name"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              {...registerForm.register("name")}
              disabled={isLoading}
            />
            {registerForm.formState.errors.name && (
              <p className="text-red-500 text-sm mt-1">
                {registerForm.formState.errors.name.message}
              </p>
            )}
          </div>

          <div>
            <Label
              htmlFor="register-email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email address
            </Label>
            <Input
              id="register-email"
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              {...registerForm.register("email")}
              disabled={isLoading}
            />
            {registerForm.formState.errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {registerForm.formState.errors.email.message}
              </p>
            )}
          </div>

          <div>
            <Label
              htmlFor="register-password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </Label>
            <div className="relative">
              <Input
                id="register-password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password (min. 6 characters)"
                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                {...registerForm.register("password")}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {registerForm.formState.errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {registerForm.formState.errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            <span>Create Account</span>
          </Button>
        </form>
      )}

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-center text-sm text-gray-600">
          {authMode === "login"
            ? "Don't have an account?"
            : "Already have an account?"}{" "}
          <button
            onClick={switchMode}
            className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
          >
            {authMode === "login" ? "Create account" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
