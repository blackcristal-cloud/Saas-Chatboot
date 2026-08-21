import React from "react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { CHANNEL_META } from "@/components/channels/ChannelIcons";
import { Lock, Settings2 } from "lucide-react";

const StatusBadge = ({ status, channelType, t }) => {
  if (channelType === "tiktok" || status === "pending_approval") {
    return (
      <Badge variant="secondary" className="gap-1" data-testid={`channels-status-${channelType}`}>
        <Lock className="h-3 w-3" />
        {t("channels.comingSoon")}
      </Badge>
    );
  }
  if (status === "active") {
    return (
      <Badge
        className="gap-1.5 border-emerald-600/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15"
        variant="outline"
        data-testid={`channels-status-${channelType}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        {t("channels.connected")}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1.5 text-muted-foreground" data-testid={`channels-status-${channelType}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
      {t("channels.disconnected")}
    </Badge>
  );
};

export const ChannelCard = ({ channel, onToggle, onConfigure }) => {
  const { t } = useApp();
  const meta = CHANNEL_META[channel.channelType];
  if (!meta) return null;
  const Icon = meta.icon;
  const isTikTok = channel.channelType === "tiktok";
  const isActive = channel.status === "active";

  return (
    <Card
      className={`card-lift relative overflow-hidden border-l-2 ${isTikTok ? "opacity-70" : ""}`}
      style={{ borderLeftColor: meta.color }}
      data-testid={`channels-card-${channel.channelType}`}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${meta.color}1f`, color: meta.color }}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-base font-semibold">{meta.name}</p>
            <StatusBadge status={channel.status} channelType={channel.channelType} t={t} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground">{t(`channels.${channel.channelType}Desc`)}</p>
        {channel.config?.handle && (
          <p className="mt-2 font-mono text-xs text-muted-foreground" data-testid={`channels-${channel.channelType}-linked-handle`}>
            {t("channels.linkedAccount")}: {channel.config.handle}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t pt-4">
        <div className="flex items-center gap-2">
          <Switch
            checked={isActive}
            disabled={isTikTok}
            onCheckedChange={(checked) => onToggle(channel, checked)}
            data-testid={`channels-${channel.channelType}-toggle`}
            aria-label={`Toggle ${meta.name}`}
          />
          <span className="text-xs text-muted-foreground">
            {isActive ? t("channels.active") : t("channels.inactive")}
          </span>
        </div>
        {isTikTok ? (
          <Badge variant="secondary" className="text-[10px]" data-testid="channels-tiktok-coming-soon-badge">
            {t("channels.comingSoonFull")}
          </Badge>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onConfigure(channel)}
            data-testid={`channels-${channel.channelType}-configure-button`}
            className="gap-1.5"
          >
            <Settings2 className="h-3.5 w-3.5" />
            {isActive ? t("channels.configure") : t("channels.connect")}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
