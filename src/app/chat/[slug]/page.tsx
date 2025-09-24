import React from "react";
import getChatHandler from "@/handlers/get-chat-handler";
import { File } from "@prisma/client";
import PDFViewer from "@/components/pdf/pdf-view";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type ChatIdProps = { params: Promise<{ slug: string }> };

// Server component
export default async function ChatId({ params }: ChatIdProps) {
  const { slug } = await params;
  // Fetch chat by slug
  const chat = await getChatHandler(slug);
  const { url } = chat?.file as File;

  if (!chat) {
    return <p>Chat not found</p>;
  }
  return (
    <>
      <div className="h-[90vh] border-r overflow-scroll w-full">
        <PDFViewer url={url} />
      </div>
      {/* Input Area */}
      <div className="flex gap-2 botder-t w-9/12 align-middle">
        <Input type="text" placeholder="Ask anything" />
        <Button loading={false}>Send</Button>
      </div>
    </>
  );
}
