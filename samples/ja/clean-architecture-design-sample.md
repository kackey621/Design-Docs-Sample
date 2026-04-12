# クリーンアーキテクチャ設計ドキュメント

| フィールド | 値 |
|-------|-------|
| **モジュール/サービス名** | メモリ共有モジュール |
| **著者** | Akira Kusama |
| **日付** | 2026-04-12 |
| **ステータス** | レビュー中 |
| **バージョン** | 1.0 |

---

## 1. 概要

### 1.1 目的
メモリ共有モジュールは、Recerdo友人グループ内でのメモリ（写真、ストーリー、瞬間）の作成、保存、共有を処理します。これはViejoアプリの感情的な中核であり、ユーザーが懐かしいコンテンツを最も大切な人たちと共有できます。

### 1.2 ビジネスコンテキスト
Recerdoは、公開放送ではなく気の合った仲間グループ間での思い出の共有に焦点を当てることで、主流のソーシャルメディアと差別化されています。このモジュールは主要なエンゲージメントループを支えています。ユーザーがメモリを作成し、特定のグループと共有し、古い友人からのリアクションを受け取ることで、感情的なつながりが強化されます。

### 1.3 アーキテクチャの原則
このドキュメントは**クリーンアーキテクチャ**（Robert C. Martin）の原則に従っています：
- **フレームワークの独立性**: メモリのビジネスロジックはExpress、TypeORM、AWS SDKに依存しません
- **テスト可能性**: すべてのユースケースは単純なモックでテスト可能です。データベースやS3は不要です
- **UIの独立性**: 同じユースケースはモバイルREST APIと将来のウェブインターフェースの両方に対応します
- **データベースの独立性**: PostgreSQLから別のストレージへの切り替えはアダプターの変更のみで済みます
- **外部機関の独立性**: クラウドストレージ（S3）はポートインターフェースの背後に抽象化されています

---

## 2. レイヤーアーキテクチャ

### 2.1 アーキテクチャ図
```
┌─────────────────────────────────────────────────────────────────┐
│  Infrastructure: Express, PostgreSQL, S3, Kafka, Redis          │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Adapters: MemoryController, PostgresMemoryRepo, S3Storage │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │  Use Cases: CreateMemory, ShareWithGroup, AddReaction   │ │ │
│  │  │  ┌─────────────────────────────────────────────────────┐ │ │ │
│  │  │  │  Entities: Memory, SharedMemory, MemoryReaction     │ │ │ │
│  │  │  └─────────────────────────────────────────────────────┘ │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 依存関係の法則
> ソースコード依存関係は**内側のみを指す**。メモリエンティティはPostgreSQL、S3、Expressについて何も知りません。ユースケースはエンティティとポートインターフェースにのみ依存します。

---

## 3. エンティティレイヤー（ドメイン）

### 3.1 ドメインモデル

| エンティティ | 説明 | 主要属性 |
|--------|-------------|----------------|
| Memory | ユーザーのメモリ（写真、ストーリー、瞬間） | id, authorId, type, content, mediaUrls, createdAt |
| SharedMemory | 特定のグループと共有されたメモリ | id, memoryId, groupId, sharedBy, sharedAt, visibility |
| MemoryReaction | 共有されたメモリへのリアクション | id, sharedMemoryId, userId, reactionType, createdAt |

### 3.2 バリューオブジェクト

| バリューオブジェクト | 説明 | 検証ルール |
|-------------|-------------|-----------------|
| MemoryId | ユニークなメモリ識別子 | UUID形式、空でない |
| MediaUrl | アップロードされたメディアへのURL | 有効なURL形式、許可された拡張子（jpg、png、mp4、webp） |
| ReactionType | 感情的なリアクションのタイプ | 列挙値: "love", "laugh", "cry", "nostalgia", "surprise" |
| MemoryContent | メモリのテキストコンテンツ | 最大5,000文字、禁止単語なし |
| Visibility | 共有の可視性レベル | 列挙値: "group_only", "mutual_friends", "private" |

### 3.3 ドメインルール / 不変性
- メモリは次の少なくとも1つが必要：テキストコンテンツまたはメディアURL（完全に空であってはいけません）
- メモリは著者がメンバーであるグループとのみ共有できます
- ユーザーは共有されたメモリごとに1つのリアクションしか持つことができません（更新は前のリアクションを置き換えます）
- メディアURLは承認されたストレージドメインからのみ可能です（外部へのホットリンクは不可）
- メモリは共有後に編集できません（不変性は真正性を保証します）

### 3.4 ドメインイベント

| イベント | トリガー | ペイロード |
|-------|---------|---------|
| MemoryCreated | 新しいメモリが保存された | memoryId, authorId, type |
| MemoryShared | メモリがグループと共有された | sharedMemoryId, memoryId, groupId |
| ReactionAdded | ユーザーが共有メモリにリアクション | reactionId, sharedMemoryId, userId, reactionType |
| MemoryDeleted | 著者がメモリを削除 | memoryId, authorId |

### 3.5 エンティティ定義
```typescript
// domain/entities/Memory.ts
export class Memory {
  readonly id: MemoryId;
  readonly authorId: string;
  readonly type: 'photo' | 'story' | 'moment';
  readonly content: MemoryContent | null;
  readonly mediaUrls: MediaUrl[];
  readonly createdAt: Date;

