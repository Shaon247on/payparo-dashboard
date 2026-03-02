import LoginGif from "@/components/elements/LoginGif";
import React from "react";

function layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center lg:justify-between min-h-screen overflow-hidden px-10 max-w-420 mx-auto gap-10">
      <LoginGif />
      <div className="flex flex-col gap-6 min-w-xs md:min-w-sm xl:min-w-lg mx-auto">
        {children}
      </div>
    </div>
  );
}

export default layout;
