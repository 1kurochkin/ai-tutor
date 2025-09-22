"use server";
import { LoginFormValues } from "@/app/(auth)/login/page";

const loginHandler = async (values: LoginFormValues) => {
  await new Promise((resolve) => setTimeout(resolve, 4000));
  console.log(values);
};

export default loginHandler;
