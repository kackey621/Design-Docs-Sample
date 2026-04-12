# マイクロサービス設計ドキュメント

| フィールド | 値 |
|-------|-------|
| **サービス名** | User Relationship Service |
| **著者** | Akira Kusama |
| **日付** | 2026-04-12 |
| **ステータス** | In Review |
| **バージョン** | 1.0 |

---

## 1. 概要

### 1.1 目的
User Relationship Service は、Recerdo 内のすべての友人接続、グループメンバーシップ、および関係履歴を管理します。これは、Viejo App が古い友人との再接続を支援し、密結合したグループを維持できるようにする中核的なソーシャルグラフエンジンです。

### 1.2 ビジネスコンテキスト
Recerdo の主要な価値提案は、ユーザーが過去の関係を再発見し強化するのを支援することです。このサービスは、友人リクエストワークフロー、グループの作成・管理、および時間とともに関係がどのように進化するかを追跡します。これは従来のソーシャルメディアプラットフォームからの重要な差別化要因です。

### 1.3 スコープ
**スコープ内**: 友人リクエスト、友人リスト管理、グループ CRUD、グループメンバーシップ、関係履歴タイムライン、相互の友人発見、共有グループに基づく友人提案。

**スコープ外**: ユーザープロフィール管理 (Profile Service)、メッセージング (Chat Service)、コンテンツ・メモリ共有 (Memory Service)、プッシュ通知 (Notification Service)。

---

## 2. アーキテクチャ概要

### 2.1 システムコンテキスト図
```
┌──────────┐     REST      ┌──────────────────────┐     Kafka      ┌──────────────┐
│  Mobile  │──────────────▶│  User Relationship   │──────────────▶│ Notification │
│   App    │◀──────────────│      Service         │               │   Service    │
└──────────┘               └──────────────────────┘               └──────────────┘
                                   │        │
                              PostgreSQL   Redis
                              (primary)   (cache)
```

### 2.2 サービス境界
このサービスは**ソーシャルグラフ**境界コンテキストを所有しています:
- 友人関係 (双方向接続)
- グループエンティティおよびメンバーシップ
- 関係メタデータ (ユーザーが最初に接続された時期・方法、共有履歴マーカー)
- 友人リクエストライフサイクル (保留中、受け入れ済み、拒否済み、ブロック済み)

### 2.3 依存関係

| 依存関係 | タイプ | 目的 |
|-----------|------|---------|
| Profile Service | 同期 (REST) | 友人リストの表示名とアバターを取得 |
| Auth Service | 同期 (REST) | JWT トークンおよびユーザー権限を検証 |
| Redis | 同期 | 頻繁にアクセスされる友人リストおよびグループメンバーシップをキャッシュ |

### 2.4 ダウンストリームコンシューマー

| コンシューマー | 通信 | 目的 |
|----------|--------------|---------|
| Memory Service | イベント (Kafka) | グループメンバーシップ変更を受信して共有権限を更新 |
| Notification Service | イベント (Kafka) | 友人リクエストイベントを受信してプッシュ通知を送信 |
| Feed Service | イベント (Kafka) | 新しい接続イベントを受信してフィードアイテムを生成 |
| Mobile App | REST | 友人リスト、グループ、および関係タイムラインを表示 |

---

## 3. API 設計

### 3.1 API スタイル
REST over HTTPS。シンプルさ、広範なクライアント互換性 (iOS/Android)、および HTTP セマンティクスを使用した簡単なキャッシング のために選択されました。gRPC は検討されましたが、リクエストボリュームとペイロード複雑性がそれを正当化するほどではないため、延期されました。

### 3.2 エンドポイント

#### `POST /api/v1/friends/requests`
- **説明**: 別のユーザーに友人リクエストを送信
- **リクエスト**:
  ```json
  {
    "target_user_id": "string — リクエストを送信するユーザーの UUID",
    "message": "string (optional) — リクエストに付加される個人的なメッセージ"
  }
  ```
- **レスポンス** (`201`):
  ```json
  {
    "request_id": "string — UUID",
    "status": "pending",
    "created_at": "string — ISO 8601"
  }
  ```
- **エラーレスポンス**: `400` (自己リクエスト), `404` (ユーザーが見つかりません), `409` (既に友人またはリクエスト保留中)

#### `PUT /api/v1/friends/requests/{request_id}`
- **説明**: 友人リクエストを受け入れるか拒否
- **リクエスト**:
  ```json
  {
    "action": "accept | decline"
  }
  ```
- **レスポンス** (`200`):
  ```json
  {
    "request_id": "string",
    "status": "accepted | declined",
    "updated_at": "string — ISO 8601"
  }
  ```

