# Vercel 배포 가이드

이 문서는 푸시 메시지 관리 시스템을 Vercel에 배포하는 방법을 설명합니다.

## 사전 요구사항

- Vercel 계정
- GitHub/GitLab/Bitbucket 저장소 (선택사항, Vercel CLI로도 배포 가능)
- PostgreSQL 데이터베이스 (Vercel Postgres 또는 외부 데이터베이스)
- Firebase 프로젝트 및 서비스 계정 키

## 배포 단계

### 1. Vercel 프로젝트 생성

#### GitHub 연동 (권장)
1. GitHub 저장소에 코드 푸시
2. [Vercel Dashboard](https://vercel.com/dashboard) 접속
3. "Add New Project" 클릭
4. GitHub 저장소 선택
5. 프로젝트 설정 확인

#### Vercel CLI 사용
```bash
npm install -g vercel
vercel login
vercel
```

### 2. 환경변수 설정

Vercel 대시보드에서 다음 환경변수를 설정하세요:

#### 필수 환경변수

**데이터베이스**
- `DATABASE_URL`: PostgreSQL 연결 URL
  - Vercel Postgres 사용 시: 자동 생성됨
  - 외부 데이터베이스: `postgresql://user:password@host:port/database?sslmode=require`

**NextAuth**
- `NEXTAUTH_URL`: 프로덕션 URL (예: `https://your-project.vercel.app`)
- `NEXTAUTH_SECRET`: 최소 32자 이상의 랜덤 문자열
  - 생성 방법: `openssl rand -base64 32`

**Firebase**
- `FIREBASE_PROJECT_ID`: Firebase 프로젝트 ID
- `FIREBASE_PRIVATE_KEY`: Firebase 서비스 계정 Private Key (전체 키, 줄바꿈 포함)
- `FIREBASE_CLIENT_EMAIL`: Firebase 서비스 계정 이메일

**Cron 작업**
- `CRON_API_KEY`: Cron 엔드포인트 보호용 API 키 (랜덤 문자열)

#### 환경별 설정

Vercel에서는 다음 환경을 지원합니다:
- **Production**: 프로덕션 배포
- **Preview**: Pull Request 및 브랜치 배포
- **Development**: 로컬 개발 환경

각 환경에 맞게 환경변수를 설정할 수 있습니다.

### 3. 데이터베이스 마이그레이션

#### Vercel Postgres 사용 시
1. Vercel 대시보드에서 "Storage" 탭으로 이동
2. "Create Database" 클릭
3. "Postgres" 선택
4. 데이터베이스 생성 후 `DATABASE_URL` 자동 설정됨
5. 로컬에서 마이그레이션 실행:
   ```bash
   DATABASE_URL="your-vercel-postgres-url" npx prisma migrate deploy
   ```

#### 외부 데이터베이스 사용 시
1. 로컬에서 마이그레이션 실행:
   ```bash
   DATABASE_URL="your-database-url" npx prisma migrate deploy
   ```

### 4. 빌드 설정

Vercel은 `vercel.json` 파일을 자동으로 인식합니다:
- 프레임워크: Next.js (자동 감지)
- 빌드 명령어: `prisma generate && next build` (자동 실행)
- 출력 디렉토리: `.next` (자동 감지)

### 5. Cron Jobs 설정

`vercel.json` 파일에 Cron 작업이 정의되어 있습니다:
- 일일 메시지 할당: 매일 오전 9시 (KST)
- 토큰 정리: 매일 오전 3시 (KST)

Vercel은 자동으로 이 스케줄에 따라 엔드포인트를 호출합니다.

**중요**: Cron 엔드포인트는 `CRON_API_KEY`로 보호됩니다. Vercel Cron은 자동으로 인증 헤더를 추가하므로, 수동 호출 시 다음 헤더를 포함해야 합니다:
```
x-api-key: your-cron-api-key
```

### 6. 배포 확인

배포 후 다음을 확인하세요:

1. **헬스체크**: `https://your-project.vercel.app/api/health`
2. **API 문서**: `https://your-project.vercel.app/api/docs`
3. **로그**: Vercel 대시보드의 "Logs" 탭에서 확인

### 7. 도메인 설정 (선택사항)

1. Vercel 대시보드에서 "Settings" > "Domains" 이동
2. 도메인 추가
3. DNS 설정 안내에 따라 레코드 추가

## 문제 해결

### 빌드 실패

**Prisma Client 생성 실패**
- `DATABASE_URL` 환경변수가 올바르게 설정되었는지 확인
- `prisma generate` 명령어가 빌드 전에 실행되는지 확인

**타입 에러**
- TypeScript 컴파일 에러 확인
- `tsconfig.json` 설정 확인

### 런타임 에러

**환경변수 누락**
- Vercel 대시보드에서 모든 필수 환경변수가 설정되었는지 확인
- 환경변수 이름이 정확한지 확인 (대소문자 구분)

**데이터베이스 연결 실패**
- `DATABASE_URL` 형식 확인
- Vercel Postgres 사용 시 SSL 모드 확인
- 외부 데이터베이스 사용 시 방화벽 설정 확인

**Firebase 연결 실패**
- `FIREBASE_PRIVATE_KEY`에 줄바꿈 문자(`\n`)가 포함되어 있는지 확인
- Private Key가 전체 키인지 확인 (시작과 끝 라인 포함)

### Cron 작업이 실행되지 않음

- Vercel 대시보드의 "Crons" 탭에서 실행 기록 확인
- `vercel.json`의 스케줄 형식 확인 (cron 표현식)
- API 키 인증 확인

## 모니터링

### 로그 확인
- Vercel 대시보드의 "Logs" 탭에서 실시간 로그 확인
- 에러 및 경고 로그 필터링 가능

### 성능 모니터링
- Vercel 대시보드의 "Analytics" 탭에서 성능 지표 확인
- API 응답 시간, 요청 수 등 확인

### 알림 설정
- Vercel 대시보드에서 배포 실패, 에러 발생 시 알림 설정 가능

## CI/CD 통합

### GitHub Actions (선택사항)

`.github/workflows/test.yml` 파일을 생성하여 테스트 자동화:

```yaml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:run
```

## 참고 자료

- [Vercel 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [Prisma 배포 가이드](https://www.prisma.io/docs/guides/deployment)

