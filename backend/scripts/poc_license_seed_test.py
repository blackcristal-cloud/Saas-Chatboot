"""
Phase 1 POC — validates license utils + seed logic end to end against MongoDB.
Run: cd /app/backend && python scripts/poc_license_seed_test.py
"""
import asyncio
import os
import sys
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

from motor.motor_asyncio import AsyncIOMotorClient
from license_utils import issue_license, renew_license, verify_license, get_license_status
from seed_service import run_seed


async def main():
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ['DB_NAME']]
    results = []

    def check(name, cond, extra=''):
        results.append((name, cond))
        print(f"{'PASS' if cond else 'FAIL'} - {name} {extra}")

    # 1. Seed idempotent
    r1 = await run_seed(db)
    r2 = await run_seed(db)
    check('Seed runs and is idempotent', r1 == r2 and r1['companies'] == 3)

    # 2. Counts
    check('3 companies', await db.companies.count_documents({}) == 3)
    check('3 licenses', await db.licenses.count_documents({}) == 3)
    check('15 channel configs', await db.channels_config.count_documents({}) == 15)
    check('1 sync log (c3 on-premise)', await db.sync_logs.count_documents({'companyId': 'c3'}) == 1)

    # 3. c2 expired
    lic_c2 = await db.licenses.find_one({'companyId': 'c2'})
    check('c2 license expired status', get_license_status(lic_c2) == 'expired')
    v = verify_license(lic_c2['signedToken'])
    check('c2 token verify fails (expired)', v['valid'] is False, f"error={v.get('error')}")

    # 4. c1 active
    lic_c1 = await db.licenses.find_one({'companyId': 'c1'})
    check('c1 license active', get_license_status(lic_c1) == 'active')
    v1 = verify_license(lic_c1['signedToken'])
    check('c1 token verifies', v1['valid'] and v1['payload']['companyId'] == 'c1' and v1['payload']['plan'] == 'starter')

    # 5. TikTok always pending_approval
    tiktoks = await db.channels_config.find({'channelType': 'tiktok'}).to_list(10)
    check('tiktok pending_approval for all', all(t['status'] == 'pending_approval' for t in tiktoks))

    # 6. Issue new license
    new_lic = issue_license('c9', 'enterprise')
    check('issue enterprise = 365 days', 360 < (new_lic['expirationDate'] - new_lic['startDate']).days <= 365)
    check('issued token verifies', verify_license(new_lic['signedToken'])['valid'])
    check('id format lic_c9_<ts>', new_lic['id'].startswith('lic_c9_'))

    # 7. Renew expired license -> extends from now
    renewed = renew_license(lic_c2, 'pro')
    now = datetime.now(timezone.utc)
    delta_days = (renewed['expirationDate'] - now).days
    check('renew expired extends ~30d from now', 28 <= delta_days <= 30, f"delta={delta_days}")
    check('renewed status active', renewed['status'] == 'active')
    check('renewed token verifies', verify_license(renewed['signedToken'])['valid'])

    # 8. Renew active license -> extends from expiration
    renewed_c1 = renew_license(lic_c1)
    exp_c1 = lic_c1['expirationDate']
    if exp_c1.tzinfo is None:
        exp_c1 = exp_c1.replace(tzinfo=timezone.utc)
    delta = (renewed_c1['expirationDate'] - exp_c1).days
    check('renew active extends from expiration (+30d)', 29 <= delta <= 30, f"delta={delta}")

    # 9. Tampered token invalid
    check('tampered token invalid', verify_license(lic_c1['signedToken'] + 'x')['valid'] is False)

    client.close()
    failed = [n for n, ok in results if not ok]
    print(f"\n{'='*50}\n{len(results) - len(failed)}/{len(results)} passed")
    if failed:
        print('FAILED:', failed)
        sys.exit(1)
    print('ALL POC TESTS PASSED')


asyncio.run(main())
