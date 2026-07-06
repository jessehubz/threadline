"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Send, MessageSquare, X, Plus, ArrowLeft } from "lucide-react";
import { getPusherClient } from "@/lib/pusher-client";
import { sendMessage } from "@/actions/message-actions";
import { getConversations, getOrCreateConversation, sendDirectMessage, getDirectMessages, getTeamMembers } from "@/actions/dm-actions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface MessageUser { id: string; name: string | null; email: string; imageUrl: string | null; }
interface Message { id: string; content: string; createdAt: string; user: MessageUser; }
interface Conversation { id: string; isGroup: boolean; name: string | null; participants: Array<{ id: string; user: MessageUser }>; messages: Array<{ id: string; content: string; createdAt: string; user: { id: string; name: string | null; email: string } }>; }

export function ChatPopup({ currentUserId }: { currentUserId: string }) {
  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [teammates, setTeammates] = useState<MessageUser[]>([]);
  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (open) { setLoading(true); getConversations().then((c) => setConversations(c as unknown as Conversation[])).catch(() => {}).finally(() => setLoading(false)); } }, [open]);
  useEffect(() => { if (!selectedConvo) return; setMessagesLoading(true); getDirectMessages(selectedConvo.id).then((msgs) => setMessages(msgs.map((m) => ({ id: m.id, content: m.content, createdAt: m.createdAt.toISOString(), user: m.user })))).catch(() => setMessages([])).finally(() => setMessagesLoading(false)); }, [selectedConvo]);
  useEffect(() => { if (!selectedConvo) return; const ch = getPusherClient().subscribe(`private-dm-${selectedConvo.id}`); ch.bind("new-dm", (d: Message) => setMessages((p) => [...p, d])); return () => { ch.unbind_all(); getPusherClient().unsubscribe(`private-dm-${selectedConvo.id}`); }; }, [selectedConvo]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function getOther(c: Conversation) { return c.participants.find((p) => p.user.id !== currentUserId)?.user; }
  async function handleNewChat() { setShowNewChat(true); try { setTeammates(await getTeamMembers()); } catch {} }
  async function startConvo(userId: string) { setShowNewChat(false); startTransition(async () => { try { const c = await getOrCreateConversation(userId) as unknown as Conversation; setConversations((p) => p.some((x) => x.id === c.id) ? p : [{ ...c, messages: [] }, ...p]); setSelectedConvo({ ...c, messages: [] }); } catch { toast.error("Failed"); } }); }
  function handleSend() { if (!input.trim() || !selectedConvo) return; const content = input.trim(); setInput(""); startTransition(async () => { try { await sendDirectMessage({ conversationId: selectedConvo.id, content }); } catch {} }); }

  return (
    <>
      <button onClick={() => setOpen(!open)} className={cn("relative rounded-xl p-2 transition-colors", open ? "bg-brand-50 text-brand-600" : "text-surface-500 hover:bg-surface-100 hover:text-surface-700")} aria-label="Messages"><MessageSquare className="h-5 w-5" /></button>
      {open && (
        <div className="fixed bottom-4 right-4 z-50 flex h-[480px] w-[360px] flex-col overflow-hidden rounded-2xl border border-surface-200/80 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-surface-100 px-4 py-3">
            {selectedConvo ? (<><button onClick={() => setSelectedConvo(null)} className="rounded-lg p-1 text-surface-400 hover:bg-surface-100"><ArrowLeft className="h-4 w-4" /></button><p className="text-sm font-semibold text-[#1A1A1A]">{getOther(selectedConvo)?.name || getOther(selectedConvo)?.email || "Chat"}</p><button onClick={() => setOpen(false)} className="rounded-lg p-1 text-surface-400 hover:bg-surface-100"><X className="h-4 w-4" /></button></>) : (<><p className="text-sm font-semibold text-[#1A1A1A]">Messages</p><div className="flex items-center gap-1"><button onClick={handleNewChat} className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-100 hover:text-brand-600"><Plus className="h-4 w-4" /></button><button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-100"><X className="h-4 w-4" /></button></div></>)}
          </div>
          {!selectedConvo ? (
            <div className="flex-1 overflow-y-auto">{showNewChat ? (<div className="p-3">{teammates.map((t) => (<button key={t.id} onClick={() => startConvo(t.id)} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-[#1A1A1A] hover:bg-surface-50"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">{(t.name||t.email).charAt(0).toUpperCase()}</div><span className="truncate">{t.name||t.email}</span></button>))}<button onClick={() => setShowNewChat(false)} className="mt-2 w-full text-center text-xs text-[#6B7280]">Cancel</button></div>) : loading ? (<div className="flex items-center justify-center py-12"><div className="h-5 w-5 animate-spin rounded-full border-2 border-surface-200 border-t-brand-600" /></div>) : conversations.length === 0 ? (<div className="flex flex-col items-center py-12"><MessageSquare className="h-8 w-8 text-surface-300 mb-2" /><p className="text-sm text-[#6B7280]">No conversations</p><button onClick={handleNewChat} className="mt-2 text-sm font-medium text-brand-600">Start one</button></div>) : (conversations.map((c) => { const o = getOther(c); return (<button key={c.id} onClick={() => setSelectedConvo(c)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-50 border-b border-surface-50"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">{(o?.name||o?.email||"?").charAt(0).toUpperCase()}</div><div className="flex-1 min-w-0"><p className="text-sm font-medium text-[#1A1A1A] truncate">{o?.name||o?.email}</p>{c.messages[0] && <p className="text-xs text-[#6B7280] truncate">{c.messages[0].content}</p>}</div></button>); }))}</div>
          ) : (<><div className="flex-1 overflow-y-auto px-3 py-3">{messagesLoading ? <div className="flex items-center justify-center py-12"><div className="h-5 w-5 animate-spin rounded-full border-2 border-surface-200 border-t-brand-600" /></div> : messages.length === 0 ? <p className="text-center text-xs text-[#6B7280] py-12">No messages yet</p> : <div className="space-y-3">{messages.map((m) => { const isOwn = m.user.id === currentUserId; return (<div key={m.id} className={cn("flex", isOwn ? "justify-end" : "justify-start")}><div className={cn("max-w-[75%] rounded-2xl px-3.5 py-2", isOwn ? "bg-brand-600 text-white" : "bg-surface-100 text-[#1A1A1A]")}><p className="text-[13px] whitespace-pre-wrap break-words">{m.content}</p><p className={cn("text-[10px] mt-0.5", isOwn ? "text-brand-200" : "text-[#6B7280]")}>{new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p></div></div>); })}<div ref={messagesEndRef} /></div>}</div><div className="border-t border-surface-100 px-3 py-2.5"><div className="flex items-center gap-2"><input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder="Type a message..." className="flex-1 rounded-xl border border-surface-200 bg-surface-50 px-3.5 py-2 text-sm text-[#1A1A1A] placeholder-surface-400 outline-none focus:border-brand-400" /><button onClick={handleSend} disabled={!input.trim()||isPending} className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50"><Send className="h-4 w-4" /></button></div></div></>)}
        </div>
      )}
    </>
  );
}
