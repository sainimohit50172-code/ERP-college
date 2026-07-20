from app.schemas.auth.schemas import MobileRegistrationCompleteRequest

data = {'mobile': '9876543211', 'password': 'Simple123', 'confirmPassword': 'Simple123'}
try:
    print(MobileRegistrationCompleteRequest.model_validate(data))
except Exception as exc:
    import traceback
    traceback.print_exc()
