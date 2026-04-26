// Template definitions for all 4 document types (EN/JA bilingual)
// Field types: 'text' | 'date' | 'select' | 'textarea' | 'code' | 'table'

const STATUS_OPTIONS = [
  { en: 'Draft', ja: 'ドラフト' },
  { en: 'In Review', ja: 'レビュー中' },
  { en: 'Approved', ja: '承認済み' },
]

// ─── Microservice Simple ──────────────────────────────────────────────────────

const microserviceSimple = {
  id: 'microservice-simple',
  type: 'microservice',
  version: 'simple',
  titleField: 'serviceName',
  title: {
    en: 'Microservice Design Document (Simple)',
    ja: 'マイクロサービス設計書（簡易版）',
  },
  metaFields: [
    { id: 'serviceName', label: { en: 'Service Name', ja: 'サービス名' }, type: 'text', placeholder: { en: 'My Service', ja: 'マイサービス' } },
    { id: 'author',      label: { en: 'Author',       ja: '作成者' },     type: 'text', placeholder: { en: 'Your Name', ja: '名前' } },
    { id: 'date',        label: { en: 'Date',         ja: '作成日' },     type: 'date' },
    { id: 'status',      label: { en: 'Status',       ja: 'ステータス' }, type: 'select', options: STATUS_OPTIONS },
  ],
  sections: [
    {
      id: 'overview',
      title: { en: '1. Overview', ja: '1. 概要' },
      fields: [
        {
          id: 'purpose',
          title: { en: '1.1 Purpose', ja: '1.1 目的' },
          type: 'textarea',
          placeholder: { en: 'What does this service do? Why does it exist?', ja: 'このサービスは何をするか？なぜ存在するか？' },
        },
        {
          id: 'scopeIn',
          title: { en: '1.2 In Scope', ja: '1.2 対象内' },
          type: 'textarea',
          placeholder: { en: 'List what this service handles.', ja: 'このサービスが担当する範囲を列挙してください。' },
        },
        {
          id: 'scopeOut',
          title: { en: '1.2 Out of Scope', ja: '1.2 対象外' },
          type: 'textarea',
          placeholder: { en: 'List what is explicitly excluded.', ja: '明示的に除外する範囲を列挙してください。' },
        },
      ],
    },
    {
      id: 'api',
      title: { en: '2. API Design', ja: '2. API設計' },
      fields: [
        {
          id: 'apiStyle',
          title: { en: '2.1 API Style', ja: '2.1 APIスタイル' },
          type: 'textarea',
          placeholder: { en: 'REST / gRPC / GraphQL', ja: 'REST / gRPC / GraphQL' },
        },
        {
          id: 'endpoints',
          title: { en: '2.2 Endpoints', ja: '2.2 エンドポイント' },
          type: 'table',
          columns: [
            { key: 'method',      label: { en: 'Method',       ja: 'メソッド' },  placeholder: { en: 'GET',             ja: 'GET' } },
            { key: 'path',        label: { en: 'Path',         ja: 'パス' },      placeholder: { en: '/api/v1/resource', ja: '/api/v1/リソース' } },
            { key: 'description', label: { en: 'Description',  ja: '説明' },      placeholder: { en: 'Description',     ja: '説明' } },
            { key: 'auth',        label: { en: 'Auth Required', ja: '認証要否' }, placeholder: { en: 'Yes / No',        ja: '要 / 不要' } },
          ],
        },
      ],
    },
    {
      id: 'data',
      title: { en: '3. Data Design', ja: '3. データ設計' },
      fields: [
        {
          id: 'dataStore',
          title: { en: '3.1 Data Store', ja: '3.1 データストア' },
          type: 'textarea',
          placeholder: { en: 'Database name and type (e.g. PostgreSQL, MongoDB, Redis)', ja: 'データベース名と種類（例：PostgreSQL、MongoDB、Redis）' },
        },
        {
          id: 'mainEntities',
          title: { en: '3.2 Main Entities', ja: '3.2 主要エンティティ' },
          type: 'table',
          columns: [
            { key: 'entity',      label: { en: 'Entity',     ja: 'エンティティ' },    placeholder: { en: 'Entity name', ja: 'エンティティ名' } },
            { key: 'fields',      label: { en: 'Key Fields',  ja: '主要フィールド' }, placeholder: { en: 'field1, field2', ja: 'field1, field2' } },
            { key: 'description', label: { en: 'Description', ja: '説明' },           placeholder: { en: 'Purpose',      ja: '目的' } },
          ],
        },
      ],
    },
    {
      id: 'deployment',
      title: { en: '4. Deployment', ja: '4. デプロイメント' },
      fields: [
        {
          id: 'environment',
          title: { en: '4.1 Environment', ja: '4.1 環境' },
          type: 'textarea',
          placeholder: { en: 'e.g. Kubernetes (EKS), AWS Lambda, GCP Cloud Run', ja: '例：Kubernetes（EKS）、AWS Lambda、GCP Cloud Run' },
        },
        {
          id: 'infraNotes',
          title: { en: '4.2 Infrastructure Notes', ja: '4.2 インフラメモ' },
          type: 'textarea',
          placeholder: { en: 'Resource limits, scaling strategy, CI/CD pipeline summary', ja: 'リソース制限、スケーリング戦略、CI/CDパイプライン概要' },
        },
      ],
    },
    {
      id: 'notes',
      title: { en: '5. Notes & Open Questions', ja: '5. メモ・未決事項' },
      fields: [
        {
          id: 'notes',
          title: { en: 'Notes', ja: 'メモ' },
          type: 'textarea',
          placeholder: { en: 'Any relevant decisions, risks, or context.', ja: '関連する決定事項、リスク、コンテキスト。' },
        },
        {
          id: 'openQuestions',
          title: { en: 'Open Questions', ja: '未決事項' },
          type: 'table',
          columns: [
            { key: 'num',      label: { en: '#',        ja: '#' },          placeholder: { en: '1',    ja: '1' } },
            { key: 'question', label: { en: 'Question', ja: '質問' },       placeholder: { en: 'Question', ja: '質問' } },
            { key: 'status',   label: { en: 'Status',   ja: 'ステータス' }, placeholder: { en: 'Open', ja: '未決' } },
            { key: 'decision', label: { en: 'Decision', ja: '決定' },       placeholder: { en: '—',    ja: '—' } },
          ],
        },
      ],
    },
  ],
}

// ─── Microservice Full ────────────────────────────────────────────────────────

