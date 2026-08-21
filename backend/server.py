from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from license_utils import issue_license, renew_license, verify_license, get_license_status
from seed_service import run_seed, CHANNEL_TYPES

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="SaaS Chatboot API")
api_router = APIRouter(prefix="/api")

ADMIN_EMAIL = 'admin@saas.com'
ADMIN_PASSWORD = 'admin123'


# ---------- serialization helpers ----------

def serialize(value: Any) -> Any:
    """Recursively convert Mongo docs to JSON-safe structures."""
    if isinstance(value, dict):
        return {k: serialize(v) for k, v in value.items() if k != '_id'}
    if isinstance(value, list):
        return [serialize(v) for v in value]
    if isinstance(value, datetime):
        if value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)
        return value.isoformat()
    return value


# ---------- models ----------

class AdminLoginInput(BaseModel):
    email: str
    password: str


class IssueLicenseInput(BaseModel):
    companyId: str
    plan: str
    days: Optional[int] = None


class RenewLicenseInput(BaseModel):
    plan: Optional[str] = None


class ChannelUpdateInput(BaseModel):
    status: Optional[str] = None
    config: Optional[dict] = None


class FaqItem(BaseModel):
    question: str
    answer: str


class BotConfigInput(BaseModel):
    persona: str = ''
    tone: str = 'amigavel'
    instructions: str = ''
    faqs: List[FaqItem] = []


VALID_PLANS = {'starter', 'pro', 'enterprise'}
VALID_CHANNEL_STATUSES = {'active', 'inactive', 'pending_approval'}


# ---------- basic ----------

@api_router.get("/")
async def root():
    return {"message": "SaaS Chatboot API", "status": "ok"}


@api_router.post("/seed")
async def seed():
    result = await run_seed(db)
    return {"message": "Seed concluido.", "inserted": result}


# ---------- admin auth (mocked) ----------

@api_router.post("/admin/login")
async def admin_login(body: AdminLoginInput):
    if body.email.strip().lower() == ADMIN_EMAIL and body.password == ADMIN_PASSWORD:
        return {"token": "admin-mock-token", "email": ADMIN_EMAIL, "name": "Administrador"}
    raise HTTPException(status_code=401, detail="Credenciais invalidas")


# ---------- companies ----------

@api_router.get("/companies")
async def list_companies():
    companies = await db.companies.find().to_list(200)
    result = []
    for company in companies:
        license_doc = await db.licenses.find_one({'companyId': company['id']}, sort=[('expirationDate', -1)])
        active_channels = await db.channels_config.count_documents({'companyId': company['id'], 'status': 'active'})
        entry = serialize(company)
        entry['license'] = None
        if license_doc:
            lic = serialize(license_doc)
            lic['computedStatus'] = get_license_status(license_doc)
            entry['license'] = lic
        entry['activeChannels'] = active_channels
        result.append(entry)
    return result


@api_router.get("/companies/{company_id}")
async def get_company(company_id: str):
    company = await db.companies.find_one({'id': company_id})
    if not company:
        raise HTTPException(status_code=404, detail="Empresa nao encontrada")
    license_doc = await db.licenses.find_one({'companyId': company_id}, sort=[('expirationDate', -1)])
    channels = await db.channels_config.find({'companyId': company_id}).to_list(20)
    sync_log = await db.sync_logs.find_one({'companyId': company_id}, sort=[('lastHeartbeatAt', -1)])

    result = serialize(company)
    result['license'] = None
    if license_doc:
        lic = serialize(license_doc)
        lic['computedStatus'] = get_license_status(license_doc)
        result['license'] = lic
    result['channels'] = serialize(channels)
    result['syncLog'] = serialize(sync_log) if sync_log else None
    return result


# ---------- licenses ----------

@api_router.get("/licenses")
async def list_licenses():
    licenses = await db.licenses.find().sort('startDate', -1).to_list(500)
    companies = {c['id']: c for c in await db.companies.find().to_list(200)}
    result = []
    for lic in licenses:
        entry = serialize(lic)
        entry['computedStatus'] = get_license_status(lic)
        company = companies.get(lic.get('companyId'))
        entry['companyName'] = company['name'] if company else lic.get('companyId')
        result.append(entry)
    return result


@api_router.post("/licenses")
async def create_license(body: IssueLicenseInput):
    if body.plan not in VALID_PLANS:
        raise HTTPException(status_code=400, detail=f"Plano invalido. Use: {sorted(VALID_PLANS)}")
    company = await db.companies.find_one({'id': body.companyId})
    if not company:
        raise HTTPException(status_code=404, detail="Empresa nao encontrada")
    if body.days is not None and body.days == 0:
        raise HTTPException(status_code=400, detail="Dias deve ser diferente de zero")

    license_doc = issue_license(body.companyId, body.plan, body.days)
    # replace previous licenses for this company (single active license per company)
    await db.licenses.delete_many({'companyId': body.companyId})
    await db.licenses.insert_one(dict(license_doc))

    result = serialize(license_doc)
    result['computedStatus'] = get_license_status(license_doc)
    result['companyName'] = company['name']
    return result