  private constructor(props: MemoryProps) {
    this.validate(props);
    Object.assign(this, props);
  }

  static create(props: CreateMemoryProps): Memory {
    if (!props.content && props.mediaUrls.length === 0) {
      throw new EmptyMemoryError();
    }
    return new Memory({
      id: MemoryId.generate(),
      ...props,
      createdAt: new Date(),
    });
  }

  private validate(props: MemoryProps): void {
    if (props.mediaUrls.length > 10) {
      throw new TooManyMediaError(props.mediaUrls.length);
    }
  }

  canBeSharedBy(userId: string): boolean {
    return this.authorId === userId;
  }
}
```

---

## 4. ユースケースレイヤー（アプリケーション）

### 4.1 ユースケース一覧

| ユースケース | 入力 | 出力 | 説明 |
|----------|-------|--------|-------------|
| CreateMemory | CreateMemoryDTO | MemoryResponseDTO | オプションのメディアで新しいメモリを作成 |
| ShareWithGroup | ShareMemoryDTO | SharedMemoryResponseDTO | 既存のメモリを友人グループと共有 |
| AddReaction | AddReactionDTO | ReactionResponseDTO | 共有メモリにリアクションを追加または更新 |
| GetGroupMemories | GetGroupMemoriesDTO | PaginatedMemoriesDTO | グループの共有メモリを取得 |
| DeleteMemory | DeleteMemoryDTO | void | メモリと全ての共有をソフト削除 |

### 4.2 ユースケース詳細

#### CreateMemory
- **アクター**: 認証されたRecerdoユーザー
- **前提条件**: ユーザーが認証されている；メディアファイル（ある場合）は一時的なストレージに既にアップロードされている
- **フロー**:
  1. 入力DTO（コンテンツ長、メディアURL形式）を検証
  2. `Memory.create()`経由でMemoryエンティティを作成
  3. `StoragePort`経由でメディアを一時から永続ストレージへ移動
  4. `MemoryRepositoryPort`経由でメモリを保存
  5. `MemoryCreated`ドメインイベントを発行
  6. MemoryResponseDTOを返す
- **事後条件**: メモリが永続化され、メディアが永続ストレージに存在
- **エラーケース**:
  - 空のメモリ（コンテンツなし、メディアなし） → `EmptyMemoryError`
  - メディアファイルが多すぎる（> 10） → `TooManyMediaError`
  - ストレージ障害 → `StorageError`（メディアクリーンアップ試行）

#### ShareWithGroup
- **アクター**: 認証されたRecerdoユーザー（メモリの著者である必要があります）
- **前提条件**: メモリが存在；ユーザーが著者；ユーザーが対象グループのメンバー
- **フロー**:
  1. `MemoryRepositoryPort`経由でメモリをロード
  2. `memory.canBeSharedBy(userId)`経由で所有権を検証
  3. `GroupMembershipPort`経由でグループメンバーシップを検証
  4. SharedMemoryエンティティを作成
  5. `SharedMemoryRepositoryPort`経由で保存
  6. `MemoryShared`ドメインイベントを発行
  7. SharedMemoryResponseDTOを返す
- **事後条件**: メモリはグループメンバーに表示される
- **エラーケース**:
  - 著者でない → `UnauthorizedShareError`
  - グループメンバーでない → `NotGroupMemberError`
  - メモリが見つからない → `MemoryNotFoundError`

### 4.3 入出力DTO
```typescript
// application/dtos/CreateMemoryDTO.ts
export interface CreateMemoryDTO {
  authorId: string;
  type: 'photo' | 'story' | 'moment';
  content?: string;
  mediaUrls?: string[];
}

