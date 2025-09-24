import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Chat } from "@prisma/client";

export default async function Sidebar({ chats }: { chats: Partial<Chat>[] }) {
  console.log(chats, "Sidebar");
  return (
    <div className="w-64 bg-black text-white flex flex-col transition-all duration-300 p-4 gap-4">
      <Button asChild variant="outline">
        <Link href="/chat">New Chat</Link>
      </Button>

      <div className="mt-8 overflow-y-auto h-full flex flex-col gap-2">
        {chats.length === 0 ? (
          <span>Chats</span>
        ) : (
          chats.map((chat) => (
            <Link
              key={chat.id}
              href={`/chat/${chat.id}`}
              className="p-2 rounded-md hover:bg-gray-700 transition"
            >
              {chat.title || "Untitled Chat"}
            </Link>
          ))
        )}
      </div>

      <form action="http://localhost:3000/api/auth/logout" method="post">
        <Button className={"w-full"} type="submit" variant="outline">
          Logout
        </Button>
      </form>
    </div>
  );
}
