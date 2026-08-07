from fastapi.testclient import TestClient

from app.db.database import SessionLocal
from app.main import app
from app.models.exam_fee_setup.fee_head import CoeFeeHead
from app.models.exam_fee_setup.fee_head_group import CoeFeeHeadGroup, CoeFeeHeadGroupDetail


def test_coe_fee_head_group_crud():
    db = SessionLocal()
    try:
        db.query(CoeFeeHeadGroupDetail).delete()
        db.query(CoeFeeHeadGroup).delete()
        db.query(CoeFeeHead).delete()
        db.commit()
    finally:
        db.close()

    with TestClient(app) as client:
        response = client.get('/api/v1/coe/fee-head-groups')
        assert response.status_code == 200
        assert response.json()['data'] == []

        fee_head_payload = {
            'feeHeadName': 'Tuition Fee',
            'feeHeadCode': 'TF-001',
            'receiptHead': 'Tuition Collection',
            'feeCategory': 'Academic',
            'displayOrder': 1,
            'amountType': 'Fixed',
            'isRefundable': False,
            'taxApplicable': False,
            'status': 'Active',
            'description': 'Tuition fee head for tests.',
        }
        fee_head_response = client.post('/api/v1/coe/fee-heads', json=fee_head_payload)
        assert fee_head_response.status_code == 201
        fee_head_id = fee_head_response.json()['data']['id']

        payload = {
            'groupName': 'Exam Fees Group',
            'groupCode': 'EFG-001',
            'status': 'Active',
            'description': 'A test group for exam fee heads.',
            'details': [
                {
                    'name': 'Installment A',
                    'feeHeadId': fee_head_id,
                }
            ],
        }
        create_response = client.post('/api/v1/coe/fee-head-groups', json=payload)
        assert create_response.status_code == 201
        data = create_response.json()['data']
        assert data['groupName'] == 'Exam Fees Group'
        assert data['groupCode'] == 'EFG-001'
        assert data['status'] == 'Active'
        assert len(data['details']) == 1
        assert data['details'][0]['name'] == 'Installment A'
        assert data['details'][0]['feeHeadId'] == fee_head_id
        assert data['details'][0]['feeHeadName'] == 'Tuition Fee'

        duplicate_response = client.post('/api/v1/coe/fee-head-groups', json=payload)
        assert duplicate_response.status_code == 409

        list_response = client.get('/api/v1/coe/fee-head-groups')
        assert list_response.status_code == 200
        assert len(list_response.json()['data']) == 1

        group_id = data['id']
        get_response = client.get(f'/api/v1/coe/fee-head-groups/{group_id}')
        assert get_response.status_code == 200
        assert get_response.json()['data']['groupName'] == 'Exam Fees Group'
        assert len(get_response.json()['data']['details']) == 1
        assert get_response.json()['data']['details'][0]['name'] == 'Installment A'
        assert get_response.json()['data']['details'][0]['feeHeadName'] == 'Tuition Fee'

        update_payload = {'groupName': 'Updated Exam Fees Group', 'description': 'Updated description.'}
        update_response = client.put(f'/api/v1/coe/fee-head-groups/{group_id}', json=update_payload)
        assert update_response.status_code == 200
        assert update_response.json()['data']['groupName'] == 'Updated Exam Fees Group'

        status_response = client.patch(f'/api/v1/coe/fee-head-groups/{group_id}/status', params={'status_value': 'Inactive'})
        assert status_response.status_code == 200
        assert status_response.json()['data']['status'] == 'Inactive'

        delete_response = client.delete(f'/api/v1/coe/fee-head-groups/{group_id}')
        assert delete_response.status_code == 200
        assert delete_response.json()['data']['success'] is True

        get_deleted_response = client.get(f'/api/v1/coe/fee-head-groups/{group_id}')
        assert get_deleted_response.status_code == 200
        assert get_deleted_response.json()['data']['status'] == 'Inactive'