const microserviceFull = {
  id: 'microservice',
  type: 'microservice',
  version: 'full',
  titleField: 'serviceName',
  title: { en: 'Microservice Design Document', ja: 'マイクロサービス設計書' },
  metaFields: [
    { id: 'serviceName', label: { en: 'Service Name', ja: 'サービス名' }, type: 'text', placeholder: { en: 'My Service', ja: 'マイサービス' } },
    { id: 'author',      label: { en: 'Author',       ja: '作成者' },     type: 'text', placeholder: { en: 'Your Name', ja: '名前' } },
    { id: 'date',        label: { en: 'Date',         ja: '作成日' },     type: 'date' },
    { id: 'status',      label: { en: 'Status',       ja: 'ステータス' }, type: 'select', options: STATUS_OPTIONS },
    { id: 'version',     label: { en: 'Version',      ja: 'バージョン' }, type: 'text', placeholder: { en: '1.0', ja: '1.0' } },
  ],
  sections: [
    {
      id: 's1',
      title: { en: '1. Overview', ja: '1. 概要' },
      fields: [
        { id: 's1_purpose',  title: { en: '1.1 Purpose',          ja: '1.1 目的' },               type: 'textarea', placeholder: { en: 'Brief description of what this microservice does and why it exists.', ja: 'このマイクロサービスが何をするか、なぜ存在するかを簡潔に記述してください。' } },
        { id: 's1_biz',      title: { en: '1.2 Business Context', ja: '1.2 ビジネスコンテキスト' }, type: 'textarea', placeholder: { en: 'What business problem does this service solve? Which user stories or product requirements does it fulfill?', ja: 'このサービスが解決するビジネス課題は何か？どのユーザーストーリーや製品要件を満たすか？' } },
        { id: 's1_scope',    title: { en: '1.3 Scope',            ja: '1.3 スコープ' },            type: 'textarea', placeholder: { en: 'What is in scope and out of scope for this service.', ja: 'このサービスのスコープ内・スコープ外を定義してください。' } },
      ],
    },
    {
      id: 's2',
      title: { en: '2. Architecture Overview', ja: '2. アーキテクチャ概要' },
      fields: [
        { id: 's2_context',   title: { en: '2.1 System Context Diagram', ja: '2.1 システムコンテキスト図' }, type: 'textarea', placeholder: { en: 'Describe how this service fits within the overall system (C4 Level 1).', ja: 'C4レベル1ダイアグラムを説明し、このサービスがシステム全体にどう位置づけられるかを示してください。' } },
        { id: 's2_boundaries', title: { en: '2.2 Service Boundaries',     ja: '2.2 サービス境界' },          type: 'textarea', placeholder: { en: 'Define the bounded context. What domain concepts does it own?', ja: '境界づけられたコンテキストを定義してください。どのドメイン概念を所有するか？' } },
        {
          id: 's2_deps',
          title: { en: '2.3 Dependencies', ja: '2.3 依存関係' },
          type: 'table',
          columns: [
            { key: 'dep',     label: { en: 'Dependency', ja: '依存先' },  placeholder: { en: 'Service/System name', ja: 'サービス/システム名' } },
            { key: 'type',    label: { en: 'Type',       ja: '種類' },    placeholder: { en: 'Sync/Async',          ja: '同期/非同期' } },
            { key: 'purpose', label: { en: 'Purpose',    ja: '目的' },    placeholder: { en: 'Why this dependency exists', ja: 'この依存が存在する理由' } },
          ],
        },
        {
          id: 's2_consumers',
          title: { en: '2.4 Downstream Consumers', ja: '2.4 下流コンシューマ' },
          type: 'table',
          columns: [
            { key: 'consumer', label: { en: 'Consumer',      ja: 'コンシューマ' },  placeholder: { en: 'Service/Client name',   ja: 'サービス/クライアント名' } },
            { key: 'comm',     label: { en: 'Communication', ja: '通信方式' },      placeholder: { en: 'REST/gRPC/Event',       ja: 'REST/gRPC/イベント' } },
            { key: 'purpose',  label: { en: 'Purpose',       ja: '目的' },          placeholder: { en: 'What they consume',     ja: '何を消費するか' } },
          ],
        },
      ],
    },
    {
      id: 's3',
      title: { en: '3. API Design', ja: '3. API設計' },
      fields: [
        { id: 's3_style',     title: { en: '3.1 API Style',               ja: '3.1 APIスタイル' },     type: 'textarea', placeholder: { en: 'REST / gRPC / GraphQL — justify the choice.', ja: 'REST / gRPC / GraphQL — 選択の根拠を記述してください。' } },
        { id: 's3_endpoints', title: { en: '3.2 Endpoints',               ja: '3.2 エンドポイント' },  type: 'textarea', placeholder: { en: 'List endpoints with method, path, description, request/response schemas, and error codes.', ja: 'メソッド、パス、説明、リクエスト/レスポンススキーマ、エラーコードを記述してください。' } },
        { id: 's3_auth',      title: { en: '3.3 Authentication & Authorization', ja: '3.3 認証・認可' }, type: 'textarea', placeholder: { en: 'How is access controlled? JWT, API keys, OAuth2, etc.', ja: 'アクセス制御の方法は？JWT、APIキー、OAuth2など。' } },
        { id: 's3_rate',      title: { en: '3.4 Rate Limiting',           ja: '3.4 レート制限' },      type: 'textarea', placeholder: { en: 'Rate limit strategy and thresholds.', ja: 'レート制限の戦略と閾値。' } },
        { id: 's3_version',   title: { en: '3.5 Versioning Strategy',     ja: '3.5 バージョニング戦略' }, type: 'textarea', placeholder: { en: 'URL path versioning, header versioning, etc.', ja: 'URLパスバージョニング、ヘッダーバージョニングなど。' } },
      ],
    },
    {
      id: 's4',
      title: { en: '4. Data Design', ja: '4. データ設計' },
      fields: [
        { id: 's4_store', title: { en: '4.1 Data Store', ja: '4.1 データストア' }, type: 'textarea', placeholder: { en: 'Database type and justification: PostgreSQL, MongoDB, Redis, etc.', ja: 'データベースの種類と選定理由：PostgreSQL、MongoDB、Redisなど。' } },
        {
          id: 's4_model',
          title: { en: '4.2 Data Model', ja: '4.2 データモデル' },
          type: 'table',
          columns: [
            { key: 'entity',      label: { en: 'Entity',      ja: 'エンティティ' },    placeholder: { en: 'Entity name', ja: 'エンティティ名' } },
            { key: 'fields',      label: { en: 'Fields',      ja: 'フィールド' },       placeholder: { en: 'Key fields',  ja: '主要フィールド' } },
            { key: 'description', label: { en: 'Description', ja: '説明' },            placeholder: { en: 'Purpose',     ja: '目的' } },
          ],
        },
        { id: 's4_schema',    title: { en: '4.3 Schema Definition',        ja: '4.3 スキーマ定義' },          type: 'code',     placeholder: { en: '-- Table/Collection definition', ja: '-- テーブル/コレクション定義' } },
        { id: 's4_migration', title: { en: '4.4 Data Migration Strategy',  ja: '4.4 データマイグレーション戦略' }, type: 'textarea', placeholder: { en: 'How will schema changes be managed? Flyway, Alembic, etc.', ja: 'スキーマ変更の管理方法は？Flyway、Alembicなど。' } },
        { id: 's4_retention', title: { en: '4.5 Data Retention & Archival', ja: '4.5 データ保持・アーカイブ' },  type: 'textarea', placeholder: { en: 'Retention policies, archival strategy, GDPR considerations.', ja: '保持ポリシー、アーカイブ戦略、GDPR考慮事項。' } },
      ],
    },
    {
      id: 's5',
      title: { en: '5. Event-Driven Communication', ja: '5. イベント駆動通信' },
      fields: [
        {
          id: 's5_published',
          title: { en: '5.1 Events Published', ja: '5.1 発行イベント' },
          type: 'table',
          columns: [
            { key: 'event',   label: { en: 'Event Name',      ja: 'イベント名' },      placeholder: { en: 'Event name', ja: 'イベント名' } },
            { key: 'topic',   label: { en: 'Topic/Queue',     ja: 'トピック/キュー' }, placeholder: { en: 'Topic',      ja: 'トピック' } },
            { key: 'payload', label: { en: 'Payload Summary', ja: 'ペイロード概要' },  placeholder: { en: 'Key fields', ja: '主要フィールド' } },
            { key: 'trigger', label: { en: 'Trigger',         ja: 'トリガー' },        placeholder: { en: 'When emitted', ja: '発行タイミング' } },
          ],
        },
        {
          id: 's5_consumed',
          title: { en: '5.2 Events Consumed', ja: '5.2 消費イベント' },
          type: 'table',
          columns: [
            { key: 'event',   label: { en: 'Event Name',   ja: 'イベント名' },   placeholder: { en: 'Event name',         ja: 'イベント名' } },
            { key: 'source',  label: { en: 'Source',       ja: 'ソース' },       placeholder: { en: 'Source service',     ja: 'ソースサービス' } },
            { key: 'handler', label: { en: 'Handler',      ja: 'ハンドラ' },     placeholder: { en: 'Handler description', ja: 'ハンドラの説明' } },
            { key: 'effects', label: { en: 'Side Effects', ja: '副作用' },       placeholder: { en: 'What happens',       ja: '何が起きるか' } },
          ],
        },
        { id: 's5_broker',      title: { en: '5.3 Message Broker',        ja: '5.3 メッセージブローカー' }, type: 'textarea', placeholder: { en: 'Kafka, RabbitMQ, AWS SNS/SQS, etc. — justify the choice.', ja: 'Kafka、RabbitMQ、AWS SNS/SQSなど — 選択の根拠。' } },
        { id: 's5_idempotency', title: { en: '5.4 Idempotency & Ordering', ja: '5.4 冪等性と順序保証' },    type: 'textarea', placeholder: { en: 'How are duplicate messages handled? Is ordering guaranteed?', ja: '重複メッセージはどう処理されるか？順序は保証されるか？' } },
      ],
    },
    {
      id: 's6',
      title: { en: '6. Resilience & Reliability', ja: '6. レジリエンスと信頼性' },
      fields: [
        {
          id: 's6_failures',
          title: { en: '6.1 Failure Modes', ja: '6.1 障害モード' },
          type: 'table',
          columns: [
            { key: 'failure',    label: { en: 'Failure',    ja: '障害' },  placeholder: { en: 'Failure scenario',  ja: '障害シナリオ' } },
            { key: 'impact',     label: { en: 'Impact',     ja: '影響' },  placeholder: { en: 'Impact description', ja: '影響の説明' } },
            { key: 'mitigation', label: { en: 'Mitigation', ja: '緩和策' }, placeholder: { en: 'Mitigation strategy', ja: '緩和戦略' } },
          ],
        },
        { id: 's6_circuit', title: { en: '6.2 Circuit Breaker',  ja: '6.2 サーキットブレーカー' }, type: 'textarea', placeholder: { en: 'Circuit breaker configuration and fallback behavior.', ja: 'サーキットブレーカーの設定とフォールバック動作。' } },
        { id: 's6_retry',   title: { en: '6.3 Retry Strategy',   ja: '6.3 リトライ戦略' },         type: 'textarea', placeholder: { en: 'Retry policies: exponential backoff, max retries, dead letter queue.', ja: 'リトライポリシー：指数バックオフ、最大リトライ数、デッドレターキュー。' } },
        {
          id: 's6_slo',
          title: { en: '6.5 SLA / SLO', ja: '6.5 SLA / SLO' },
          type: 'table',
          columns: [
            { key: 'metric', label: { en: 'Metric', ja: 'メトリクス' }, placeholder: { en: 'Availability',  ja: '可用性' } },
            { key: 'target', label: { en: 'Target', ja: '目標値' },    placeholder: { en: 'e.g., 99.9%',   ja: '例：99.9%' } },
          ],
        },
      ],
    },
    {
      id: 's7',
      title: { en: '7. Security', ja: '7. セキュリティ' },
      fields: [
        { id: 's7_auth',       title: { en: '7.1 Authentication',    ja: '7.1 認証' },             type: 'textarea', placeholder: { en: 'Service-to-service auth: mTLS, service mesh, API gateway.', ja: 'サービス間認証：mTLS、サービスメッシュ、APIゲートウェイ。' } },
        { id: 's7_encryption', title: { en: '7.2 Data Encryption',   ja: '7.2 データ暗号化' },     type: 'textarea', placeholder: { en: 'At rest: [method]. In transit: TLS [version].', ja: '保存時：[暗号化方式]。転送時：TLS [バージョン]。' } },
        { id: 's7_secrets',    title: { en: '7.3 Secrets Management', ja: '7.3 シークレット管理' }, type: 'textarea', placeholder: { en: 'Vault, AWS Secrets Manager, K8s secrets, etc.', ja: 'Vault、AWS Secrets Manager、K8s Secretsなど。' } },
        { id: 's7_validation', title: { en: '7.4 Input Validation',  ja: '7.4 入力バリデーション' }, type: 'textarea', placeholder: { en: 'Validation strategy and libraries used.', ja: 'バリデーション戦略と使用ライブラリ。' } },
      ],
    },
    {
      id: 's8',
      title: { en: '8. Observability', ja: '8. オブザーバビリティ' },
      fields: [
        { id: 's8_logging', title: { en: '8.1 Logging', ja: '8.1 ロギング' }, type: 'textarea', placeholder: { en: 'Structured logging format, log levels, correlation IDs.', ja: '構造化ログの形式、ログレベル、コリレーションID。' } },
        {
          id: 's8_metrics',
          title: { en: '8.2 Metrics', ja: '8.2 メトリクス' },
          type: 'table',
          columns: [
            { key: 'metric',      label: { en: 'Metric',      ja: 'メトリクス' }, placeholder: { en: 'Metric name',           ja: 'メトリクス名' } },
            { key: 'type',        label: { en: 'Type',        ja: '種類' },       placeholder: { en: 'Counter/Gauge/Histogram', ja: 'Counter/Gauge/Histogram' } },
            { key: 'description', label: { en: 'Description', ja: '説明' },       placeholder: { en: 'What it measures',      ja: '何を計測するか' } },
          ],
        },
        { id: 's8_tracing', title: { en: '8.3 Tracing', ja: '8.3 トレーシング' }, type: 'textarea', placeholder: { en: 'Distributed tracing: OpenTelemetry, Jaeger, etc.', ja: '分散トレーシング：OpenTelemetry、Jaegerなど。' } },
        {
          id: 's8_alerting',
          title: { en: '8.4 Alerting', ja: '8.4 アラート' },
          type: 'table',
          columns: [
            { key: 'alert',    label: { en: 'Alert',     ja: 'アラート' },    placeholder: { en: 'Alert name',      ja: 'アラート名' } },
            { key: 'cond',     label: { en: 'Condition', ja: '条件' },        placeholder: { en: 'Trigger condition', ja: 'トリガー条件' } },
            { key: 'severity', label: { en: 'Severity',  ja: '重要度' },      placeholder: { en: 'Critical/Warning', ja: 'Critical/Warning' } },
            { key: 'runbook',  label: { en: 'Runbook',   ja: 'ランブック' },  placeholder: { en: 'Link',             ja: 'リンク' } },
          ],
        },
      ],
    },
    {
      id: 's9',
      title: { en: '9. Deployment', ja: '9. デプロイメント' },
      fields: [
        { id: 's9_infra',   title: { en: '9.1 Infrastructure',      ja: '9.1 インフラストラクチャ' }, type: 'textarea', placeholder: { en: 'Kubernetes, ECS, Lambda — describe the runtime environment.', ja: 'Kubernetes、ECS、Lambda — ランタイム環境を記述。' } },
        { id: 's9_cicd',    title: { en: '9.2 CI/CD Pipeline',      ja: '9.2 CI/CDパイプライン' },    type: 'textarea', placeholder: { en: 'Build, test, deploy stages. Tools: GitHub Actions, ArgoCD, etc.', ja: 'ビルド、テスト、デプロイのステージ。使用ツール：GitHub Actions、ArgoCDなど。' } },
        { id: 's9_config',  title: { en: '9.3 Configuration Mgmt',  ja: '9.3 構成管理' },             type: 'textarea', placeholder: { en: 'Environment variables, ConfigMaps, feature flags.', ja: '環境変数、ConfigMap、フィーチャーフラグ。' } },
        {
          id: 's9_scaling',
          title: { en: '9.4 Scaling Strategy', ja: '9.4 スケーリング戦略' },
          type: 'table',
          columns: [
            { key: 'dimension', label: { en: 'Dimension', ja: '次元' },   placeholder: { en: 'Horizontal',          ja: '水平' } },
            { key: 'strategy',  label: { en: 'Strategy',  ja: '戦略' },   placeholder: { en: 'Auto-scaling policy', ja: 'オートスケーリングポリシー' } },
            { key: 'threshold', label: { en: 'Threshold', ja: '閾値' },   placeholder: { en: 'CPU/Memory/Custom',   ja: 'CPU/メモリ/カスタム' } },
          ],
        },
        { id: 's9_rollback', title: { en: '9.5 Rollback Plan', ja: '9.5 ロールバック計画' }, type: 'textarea', placeholder: { en: 'How to roll back a failed deployment.', ja: 'デプロイ失敗時のロールバック方法。' } },
      ],
    },
    {
      id: 's10',
      title: { en: '10. Testing Strategy', ja: '10. テスト戦略' },
      fields: [
        {
          id: 's10_testing',
          title: { en: 'Test Coverage', ja: 'テストカバレッジ' },
          type: 'table',
          columns: [
            { key: 'type',  label: { en: 'Test Type', ja: 'テスト種別' }, placeholder: { en: 'Unit',             ja: 'ユニット' } },
            { key: 'scope', label: { en: 'Scope',     ja: 'スコープ' },  placeholder: { en: 'Business logic',   ja: 'ビジネスロジック' } },
            { key: 'tools', label: { en: 'Tools',     ja: 'ツール' },    placeholder: { en: 'Testing framework', ja: 'テストフレームワーク' } },
          ],
        },
      ],
    },
    {
      id: 's11',
      title: { en: '11. Migration & Rollout Plan', ja: '11. マイグレーション・ロールアウト計画' },
      fields: [
        { id: 's11_steps', title: { en: '11.1 Migration Steps', ja: '11.1 マイグレーション手順' }, type: 'textarea', placeholder: { en: 'Step-by-step plan for deploying or migrating from an existing system.', ja: '初回デプロイまたは既存システムからの移行のステップバイステップ計画。' } },
        { id: 's11_flags', title: { en: '11.2 Feature Flags',   ja: '11.2 フィーチャーフラグ' },  type: 'textarea', placeholder: { en: 'Which features are behind flags? Rollout percentages.', ja: 'フラグの対象機能は？ロールアウト割合。' } },
        {
          id: 's11_phases',
          title: { en: '11.3 Rollout Phases', ja: '11.3 ロールアウトフェーズ' },
          type: 'table',
          columns: [
            { key: 'phase',    label: { en: 'Phase',            ja: 'フェーズ' },   placeholder: { en: 'Phase 1',    ja: 'フェーズ1' } },
            { key: 'desc',     label: { en: 'Description',      ja: '説明' },       placeholder: { en: 'Description', ja: '説明' } },
            { key: 'criteria', label: { en: 'Success Criteria', ja: '成功基準' },   placeholder: { en: 'Criteria',   ja: '基準' } },
          ],
        },
      ],
    },
    {
      id: 's12',
      title: { en: '12. Open Questions & Decisions', ja: '12. 未決事項と決定事項' },
      fields: [
        {
          id: 's12_questions',
          title: { en: 'Questions', ja: '質問' },
          type: 'table',
          columns: [
            { key: 'num',      label: { en: '#',        ja: '#' },          placeholder: { en: '1',          ja: '1' } },
            { key: 'question', label: { en: 'Question', ja: '質問' },       placeholder: { en: 'Question',   ja: '質問' } },
            { key: 'status',   label: { en: 'Status',   ja: 'ステータス' }, placeholder: { en: 'Open',       ja: '未決' } },
            { key: 'decision', label: { en: 'Decision', ja: '決定' },       placeholder: { en: '—',          ja: '—' } },
            { key: 'date',     label: { en: 'Date',     ja: '日付' },       placeholder: { en: 'YYYY-MM-DD', ja: 'YYYY-MM-DD' } },
          ],
        },
      ],
    },
    {
      id: 's13',
      title: { en: '13. References', ja: '13. 参考資料' },
      fields: [
        { id: 's13_refs', title: { en: 'References', ja: '参考資料' }, type: 'textarea', placeholder: { en: '- Link to related design docs\n- Link to API specification (OpenAPI/Swagger)\n- Link to architecture diagrams', ja: '- 関連設計書へのリンク\n- API仕様書（OpenAPI/Swagger）へのリンク\n- アーキテクチャ図へのリンク' } },
      ],
    },
  ],
}

