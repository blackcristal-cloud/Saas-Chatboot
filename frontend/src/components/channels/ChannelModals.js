import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SimulatedQRCode } from "@/components/channels/SimulatedQRCode";
import { InstagramIcon } from "@/components/channels/ChannelIcons";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Copy, Check } from "lucide-react";

// ---------- WhatsApp: simulated QR ----------
export const WhatsAppModal = ({ open, onOpenChange, onConnect, companyId }) => {
  const { t } = useApp();
  const [connecting, setConnecting] = useState(false);

  const handleScanned = async () => {
    setConnecting(true);
    await onConnect({ status: "active" });
    setConnecting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="whatsapp-modal">
        <DialogHeader>
          <DialogTitle className="font-display">{t("channels.whatsappModalTitle")}</DialogTitle>
          <DialogDescription>{t("channels.whatsappModalDesc")}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-3 py-2">
          <SimulatedQRCode seed={companyId ? companyId.charCodeAt(companyId.length - 1) * 7 : 42} />
          <p className="text-xs text-muted-foreground">{t("channels.qrExpires")}</p>
        </div>
        <DialogFooter>
          <Button
            onClick={handleScanned}
            disabled={connecting}
            data-testid="whatsapp-scanned-button"
            className="w-full gap-2"
          >
            {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {t("channels.alreadyScanned")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ---------- Telegram: bot token ----------
export const TelegramModal = ({ open, onOpenChange, onConnect }) => {
  const { t } = useApp();
  const [token, setToken] = useState("");
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    if (!token.trim()) {
      toast.error(t("channels.tokenRequired"));
      return;
    }
    setConnecting(true);
    await onConnect({ status: "active", config: { botToken: token.trim() } });
    setConnecting(false);
    setToken("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="telegram-modal">
        <DialogHeader>
          <DialogTitle className="font-display">{t("channels.telegramModalTitle")}</DialogTitle>
          <DialogDescription>{t("channels.telegramModalDesc")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="telegram-token">{t("channels.botToken")}</Label>
          <Input
            id="telegram-token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder={t("channels.tokenPlaceholder")}
            data-testid="telegram-token-input"
            className="font-mono text-sm"
          />
        </div>
        <DialogFooter>
          <Button
            onClick={handleConnect}
            disabled={connecting}
            data-testid="telegram-connect-button"
            className="w-full gap-2"
          >
            {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {t("channels.validateConnect")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ---------- Instagram: simulated OAuth ----------
export const InstagramModal = ({ open, onOpenChange, onConnect, companyName }) => {
  const { t } = useApp();
  const [step, setStep] = useState("idle"); // idle -> loading -> linked

  const handle = "@" + (companyName || "empresa").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "");

  const startOAuth = () => {
    setStep("loading");
    setTimeout(async () => {
      await onConnect({ status: "active", config: { handle } });
      setStep("linked");
    }, 2000);
  };

  const handleClose = (value) => {
    onOpenChange(value);
    if (!value) setTimeout(() => setStep("idle"), 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" data-testid="instagram-modal">
        <DialogHeader>
          <DialogTitle className="font-display">{t("channels.instagramModalTitle")}</DialogTitle>
          <DialogDescription>{t("channels.instagramModalDesc")}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          {step === "idle" && (
            <Button
              onClick={startOAuth}
              data-testid="instagram-oauth-button"
              className="gap-2 bg-[#DD2A7B] text-white hover:bg-[#c22069]"
            >
              <InstagramIcon className="h-4 w-4" />
              {t("channels.connectWithInstagram")}
            </Button>
          )}
          {step === "loading" && (
            <div className="flex flex-col items-center gap-3 py-4" data-testid="instagram-oauth-loading">
              <Loader2 className="h-8 w-8 animate-spin text-[#DD2A7B]" />
              <p className="text-sm text-muted-foreground">{t("channels.connecting")}</p>
            </div>
          )}
          {step === "linked" && (
            <div className="flex flex-col items-center gap-3 py-4" data-testid="instagram-oauth-linked">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              <p className="text-sm font-medium">
                {t("channels.linkedAccount")}: <span className="font-mono">{handle}</span>
              </p>
              <Button variant="outline" size="sm" onClick={() => handleClose(false)} data-testid="instagram-close-button">
                {t("common.close")}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ---------- Web Chat: embed code ----------
export const WebChatModal = ({ open, onOpenChange, companyId }) => {
  const { t } = useApp();
  const [copied, setCopied] = useState(false);

  const embedCode = `<script\n  src="https://cdn.saaschatboot.com/widget.js"\n  data-company="${companyId}"\n  data-position="bottom-right"\n  async>\n</script>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
    } catch {
      // fallback for older browsers / permissions
      const ta = document.createElement("textarea");
      ta.value = embedCode;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    toast.success(t("channels.embedCopied"));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" data-testid="webchat-modal">
        <DialogHeader>
          <DialogTitle className="font-display">{t("channels.webchatModalTitle")}</DialogTitle>
          <DialogDescription>{t("channels.webchatModalDesc")}</DialogDescription>
        </DialogHeader>
        <pre className="overflow-x-auto rounded-lg border bg-muted p-4 font-mono text-xs leading-relaxed" data-testid="webchat-embed-code">
          {embedCode}
        </pre>
        <DialogFooter>
          <Button onClick={handleCopy} data-testid="channels-webchat-copy-embed-button" className="w-full gap-2">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {t("channels.copyEmbed")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
