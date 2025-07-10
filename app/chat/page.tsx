import React from "react";
import Chat from "./Chat";
import ChatCard from "@/components/ChatCard";

const page = () => {
  return (
    <div>
        <div className="h-[4rem] border-b">header</div>
      <div className="grid grid-cols-2">
        <Chat />
        <ChatCard />
      </div>
    </div>
  );
};

export default page;
