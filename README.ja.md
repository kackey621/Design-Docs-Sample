[![Netlify Status](https://api.netlify.com/api/v1/badges/f965f47f-947c-4ea0-9f9a-042bc2462369/deploy-status)](https://app.netlify.com/projects/design-doc-generator/deploys)
[![Netlify](https://www.netlify.com/img/global/badges/netlify-color-accent.svg)](https://www.netlify.com)

# 設計ドキュメント

サービス（旧友・仲良かったグループとの再接続を目的としたSNSプラットフォーム「Viejoアプリ」）の設計ドキュメントテンプレート集です。

## リポジトリ構成

```
.
├── README.md                  # 英語版README
├── README.ja.md               # このファイル（日本語版README）
├── Templates.md               # テンプレート一覧・使い方ガイド
├── Sample.md                  # サンプル一覧・概要
├── templates/
│   ├── en/                    # 英語テンプレート
│   │   ├── microservice-design.md
│   │   └── clean-architecture-design.md
│   └── ja/                    # 日本語テンプレート
│       ├── microservice-design.md
│       └── clean-architecture-design.md
├── samples/
│   ├── en/                    # 英語記入例
│   │   ├── microservice-design-sample.md
│   │   └── clean-architecture-design-sample.md
│   └── ja/                    # 日本語記入例
│       ├── microservice-design-sample.md
│       └── clean-architecture-design-sample.md
└── docx/
    ├── en/                    # 英語版Word文書
    └── ja/                    # 日本語版Word文書
```

## 使い方

1. `templates/ja/` からテンプレートを選択します
2. テンプレートをプロジェクトのドキュメントフォルダにコピーします
3. `[...]` 内のガイダンスに従って各セクションを記入します
4. 具体的な記入例は `samples/` を参照してください（サービスを題材にした実例）
5. オフライン編集・正式レビュー用のWord版は `docx/` にあります

## テンプレート一覧

| テンプレート | 説明 |
|-------------|------|
| マイクロサービス設計書 | 個別マイクロサービスの設計：APIコントラクト、データモデル、デプロイメント、サービス間通信 |
| クリーンアーキテクチャ設計書 | レイヤードアーキテクチャの定義：エンティティ、ユースケース、インターフェースアダプタ、依存性ルール |

## ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルを参照してください。