// application/dtos/MemoryResponseDTO.ts
export interface MemoryResponseDTO {
  id: string;
  authorId: string;
  type: string;
  content: string | null;
  mediaUrls: string[];
  createdAt: string;
}

// application/dtos/ShareMemoryDTO.ts
export interface ShareMemoryDTO {
  memoryId: string;
  groupId: string;
  sharedBy: string;
  visibility: 'group_only' | 'mutual_friends' | 'private';
}
```

### 4.4 リポジトリインターフェース（ポート）
```typescript
// application/ports/MemoryRepositoryPort.ts
export interface MemoryRepositoryPort {
  save(memory: Memory): Promise<void>;
  findById(id: MemoryId): Promise<Memory | null>;
  findByAuthor(authorId: string, pagination: Pagination): Promise<Memory[]>;
  softDelete(id: MemoryId): Promise<void>;
}

// application/ports/SharedMemoryRepositoryPort.ts
export interface SharedMemoryRepositoryPort {
  save(sharedMemory: SharedMemory): Promise<void>;
  findByGroup(groupId: string, pagination: Pagination): Promise<SharedMemory[]>;
  findByMemoryId(memoryId: MemoryId): Promise<SharedMemory[]>;
}
```

### 4.5 外部サービスインターフェース（ポート）
```typescript
// application/ports/StoragePort.ts
export interface StoragePort {
  moveToPermament(tempUrl: string): Promise<string>;  // returns permanent URL
  delete(url: string): Promise<void>;
  generateUploadUrl(fileName: string, contentType: string): Promise<string>;
}

// application/ports/GroupMembershipPort.ts
export interface GroupMembershipPort {
  isMember(userId: string, groupId: string): Promise<boolean>;
  getGroupMembers(groupId: string): Promise<string[]>;
}

// application/ports/EventPublisherPort.ts
export interface EventPublisherPort {
  publish(event: DomainEvent): Promise<void>;
}
```

---

## 5. インターフェースアダプターレイヤー

### 5.1 コントローラー / ハンドラー

| コントローラー | ルート/トリガー | ユースケース |
|-----------|--------------|----------|
| MemoryController | `POST /api/v1/memories` | CreateMemory |
| MemoryController | `POST /api/v1/memories/{id}/share` | ShareWithGroup |
| MemoryController | `GET /api/v1/groups/{groupId}/memories` | GetGroupMemories |
| ReactionController | `POST /api/v1/shared-memories/{id}/reactions` | AddReaction |
| MemoryController | `DELETE /api/v1/memories/{id}` | DeleteMemory |

### 5.2 プレゼンター / レスポンスマッパー
```typescript
// adapters/presenters/MemoryPresenter.ts
export class MemoryPresenter {
  static toResponse(memory: Memory): MemoryResponseDTO {
    return {
      id: memory.id.value,
      authorId: memory.authorId,
      type: memory.type,
      content: memory.content?.value ?? null,
      mediaUrls: memory.mediaUrls.map(url => url.value),
      createdAt: memory.createdAt.toISOString(),
    };
  }
}
```

### 5.3 リポジトリ実装（アダプター）

| リポジトリインターフェース | 実装 | データストア |
|---------------------|---------------|-----------|
| MemoryRepositoryPort | PostgresMemoryRepository | PostgreSQL |
| SharedMemoryRepositoryPort | PostgresSharedMemoryRepository | PostgreSQL |
| （キャッシュレイヤー） | RedisMemoryCacheRepository | Redis |

### 5.4 外部サービスアダプター

| サービスインターフェース | 実装 | 外部システム |
|------------------|---------------|----------------|
| StoragePort | S3StorageAdapter | AWS S3 |
| GroupMembershipPort | RelationshipServiceAdapter | ユーザーリレーションシップサービス（REST） |
| EventPublisherPort | KafkaEventPublisher | Apache Kafka |

### 5.5 マッパー
```typescript
// adapters/mappers/MemoryMapper.ts
export class MemoryMapper {
  // Domain → Persistence
  static toPersistence(memory: Memory): MemoryRecord {
    return {
      id: memory.id.value,
      author_id: memory.authorId,
      type: memory.type,
      content: memory.content?.value,
      media_urls: JSON.stringify(memory.mediaUrls.map(u => u.value)),
      created_at: memory.createdAt,
    };
  }

