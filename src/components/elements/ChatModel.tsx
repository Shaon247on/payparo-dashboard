"use client";
import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  text: string;
  sender: "them" | "me";
  time: string;
  read: boolean;
}

interface ChatModalProps {
  open: boolean;
  onClose: () => void;
  userName: string;
  userAvatar?: string;
}

const initialMessages: Message[] = [
  {
    id: "1",
    text: "I am seller, i have many problems in this app.",
    sender: "them",
    time: "10:43 AM",
    read: true,
  },
  {
    id: "2",
    text: "Hello! I'm Sarah from the compliance team.",
    sender: "me",
    time: "10:43 AM",
    read: true,
  },
];

export function ChatModal({ open, onClose, userName, userAvatar }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), text: trimmed, sender: "me", time: now, read: false },
    ]);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="bg-[#0d0f18] border-white/10 text-white p-0 max-w-[480px] overflow-hidden gap-0">
        {/* Header */}
        <DialogHeader className="px-5 py-4 border-b border-white/5">
          <DialogTitle className="text-white text-base font-bold text-center">
            {userName}
          </DialogTitle>
        </DialogHeader>

        {/* Messages */}
        <div className="flex flex-col gap-4 px-4 py-5 overflow-y-auto min-h-[300px] max-h-[400px]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn("flex items-end gap-2.5", msg.sender === "me" && "flex-row-reverse")}
            >
              {/* Avatar */}
              <Avatar className="w-9 h-9 flex-shrink-0">
                {msg.sender === "them" ? (
                  <>
                    <AvatarImage src={userAvatar} alt={userName} className="object-cover" />
                    <AvatarFallback className="bg-[#2a2d3e] text-white/60 text-xs">{initials}</AvatarFallback>
                  </>
                ) : (
                  <>
                    <AvatarImage src="/avatar.jpg" alt="Me" className="object-cover" />
                    <AvatarFallback className="bg-[#0099ff] text-white text-xs">ME</AvatarFallback>
                  </>
                )}
              </Avatar>

              <div className={cn("flex flex-col gap-1 max-w-[65%]", msg.sender === "me" && "items-end")}>
                {/* Bubble */}
                <div
                  className={cn(
                    "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                    msg.sender === "them"
                      ? "bg-[#1e2333] text-white rounded-tl-sm"
                      : "bg-[#0099ff] text-white rounded-tr-sm"
                  )}
                >
                  {msg.text}
                </div>

                {/* Time + read */}
                <div className="flex items-center gap-1.5 px-1">
                  <span className="text-white/30 text-xs">{msg.time}</span>
                  {msg.sender === "me" && (
                    msg.read
                      ? <CheckCheck className="w-3.5 h-3.5 text-[#0099ff]" />
                      : <Check className="w-3.5 h-3.5 text-white/30" />
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-4 border-t border-white/5">
          <Input
            className="flex-1 bg-[#1a1d27] border-white/10 text-white placeholder:text-white/25 h-11 rounded-xl focus-visible:ring-0 focus-visible:border-white/20"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-11 h-11 rounded-full bg-[#0099ff] hover:bg-[#007acc] p-0 flex-shrink-0 disabled:opacity-40"
          >
            <Send className="w-4 h-4 text-white" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}