"use client";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import signupHandler from "@/handlers/signup.handler";
import { useRouter } from "next/navigation";

const SignupFormSchema = z
  .object({
    email: z.email(),
    password: z
      .string()
      .min(8, "Password must contain at least 8 characters.")
      .max(20),
    confirmPassword: z
      .string()
      .min(8, "Password must contain at least 8 characters.")
      .max(20),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type SignupFormValues = z.infer<typeof SignupFormSchema>;

export default function Signup() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, formState, reset } =
    useForm<SignupFormValues>({
      mode: "onChange",
      resolver: zodResolver(SignupFormSchema),
    });

  const onFormSubmitHandler = async (data: SignupFormValues) => {
    setLoading(true);
    try {
      console.log(data, "SIGNUP");
      await signupHandler(data);
      toast("Account has been created!");
      reset();
      router.replace("/tutor");
    } catch (e) {
      toast((e as Error).message);
    }
    setLoading(false);
  };

  return (
    <div className={"w-full"}>
      <h1 className="text-4xl text-center font-bold pb-9">Signup</h1>
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
        <Input
          disabled={loading}
          label={"Confirm Password"}
          type={"password"}
          message={formState.errors["confirmPassword"]?.message}
          {...register("confirmPassword")}
          placeholder={"qwerty1234:)"}
        />
        <Button
          type="submit"
          disabled={!formState.isValid || loading}
          loading={loading}
          className="w-full"
        >
          Create account
        </Button>
        <div className={"text-center"}>
          <span>{`Already a user? `}</span>
          <Link className={"underline"} href={"/login"}>
            Login
          </Link>
        </div>
      </form>
    </div>
  );
}
