{
  "product": {
    "name": "Plataforma SaaS de Gestão de Chatbots (Multi-canal)",
    "audience": {
      "primary": "Pequenas empresas no Brasil (clínicas, hotéis, imobiliárias) gerenciando canais e treinamento do bot",
      "secondary": "Equipe interna (admins) gerenciando empresas/licenças e implantações"
    },
    "brand_attributes": [
      "confiável",
      "operacional (B2B)",
      "moderno",
      "calmo e legível",
      "orientado a status (conectado/expirado)",
      "premium sem parecer ‘fintech’"
    ],
    "visual_personality": {
      "style_fusion": "Swiss grid + ‘quiet luxury’ dark SaaS + micro-accent ocean/teal (sem roxo).",
      "why": "O produto é denso (tabelas, métricas, formulários). Precisamos de hierarquia forte, contraste AA, e acentos discretos para estados e CTAs."
    }
  },

  "design_tokens": {
    "notes": "Usar CSS variables (HSL) em /frontend/src/index.css. Dark é default via class .dark no html/body wrapper. Evitar fundos transparentes; cards sempre sólidos.",

    "color_system": {
      "semantic": {
        "primary": {
          "name": "Ocean Teal",
          "hsl": "175 84% 36%",
          "usage": "CTA principal, links ativos, foco (ring)"
        },
        "primary_foreground": { "hsl": "0 0% 98%" },

        "accent": {
          "name": "Sky",
          "hsl": "204 88% 56%",
          "usage": "realce secundário (gráficos, hover suave)"
        },

        "background": {
          "dark_hsl": "222 22% 8%",
          "light_hsl": "0 0% 100%",
          "usage": "fundo do app"
        },
        "surface": {
          "dark_hsl": "222 18% 11%",
          "light_hsl": "210 20% 98%",
          "usage": "cards, modais, sidebar"
        },
        "surface_2": {
          "dark_hsl": "222 16% 14%",
          "light_hsl": "0 0% 100%",
          "usage": "sub-cards, tabelas, inputs"
        },

        "foreground": {
          "dark_hsl": "210 20% 96%",
          "light_hsl": "222 22% 12%"
        },
        "muted_foreground": {
          "dark_hsl": "215 14% 70%",
          "light_hsl": "215 16% 40%"
        },

        "border": {
          "dark_hsl": "222 14% 20%",
          "light_hsl": "214 18% 88%"
        },
        "ring": {
          "dark_hsl": "175 84% 36%",
          "light_hsl": "175 84% 30%"
        },

        "success": {
          "hsl": "152 62% 38%",
          "usage": "Conectado, Ativa"
        },
        "warning": {
          "hsl": "38 92% 50%",
          "usage": "Expirando, atenção"
        },
        "danger": {
          "hsl": "0 72% 52%",
          "usage": "Expirada, erro"
        },
        "info": {
          "hsl": "204 88% 56%",
          "usage": "logs, dicas"
        }
      },

      "channel_brand_accents": {
        "rules": "Usar apenas como pequenos acentos (ícone, badge dot, borda esquerda 2px). Não usar gradientes escuros e não cobrir áreas grandes.",
        "whatsapp": { "hex": "#25D366" },
        "telegram": { "hex": "#229ED9" },
        "instagram": {
          "note": "Instagram tem gradiente de marca; aqui usar versão ‘soft’ em 1-2px border/ícone apenas.",
          "soft_gradient": "linear-gradient(135deg, #FEDA77 0%, #DD2A7B 45%, #8134AF 100%)"
        },
        "tiktok": { "hex": "#00F2EA" }
      },

      "allowed_gradients": {
        "restriction": "Gradientes só em backgrounds decorativos (hero/login) e overlays; nunca em áreas de leitura. Máx 20% viewport.",
        "hero_dark": "radial-gradient(900px circle at 20% 10%, rgba(45,212,191,0.18), transparent 55%), radial-gradient(700px circle at 80% 20%, rgba(56,189,248,0.14), transparent 55%)",
        "hero_light": "radial-gradient(900px circle at 20% 10%, rgba(45,212,191,0.14), transparent 55%), radial-gradient(700px circle at 80% 20%, rgba(56,189,248,0.12), transparent 55%)",
        "noise_overlay": "Use um pseudo-element com background-image: url(data-uri noise) ou repeating-radial-gradient muito sutil (opacity 0.06)."
      }
    },

    "typography": {
      "font_pairing": {
        "display": "Space Grotesk (600-700)",
        "body": "Inter (400-600)",
        "mono": "IBM Plex Mono (400-500)"
      },
      "google_fonts_import": "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&family=Space+Grotesk:wght@500;600;700&display=swap');",
      "scale": {
        "h1": "text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight",
        "h2": "text-base md:text-lg text-muted-foreground",
        "section_title": "text-lg font-semibold",
        "card_value": "text-2xl font-semibold tracking-tight",
        "body": "text-sm md:text-base",
        "caption": "text-xs text-muted-foreground",
        "mono_small": "font-mono text-xs"
      }
    },

    "radius_shadow": {
      "radius": {
        "card": "rounded-xl",
        "button": "rounded-lg",
        "input": "rounded-md",
        "modal": "rounded-xl"
      },
      "shadows": {
        "card_dark": "shadow-[0_1px_0_rgba(255,255,255,0.04),0_12px_30px_rgba(0,0,0,0.35)]",
        "card_light": "shadow-[0_1px_0_rgba(0,0,0,0.04),0_12px_30px_rgba(15,23,42,0.08)]",
        "focus": "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      }
    },

    "spacing_grid": {
      "grid": "Desktop 12-col (max-w-[1200px] content), Tablet 8-col, Mobile 4-col",
      "page_padding": "px-4 sm:px-6 lg:px-8",
      "vertical_rhythm": "section gap 24-32px; card gap 16-20px; form gap 12-16px",
      "sidebar": {
        "width": "w-[280px] (desktop), collapsible to icons w-[72px]",
        "mobile": "Sheet drawer"
      }
    }
  },

  "layout_and_navigation": {
    "client_panel": {
      "structure": "AppShell: fixed sidebar + top header (sticky) + main scroll area. License banner fixed no topo dentro do shell.",
      "sidebar": {
        "sections": [
          "Marca + seletor de empresa (mock)",
          "Nav: Dashboard, Treinamento, Canais",
          "Footer: Theme toggle, Language toggle"
        ],
        "active_indicator": "left border 2px primary + subtle bg accent",
        "data_density": "Use ScrollArea para sidebar se altura pequena"
      },
      "header": {
        "elements": [
          "Breadcrumb",
          "Search (Command) opcional",
          "Quick actions (ex: ‘Novo FAQ’) contextual",
          "User menu (Dropdown)"
        ]
      }
    },

    "admin_panel": {
      "visual_distinction": "Admin usa acento ‘Sky’ (azul) como primary e um background um pouco mais neutro; client usa ‘Ocean Teal’. Mantém mesma base tokens mas troca --primary via wrapper .admin-scope.",
      "structure": "AdminShell separado: sidebar mais ‘utilitária’ + header com badge ‘Admin’.",
      "pages": [
        "/admin (login mocked)",
        "/admin/empresas (table)",
        "/admin/empresas/:id (detail)",
        "/admin/licencas (form + table)"
      ]
    }
  },

  "components": {
    "component_path": {
      "shadcn_ui": {
        "button": "/app/frontend/src/components/ui/button.jsx",
        "card": "/app/frontend/src/components/ui/card.jsx",
        "badge": "/app/frontend/src/components/ui/badge.jsx",
        "table": "/app/frontend/src/components/ui/table.jsx",
        "dialog": "/app/frontend/src/components/ui/dialog.jsx",
        "alert": "/app/frontend/src/components/ui/alert.jsx",
        "sheet": "/app/frontend/src/components/ui/sheet.jsx",
        "tabs": "/app/frontend/src/components/ui/tabs.jsx",
        "switch": "/app/frontend/src/components/ui/switch.jsx",
        "dropdown_menu": "/app/frontend/src/components/ui/dropdown-menu.jsx",
        "select": "/app/frontend/src/components/ui/select.jsx",
        "textarea": "/app/frontend/src/components/ui/textarea.jsx",
        "input": "/app/frontend/src/components/ui/input.jsx",
        "separator": "/app/frontend/src/components/ui/separator.jsx",
        "scroll_area": "/app/frontend/src/components/ui/scroll-area.jsx",
        "tooltip": "/app/frontend/src/components/ui/tooltip.jsx",
        "sonner": "/app/frontend/src/components/ui/sonner.jsx"
      },
      "recommended_new_components": {
        "AppShell": "Create /app/frontend/src/components/layout/AppShell.js",
        "AdminShell": "Create /app/frontend/src/components/layout/AdminShell.js",
        "LicenseBanner": "Create /app/frontend/src/components/billing/LicenseBanner.js",
        "MetricCard": "Create /app/frontend/src/components/dashboard/MetricCard.js",
        "WeeklyConversationsChart": "Create /app/frontend/src/components/dashboard/WeeklyConversationsChart.js (Recharts)",
        "ChannelCard": "Create /app/frontend/src/components/channels/ChannelCard.js",
        "ChannelConnectModal": "Create /app/frontend/src/components/channels/ChannelConnectModal.js",
        "CompanyTable": "Create /app/frontend/src/components/admin/CompanyTable.js",
        "LicenseIssueForm": "Create /app/frontend/src/components/admin/LicenseIssueForm.js",
        "SyncLogsTimeline": "Create /app/frontend/src/components/admin/SyncLogsTimeline.js"
      }
    },

    "key_ui_patterns": {
      "license_expired_banner": {
        "placement": "fixed top inside shell; height 44-52px; pushes content via padding-top",
        "style": "solid danger background with subtle border; no gradient",
        "cta": "Button secondary/outline: ‘Falar com o suporte’",
        "data_testids": [
          "license-banner",
          "license-banner-support-button"
        ]
      },

      "dashboard": {
        "metric_cards": {
          "layout": "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
          "card": "Card with label (caption), value (card_value), delta badge",
          "micro": "hover lift: translate-y-[-1px] + shadow change (no transition:all)",
          "data_testids": [
            "dashboard-metric-total-conversations",
            "dashboard-metric-leads",
            "dashboard-metric-resolution-rate",
            "dashboard-metric-avg-response-time"
          ]
        },
        "chart": {
          "library": "Recharts",
          "style": "Area/Line chart with muted gridlines; tooltip in Card",
          "empty_state": "Skeleton + text ‘Sem dados nesta semana’",
          "data_testids": ["dashboard-weekly-conversations-chart"]
        }
      },

      "treinamento": {
        "form": {
          "layout": "2-col on lg: left (persona/tone/instructions), right (FAQs list)",
          "components": ["Form", "Input", "Textarea", "Select", "Card", "Button", "Separator"],
          "faq_list": "Use Card list with add/remove; each item has question+answer inputs",
          "data_testids": [
            "training-persona-input",
            "training-tone-select",
            "training-instructions-textarea",
            "training-faq-add-button",
            "training-save-button"
          ]
        }
      },

      "canais": {
        "grid": "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4",
        "channel_card": {
          "structure": "Header: icon + name + status badge; Body: description + last sync; Footer: Switch + ‘Configurar’ button",
          "status_badges": {
            "connected": "Badge with success dot",
            "disconnected": "Badge outline muted",
            "coming_soon": "Badge secondary + lock icon; disable actions",
            "expired": "Badge destructive"
          },
          "brand_accent": "2px left border using channel color; keep rest neutral",
          "data_testids": [
            "channels-card-whatsapp",
            "channels-card-instagram",
            "channels-card-telegram",
            "channels-card-webchat",
            "channels-card-tiktok",
            "channels-whatsapp-toggle",
            "channels-instagram-connect-button"
          ]
        },
        "modals": {
          "whatsapp": "Dialog with simulated QR code (SVG/placeholder) + instructions + ‘Já escaneei’ confirm",
          "telegram": "Dialog with Input for bot token + validate button",
          "instagram": "Dialog with simulated OAuth button (opens fake stepper)",
          "webchat": "Dialog with code block (mono) + copy button (uses navigator.clipboard)",
          "tiktok": "Disabled card with ‘Em breve’"
        }
      },

      "admin_empresas": {
        "table": {
          "components": ["Table", "Badge", "Button", "DropdownMenu"],
          "columns": ["Empresa", "Plano", "Status da licença", "Canais ativos", "Última atividade", "Ações"],
          "row_action": "View details button",
          "data_testids": [
            "admin-companies-table",
            "admin-companies-row-action"
          ]
        }
      },

      "admin_company_detail": {
        "sections": [
          "Resumo (cards)",
          "Canais ativos (badges)",
          "Deployment type (Cloud/On-Premise)",
          "Sync logs (timeline/table) com heartbeat/version"
        ],
        "data_testids": [
          "admin-company-detail",
          "admin-company-deployment-badge",
          "admin-company-sync-logs"
        ]
      },

      "admin_licencas": {
        "issue_form": {
          "components": ["Form", "Input", "Select", "Calendar", "Button"],
          "fields": ["empresa", "plano", "data_expiracao", "deployment_type"],
          "data_testids": [
            "admin-license-issue-form",
            "admin-license-issue-submit-button"
          ]
        },
        "licenses_table": {
          "action": "Confirmar Pagamento e Renovar",
          "data_testids": [
            "admin-licenses-table",
            "admin-license-renew-button"
          ]
        }
      }
    }
  },

  "motion_microinteractions": {
    "principles": [
      "Motion curto e funcional (120–220ms)",
      "Use easing: cubic-bezier(0.2, 0.8, 0.2, 1)",
      "Respeitar prefers-reduced-motion"
    ],
    "hover": {
      "cards": "hover:shadow + hover:-translate-y-[1px] (transition-shadow, transition-transform separadas)",
      "buttons": "active:scale-[0.98] + hover brightness",
      "sidebar_links": "hover bg-muted/40 + underline none"
    },
    "modals": "Dialog content: animate-in fade-in-0 zoom-in-95; overlay fade",
    "toasts": "Use Sonner para feedback de copy/connect/save"
  },

  "data_visualization": {
    "library": {
      "name": "recharts",
      "install": "npm i recharts",
      "usage": "Weekly conversations line/area chart; keep gridlines subtle using stroke with opacity 0.2"
    },
    "chart_colors": {
      "primary_line": "hsl(var(--primary))",
      "secondary_line": "hsl(var(--accent))",
      "grid": "hsl(var(--border) / 0.35)"
    }
  },

  "accessibility": {
    "requirements": [
      "WCAG AA contrast (especialmente badges e texto muted)",
      "Focus visível em todos os controles (ring)",
      "Toggles e botões com aria-label quando só ícone",
      "Não depender apenas de cor para status: sempre texto + ícone/dot",
      "Targets touch >= 44px"
    ]
  },

  "i18n_and_content": {
    "language_toggle": {
      "placement": "Sidebar footer",
      "component": "DropdownMenu ou Select",
      "data_testids": ["language-toggle"]
    },
    "tone": {
      "pt_br": "objetivo e amigável",
      "en": "clear and operational"
    },
    "status_copy": {
      "pt_br": {
        "connected": "Conectado",
        "disconnected": "Desconectado",
        "coming_soon": "Em breve",
        "expired": "Expirada",
        "active": "Ativa"
      },
      "en": {
        "connected": "Connected",
        "disconnected": "Disconnected",
        "coming_soon": "Coming soon",
        "expired": "Expired",
        "active": "Active"
      }
    }
  },

  "image_urls": {
    "login_hero_background": {
      "category": "background",
      "description": "Subtle mesh background for login split-screen (use as decorative, max 20% viewport overlay).",
      "urls": [
        "https://images.unsplash.com/photo-1557683316-973673baf926?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
        "https://images.unsplash.com/photo-1604079628040-94301bb21b91?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85"
      ]
    },
    "login_side_image": {
      "category": "photography",
      "description": "Optional image for login left panel (Brazil small business vibe). Use with dark overlay for readability.",
      "urls": [
        "https://images.pexels.com/photos/38759595/pexels-photo-38759595.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "https://images.pexels.com/photos/6775115/pexels-photo-6775115.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
      ]
    },
    "channel_abstract": {
      "category": "decorative",
      "description": "Small decorative image for empty states or onboarding card (keep subtle).",
      "urls": [
        "https://images.unsplash.com/photo-1661092133357-e50572adedc1?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85"
      ]
    }
  },

  "implementation_notes": {
    "css_variables_update": {
      "file": "/app/frontend/src/index.css",
      "instruction": "Substituir tokens default do shadcn por este sistema (mantendo nomes). Adicionar fontes no topo e setar body font-family para Inter; headings com Space Grotesk via utility class (ex: .font-display)."
    },
    "no_transparent_backgrounds": "Cards e modais sempre com bg-card/bg-popover sólidos. Evitar backdrop blur pesado.",
    "testing": {
      "rule": "Todo elemento interativo e info crítica deve ter data-testid (kebab-case).",
      "examples": [
        "data-testid=\"theme-toggle\"",
        "data-testid=\"admin-login-submit-button\"",
        "data-testid=\"channels-webchat-copy-embed-button\""
      ]
    },
    "icons": {
      "library": "lucide-react (preferencial) ou FontAwesome CDN",
      "note": "Usar ícones de marca como SVG simples/monocromático + accent color via border/dot."
    }
  },

  "instructions_to_main_agent": [
    "Atualize /frontend/src/index.css tokens para refletir Ocean Teal + Sky (sem roxo). Dark default.",
    "Crie AppShell e AdminShell com sidebar + header; mobile usa Sheet.",
    "Implemente LicenseBanner fixo no topo do client panel com CTA ‘Falar com o suporte’.",
    "Dashboard: cards + Recharts weekly chart dentro de Card; usar Skeleton em loading.",
    "Treinamento: form em duas colunas no desktop; FAQ list dinâmica com add/remove.",
    "Canais: grid de ChannelCard com Switch + status Badge + Dialogs específicos (QR/token/OAuth/copy embed). TikTok desabilitado com ‘Em breve’.",
    "Admin: tabelas densas com badges; Company detail com deployment + sync logs (timeline/table).",
    "Adicionar data-testid em TODOS os botões, toggles, inputs, links, badges de status e textos críticos (ex: status da licença).",
    "Não usar transition: all. Use transições específicas (transition-colors, transition-shadow).",
    "Sem backgrounds transparentes; use bg-card/bg-popover sólidos."
  ],

  "appendix_general_ui_ux_design_guidelines": "<General UI UX Design Guidelines>\n    - You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms\n    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text\n   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json\n\n **GRADIENT RESTRICTION RULE**\nNEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc\nNEVER use dark gradients for logo, testimonial, footer etc\nNEVER let gradients cover more than 20% of the viewport.\nNEVER apply gradients to text-heavy content or reading areas.\nNEVER use gradients on small UI elements (<100px width).\nNEVER stack multiple gradient layers in the same viewport.\n\n**ENFORCEMENT RULE:**\n    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors\n\n**How and where to use:**\n   • Section backgrounds (not content backgrounds)\n   • Hero section header content. Eg: dark to light to dark color\n   • Decorative overlays and accent elements only\n   • Hero section with 2-3 mild color\n   • Gradients creation can be done for any angle say horizontal, vertical or diagonal\n\n- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**\n\n</Font Guidelines>\n\n- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. \n   \n- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.\n\n- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.\n   \n- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly\n    Eg: - if it implies playful/energetic, choose a colorful scheme\n           - if it implies monochrome/minimal, choose a black–white/neutral scheme\n\n**Component Reuse:**\n\t- Prioritize using pre-existing components from src/components/ui when applicable\n\t- Create new components that match the style and conventions of existing components when needed\n\t- Examine existing components to understand the project's component patterns before creating new ones\n\n**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component\n\n**Best Practices:**\n\t- Use Shadcn/UI as the primary component library for consistency and accessibility\n\t- Import path: ./components/[component-name]\n\n**Export Conventions:**\n\t- Components MUST use named exports (export const ComponentName = ...)\n\t- Pages MUST use default exports (export default function PageName() {...})\n\n**Toasts:**\n  - Use `sonner` for toasts\"\n  - Sonner component are located in `/app/src/components/ui/sonner.tsx`\n\nUse 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals.\n</General UI UX Design Guidelines>"
}
