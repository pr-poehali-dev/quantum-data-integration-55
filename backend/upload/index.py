import json
import os
import uuid
import boto3


def handler(event: dict, context) -> dict:
    """Выдаёт временную ссылку для прямой загрузки файла (видео/миниатюра) в хранилище"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400',
            },
            'body': '',
        }

    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}

    if method != 'POST':
        return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Метод не поддерживается'})}

    body = json.loads(event.get('body') or '{}')
    folder = body.get('folder')
    content_type = body.get('contentType') or 'application/octet-stream'

    if folder not in ('videos', 'thumbnails'):
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Некорректная папка'})}

    ext = content_type.split('/')[1] if '/' in content_type else 'bin'
    key = f'{folder}/{uuid.uuid4()}.{ext}'

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )
    upload_url = s3.generate_presigned_url(
        'put_object',
        Params={'Bucket': 'files', 'Key': key, 'ContentType': content_type},
        ExpiresIn=3600,
    )
    public_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"

    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'uploadUrl': upload_url, 'publicUrl': public_url}),
    }
