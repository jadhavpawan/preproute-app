"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authApi, getApiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Field, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";

const loginSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginForm) {
    setServerError(null);
    setLoading(true);
    try {
      const { token, user } = await authApi.login(values.userId, values.password);
      setAuth(token, user ?? { id: values.userId, userId: values.userId });
      toast.success("Logged in successfully");
      router.replace("/dashboard");
    } catch (err) {
      setServerError(getApiErrorMessage(err, "Invalid user ID or password"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Left illustration panel */}
      <div className="hidden flex-1 items-center justify-center bg-surface-blue lg:flex">
        <Image
          src="/login-illustration.png"
          alt=""
          width={355}
          height={512}
          priority
          className="w-full max-w-[355px]"
        />
      </div>

      {/* Right form panel */}
      <div className="flex w-full max-w-[520px] flex-col justify-center px-2xl">
        <Image src="/logo.png" alt="PrepRoute" width={160} height={46} priority className="mb-2xl" />

        <h1 className="text-section-title text-text-secondary">Login</h1>
        <p className="mb-xl mt-1 text-small-body text-text-tertiary">
          Use your company provided Login credentials
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-lg">
          <Field label="User ID" error={errors.userId?.message}>
            <Input placeholder="Enter User ID" error={!!errors.userId} {...register("userId")} />
          </Field>

          <Field label="Password" error={errors.password?.message}>
            <Input
              type="password"
              placeholder="Enter Password"
              error={!!errors.password}
              {...register("password")}
            />
          </Field>

          <Link href="#" className="-mt-2 text-small-body text-brand-periwinkle">
            Forgot password?
          </Link>

          {serverError && <p className="text-caption text-danger">{serverError}</p>}

          <Button type="submit" loading={loading} className="mt-2 w-full">
            Login
          </Button>
        </form>
      </div>
    </div>
  );
}