  // Persistence → Domain
  static toDomain(record: MemoryRecord): Memory {
    return Memory.reconstitute({
      id: new MemoryId(record.id),
      authorId: record.author_id,
      type: record.type,
      content: record.content ? new MemoryContent(record.content) : null,
      mediaUrls: JSON.parse(record.media_urls).map((u: string) => new MediaUrl(u)),
      createdAt: record.created_at,
    });
  }
}
```

---

## 6. フレームワーク&ドライバーレイヤー（インフラストラクチャ）

### 6.1 ウェブフレームワーク
**Express.js**（Node.js 20 LTS）— 軽量で、チームに広く知られており、REST APIに十分です。ミドルウェア：helmet（セキュリティヘッダー）、cors、express-rate-limit。

### 6.2 データベース
**PostgreSQL 15** via `pg` driver with connection pooling（pg-pool、最大20接続）。ORM不使用 — パラメータ化されたクエリで性能と制御を確保。Migrationsは Flyway経由。

### 6.3 メッセージブローカー
**Apache Kafka** via `kafkajs`。ドメインイベントを `memory-events` トピックに発行。リアクション処理と通知生成用のコンシューマーグループ。

### 6.4 外部ライブラリ & SDK

| ライブラリ | 目的 | レイヤー |
|---------|---------|-------|
| `@aws-sdk/client-s3` | メディアファイルストレージ | インフラストラクチャ |
| `kafkajs` | イベント発行とコンシューム | インフラストラクチャ |
| `pg` / `pg-pool` | データベースアクセス | インフラストラクチャ |
| `ioredis` | キャッシング | インフラストラクチャ |
| `joi` | 入力検証 | アダプター（コントローラー） |
| `pino` | 構造化ログ | 横断的関心事（インフラストラクチャ） |

### 6.5 依存性注入
**tsyringe** — 軽量なTypeScript DIコンテナ。すべてのポートはインターフェースとして登録され、アプリケーション起動時に解決されます。

```typescript
// infrastructure/di/container.ts
container.register<MemoryRepositoryPort>(
  'MemoryRepositoryPort',
  { useClass: PostgresMemoryRepository }
);
container.register<StoragePort>(
  'StoragePort',
  { useClass: S3StorageAdapter }
);
container.register<EventPublisherPort>(
  'EventPublisherPort',
  { useClass: KafkaEventPublisher }
);
```

---

## 7. ディレクトリ構造

```
src/
├── domain/
│   ├── entities/
│   │   ├── Memory.ts
│   │   ├── SharedMemory.ts
│   │   └── MemoryReaction.ts
│   ├── value-objects/
│   │   ├── MemoryId.ts
│   │   ├── MediaUrl.ts
│   │   ├── MemoryContent.ts
│   │   ├── ReactionType.ts
│   │   └── Visibility.ts
│   ├── events/
│   │   ├── MemoryCreated.ts
│   │   ├── MemoryShared.ts
│   │   └── ReactionAdded.ts
│   └── errors/
│       ├── EmptyMemoryError.ts
│       └── TooManyMediaError.ts
├── application/
│   ├── use-cases/
│   │   ├── CreateMemory.ts
│   │   ├── ShareWithGroup.ts
│   │   ├── AddReaction.ts
│   │   ├── GetGroupMemories.ts
│   │   └── DeleteMemory.ts
│   ├── dtos/
│   │   ├── CreateMemoryDTO.ts
│   │   ├── ShareMemoryDTO.ts
│   │   └── MemoryResponseDTO.ts
│   ├── ports/
│   │   ├── MemoryRepositoryPort.ts
│   │   ├── SharedMemoryRepositoryPort.ts
│   │   ├── StoragePort.ts
│   │   ├── GroupMembershipPort.ts
│   │   └── EventPublisherPort.ts
│   └── errors/
│       ├── MemoryNotFoundError.ts
│       └── UnauthorizedShareError.ts
├── adapters/
│   ├── controllers/
│   │   ├── MemoryController.ts
│   │   └── ReactionController.ts
│   ├── presenters/
│   │   └── MemoryPresenter.ts
│   ├── repositories/
│   │   ├── PostgresMemoryRepository.ts
│   │   └── PostgresSharedMemoryRepository.ts
│   ├── services/
│   │   ├── S3StorageAdapter.ts
│   │   ├── RelationshipServiceAdapter.ts
│   │   └── KafkaEventPublisher.ts
│   └── mappers/
│       ├── MemoryMapper.ts
│       └── SharedMemoryMapper.ts
└── infrastructure/
    ├── config/
    │   └── env.ts
    ├── database/
    │   ├── connection.ts
    │   └── migrations/
    ├── messaging/
    │   └── kafka.ts
    ├── di/
    │   └── container.ts
    └── server/
        └── app.ts
