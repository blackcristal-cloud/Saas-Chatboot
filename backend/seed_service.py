"""
Port of /scripts/seed.js — populates demo data into MongoDB collections:
companies, licenses, channels_config, sync_logs (+ bot_config, dashboard_metrics).
Idempotent: clears and repopulates.
"""
import random
from datetime import datetime, timedelta, timezone

from license_utils import issue_license

MOCK_COMPANIES = [
    {'id': 'c1', 'name': 'Studio Bella Estética', 'niche': 'Clínica de Estética', 'deploymentType': 'cloud'},
    {'id': 'c2', 'name': 'Pousada Vista Mar', 'niche': 'Hotelaria', 'deploymentType': 'cloud'},
    {'id': 'c3', 'name': 'Grupo Imobiliário Prime', 'niche': 'Imobiliária', 'deploymentType': 'on_premise'},
]

CHANNEL_TYPES = ['whatsapp', 'instagram', 'telegram', 'webchat', 'tiktok']

DEFAULT_BOT_CONFIGS = {
    'c1': {
        'persona': 'Atendente virtual simpática e acolhedora da clínica de estética',
        'tone': 'amigavel',
        'instructions': 'Responda dúvidas sobre procedimentos estéticos, agende avaliações e informe preços básicos. Sempre incentive o agendamento de uma avaliação gratuita.',
        'faqs': [
            {'question': 'Quais procedimentos vocês oferecem?', 'answer': 'Oferecemos limpeza de pele, botox, preenchimento, drenagem linfática e depilação a laser.'},
            {'question': 'Qual o horário de funcionamento?', 'answer': 'Segunda a sexta das 9h às 19h, sábados das 9h às 14h.'},
        ],
    },
    'c2': {
        'persona': 'Concierge virtual da pousada, prestativo e detalhista',
        'tone': 'profissional',
        'instructions': 'Informe disponibilidade de quartos, preços de diárias, políticas de check-in/check-out e atrações próximas.',
        'faqs': [
            {'question': 'Qual o horário de check-in?', 'answer': 'Check-in a partir das 14h e check-out até às 12h.'},
            {'question': 'Aceitam animais de estimação?', 'answer': 'Sim, aceitamos pets de pequeno porte mediante taxa adicional.'},
        ],
    },
    'c3': {
        'persona': 'Consultor imobiliário virtual, objetivo e conhecedor do mercado',
        'tone': 'formal',
        'instructions': 'Qualifique leads perguntando tipo de imóvel, região e faixa de preço. Agende visitas com corretores.',
        'faqs': [
            {'question': 'Vocês trabalham com financiamento?', 'answer': 'Sim, temos parceria com os principais bancos para financiamento imobiliário.'},
            {'question': 'Quais regiões vocês atendem?', 'answer': 'Atendemos toda a região metropolitana e litoral norte.'},
        ],
    },
}

DASHBOARD_METRICS = {
    'c1': {'conversasTotal': 856, 'leadsTotal': 64, 'uptimePct': 99.8, 'mensagensHoje': 42, 'taxaConversao': 7.5,
           'conversasSemana': [98, 112, 87, 134, 121, 76, 58]},
    'c2': {'conversasTotal': 2103, 'leadsTotal': 178, 'uptimePct': 99.9, 'mensagensHoje': 97, 'taxaConversao': 8.5,
           'conversasSemana': [245, 289, 267, 312, 298, 340, 352]},
    'c3': {'conversasTotal': 1240, 'leadsTotal': 87, 'uptimePct': 99.4, 'mensagensHoje': 55, 'taxaConversao': 7.0,
           'conversasSemana': [156, 178, 143, 189, 167, 134, 112]},
}


async def run_seed(db) -> dict:
    now = datetime.now(timezone.utc)

    await db.companies.delete_many({})
    await db.licenses.delete_many({})
    await db.channels_config.delete_many({})
    await db.sync_logs.delete_many({})
    await db.bot_config.delete_many({})
    await db.dashboard_metrics.delete_many({})

    await db.companies.insert_many([dict(c) for c in MOCK_COMPANIES])

    for i, company in enumerate(MOCK_COMPANIES):
        plan = 'enterprise' if i == 2 else 'pro' if i == 1 else 'starter'
        license_doc = issue_license(company['id'], plan, days=-5 if i == 1 else 30)
        # força a segunda empresa a estar expirada (para testar o banner)
        if i == 1:
            license_doc['status'] = 'expired'
            license_doc['expirationDate'] = now - timedelta(days=5)
        await db.licenses.insert_one(dict(license_doc))

        for channel_type in CHANNEL_TYPES:
            status = 'pending_approval' if channel_type == 'tiktok' else ('active' if random.random() > 0.4 else 'inactive')
            await db.channels_config.insert_one({
                'companyId': company['id'],
                'channelType': channel_type,
                'status': status,
                'connectedAt': now,
                'config': {},
            })

        if company['deploymentType'] == 'on_premise':
            await db.sync_logs.insert_one({
                'companyId': company['id'],
                'serverId': f"srv_{company['id']}",
                'lastHeartbeatAt': now - timedelta(hours=2),
                'status': 'online',
                'installedVersion': 'v1.2.0',
                'aggregatedMetrics': {'conversasTotal': 1240, 'leadsTotal': 87, 'uptimePct': 99.4},
            })

        bot_cfg = dict(DEFAULT_BOT_CONFIGS[company['id']])
        bot_cfg.update({'companyId': company['id'], 'updatedAt': now})
        await db.bot_config.insert_one(bot_cfg)

        metrics = dict(DASHBOARD_METRICS[company['id']])
        metrics['companyId'] = company['id']
        await db.dashboard_metrics.insert_one(metrics)

    return {
        'companies': len(MOCK_COMPANIES),
        'licenses': len(MOCK_COMPANIES),
        'channels': len(MOCK_COMPANIES) * len(CHANNEL_TYPES),
        'syncLogs': 1,
    }