// ─── Clean Architecture Simple ───────────────────────────────────────────────

const cleanArchSimple = {
  id: 'clean-architecture-simple',
  type: 'clean-architecture',
  version: 'simple',
  titleField: 'moduleName',
  title: { en: 'Clean Architecture Design Document (Simple)', ja: 'クリーンアーキテクチャ設計書（簡易版）' },
  metaFields: [
    { id: 'moduleName', label: { en: 'Module Name', ja: 'モジュール名' },  type: 'text', placeholder: { en: 'My Module', ja: 'マイモジュール' } },
    { id: 'author',     label: { en: 'Author',      ja: '作成者' },        type: 'text', placeholder: { en: 'Your Name', ja: '名前' } },
    { id: 'date',       label: { en: 'Date',        ja: '作成日' },        type: 'date' },
    { id: 'status',     label: { en: 'Status',      ja: 'ステータス' },    type: 'select', options: STATUS_OPTIONS },
  ],
  sections: [
    {
      id: 'c1',
      title: { en: '1. Overview', ja: '1. 概要' },
      fields: [
        { id: 'c1_purpose', title: { en: '1.1 Purpose', ja: '1.1 目的' }, type: 'textarea', placeholder: { en: 'What does this module do? Why does it exist?', ja: 'このモジュールは何をするか？なぜ存在するか？' } },
      ],
    },
    {
      id: 'c2',
      title: { en: '2. Entities (Domain Layer)', ja: '2. エンティティ（ドメイン層）' },
      fields: [
        {
          id: 'c2_entities',
          title: { en: '2.1 Entities', ja: '2.1 エンティティ' },
          type: 'table',
          columns: [
            { key: 'name',       label: { en: 'Name',            ja: '名前' },     placeholder: { en: 'Entity name',                         ja: 'エンティティ名' } },
            { key: 'attributes', label: { en: 'Key Attributes',  ja: '主要属性' }, placeholder: { en: 'attr1, attr2',                        ja: 'attr1, attr2' } },
            { key: 'invariants', label: { en: 'Key Invariants',  ja: '主要不変条件' }, placeholder: { en: 'Business rule that must always be true', ja: '常に成立すべきビジネスルール' } },
          ],
        },
        {
          id: 'c2_valueObjects',
          title: { en: '2.2 Value Objects', ja: '2.2 値オブジェクト' },
          type: 'table',
          columns: [
            { key: 'name',       label: { en: 'Name',        ja: '名前' },    placeholder: { en: 'Value object name', ja: '値オブジェクト名' } },
            { key: 'desc',       label: { en: 'Description', ja: '説明' },    placeholder: { en: 'Purpose',           ja: '目的' } },
            { key: 'validation', label: { en: 'Validation',  ja: 'バリデーション' }, placeholder: { en: 'Constraints/rules', ja: '制約/ルール' } },
          ],
        },
      ],
    },
    {
      id: 'c3',
      title: { en: '3. Use Cases (Application Layer)', ja: '3. ユースケース（アプリケーション層）' },
      fields: [
        {
          id: 'c3_usecases',
          title: { en: 'Use Case Inventory', ja: 'ユースケース一覧' },
          type: 'table',
          columns: [
            { key: 'usecase', label: { en: 'Use Case', ja: 'ユースケース' }, placeholder: { en: 'UseCase name',   ja: 'ユースケース名' } },
            { key: 'actor',   label: { en: 'Actor',    ja: 'アクター' },     placeholder: { en: 'Who triggers it', ja: '誰がトリガーするか' } },
            { key: 'input',   label: { en: 'Input',    ja: '入力' },         placeholder: { en: 'Input DTO',      ja: '入力DTO' } },
            { key: 'output',  label: { en: 'Output',   ja: '出力' },         placeholder: { en: 'Output DTO',     ja: '出力DTO' } },
            { key: 'desc',    label: { en: 'Description', ja: '説明' },      placeholder: { en: 'What it does',   ja: '何をするか' } },
          ],
        },
      ],
    },
    {
      id: 'c4',
      title: { en: '4. Adapters', ja: '4. アダプタ' },
      fields: [
        {
          id: 'c4_adapters',
          title: { en: 'Adapter Inventory', ja: 'アダプタ一覧' },
          type: 'table',
          columns: [
            { key: 'type',   label: { en: 'Type',           ja: '種類' },              placeholder: { en: 'Controller/Repository/Service', ja: 'Controller/Repository/Service' } },
            { key: 'name',   label: { en: 'Name',           ja: '名前' },              placeholder: { en: 'Class name',                    ja: 'クラス名' } },
            { key: 'port',   label: { en: 'Port Interface',  ja: 'ポートインターフェース' }, placeholder: { en: 'IRepoPort',                ja: 'IRepoPort' } },
            { key: 'impl',   label: { en: 'Implementation', ja: '実装' },              placeholder: { en: 'Class name',                    ja: 'クラス名' } },
            { key: 'storage',label: { en: 'Storage / External', ja: 'ストレージ/外部' }, placeholder: { en: 'DB / External API',           ja: 'DB / 外部API' } },
          ],
        },
      ],
    },
    {
      id: 'c5',
      title: { en: '5. Notes & Open Questions', ja: '5. メモ・未決事項' },
      fields: [
        { id: 'c5_notes', title: { en: 'Notes', ja: 'メモ' }, type: 'textarea', placeholder: { en: 'Directory structure, key decisions, dependency rules summary.', ja: 'ディレクトリ構成、主要決定事項、依存性ルール概要。' } },
        {
          id: 'c5_questions',
          title: { en: 'Open Questions', ja: '未決事項' },
          type: 'table',
          columns: [
            { key: 'num',      label: { en: '#',        ja: '#' },          placeholder: { en: '1',       ja: '1' } },
            { key: 'question', label: { en: 'Question', ja: '質問' },       placeholder: { en: 'Question', ja: '質問' } },
            { key: 'status',   label: { en: 'Status',   ja: 'ステータス' }, placeholder: { en: 'Open',    ja: '未決' } },
            { key: 'decision', label: { en: 'Decision', ja: '決定' },       placeholder: { en: '—',       ja: '—' } },
          ],
        },
      ],
    },
  ],
}

