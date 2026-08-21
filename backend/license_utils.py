"""
Port of /lib/license.js — license issuing, renewal and verification.
Uses symmetric secret via env var (MVP), mirroring the JS implementation.
"""
import os
import time
from datetime import datetime, timedelta, timezone

import jwt

SECRET = os.environ.get('LICENSE_SECRET', 'dev-secret-troque-em-producao')

PLAN_DEFAULT_DAYS = {
    'starter': 30,
    'pro': 30,
    'enterprise': 365,
}


def _now():
    return datetime.now(timezone.utc)


def issue_license(company_id: str, plan: str, days: int | None = None) -> dict:
    """Mirror of issueLicense({companyId, plan, days})."""
    duration = days if days is not None else PLAN_DEFAULT_DAYS.get(plan, 30)
    now = _now()
    expiration = now + timedelta(days=duration)

    token = jwt.encode(
        {
            'companyId': company_id,
            'plan': plan,
            'iat': int(now.timestamp()),
            'exp': int(expiration.timestamp()),
        },
        SECRET,
        algorithm='HS256',
    )

    return {
        'id': f"lic_{company_id}_{int(now.timestamp() * 1000)}",
        'companyId': company_id,
        'plan': plan,
        'status': 'active',
        'startDate': now,
        'expirationDate': expiration,
        'signedToken': token,
    }


def renew_license(existing_license: dict, plan: str | None = None) -> dict:
    """Mirror of renewLicense(existingLicense, plan).
    Extends from max(expirationDate, now) + duration days."""
    effective_plan = plan or existing_license.get('plan')
    duration = PLAN_DEFAULT_DAYS.get(effective_plan) or PLAN_DEFAULT_DAYS.get(existing_license.get('plan'), 30)

    now = _now()
    exp_date = existing_license.get('expirationDate')
    if isinstance(exp_date, str):
        exp_date = datetime.fromisoformat(exp_date)
    if exp_date is not None and exp_date.tzinfo is None:
        exp_date = exp_date.replace(tzinfo=timezone.utc)

    base = exp_date if (exp_date and exp_date > now) else now
    new_expiration = base + timedelta(days=duration)

    token = jwt.encode(
        {
            'companyId': existing_license['companyId'],
            'plan': effective_plan,
            'iat': int(now.timestamp()),
            'exp': int(new_expiration.timestamp()),
        },
        SECRET,
        algorithm='HS256',
    )

    renewed = dict(existing_license)
    renewed.update({
        'plan': effective_plan,
        'status': 'active',
        'expirationDate': new_expiration,
        'signedToken': token,
    })
    return renewed


def verify_license(token: str) -> dict:
    """Mirror of verifyLicense(token)."""
    try:
        payload = jwt.decode(token, SECRET, algorithms=['HS256'])
        return {'valid': True, 'payload': payload}
    except jwt.ExpiredSignatureError as err:
        return {'valid': False, 'error': 'jwt expired'}
    except Exception as err:
        return {'valid': False, 'error': str(err)}


def get_license_status(license_doc: dict | None) -> str:
    """Mirror of getLicenseStatus(license)."""
    if not license_doc:
        return 'expired'
    now = _now()
    exp = license_doc.get('expirationDate')
    if isinstance(exp, str):
        exp = datetime.fromisoformat(exp)
    if exp is not None and exp.tzinfo is None:
        exp = exp.replace(tzinfo=timezone.utc)
    if exp and exp < now:
        return 'expired'
    return license_doc.get('status') or 'active'
