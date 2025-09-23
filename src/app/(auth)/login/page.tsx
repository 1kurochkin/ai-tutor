"use client";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import loginHandler from "@/handlers/login.handler";
import { useRouter } from "next/navigation";

const LoginFormSchema = z.object({
  email: z.email(),
  password: z
    .string()
    .min(8, "Password must contain at least 8 characters.")
    .max(20),
});
export type LoginFormValues = z.infer<typeof LoginFormSchema>;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, formState, reset } = useForm<LoginFormValues>(
    {
      mode: "onChange",
      resolver: zodResolver(LoginFormSchema),
    },
  );

  const onFormSubmitHandler = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      console.log(data, "Login");
      await loginHandler(data);
      reset();
      router.replace("/tutor");
    } catch (e) {
      console.log(e, "ERROR");
      toast((e as Error).message);
    }
    setLoading(false);
  };

  return (
    <div className={"w-full"}>
      <h1 className="text-4xl text-center font-bold pb-9">Login</h1>
      <form
        className={"flex flex-col gap-3"}
        onSubmit={handleSubmit(onFormSubmitHandler)}
      >
        <Input
          disabled={loading}
          message={formState.errors["email"]?.message}
          label={"Email"}
          {...register("email")}
          placeholder={"john.doe@email.com"}
        />
        <Input
          disabled={loading}
          type={"password"}
          label={"Password"}
          message={formState.errors["password"]?.message}
          {...register("password")}
          placeholder={"qwerty1234:)"}
        />
        <Button
          type="submit"
          disabled={!formState.isValid || loading}
          loading={loading}
          className="w-full"
        >
          Login
        </Button>
        <div className={"text-center"}>
          <span>{`Don't have an account? `}</span>
          <Link className={"underline"} href={"/signup"}>
            Signup
          </Link>
        </div>
      </form>
    </div>
  );
}