@api_router.post("/licenses/{license_id}/renew")
async def renew_license_route(license_id: str, body: RenewLicenseInput = RenewLicenseInput()):
    existing = await db.licenses.find_one({'id': license_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Licenca nao encontrada")
    if body.plan is not None and body.plan not in VALID_PLANS:
        raise HTTPException(status_code=400, detail=f"Plano invalido. Use: {sorted(VALID_PLANS)}")

    renewed = renew_license(existing, body.plan)
    await db.licenses.update_one(
        {'id': license_id},
        {'$set': {
            'plan': renewed['plan'],
            'status': renewed['status'],
            'expirationDate': renewed['expirationDate'],
            'signedToken': renewed['signedToken'],
        }}
    )
    company = await db.companies.find_one({'id': renewed['companyId']})
    result = serialize(renewed)
    result['computedStatus'] = get_license_status(renewed)
    result['companyName'] = company['name'] if company else renewed['companyId']
    return result


@api_router.get("/license/status")
async def license_status(companyId: str = Query(...)):
    license_doc = await db.licenses.find_one({'companyId': companyId}, sort=[('expirationDate', -1)])
    if not license_doc:
        return {"companyId": companyId, "status": "expired", "valid": False, "error": "Nenhuma licenca encontrada"}

    verification = verify_license(license_doc.get('signedToken', ''))
    status = get_license_status(license_doc)
    if not verification['valid']:
        status = 'expired'

    return {
        "companyId": companyId,
        "status": status,
        "valid": verification['valid'],
        "plan": license_doc.get('plan'),
        "expirationDate": serialize(license_doc.get('expirationDate')),
        "error": verification.get('error'),
    }


# ---------- channels ----------

@api_router.get("/channels/{company_id}")
async def get_channels(company_id: str):
    channels = await db.channels_config.find({'companyId': company_id}).to_list(20)
    existing_types = {c['channelType'] for c in channels}
    # guarantee all channel types exist
    for channel_type in CHANNEL_TYPES:
        if channel_type not in existing_types:
            doc = {
                'companyId': company_id,
                'channelType': channel_type,
                'status': 'pending_approval' if channel_type == 'tiktok' else 'inactive',
                'connectedAt': None,
                'config': {},
            }
            await db.channels_config.insert_one(dict(doc))
            channels.append(doc)
    order = {t: i for i, t in enumerate(CHANNEL_TYPES)}
    channels.sort(key=lambda c: order.get(c['channelType'], 99))
    return serialize(channels)


@api_router.put("/channels/{company_id}/{channel_type}")
async def update_channel(company_id: str, channel_type: str, body: ChannelUpdateInput):
    if channel_type not in CHANNEL_TYPES:
        raise HTTPException(status_code=400, detail=f"Canal invalido. Use: {CHANNEL_TYPES}")
    if channel_type == 'tiktok':
        raise HTTPException(status_code=400, detail="TikTok esta em breve / sujeito a aprovacao e nao pode ser alterado")
    if body.status is not None and body.status not in VALID_CHANNEL_STATUSES:
        raise HTTPException(status_code=400, detail=f"Status invalido. Use: {sorted(VALID_CHANNEL_STATUSES)}")

    update: dict = {}
    if body.status is not None:
        update['status'] = body.status
        if body.status == 'active':
            update['connectedAt'] = datetime.now(timezone.utc)
    if body.config is not None:
        existing = await db.channels_config.find_one({'companyId': company_id, 'channelType': channel_type})
        merged = dict((existing or {}).get('config') or {})
        merged.update(body.config)
        update['config'] = merged

    if not update:
        raise HTTPException(status_code=400, detail="Nada para atualizar")

    await db.channels_config.update_one(
        {'companyId': company_id, 'channelType': channel_type},
        {'$set': update, '$setOnInsert': {'companyId': company_id, 'channelType': channel_type}},
        upsert=True,
    )
    doc = await db.channels_config.find_one({'companyId': company_id, 'channelType': channel_type})
    return serialize(doc)


# ---------- bot config (Treinamento) ----------

@api_router.get("/bot-config/{company_id}")
async def get_bot_config(company_id: str):
    doc = await db.bot_config.find_one({'companyId': company_id})
    if not doc:
        return {"companyId": company_id, "persona": "", "tone": "amigavel", "instructions": "", "faqs": []}
    return serialize(doc)


@api_router.put("/bot-config/{company_id}")
async def update_bot_config(company_id: str, body: BotConfigInput):
    doc = body.model_dump()
    doc['companyId'] = company_id
    doc['updatedAt'] = datetime.now(timezone.utc)
    await db.bot_config.update_one({'companyId': company_id}, {'$set': doc}, upsert=True)
    saved = await db.bot_config.find_one({'companyId': company_id})
    return serialize(saved)


# ---------- dashboard ----------

@api_router.get("/dashboard/{company_id}")
async def get_dashboard(company_id: str):
    metrics = await db.dashboard_metrics.find_one({'companyId': company_id})
    if not metrics:
        return {
            "companyId": company_id,
            "conversasTotal": 0, "leadsTotal": 0, "uptimePct": 0,
            "mensagensHoje": 0, "taxaConversao": 0,
            "conversasSemana": [0, 0, 0, 0, 0, 0, 0],
        }
    return serialize(metrics)


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def auto_seed():
    """Populate demo data on first boot so screens are never empty."""
    count = await db.companies.count_documents({})
    if count == 0:
        result = await run_seed(db)
        logger.info(f"Auto-seed executado: {result}")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
