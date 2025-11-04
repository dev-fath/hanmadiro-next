# 푸시 메시지 관리 시스템

Next.js를 사용한 푸시 메시지 관리 시스템입니다.

## 주요 기능

- 푸시 토큰 관리
- 메시지 관리 (CRUD)
- 일일 자동 메시지 할당 및 발송
- 수동 푸시 발송
- 발송 기록 조회
- 회원가입 및 로그인 (NextAuth)
- 통계 및 모니터링
- 헬스체크

## 기술 스택

- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Push Service**: Firebase Cloud Messaging (FCM)
- **Scheduling**: node-cron
- **Logging**: Winston
- **Validation**: Zod
- **API Documentation**: Swagger/OpenAPI

## 시작하기

### 1. 환경변수 설정

`.env.example` 파일을 참고하여 `.env` 파일을 생성하고 필요한 환경변수를 설정하세요.

```bash
cp .env.example .env
```

필수 환경변수:
- `DATABASE_URL`: PostgreSQL 데이터베이스 연결 URL
- `NEXTAUTH_URL`: NextAuth URL
- `NEXTAUTH_SECRET`: NextAuth 시크릿 키 (최소 32자)
- `FIREBASE_PROJECT_ID`: Firebase 프로젝트 ID
- `FIREBASE_PRIVATE_KEY`: Firebase Private Key
- `FIREBASE_CLIENT_EMAIL`: Firebase Client Email
- `CRON_API_KEY`: Cron 엔드포인트 보호용 API 키

### 2. 데이터베이스 설정

```bash
# Prisma 마이그레이션 실행
npm run prisma:migrate

# Prisma Client 생성
npm run prisma:generate
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## API 문서

Swagger UI를 통해 모든 API 엔드포인트의 상세 문서를 확인할 수 있습니다:

- **Swagger UI**: http://localhost:3000/api/docs
- **Swagger JSON**: http://localhost:3000/api/docs (JSON 형식)

Swagger UI에서는 각 API의 요청/응답 형식, 파라미터, 인증 방법 등을 확인하고 직접 테스트할 수 있습니다.

## API 엔드포인트

### 인증
- `POST /api/auth/register` - 회원가입
- `GET /api/auth/users` - 회원 목록 조회 (인증 필요)

### 푸시 토큰
- `POST /api/push-tokens` - 푸시 토큰 등록
- `PUT /api/push-tokens/[id]` - 푸시 토큰 갱신 (인증 필요)

### 메시지
- `GET /api/messages` - 메시지 목록 조회 (인증 필요)
- `POST /api/messages` - 메시지 생성 (인증 필요)
- `PUT /api/messages/[id]` - 메시지 수정 (인증 필요)
- `DELETE /api/messages/[id]` - 메시지 삭제 (인증 필요)

### 푸시 발송
- `POST /api/push/send` - 수동 푸시 발송 (인증 필요)

### 발송 기록
- `GET /api/logs` - 발송 기록 조회 (인증 필요)

### 통계
- `GET /api/stats` - 통계 조회 (인증 필요)

### 헬스체크
- `GET /api/health` - 서비스 헬스체크

### Cron 작업
- `GET /api/cron/daily-assignment` - 일일 메시지 할당 (API 키 필요)
- `GET /api/cron/cleanup-tokens` - 유효하지 않은 토큰 정리 (API 키 필요)

## API 응답 형식

모든 API 응답은 다음 형식을 따릅니다:

```json
{
  "code": 200,
  "data": { ... },
  "message": "Success"
}
```

## Cron 작업 설정

서버가 시작되면 자동으로 다음 Cron 작업들이 스케줄링됩니다:

- **일일 메시지 할당**: 매일 오전 9시 (`0 9 * * *`)
- **토큰 정리**: 매일 오전 3시 (`0 3 * * *`)

수동으로 실행하려면 다음 엔드포인트를 호출할 수 있습니다:

```
GET /api/cron/daily-assignment
Header: x-api-key: {CRON_API_KEY}

GET /api/cron/cleanup-tokens
Header: x-api-key: {CRON_API_KEY}
```

참고: Cron 작업은 서버가 실행 중일 때만 작동합니다. 서버리스 환경에서는 외부 cron 서비스를 사용하여 API 엔드포인트를 호출하세요.

## 보안

- 비밀번호는 bcrypt로 해싱되어 저장됩니다
- 로그인 실패 5회 시 계정이 30분간 잠금됩니다
- Rate limiting이 적용됩니다
- 보안 헤더가 설정됩니다
- API 키로 Cron 엔드포인트가 보호됩니다

## 로깅

로그는 `logs/` 디렉토리에 일별로 저장됩니다:
- `error.log`: 에러 로그
- `app-YYYY-MM-DD.log`: 일별 로그

## 개발

```bash
# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 린트 검사
npm run lint

# Prisma Studio 실행
npm run prisma:studio
```

## 라이선스

MIT
