"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/modules/core/lib/supabase/client";
import { getMyMessages, markMessageAsRead } from "../actions/student-message-actions";
import type { StudentMessage } from "@/modules/projects/types/message-types";

export function useStudentMessages() {
  const [messages, setMessages] = useState<StudentMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadMessages = useCallback(async () => {
    const res = await getMyMessages();
    if (res.success && res.messages) {
      setMessages(res.messages as any);
      const unread = (res.messages as any[]).filter((m) => !m.leido).length;
      setUnreadCount(unread);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadMessages();

    const supabase = createClient();
    const channelId = `student-messages-${Math.random().toString(36).substring(7)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "student_messages" },
        () => {
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadMessages]);

  const handleMarkAsRead = async (messageId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, leido: true, leido_at: new Date() } : m
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    await markMessageAsRead(messageId);
  };

  const openMessagesModal = () => {
    setIsModalOpen(true);
  };

  const closeMessagesModal = () => {
    setIsModalOpen(false);
  };

  return {
    state: {
      messages,
      unreadCount,
      isLoading,
      isModalOpen,
    },
    actions: {
      openMessagesModal,
      closeMessagesModal,
      handleMarkAsRead,
      loadMessages,
    },
  };
}