#### `GET /api/v1/friends`
- **説明**: 認証済みユーザーの友人リストを取得
- **クエリパラメータ**: `page`, `limit`, `search` (名前フィルタ)
- **レスポンス** (`200`):
  ```json
  {
    "friends": [
      {
        "user_id": "string",
        "display_name": "string",
        "avatar_url": "string",
        "connected_since": "string — ISO 8601",
        "mutual_friends_count": "number"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 150 }
  }
  ```

#### `POST /api/v1/groups`
- **説明**: 新しい友人グループを作成
- **リクエスト**:
  ```json
  {
    "name": "string — グループ名 (最大 100 文字)",
    "description": "string (optional)",
    "member_ids": ["string — 初期メンバーの UUIDs"]
  }
  ```
- **レスポンス** (`201`):
  ```json
  {
    "group_id": "string",
    "name": "string",
    "created_at": "string — ISO 8601",
    "member_count": "number"
  }
  ```

#### `GET /api/v1/groups/{group_id}/members`
- **説明**: グループのメンバーをリスト
- **レスポンス** (`200`):
  ```json
  {
    "members": [
      {
        "user_id": "string",
        "display_name": "string",
        "role": "owner | admin | member",
        "joined_at": "string — ISO 8601"
      }
    ]
  }
  ```

### 3.3 認証と認可
すべてのエンドポイントには `Authorization: Bearer <token>` ヘッダーに有効な JWT が必要です。Auth Service はトークンを検証します。グループ管理操作 (グループ削除、メンバー削除) は、グループ内で `owner` または `admin` ロールが必要です。

### 3.4 レート制限
- 友人リクエスト: ユーザーあたり 1 時間に 50 件 (スパム防止)
- 読み取りエンドポイント: ユーザーあたり 1 分に 300 件
- グループ作成: ユーザーあたり 1 日に 10 件

### 3.5 バージョニング戦略
URL パスバージョニング (`/api/v1/`)。重大な変更は主要なバージョン番号を増加させます。マイナー・パッチ変更は後方互換です。

---

## 4. データ設計

### 4.1 データストア
**PostgreSQL 15** — 強い関係整合性 (友人関係は本質的に関係性がある)、ACID コンプライアンス、複雑なクエリ (相互の友人、グループ交差) への優れたサポートのために選択されました。Redis はホットな友人リストをキャッシュします。

### 4.2 データモデル

| エンティティ | フィールド | 説明 |
|--------|--------|-------------|
| friendship | id, user_id_a, user_id_b, status, created_at, updated_at | 双方向友人接続 |
| friend_request | id, sender_id, receiver_id, status, message, created_at | 友人リクエストライフサイクル |
| group | id, name, description, owner_id, created_at | 友人グループ |
| group_membership | id, group_id, user_id, role, joined_at | ロール付きグループメンバーシップ |
| relationship_event | id, user_id_a, user_id_b, event_type, metadata, created_at | 関係履歴タイムライン |

### 4.3 スキーマ定義
```sql
CREATE TABLE friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id_a UUID NOT NULL,
    user_id_b UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id_a, user_id_b),
    CHECK (user_id_a < user_id_b)  -- Canonical ordering to prevent duplicates
);

CREATE TABLE friend_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL,
    receiver_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (sender_id != receiver_id)
);

CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE group_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'member',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

CREATE TABLE relationship_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id_a UUID NOT NULL,
    user_id_b UUID NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_friendships_user_a ON friendships(user_id_a);
CREATE INDEX idx_friendships_user_b ON friendships(user_id_b);
CREATE INDEX idx_friend_requests_receiver ON friend_requests(receiver_id, status);
CREATE INDEX idx_group_memberships_user ON group_memberships(user_id);
```

### 4.4 データ移行戦略
**Flyway** でバージョン管理された SQL 移行。すべての移行は前進のみで、後方互換です。スキーマ変更は展開前に PR レビュープロセスを通じて実行されます。

### 4.5 データ保持とアーカイブ
- アクティブな友人関係: 無期限に保持
- 拒否された友人リクエスト: 90 日後にソフト削除
- 関係イベント: 3 年間保持、その後コールドストレージ (S3) にアーカイブ
- GDPR: Admin API 経由で完全なユーザーデータエクスポートおよび削除エンドポイントが利用可能

---

## 5. イベント駆動通信

### 5.1 発行されたイベント

| イベント名 | トピック | ペイロード概要 | トリガー |
|-----------|-------|-----------------|---------|
| `friend.request.sent` | `relationship-events` | sender_id, receiver_id, request_id | ユーザーが友人リクエストを送信 |
| `friend.request.accepted` | `relationship-events` | sender_id, receiver_id, friendship_id | 友人リクエストが受け入れられた |
| `friend.removed` | `relationship-events` | user_id_a, user_id_b | ユーザーが誰かを削除 |
| `group.member.added` | `group-events` | group_id, user_id, role | メンバーがグループに追加 |
| `group.member.removed` | `group-events` | group_id, user_id | メンバーがグループから削除 |

