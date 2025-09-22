"use server";
import { SignupFormValues } from "../app/(auth)/signup/page";
const signupHandler = async (values: SignupFormValues) => {
  await new Promise((resolve) => setTimeout(resolve, 4000));
  console.log(values);
};

export default signupHandler;
