import json
import os
import hashlib
import psycopg2


def handler(event: dict, context) -> dict:
    """Регистрация и вход пользователей PLAYERS LIVE. action=register|login"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Username',
                'Access-Control-Max-Age': '86400',
            },
            'body': '',
        }

    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}

    if method != 'POST':
        return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Метод не поддерживается'})}

    body = json.loads(event.get('body') or '{}')
    action = body.get('action')
    username = (body.get('username') or '').strip()
    password = body.get('password') or ''

    if not username or not password:
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Заполните все поля'})}

    password_hash = hashlib.sha256(password.encode()).hexdigest()
    schema = os.environ['MAIN_DB_SCHEMA']

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    try:
        cur = conn.cursor()

        if action == 'register':
            cur.execute(f'SELECT id FROM {schema}.users WHERE lower(username) = lower(%s)', (username,))
            if cur.fetchone():
                return {'statusCode': 409, 'headers': headers, 'body': json.dumps({'error': 'Такой пользователь уже существует'})}
            cur.execute(
                f'INSERT INTO {schema}.users (username, password_hash) VALUES (%s, %s) RETURNING subscribers',
                (username, password_hash),
            )
            subscribers = cur.fetchone()[0]
            conn.commit()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'username': username, 'subscribers': subscribers})}

        if action == 'login':
            cur.execute(
                f'SELECT username, subscribers FROM {schema}.users WHERE lower(username) = lower(%s) AND password_hash = %s',
                (username, password_hash),
            )
            row = cur.fetchone()
            if not row:
                return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Неверный логин или пароль'})}
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'username': row[0], 'subscribers': row[1]})}

        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Некорректное действие'})}
    finally:
        conn.close()