```

---

## 8. 依存関係ルール & 境界

### 8.1 許可される依存関係

| レイヤー | 依存可能 | 依存してはいけない |
|-------|--------------|-------------------|
| エンティティ | なし（純粋ドメイン） | アプリケーション、アダプター、インフラストラクチャ |
| ユースケース | エンティティ、ポートインターフェース | アダプター、インフラストラクチャ、Express、pg、AWS SDK |
| アダプター | ユースケース、エンティティ | インフラストラクチャ設定の詳細 |
| インフラストラクチャ | すべての内側レイヤー | — |

### 8.2 境界交差
データはDTOを介して境界を越えます。コントローラーはHTTPリクエストボディを受け取り、Joiで検証し、`CreateMemoryDTO`オブジェクトを構築します。ユースケースはレスポンスDTOを返します。プレゼンターはDTOをHTTPレスポンスようにフォーマットします。ドメインエンティティはユースケースレイヤーを離れません。

### 8.3 実装
- **ESLintインポートルール**: `eslint-plugin-boundaries`は内→外へのインポートを禁止するよう設定
- **アーキテクチャテスト**: 各レイヤーのインポート文をスキャンするカスタムJestテスト
- **CIチェック**: アーキテクチャテストスイートはすべてのPRで実行；違反はマージをブロック

---

## 9. テスト戦略

### 9.1 テストピラミッド

| レイヤー | テストタイプ | モック戦略 |
|-------|-----------|-----------------|
| エンティティ | ユニットテスト | モックなし — 純粋ロジック | 
| ユースケース | ユニットテスト | ポートのメモリ内実装 |
| アダプター | 統合テスト | Testcontainers（PostgreSQL、Redis） |
| インフラストラクチャ | E2Eテスト | Docker Composeでの完全スタック |

### 9.2 テスト例
```typescript
// ユニットテスト — ドメインエンティティ
describe('Memory', () => {
  it('should reject empty memories', () => {
    expect(() => Memory.create({
      authorId: 'user-1',
      type: 'story',
      // no content, no media
    })).toThrow(EmptyMemoryError);
  });

  it('should create memory with content only', () => {
    const memory = Memory.create({
      authorId: 'user-1',
      type: 'story',
      content: 'Remember that summer trip?',
      mediaUrls: [],
    });
    expect(memory.id).toBeDefined();
    expect(memory.content?.value).toBe('Remember that summer trip?');
  });
});