// ─── Clean Architecture Full ──────────────────────────────────────────────────

const cleanArchFull = {
  id: 'clean-architecture',
  type: 'clean-architecture',
  version: 'full',
  titleField: 'moduleName',
  title: { en: 'Clean Architecture Design Document', ja: 'クリーンアーキテクチャ設計書' },
  metaFields: [
    { id: 'moduleName', label: { en: 'Module/Service Name', ja: 'モジュール/サービス名' }, type: 'text', placeholder: { en: 'My Module', ja: 'マイモジュール' } },
    { id: 'author',     label: { en: 'Author',              ja: '作成者' },               type: 'text', placeholder: { en: 'Your Name', ja: '名前' } },
    { id: 'date',       label: { en: 'Date',                ja: '作成日' },               type: 'date' },
    { id: 'status',     label: { en: 'Status',              ja: 'ステータス' },            type: 'select', options: STATUS_OPTIONS },
    { id: 'version',    label: { en: 'Version',             ja: 'バージョン' },            type: 'text', placeholder: { en: '1.0', ja: '1.0' } },
  ],
  sections: [
    {
      id: 'ca1',
      title: { en: '1. Overview', ja: '1. 概要' },
      fields: [
        { id: 'ca1_purpose', title: { en: '1.1 Purpose',          ja: '1.1 目的' },               type: 'textarea', placeholder: { en: 'What does this module/service do? Why does it exist?', ja: 'このモジュール/サービスが何をするか？なぜ存在するか？' } },
        { id: 'ca1_biz',     title: { en: '1.2 Business Context', ja: '1.2 ビジネスコンテキスト' }, type: 'textarea', placeholder: { en: 'Business problem being solved. User stories or product requirements.', ja: '解決するビジネス課題。ユーザーストーリーまたは製品要件。' } },
      ],
    },
    {
      id: 'ca3',
      title: { en: '3. Entities Layer (Domain)', ja: '3. エンティティ層（ドメイン）' },
      fields: [
        {
          id: 'ca3_models',
          title: { en: '3.1 Domain Models', ja: '3.1 ドメインモデル' },
          type: 'table',
          columns: [
            { key: 'entity',      label: { en: 'Entity',      ja: 'エンティティ' },  placeholder: { en: 'Entity name',       ja: 'エンティティ名' } },
            { key: 'description', label: { en: 'Description', ja: '説明' },          placeholder: { en: 'What it represents', ja: '何を表すか' } },
            { key: 'attributes',  label: { en: 'Key Attributes', ja: '主要属性' },   placeholder: { en: 'Key fields',        ja: '主要フィールド' } },
          ],
        },
        {
          id: 'ca3_valueObjects',
          title: { en: '3.2 Value Objects', ja: '3.2 値オブジェクト' },
          type: 'table',
          columns: [
            { key: 'name',       label: { en: 'Value Object', ja: '値オブジェクト' }, placeholder: { en: 'Value object name', ja: '値オブジェクト名' } },
            { key: 'desc',       label: { en: 'Description',  ja: '説明' },           placeholder: { en: 'Purpose',           ja: '目的' } },
            { key: 'validation', label: { en: 'Validation Rules', ja: 'バリデーションルール' }, placeholder: { en: 'Constraints', ja: '制約' } },
          ],
        },
        { id: 'ca3_rules',   title: { en: '3.3 Domain Rules / Invariants', ja: '3.3 ドメインルール / 不変条件' }, type: 'textarea', placeholder: { en: 'List business rules that entities must always satisfy.\n- Rule 1\n- Rule 2', ja: 'エンティティが常に満たすべきビジネスルールを列挙してください。\n- ルール1\n- ルール2' } },
        {
          id: 'ca3_events',
          title: { en: '3.4 Domain Events', ja: '3.4 ドメインイベント' },
          type: 'table',
          columns: [
            { key: 'event',   label: { en: 'Event',   ja: 'イベント' },  placeholder: { en: 'Event name',   ja: 'イベント名' } },
            { key: 'trigger', label: { en: 'Trigger', ja: 'トリガー' }, placeholder: { en: 'When it occurs', ja: 'いつ発生するか' } },
            { key: 'payload', label: { en: 'Payload', ja: 'ペイロード' }, placeholder: { en: 'Key data',    ja: '主要データ' } },
          ],
        },
        { id: 'ca3_entity_def', title: { en: '3.5 Entity Definition', ja: '3.5 エンティティ定義' }, type: 'code', placeholder: { en: '// Pseudocode or language-specific class definition', ja: '// 疑似コードまたは言語固有のクラス定義' } },
      ],
    },
    {
      id: 'ca4',
      title: { en: '4. Use Cases Layer (Application)', ja: '4. ユースケース層（アプリケーション）' },
      fields: [
        {
          id: 'ca4_inventory',
          title: { en: '4.1 Use Case Inventory', ja: '4.1 ユースケース一覧' },
          type: 'table',
          columns: [
            { key: 'usecase', label: { en: 'Use Case',    ja: 'ユースケース' }, placeholder: { en: 'Use case name', ja: 'ユースケース名' } },
            { key: 'input',   label: { en: 'Input',       ja: '入力' },         placeholder: { en: 'Input DTO',    ja: '入力DTO' } },
            { key: 'output',  label: { en: 'Output',      ja: '出力' },         placeholder: { en: 'Output DTO',   ja: '出力DTO' } },
            { key: 'desc',    label: { en: 'Description', ja: '説明' },         placeholder: { en: 'What it does', ja: '何をするか' } },
          ],
        },
        { id: 'ca4_detail',    title: { en: '4.2 Use Case Detail',              ja: '4.2 ユースケース詳細' },    type: 'textarea', placeholder: { en: 'Actor, preconditions, flow steps, postconditions, error cases.', ja: 'アクター、前提条件、フロー手順、事後条件、エラーケース。' } },
        { id: 'ca4_dtos',      title: { en: '4.3 Input/Output DTOs',            ja: '4.3 入力/出力DTO' },       type: 'code',     placeholder: { en: '// DTO definitions — request and response data structures', ja: '// DTO定義 — リクエストおよびレスポンスデータ構造' } },
        { id: 'ca4_repo',      title: { en: '4.4 Repository Interfaces (Ports)', ja: '4.4 リポジトリインターフェース（ポート）' }, type: 'code', placeholder: { en: '// Interface definitions for data access', ja: '// データアクセス用インターフェース定義' } },
        { id: 'ca4_ext',       title: { en: '4.5 External Service Interfaces',  ja: '4.5 外部サービスインターフェース' }, type: 'code', placeholder: { en: '// Interface definitions for external service calls', ja: '// 外部サービス呼び出し用インターフェース定義' } },
      ],
    },
    {
      id: 'ca5',
      title: { en: '5. Interface Adapters Layer', ja: '5. インターフェースアダプタ層' },
      fields: [
        {
          id: 'ca5_controllers',
          title: { en: '5.1 Controllers / Handlers', ja: '5.1 コントローラ / ハンドラ' },
          type: 'table',
          columns: [
            { key: 'controller', label: { en: 'Controller',    ja: 'コントローラ' }, placeholder: { en: 'Controller name',       ja: 'コントローラ名' } },
            { key: 'route',      label: { en: 'Route/Trigger', ja: 'ルート/トリガー' }, placeholder: { en: 'HTTP route or event', ja: 'HTTPルートまたはイベント' } },
            { key: 'usecase',    label: { en: 'Use Case',      ja: 'ユースケース' }, placeholder: { en: 'Which use case',        ja: '対応するユースケース' } },
          ],
        },
        { id: 'ca5_presenters', title: { en: '5.2 Presenters / Response Mappers', ja: '5.2 プレゼンタ / レスポンスマッパ' }, type: 'textarea', placeholder: { en: 'How domain objects are transformed into API responses or view models.', ja: 'ドメインオブジェクトをAPIレスポンスまたはビューモデルに変換する方法。' } },
        {
          id: 'ca5_repos',
          title: { en: '5.3 Repository Implementations (Adapters)', ja: '5.3 リポジトリ実装（アダプタ）' },
          type: 'table',
          columns: [
            { key: 'iface', label: { en: 'Repository Interface', ja: 'リポジトリインターフェース' }, placeholder: { en: 'Interface name', ja: 'インターフェース名' } },
            { key: 'impl',  label: { en: 'Implementation',        ja: '実装クラス' },                placeholder: { en: 'Implementation class', ja: '実装クラス名' } },
            { key: 'store', label: { en: 'Data Store',            ja: 'データストア' },              placeholder: { en: 'DB/Cache/etc.',        ja: 'DB/キャッシュなど' } },
          ],
        },
        {
          id: 'ca5_services',
          title: { en: '5.4 External Service Adapters', ja: '5.4 外部サービスアダプタ' },
          type: 'table',
          columns: [
            { key: 'iface',  label: { en: 'Service Interface', ja: 'サービスインターフェース' }, placeholder: { en: 'Interface name',  ja: 'インターフェース名' } },
            { key: 'impl',   label: { en: 'Implementation',    ja: '実装クラス' },               placeholder: { en: 'Adapter class',   ja: 'アダプタクラス名' } },
            { key: 'system', label: { en: 'External System',   ja: '外部システム' },             placeholder: { en: 'Third-party API', ja: 'サードパーティAPI' } },
          ],
        },
        { id: 'ca5_mappers', title: { en: '5.5 Mappers', ja: '5.5 マッパ' }, type: 'textarea', placeholder: { en: 'How data is mapped between layers: Domain ↔ DTO ↔ Persistence Model.', ja: '層間のデータマッピング：Domain ↔ DTO ↔ Persistence Model。' } },
      ],
    },
    {
      id: 'ca6',
      title: { en: '6. Frameworks & Drivers Layer (Infrastructure)', ja: '6. フレームワーク＆ドライバ層（インフラストラクチャ）' },
      fields: [
        { id: 'ca6_web', title: { en: '6.1 Web Framework', ja: '6.1 Webフレームワーク' }, type: 'textarea', placeholder: { en: 'Framework choice and configuration: Express, Gin, Spring Boot, etc.', ja: 'フレームワークの選択と設定：Express、Gin、Spring Bootなど。' } },
        { id: 'ca6_db',  title: { en: '6.2 Database',      ja: '6.2 データベース' },       type: 'textarea', placeholder: { en: 'Database technology, connection management, ORM/query builder.', ja: 'データベース技術、コネクション管理、ORM/クエリビルダー。' } },
        { id: 'ca6_mq',  title: { en: '6.3 Message Broker', ja: '6.3 メッセージブローカー' }, type: 'textarea', placeholder: { en: 'Event bus, message queue configuration.', ja: 'イベントバス、メッセージキュー設定。' } },
        {
          id: 'ca6_libs',
          title: { en: '6.4 External Libraries & SDKs', ja: '6.4 外部ライブラリ＆SDK' },
          type: 'table',
          columns: [
            { key: 'library', label: { en: 'Library', ja: 'ライブラリ' }, placeholder: { en: 'Library name',     ja: 'ライブラリ名' } },
            { key: 'purpose', label: { en: 'Purpose', ja: '目的' },       placeholder: { en: 'What it\'s used for', ja: '何に使用するか' } },
            { key: 'layer',   label: { en: 'Layer',   ja: '層' },         placeholder: { en: 'Which layer',      ja: 'どの層で使用するか' } },
          ],
        },
        { id: 'ca6_di', title: { en: '6.5 Dependency Injection', ja: '6.5 依存性注入' }, type: 'textarea', placeholder: { en: 'DI framework/container and wiring strategy.', ja: 'DIフレームワーク/コンテナとワイヤリング戦略。' } },
      ],
    },
    {
      id: 'ca7',
      title: { en: '7. Directory Structure', ja: '7. ディレクトリ構成' },
      fields: [
        {
          id: 'ca7_structure',
          title: { en: 'Directory Layout', ja: 'ディレクトリレイアウト' },
          type: 'code',
          placeholder: { en: 'src/\n├── domain/          # Entities Layer\n│   ├── entities/\n│   ├── value-objects/\n│   ├── events/\n│   └── errors/\n├── application/     # Use Cases Layer\n│   ├── use-cases/\n│   ├── dtos/\n│   └── ports/\n├── adapters/        # Interface Adapters Layer\n│   ├── controllers/\n│   ├── repositories/\n│   └── mappers/\n└── infrastructure/  # Frameworks & Drivers Layer\n    ├── database/\n    ├── messaging/\n    └── server/', ja: 'src/\n├── domain/          # エンティティ層\n│   ├── entities/\n│   ├── value-objects/\n│   ├── events/\n│   └── errors/\n├── application/     # ユースケース層\n│   ├── use-cases/\n│   ├── dtos/\n│   └── ports/\n├── adapters/        # インターフェースアダプタ層\n│   ├── controllers/\n│   ├── repositories/\n│   └── mappers/\n└── infrastructure/  # フレームワーク＆ドライバ層\n    ├── database/\n    ├── messaging/\n    └── server/' },
        },
      ],
    },
    {
      id: 'ca8',
      title: { en: '8. Dependency Rules & Boundaries', ja: '8. 依存性ルール＆境界' },
      fields: [
        { id: 'ca8_crossing',    title: { en: '8.2 Boundary Crossing', ja: '8.2 境界越え' },  type: 'textarea', placeholder: { en: 'How data crosses layer boundaries: DTOs, interfaces, dependency inversion.', ja: 'データが層境界を越える方法：DTO、インターフェース、依存性逆転。' } },
        { id: 'ca8_enforcement', title: { en: '8.3 Enforcement',       ja: '8.3 強制' },       type: 'textarea', placeholder: { en: 'How dependency rules are enforced: linting rules, architecture tests.', ja: '依存性ルールの強制方法：リンティングルール、アーキテクチャテスト。' } },
      ],
    },
    {
      id: 'ca9',
      title: { en: '9. Testing Strategy', ja: '9. テスト戦略' },
      fields: [
        {
          id: 'ca9_pyramid',
          title: { en: '9.1 Test Pyramid', ja: '9.1 テストピラミッド' },
          type: 'table',
          columns: [
            { key: 'layer',    label: { en: 'Layer',            ja: '層' },             placeholder: { en: 'Entities',         ja: 'エンティティ' } },
            { key: 'testType', label: { en: 'Test Type',        ja: 'テスト種別' },     placeholder: { en: 'Unit tests',       ja: 'ユニットテスト' } },
            { key: 'mocking',  label: { en: 'Mocking Strategy', ja: 'モック戦略' },     placeholder: { en: 'No mocks needed',  ja: 'モック不要' } },
          ],
        },
        { id: 'ca9_examples', title: { en: '9.2 Test Examples', ja: '9.2 テスト例' }, type: 'code', placeholder: { en: '// Example test structure for each layer', ja: '// 各層のテスト構造の例' } },
      ],
    },
    {
      id: 'ca10',
      title: { en: '10. Error Handling', ja: '10. エラーハンドリング' },
      fields: [
        { id: 'ca10_domain', title: { en: '10.1 Domain Errors',     ja: '10.1 ドメインエラー' },     type: 'textarea', placeholder: { en: 'Custom error types for business rule violations.', ja: 'ビジネスルール違反用のカスタムエラー型。' } },
        { id: 'ca10_app',    title: { en: '10.2 Application Errors', ja: '10.2 アプリケーションエラー' }, type: 'textarea', placeholder: { en: 'Use case specific errors: not found, validation failure, etc.', ja: 'ユースケース固有エラー：not found、バリデーション失敗など。' } },
        {
          id: 'ca10_translation',
          title: { en: '10.3 Error Translation', ja: '10.3 エラー変換' },
          type: 'table',
          columns: [
            { key: 'domain', label: { en: 'Domain Error', ja: 'ドメインエラー' }, placeholder: { en: 'Error type',   ja: 'エラー型' } },
            { key: 'http',   label: { en: 'HTTP Status',  ja: 'HTTPステータス' }, placeholder: { en: 'Status code', ja: 'ステータスコード' } },
            { key: 'msg',    label: { en: 'User Message', ja: 'ユーザーメッセージ' }, placeholder: { en: 'Message',  ja: 'メッセージ' } },
          ],
        },
      ],
    },
    {
      id: 'ca11',
      title: { en: '11. Cross-Cutting Concerns', ja: '11. 横断的関心事' },
      fields: [
        { id: 'ca11_logging',    title: { en: '11.1 Logging',                   ja: '11.1 ロギング' },             type: 'textarea', placeholder: { en: 'Where and how logging is implemented without violating layer boundaries.', ja: '層境界を侵害せずにロギングを実装する場所と方法。' } },
        { id: 'ca11_auth',       title: { en: '11.2 Authentication & Authorization', ja: '11.2 認証・認可' },      type: 'textarea', placeholder: { en: 'How auth is handled in the adapter layer and passed to use cases.', ja: 'アダプタ層での認証処理方法とユースケースへの伝達方法。' } },
        { id: 'ca11_validation', title: { en: '11.3 Validation',               ja: '11.3 バリデーション' },       type: 'textarea', placeholder: { en: 'Input validation at adapter layer vs. domain validation in entities.', ja: 'アダプタ層での入力バリデーションとエンティティでのドメインバリデーション。' } },
        { id: 'ca11_caching',    title: { en: '11.4 Caching',                  ja: '11.4 キャッシング' },         type: 'textarea', placeholder: { en: 'Caching strategy and where it lives in the architecture.', ja: 'キャッシング戦略とアーキテクチャ内での位置づけ。' } },
      ],
    },
    {
      id: 'ca12',
      title: { en: '12. Migration Plan', ja: '12. マイグレーション計画' },
      fields: [
        { id: 'ca12_current', title: { en: '12.1 Current State',    ja: '12.1 現状' },      type: 'textarea', placeholder: { en: 'Describe current architecture if migrating from an existing system.', ja: '既存システムから移行する場合の現状アーキテクチャを記述してください。' } },
        { id: 'ca12_target',  title: { en: '12.2 Target State',     ja: '12.2 目標状態' },  type: 'textarea', placeholder: { en: 'Describe the clean architecture target.', ja: 'クリーンアーキテクチャの目標状態を記述してください。' } },
        {
          id: 'ca12_steps',
          title: { en: '12.3 Migration Steps', ja: '12.3 移行手順' },
          type: 'table',
          columns: [
            { key: 'step',     label: { en: 'Step',        ja: '手順' },     placeholder: { en: 'Step 1',     ja: '手順1' } },
            { key: 'desc',     label: { en: 'Description', ja: '説明' },     placeholder: { en: 'Description', ja: '説明' } },
            { key: 'risk',     label: { en: 'Risk',        ja: 'リスク' },   placeholder: { en: 'Risk level', ja: 'リスクレベル' } },
            { key: 'rollback', label: { en: 'Rollback',    ja: 'ロールバック' }, placeholder: { en: 'How to rollback', ja: 'ロールバック方法' } },
          ],
        },
      ],
    },
    {
      id: 'ca13',
      title: { en: '13. Open Questions & Decisions', ja: '13. 未決事項と決定事項' },
      fields: [
        {
          id: 'ca13_questions',
          title: { en: 'Questions', ja: '質問' },
          type: 'table',
          columns: [
            { key: 'num',      label: { en: '#',        ja: '#' },          placeholder: { en: '1',          ja: '1' } },
            { key: 'question', label: { en: 'Question', ja: '質問' },       placeholder: { en: 'Question',   ja: '質問' } },
            { key: 'status',   label: { en: 'Status',   ja: 'ステータス' }, placeholder: { en: 'Open',       ja: '未決' } },
            { key: 'decision', label: { en: 'Decision', ja: '決定' },       placeholder: { en: '—',          ja: '—' } },
            { key: 'date',     label: { en: 'Date',     ja: '日付' },       placeholder: { en: 'YYYY-MM-DD', ja: 'YYYY-MM-DD' } },
          ],
        },
      ],
    },
    {
      id: 'ca14',
      title: { en: '14. References', ja: '14. 参考資料' },
      fields: [
        { id: 'ca14_refs', title: { en: 'References', ja: '参考資料' }, type: 'textarea', placeholder: { en: '- Clean Architecture — Robert C. Martin\n- Related design documents\n- API specifications', ja: '- クリーンアーキテクチャ — Robert C. Martin\n- 関連設計書\n- API仕様書' } },
      ],
    },
  ],
}

export const TEMPLATES = [
  microserviceSimple,
  microserviceFull,
  cleanArchSimple,
  cleanArchFull,
]

export function getTemplate(id) {
  return TEMPLATES.find(t => t.id === id)
}

export function getDefaultFormData(template) {
  const data = {}
  template.metaFields.forEach(f => {
    if (f.type === 'select') data[f.id] = f.options[0].en
    else if (f.type === 'date') data[f.id] = new Date().toISOString().slice(0, 10)
    else data[f.id] = ''
  })
  template.sections.forEach(section => {
    section.fields.forEach(field => {
      if (field.type === 'table') {
        data[field.id] = [Object.fromEntries(field.columns.map(c => [c.key, '']))]
      } else {
        data[field.id] = ''
      }
    })
  })
  return data
}
