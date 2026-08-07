from app.main import app


def test_exam_form_preferences_settings_route_is_registered():
    routes = {route.path for route in app.router.routes if hasattr(route, 'path')}

    assert '/api/v1/coe/exam-form-preferences/settings' in routes