// ユニットテスト — ユースケース
describe('CreateMemory', () => {
  it('should save memory and publish event', async () => {
    const mockRepo = new InMemoryMemoryRepository();
    const mockStorage = new InMemoryStorage();
    const mockPublisher = new InMemoryEventPublisher();
    const useCase = new CreateMemory(mockRepo, mockStorage, mockPublisher);

    const result = await useCase.execute({
      authorId: 'user-1',
      type: 'photo',
      content: 'Beach day!',
      mediaUrls: ['temp://photo1.jpg'],
    });

    expect(result.id).toBeDefined();
    expect(mockRepo.memories).toHaveLength(1);
    expect(mockPublisher.events).toHaveLength(1);
    expect(mockPublisher.events[0]).toBeInstanceOf(MemoryCreated);
  });
});
```

---

## 10. エラーハンドリング

### 10.1 ドメインエラー
- `EmptyMemoryError`: メモリにコンテンツがなく、メディアもない
- `TooManyMediaError`: 10を超えるメディアファイルが添付されている
- `InvalidMediaUrlError`: メディアURLが承認されたストレージドメインからではない

### 10.2 アプリケーションエラー
- `MemoryNotFoundError`: 参照されたメモリが存在しない
- `UnauthorizedShareError`: ユーザーがメモリの著者ではない
- `NotGroupMemberError`: ユーザーが対象グループのメンバーではない
- `DuplicateReactionError`: ユーザーが既にリアクション（アップサートで処理）

### 10.3 エラー変換

| ドメインエラー | HTTPステータス | ユーザーメッセージ |
|-------------|------------|-------------|
| EmptyMemoryError | 400 | "メモリはテキストか少なくとも1つの写真を含む必要があります。" |
| TooManyMediaError | 400 | "1つのメモリあたり最大10個の写真を添付できます。" |
| MemoryNotFoundError | 404 | "このメモリは見つかりませんでした。" |
| UnauthorizedShareError | 403 | "メモリの著者のみが共有できます。" |
| NotGroupMemberError | 403 | "ここで共有するにはグループメンバーである必要があります。" |

---

## 11. 横断的関心事

### 11.1 ログ
PinoロガーはDI経由で注入されます。コントローラーはリクエスト/レスポンスメタデータをログ出力。ユースケースはビジネスイベントをログ出力。アダプターは外部呼び出し期間をログ出力。ドメインレイヤーにはロギングはありません。エラーを発生させ、上位レイヤーが記録します。

### 11.2 認証と認可
Expressミドルウェアがトークンを検証し、`userId`を抽出し、コントローラーメソッドに渡します。コントローラーはすべてのDTOに`userId`を含めます。認可ロジックはユースケースに存在します（例：「著者のみが共有できる」）。

### 11.3 検証
2つのレベル：（1）アダプターレイヤー：Joiは HTTP入力の形状、型、長さを検証。（2）ドメインレイヤー：エンティティコンストラクターはビジネス不変性を実装。この分離により、APIフレームワークが変更されてもドメインは清潔です。

### 11.4 キャッシング
Redisはグループメモリリストをキャッシュ（TTL：5分）。新しい共有またはリアクション時にキャッシュを無効化。キャッシュロジックはアダプターデコレータ（`CachedMemoryRepository`）に存在し、PostgreSQLアダプターをラップします。ユースケースはキャッシングを認識しません。

---

## 12. マイグレーション計画

### 12.1 現在の状態
既存のメモリシステムはなく、これはRecerdoプラットフォーム内のグリーンフィールドモジュールです。

### 12.2 目標状態
5つのユースケースすべてを含む完全に動作するメモリ共有モジュール、ユーザーリレーションシップサービスと統合され、Kubernetesにデプロイされています。

### 12.3 マイグレーションステップ
| ステップ | 説明 | リスク | ロールバック |
|------|-------------|------|----------|
| 1 | データベーススキーマをデプロイ | 低 | テーブルを削除 |
| 2 | CreateMemoryのみでサービスをデプロイ | 低 | デプロイメントを削除 |
| 3 | ShareWithGroup + GetGroupMemoriesを有効化 | 中 | フィーチャーフラグをOFF |
| 4 | AddReactionを有効化 | 低 | フィーチャーフラグをOFF |
| 5 | DeleteMemory + クリーンアップジョブを有効化 | 低 | フィーチャーフラグをOFF |

---

## 13. 未解決な質問と決定

| # | 質問 | ステータス | 決定 | 日付 |
|---|----------|--------|----------|------|
| 1 | メモリは60秒を超える動画に対応すべきか？ | 未解決 | — | — |
| 2 | 「メモリアルバム」（コレクション）を追加すべきか？ | 未解決 | — | — |
| 3 | 最大メディアファイルサイズ？ | 解決 | ファイルあたり50MB、メモリあたり合計200MB | 2026-04-05 |
| 4 | リアクションはカスタム絵文字を含めるべきか？ | 解決 | いいえ — v1は5つのリアクションタイプの固定セット | 2026-04-08 |

---

## 14. 参考資料

- [Clean Architecture — Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [ユーザーリレーションシップサービス設計ドキュメント](../microservice-design-sample.md)
- [Recerdoシステムアーキテクチャ概要](../../architecture-overview.md)
- [メモリサービスOpenAPI仕様](../../api-specs/memory-service.yaml)
