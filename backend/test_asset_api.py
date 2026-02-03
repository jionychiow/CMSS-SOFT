import requests
import json

# 登录获取新 token
login_data = {
    'username': 'admin',
    'password': 'admin123'
}

login_response = requests.post('http://127.0.0.1:8001/api/api-token-auth/', data=login_data)
print(f"Login Status: {login_response.status_code}")

if login_response.status_code == 200:
    token_data = login_response.json()
    token = token_data.get('token')
    print(f"Token: {token}")
    
    # 使用新 token 获取资产数据
    asset_uuid = "7661a2d1-dae2-41b4-a0da-529b504987c6"
    headers = {
        'Authorization': f'Token {token}',
        'Content-Type': 'application/json'
    }

    response = requests.get(f'http://127.0.0.1:8001/api/v1/assets/{asset_uuid}/', headers=headers)
    print(f"\nAsset Get Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print("Asset Data:")
        print(json.dumps(data, indent=2, ensure_ascii=False))
        # 只显示关键字段
        print("\nKey fields:")
        print(f"Phase name: {data.get('phase_name')}")
        print(f"Process name: {data.get('process_name')}")
        print(f"Production line name: {data.get('production_line_name')}")
    else:
        print(f"Error getting asset: {response.text}")
else:
    print(f"Login failed: {login_response.text}")