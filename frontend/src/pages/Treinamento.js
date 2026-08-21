import React, { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Plus, Trash2, Save, Loader2, HelpCircle } from "lucide-react";

export default function Treinamento() {
  const { t, company } = useApp();
  const [config, setConfig] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!company?.id) return;
    api
      .get(`/bot-config/${company.id}`)
      .then((res) => setConfig({ persona: "", tone: "amigavel", instructions: "", faqs: [], ...res.data }))
      .catch(() => toast.error(t("common.error")));
  }, [company?.id, t]);

  const update = (field, value) => setConfig((c) => ({ ...c, [field]: value }));

  const updateFaq = (index, field, value) => {
    setConfig((c) => {
      const faqs = [...c.faqs];
      faqs[index] = { ...faqs[index], [field]: value };
      return { ...c, faqs };
    });
  };

  const addFaq = () => setConfig((c) => ({ ...c, faqs: [...c.faqs, { question: "", answer: "" }] }));
  const removeFaq = (index) => setConfig((c) => ({ ...c, faqs: c.faqs.filter((_, i) => i !== index) }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/bot-config/${company.id}`, {
        persona: config.persona,
        tone: config.tone,
        instructions: config.instructions,
        faqs: config.faqs.filter((f) => f.question.trim() || f.answer.trim()),
      });
      toast.success(t("training.saved"));
    } catch {
      toast.error(t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  if (config === null) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-[420px] rounded-xl" />
          <Skeleton className="h-[420px] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="training-page">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">{t("training.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("training.subtitle")}</p>
        </div>
        <Button onClick={handleSave} disabled={saving} data-testid="training-save-button" className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? t("common.saving") : t("common.save")}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: persona / tone / instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">{t("training.persona")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="persona">{t("training.persona")}</Label>
              <Input
                id="persona"
                value={config.persona}
                onChange={(e) => update("persona", e.target.value)}
                placeholder={t("training.personaPlaceholder")}
                data-testid="training-persona-input"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("training.tone")}</Label>
              <Select value={config.tone} onValueChange={(v) => update("tone", v)}>
                <SelectTrigger data-testid="training-tone-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="amigavel" data-testid="training-tone-amigavel">{t("training.tones.amigavel")}</SelectItem>
                  <SelectItem value="profissional" data-testid="training-tone-profissional">{t("training.tones.profissional")}</SelectItem>
                  <SelectItem value="formal" data-testid="training-tone-formal">{t("training.tones.formal")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="instructions">{t("training.instructions")}</Label>
              <Textarea
                id="instructions"
                rows={8}
                value={config.instructions}
                onChange={(e) => update("instructions", e.target.value)}
                placeholder={t("training.instructionsPlaceholder")}
                data-testid="training-instructions-textarea"
                className="resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Right: FAQs */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="font-display text-lg">{t("training.faqs")}</CardTitle>
              <CardDescription>{t("training.faqsHint")}</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={addFaq} data-testid="training-faq-add-button" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              {t("training.addFaq")}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {config.faqs.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
                <HelpCircle className="h-8 w-8 opacity-40" />
                {t("training.empty")}
              </div>
            )}
            {config.faqs.map((faq, i) => (
              <div key={i} className="space-y-2 rounded-lg border bg-muted/30 p-3" data-testid={`training-faq-item-${i}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">FAQ #{i + 1}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => removeFaq(i)}
                    data-testid={`training-faq-remove-${i}`}
                    aria-label={t("training.remove")}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <Input
                  value={faq.question}
                  onChange={(e) => updateFaq(i, "question", e.target.value)}
                  placeholder={t("training.question")}
                  data-testid={`training-faq-question-${i}`}
                />
                <Textarea
                  value={faq.answer}
                  onChange={(e) => updateFaq(i, "answer", e.target.value)}
                  placeholder={t("training.answer")}
                  rows={2}
                  data-testid={`training-faq-answer-${i}`}
                  className="resize-none"
                />
                {i < config.faqs.length - 1 && <Separator className="mt-2" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
