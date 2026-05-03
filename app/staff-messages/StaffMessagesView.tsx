'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCheck, Inbox, Loader2, MailPlus, MessageSquare, Reply, Send, X } from 'lucide-react';
import { markMessageThreadRead, replyToPersonalMessage, sendPersonalMessage } from '@/app/actions/messages';
import GlassSelect from '@/components/GlassSelect';

type Recipient = {
  id: number;
  name: string;
  email: string;
  role: string;
  designation: string;
  departmentName: string | null;
};

type Message = {
  id: number;
  senderId: number;
  recipientId: number;
  subject: string;
  body: string;
  parentMessageId: number | null;
  isRead: boolean | number;
  createdAt: number | string | Date;
  senderName: string;
  senderRole: string;
  recipientName: string;
  recipientRole: string;
};

type Thread = {
  id: number;
  subject: string;
  otherParty: { id: number; name: string; role: string };
  latest: Message;
  messages: Message[];
  unreadCount: number;
};

function formatDate(value: number | string | Date) {
  const raw = Number(value);
  const date = Number.isFinite(raw)
    ? new Date(raw < 10000000000 ? raw * 1000 : raw)
    : new Date(value);

  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function roleLabel(role: string) {
  if (role === 'HEAD') return 'Department Head';
  if (role === 'ADMIN') return 'System Admin';
  return 'Teacher';
}

export default function StaffMessagesView({
  basePath,
  currentUser,
  recipients,
  threads,
  selectedThreadId,
}: {
  basePath: string;
  currentUser: { id: number; name: string; role: string };
  recipients: Recipient[];
  threads: Thread[];
  selectedThreadId?: number;
}) {
  const router = useRouter();
  const [composeOpen, setComposeOpen] = useState(false);
  const [recipientId, setRecipientId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [replying, setReplying] = useState(false);
  const [error, setError] = useState('');

  const selectedThread = useMemo(
    () => threads.find(thread => thread.id === selectedThreadId) ?? threads[0],
    [selectedThreadId, threads]
  );

  useEffect(() => {
    if (selectedThread?.unreadCount) {
      void markMessageThreadRead(selectedThread.id).then(() => router.refresh());
    }
  }, [router, selectedThread?.id, selectedThread?.unreadCount]);

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const message = await sendPersonalMessage({
        recipientId: parseInt(recipientId),
        subject,
        body,
      });
      setComposeOpen(false);
      setRecipientId('');
      setSubject('');
      setBody('');
      router.push(`${basePath}?thread=${message.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedThread) return;
    setReplying(true);
    setError('');
    try {
      await replyToPersonalMessage(selectedThread.id, replyBody);
      setReplyBody('');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to send reply');
    } finally {
      setReplying(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-indigo-600 dark:text-indigo-400" suppressHydrationWarning />
            Staff Messages
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Personal messages between teachers, department heads, and system admins.
          </p>
        </div>
        <button
          onClick={() => setComposeOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-sm transition-colors"
        >
          <MailPlus className="w-4 h-4" suppressHydrationWarning />
          New Message
        </button>
      </header>

      {error && (
        <div className="rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-900/20 px-4 py-3 text-sm font-medium text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm min-h-[520px]">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 dark:text-white">Conversations</h2>
            <span className="text-xs font-bold text-slate-400">{threads.length}</span>
          </div>

          {threads.length === 0 ? (
            <div className="h-[440px] flex flex-col items-center justify-center text-center p-8">
              <Inbox className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" suppressHydrationWarning />
              <h3 className="font-bold text-slate-900 dark:text-white">No messages yet</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Start a staff conversation when you need a direct decision or follow-up.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {threads.map(thread => {
                const active = selectedThread?.id === thread.id;
                return (
                  <Link key={thread.id} href={`${basePath}?thread=${thread.id}`}>
                    <span className={`block px-5 py-4 transition-colors cursor-pointer ${active ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{thread.subject}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                            {thread.otherParty.name} - {roleLabel(thread.otherParty.role)}
                          </p>
                        </div>
                        {thread.unreadCount > 0 ? (
                          <span className="shrink-0 bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{thread.unreadCount}</span>
                        ) : (
                          <CheckCheck className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" suppressHydrationWarning />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 line-clamp-2">{thread.latest.body}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">{formatDate(thread.latest.createdAt)}</p>
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm min-h-[520px] flex flex-col">
          {!selectedThread ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <MessageSquare className="w-14 h-14 text-slate-300 dark:text-slate-600 mb-3" suppressHydrationWarning />
              <h3 className="font-bold text-slate-900 dark:text-white">Select a conversation</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Replies and message history will appear here.</p>
            </div>
          ) : (
            <>
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">{selectedThread.subject}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Conversation with {selectedThread.otherParty.name} ({roleLabel(selectedThread.otherParty.role)})
                </p>
              </div>

              <div className="flex-1 p-6 space-y-4 overflow-y-auto max-h-[560px] bg-slate-50/60 dark:bg-slate-950/40">
                {selectedThread.messages.map(message => {
                  const mine = message.senderId === currentUser.id;
                  return (
                    <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[82%] rounded-2xl px-4 py-3 border shadow-sm ${
                        mine
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100'
                      }`}>
                        <div className="flex items-center justify-between gap-4 mb-1">
                          <p className={`text-xs font-black uppercase tracking-wider ${mine ? 'text-indigo-100' : 'text-slate-400'}`}>
                            {mine ? 'You' : message.senderName}
                          </p>
                          <p className={`text-[11px] ${mine ? 'text-indigo-100' : 'text-slate-400'}`}>{formatDate(message.createdAt)}</p>
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.body}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleReply} className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex gap-3">
                  <textarea
                    required
                    rows={2}
                    value={replyBody}
                    onChange={event => setReplyBody(event.target.value)}
                    placeholder="Write a reply..."
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                  <button
                    type="submit"
                    disabled={replying}
                    className="self-stretch px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-colors disabled:opacity-60"
                    title="Send reply"
                  >
                    {replying ? <Loader2 className="w-5 h-5 animate-spin" suppressHydrationWarning /> : <Reply className="w-5 h-5" suppressHydrationWarning />}
                  </button>
                </div>
              </form>
            </>
          )}
        </section>
      </div>

      {composeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-xl shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MailPlus className="w-5 h-5 text-indigo-500" suppressHydrationWarning />
                New Staff Message
              </h3>
              <button onClick={() => setComposeOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="w-5 h-5" suppressHydrationWarning />
              </button>
            </div>

            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Recipient</label>
                <GlassSelect
                  required
                  value={recipientId}
                  onChange={event => setRecipientId(event.target.value)}
                  className="w-full"
                >
                  <option value="">Select teacher, head, or admin</option>
                  {recipients.map(recipient => (
                    <option key={recipient.id} value={recipient.id}>
                      {recipient.name} - {roleLabel(recipient.role)}{recipient.departmentName ? `, ${recipient.departmentName}` : ''}
                    </option>
                  ))}
                </GlassSelect>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                <input
                  required
                  value={subject}
                  onChange={event => setSubject(event.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Message subject"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Message</label>
                <textarea
                  required
                  rows={5}
                  value={body}
                  onChange={event => setBody(event.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Write the message..."
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setComposeOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-60 flex items-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" suppressHydrationWarning /> : <Send className="w-4 h-4" suppressHydrationWarning />}
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
