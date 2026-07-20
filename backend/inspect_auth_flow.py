import asyncio
from app.db.database import SessionLocal
from app.repositories.mysql.auth import MySQLAuthRepository
from app.services.auth.service import AuthService

async def main():
    db = SessionLocal()
    try:
        repo = MySQLAuthRepository(db)
        service = AuthService(repo)
        mobile_number = '9876543212'
        otp_code = None
        result = await service.send_mobile_otp(full_name='Flow User', username='flowuser', email='flow.user@example.com', mobile_number=mobile_number, role_name='Admin')
        otp_code = result.get('otp_code')
        print('send result', result)
        otp_record = await repo.get_latest_mobile_otp(mobile_number)
        print('after send', otp_record.id, otp_record.verified, otp_record.used, otp_record.expires_at)
        verify_result = await service.verify_mobile_otp(mobile_number, otp_code)
        print('verify result', verify_result)
        otp_record = await repo.get_latest_mobile_otp(mobile_number)
        print('after verify', otp_record.id, otp_record.verified, otp_record.used, otp_record.expires_at)
        try:
            complete_result = await service.complete_mobile_registration(mobile_number, 'Simple123', 'Simple123')
            print('complete result', complete_result)
        except Exception as exc:
            print('complete error', type(exc).__name__, exc)
    finally:
        db.close()

asyncio.run(main())