### 5.2 消費されたイベント

| イベント名 | ソース | ハンドラ | 副作用 |
|-----------|--------|---------|--------------|
| `user.deleted` | Profile Service | UserDeletionHandler | 削除されたユーザーのすべての友人関係、グループメンバーシップ、およびリクエストを削除 |
| `user.profile.updated` | Profile Service | ProfileCacheInvalidator | 友人リスト内のキャッシュされた表示名を無効化 |

### 5.3 メッセージブローカー
**Apache Kafka** — 耐久性、リプレイ機能、および高いスループットのために選択されました。関係イベントはダウンストリームサービスにとって重要で、失われてはなりません。Kafka のログ保持により、コンシューマーが遅れた場合の再処理が可能になります。

### 5.4 冪等性と順序
- 各イベントには `event_id` (UUID) と `idempotency_key` が含まれます。コンシューマーは `event_id` で重複を排除します。
- イベントは `user_id` でパーティション分割され、ユーザーごとの順序を保証します。
- コンシューマーは独自のデータストア内でオフセットチェックポイントを維持します。

---

## 6. 耐性と信頼性

### 6.1 障害モード

| 障害 | 影響 | 軽減 |
|---------|--------|-----------|
| PostgreSQL ダウン | 関係を読み書きできません | サーキットブレーカー、Redis のキャッシュされた友人リスト (古い読み取り) |
| Redis ダウン | 応答時間が遅い | グレースフルデグラデーション — PostgreSQL に直接クエリ |
| Profile Service 利用不可 | 表示名を友人リストに追加できません | ユーザー ID のみで友人リストを返す。クライアントは充実化を再試行 |
| Kafka ブローカー ダウン | イベントが発行されません | アウトボックスパターンで再試行。イベントは DB に保存され、リプレイされます |

### 6.2 サーキットブレーカー
Profile Service コールに関する Resilience4j サーキットブレーカー。5 つの連続した失敗後にオープン、30 秒後にハーフオープン。フォールバックはキャッシュまたは部分的なデータを返します。

### 6.3 再試行戦略
- 一時的な失敗: 指数バックオフ (100ms, 200ms, 400ms)、最大 3 回の再試行
- Kafka 発行の失敗: アウトボックスパターンで 5 秒ごとにバックグラウンド再試行
- 10 回の試行後に失敗したイベントのデッドレターキュー

### 6.4 ヘルスチェック
- **Liveness**: `GET /health/live` — JVM が実行されている場合は 200 を返す
- **Readiness**: `GET /health/ready` — PostgreSQL と Redis の接続性を確認

### 6.5 SLA / SLO

| メトリック | ターゲット |
|--------|--------|
| 可用性 | 99.95% |
| レイテンシ (p99) | < 150ms (読み取り), < 300ms (書き込み) |
| エラー率 | < 0.05% |

---

## 7. セキュリティ

### 7.1 認証
サービス間: Kubernetes クラスタ内で mTLS。外部: Auth Service 経由の JWT 検証。

### 7.2 データ暗号化
- **保存中**: PostgreSQL TDE (Transparent Data Encryption) 経由の AES-256
- **転送中**: TLS 1.3

### 7.3 シークレット管理
AWS Secrets Manager でデータベース認証情報と API キーを管理。Kubernetes ExternalSecrets オペレータがポッドにシークレットを同期します。

### 7.4 入力検証
すべての入力は Joi (Node.js) で検証されます。UUID は形式が確認されます。文字列の長さが強制されます。SQL インジェクションはパラメータ化クエリで防止されます。

---

## 8. 可観測性

### 8.1 ログ
Pino 経由の構造化 JSON ログ。すべてのリクエストに `correlation_id`、`user_id`、`request_path` が含まれます。ログレベル: 失敗の場合は ERROR、劣化状態の場合は WARN、リクエストライフサイクルの場合は INFO。

### 8.2 メトリクス

| メトリック | タイプ | 説明 |
|--------|------|-------------|
| `relationship_friend_requests_total` | Counter | 送信された友人リクエストの総数 |
| `relationship_active_friendships_gauge` | Gauge | アクティブな友人関係の現在数 |
| `relationship_api_latency_seconds` | Histogram | エンドポイント別の API 応答時間 |
| `relationship_cache_hit_ratio` | Gauge | Redis キャッシュヒット率 |

### 8.3 トレーシング
OpenTelemetry と Jaeger バックエンド。すべてのサービス間呼び出しがトレースされます。トレースコンテキストは W3C Trace Context ヘッダー経由で伝播されます。

