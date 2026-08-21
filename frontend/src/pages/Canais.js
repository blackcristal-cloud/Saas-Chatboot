import React, { useCallback, useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import { ChannelCard } from "@/components/channels/ChannelCard";
import { WhatsAppModal, TelegramModal, InstagramModal, WebChatModal } from "@/components/channels/ChannelModals";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function Canais() {
  const { t, company } = useApp();
  const [channels, setChannels] = useState(null);
  const [openModal, setOpenModal] = useState(null); // whatsapp | telegram | instagram | webchat

  const loadChannels = useCallback(() => {
    if (!company?.id) return;
    api
      .get(`/channels/${company.id}`)
      .then((res) => setChannels(res.data))
      .catch(() => toast.error(t("common.error")));
  }, [company?.id, t]);

  useEffect(() => {
    loadChannels();
  }, [loadChannels]);

  const updateChannel = async (channelType, payload, successMsg) => {
    try {
      const res = await api.put(`/channels/${company.id}/${channelType}`, payload);
      setChannels((prev) => prev.map((c) => (c.channelType === channelType ? res.data : c)));
      if (successMsg) toast.success(successMsg);
      return true;
    } catch {
      toast.error(t("common.error"));
      return false;
    }
  };

  const handleToggle = (channel, checked) => {
    updateChannel(
      channel.channelType,
      { status: checked ? "active" : "inactive" },
      checked ? t("channels.channelConnected") : t("channels.channelDisconnected")
    );
  };

  const handleConfigure = (channel) => setOpenModal(channel.channelType);

  return (
    <div className="space-y-6" data-testid="channels-page">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">{t("channels.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("channels.subtitle")}</p>
      </div>

      {channels === null ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-[210px] rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {channels.map((channel) => (
            <ChannelCard key={channel.channelType} channel={channel} onToggle={handleToggle} onConfigure={handleConfigure} />
          ))}
        </div>
      )}

      <WhatsAppModal
        open={openModal === "whatsapp"}
        onOpenChange={(v) => setOpenModal(v ? "whatsapp" : null)}
        companyId={company?.id}
        onConnect={(payload) => updateChannel("whatsapp", payload, t("channels.channelConnected"))}
      />
      <TelegramModal
        open={openModal === "telegram"}
        onOpenChange={(v) => setOpenModal(v ? "telegram" : null)}
        onConnect={(payload) => updateChannel("telegram", payload, t("channels.channelConnected"))}
      />
      <InstagramModal
        open={openModal === "instagram"}
        onOpenChange={(v) => setOpenModal(v ? "instagram" : null)}
        companyName={company?.name}
        onConnect={(payload) => updateChannel("instagram", payload, t("channels.channelConnected"))}
      />
      <WebChatModal
        open={openModal === "webchat"}
        onOpenChange={(v) => setOpenModal(v ? "webchat" : null)}
        companyId={company?.id}
      />
    </div>
  );
}
