import React from "react";
import Chat from "../../components/Chat";

const page = () => {
  return (
    <div>
        <div className="h-[4rem] border-b">header</div>
      <div className="grid grid-cols-2">
        <Chat />
      </div>
    </div>
  );
};

export default page;