### 8.4 アラート

| アラート | 条件 | 重大度 | ランブック |
|-------|-----------|----------|---------|
| 高いエラー率 | 5 分間でエラー率 > 1% | Critical | `/runbooks/relationship-high-errors.md` |
| データベース接続プール枯渇 | 利用可能な接続 < 5 | Critical | `/runbooks/relationship-db-pool.md` |
| キャッシュミス率が高い | 10 分間でミス率 > 50% | Warning | `/runbooks/relationship-cache.md` |
| Kafka ラグ増加中 | コンシューマーラグ > 10,000 | Warning | `/runbooks/relationship-kafka-lag.md` |

---

## 9. デプロイメント

### 9.1 インフラストラクチャ
Kubernetes (EKS) 最小 3 レプリカ。各ポッド: 512MB RAM、0.5 vCPU リクエスト; 1GB RAM、1 vCPU リミット。

### 9.2 CI/CD パイプライン
GitHub Actions → Docker イメージをビルド → テスト実行 → ECR にプッシュ → ArgoCD が EKS に同期。10% のトラフィックで 15 分間カナリアデプロイメント を実施した後、完全にロールアウト。

### 9.3 設定管理
- 環境固有: Kubernetes ConfigMaps
- フィーチャーフラグ: LaunchDarkly (友人提案フィーチャー、グループサイズ制限)
- シークレット: ExternalSecrets 経由の AWS Secrets Manager

### 9.4 スケーリング戦略

| ディメンション | 戦略 | 閾値 |
|-----------|----------|-----------|
| 水平 | HPA (Horizontal Pod Autoscaler) | CPU > 70% または カスタムメトリック: requests/sec > 500 |
| 垂直 | VPA 推奨事項を月次レビュー | メモリが持続的に > 80% |

### 9.5 ロールバック計画
デプロイメント後 5 分以内にヘルスチェックが失敗した場合、ArgoCD は自動ロールバックします。手動ロールバック: `argocd app rollback relationship-service`。

---

## 10. テスト戦略

| テストタイプ | スコープ | ツール |
|-----------|-------|-------|
| ユニット | ビジネスロジック、ドメインルール | Jest |
| インテグレーション | PostgreSQL クエリ、Redis キャッシング | Testcontainers + Jest |
| コントラクト | Mobile App との API コントラクト | Pact |
| E2E | 友人リクエスト → 受け入れ → グループ作成フロー | Playwright (API mode) |
| 負荷 | 1000 同時ユーザー、ピーク友人リスト読み取り | k6 |

---

## 11. 移行とロールアウト計画

### 11.1 移行ステップ
1. Flyway 経由でデータベーススキーマをデプロイ
2. フィーチャーフラグ OFF でサービスをデプロイ
3. 友人リクエストエンドポイントを有効化 (フラグ: `enable-friend-requests`)
4. グループ管理エンドポイントを有効化 (フラグ: `enable-groups`)
5. 関係履歴追跡を有効化 (フラグ: `enable-relationship-events`)

### 11.2 フィーチャーフラグ
| フラグ | デフォルト | 説明 |
|------|---------|-------------|
| `enable-friend-requests` | OFF | 友人リクエストワークフロー |
| `enable-groups` | OFF | グループの作成と管理 |
| `enable-friend-suggestions` | OFF | ML ベースの友人提案 |

### 11.3 ロールアウトフェーズ
| フェーズ | 説明 | 成功基準 |
|-------|-------------|-----------------|
| Phase 1 (Week 1) | 内部チームテスト | 重大なバグなし、p99 < 150ms |
| Phase 2 (Week 2) | ユーザーの 5% | エラー率 < 0.1%、データ不整合なし |
| Phase 3 (Week 3) | ユーザーの 50% | 安定したメトリクス、肯定的なユーザーフィードバック |
| Phase 4 (Week 4) | 100% ロールアウト | 48 時間すべての SLO を達成 |

---

## 12. 未解決の質問と決定

| # | 質問 | ステータス | 決定 | 日付 |
|---|----------|--------|----------|------|
| 1 | 「親友」ティアをサポートすべきか? | Open | — | — |
| 2 | グループの最大サイズ制限は? | Resolved | 150 メンバー (Dunbar の数) | 2026-04-10 |
| 3 | ブロック済みユーザーは相互の友人数に表示すべきか? | Resolved | いいえ — ブロック済みユーザーはすべてのクエリから除外 | 2026-04-08 |

---

## 13. 参考文献

- [Recerdo System Architecture Overview](../architecture-overview.md)
- [Profile Service Design Doc](../profile-service-design.md)
- [OpenAPI Spec — User Relationship Service](../api-specs/relationship-service.yaml)
- [Kafka Topic Registry](../infrastructure/kafka-topics.md)
