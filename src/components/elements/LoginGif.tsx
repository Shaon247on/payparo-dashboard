"use client";
import Lottie from "lottie-react";
import login from "../../../public/gif/Login.json";

function LoginGif() {
  return (
    <div className="max-h-screen w-1/2 h-screen hidden lg:block">
      <Lottie animationData={login} loop className="h-full w-full" />
    </div>
  );
}

export default LoginGif;
