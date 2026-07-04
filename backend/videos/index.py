import json
import os
import psycopg2

SCHEMA = os.environ['MAIN_DB_SCHEMA']


def get_conn():
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    return conn, conn.cursor()


def handler(event: dict, context) -> dict:
    """CRUD видео PLAYERS LIVE: список всех видео, публикация нового видео, лайки"""
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

    if method == 'GET':
        conn, cur = get_conn()
        try:
            cur.execute(
                f'''
                SELECT v.id, v.author_username, v.title, v.description, v.thumbnail_url,
                       v.video_url, v.publish_at, v.created_at, v.likes_count
                FROM {SCHEMA}.videos v
                ORDER BY v.created_at DESC
                '''
            )
            rows = cur.fetchall()
            req_headers = event.get('headers') or {}
            requester = req_headers.get('X-Username') or req_headers.get('x-username')
            liked_ids = set()
            if requester:
                cur.execute(f'SELECT video_id FROM {SCHEMA}.video_likes WHERE username = %s', (requester,))
                liked_ids = {str(r[0]) for r in cur.fetchall()}

            videos = [
                {
                    'id': str(r[0]),
                    'author': r[1],
                    'title': r[2],
                    'description': r[3],
                    'thumbnail': r[4],
                    'videoUrl': r[5],
                    'publishAt': r[6].isoformat(),
                    'createdAt': r[7].isoformat(),
                    'likes': r[8],
                    'likedByMe': str(r[0]) in liked_ids,
                }
                for r in rows
            ]
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps(videos)}
        finally:
            conn.close()

    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        action = body.get('action', 'create')

        if action == 'like':
            username = body.get('username')
            video_id = body.get('videoId')
            if not username or not video_id:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Не хватает данных'})}
            conn, cur = get_conn()
            try:
                cur.execute(f'SELECT 1 FROM {SCHEMA}.video_likes WHERE video_id = %s AND username = %s', (video_id, username))
                exists = cur.fetchone()
                if exists:
                    cur.execute(f'DELETE FROM {SCHEMA}.video_likes WHERE video_id = %s AND username = %s', (video_id, username))
                    cur.execute(f'UPDATE {SCHEMA}.videos SET likes_count = likes_count - 1 WHERE id = %s RETURNING likes_count', (video_id,))
                else:
                    cur.execute(f'INSERT INTO {SCHEMA}.video_likes (video_id, username) VALUES (%s, %s)', (video_id, username))
                    cur.execute(f'UPDATE {SCHEMA}.videos SET likes_count = likes_count + 1 WHERE id = %s RETURNING likes_count', (video_id,))
                likes = cur.fetchone()[0]
                conn.commit()
                return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'likes': likes, 'liked': not exists})}
            finally:
                conn.close()

        author = body.get('author')
        title = (body.get('title') or '').strip()
        description = body.get('description') or ''
        publish_at = body.get('publishAt')
        thumbnail_url = body.get('thumbnail') or ''
        video_url = body.get('videoUrl') or ''

        if not author or not title or not video_url:
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Не хватает данных для публикации'})}

        conn, cur = get_conn()
        try:
            cur.execute(
                f'''
                INSERT INTO {SCHEMA}.videos (author_username, title, description, thumbnail_url, video_url, publish_at)
                VALUES (%s, %s, %s, %s, %s, COALESCE(%s, now()))
                RETURNING id, created_at
                ''',
                (author, title, description, thumbnail_url, video_url, publish_at),
            )
            video_id, created_at = cur.fetchone()
            conn.commit()
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'id': str(video_id), 'createdAt': created_at.isoformat()}),
            }
        finally:
            conn.close()

    return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Метод не поддерживается'})}