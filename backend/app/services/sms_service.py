from __future__ import annotations

import logging
from typing import Any

import httpx

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


async def send_otp_sms(mobile_number: str, otp: str) -> dict[str, Any]:
    """Send an OTP SMS via MSG91 or log it in dev mode.

    In local development, `SMS_DEV_MODE=true` will bypass the actual gateway and
    simply log the OTP to the backend console. This keeps testing safe without
    spending live SMS credits.
    """
    normalized_mobile = str(mobile_number or '').strip()
    normalized_otp = str(otp or '').strip()

    if not normalized_mobile or not normalized_otp:
        raise ValueError('Both mobile number and OTP are required for SMS delivery')

    msg91_auth_key = settings.msg91_auth_key.strip()
    msg91_sender_id = settings.msg91_sender_id.strip()
    msg91_template_id = settings.msg91_template_id.strip()

    if settings.sms_dev_mode or not msg91_auth_key or not msg91_sender_id:
        logger.info(
            'SMS delivery is in safe dev fallback mode for mobile %s. OTP: %s',
            normalized_mobile,
            normalized_otp,
        )
        return {
            'mode': 'dev',
            'status': 'logged',
            'provider': 'msg91',
            'mobile_number': normalized_mobile,
            'otp': normalized_otp,
            'dev_mode': True,
            'message': 'OTP logged locally; SMS skipped because the gateway is not configured for this runtime.',
        }

    message = f"Your OTP is {normalized_otp}. Please do not share it with anyone."
    endpoint = 'https://api.msg91.com/api/sendhttp.php'
    params: dict[str, str] = {
        'authkey': msg91_auth_key,
        'mobiles': normalized_mobile,
        'message': message,
        'sender': msg91_sender_id,
        'route': '4',
        'country': '91',
    }
    if msg91_template_id:
        params['DLTTemplateId'] = msg91_template_id

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(endpoint, params=params)
            response.raise_for_status()
            response_text = response.text.strip()
            if response_text and response_text.lower().startswith('success'):
                logger.info('MSG91 SMS delivery accepted for %s: %s', normalized_mobile, response_text)
                return {
                    'mode': 'live',
                    'status': 'sent',
                    'provider': 'msg91',
                    'provider_response': response_text,
                    'mobile_number': normalized_mobile,
                    'otp': normalized_otp,
                    'dev_mode': False,
                    'message': 'OTP sent successfully',
                }
            raise RuntimeError(f'MSG91 rejected the request: {response_text or "empty response"}')
    except httpx.TimeoutException as exc:
        logger.exception('MSG91 timeout while sending OTP SMS to %s', normalized_mobile)
        raise RuntimeError('SMS gateway timed out while sending OTP. Please retry.') from exc
    except httpx.HTTPError as exc:
        logger.exception('MSG91 HTTP error while sending OTP SMS to %s', normalized_mobile)
        raise RuntimeError('SMS gateway request failed while sending OTP. Please retry.') from exc
