[![Netlify Status](https://api.netlify.com/api/v1/badges/f965f47f-947c-4ea0-9f9a-042bc2462369/deploy-status)](https://app.netlify.com/projects/design-doc-generator/deploys)

# Design Docs

Design document templates for the service — a social media platform (Viejo App) for reconnecting with old friends and close-knit groups.

## Repository Structure

```
.
├── README.md                  # This file
├── Templates.md               # Template index & usage guide
├── Sample.md                  # Sample index & overview
├── templates/
│   ├── en/                    # English templates
│   │   ├── microservice-design.md
│   │   └── clean-architecture-design.md
│   └── ja/                    # Japanese templates (日本語テンプレート)
│       ├── microservice-design.md
│       └── clean-architecture-design.md
├── samples/
│   ├── en/                    # English filled examples
│   │   ├── microservice-design-sample.md
│   │   └── clean-architecture-design-sample.md
│   └── ja/                    # Japanese filled examples (日本語サンプル)
│       ├── microservice-design-sample.md
│       └── clean-architecture-design-sample.md
└── docx/
    ├── en/                    # English Word documents
    │   ├── microservice-design-template.docx
    │   ├── clean-architecture-design-template.docx
    │   ├── microservice-design-sample.docx
    │   └── clean-architecture-design-sample.docx
    └── ja/                    # Japanese Word documents (日本語Word文書)
        ├── microservice-design-template.docx
        ├── clean-architecture-design-template.docx
        ├── microservice-design-sample.docx
        └── clean-architecture-design-sample.docx
```

## How to Use

1. **Choose a template** from `templates/en/` or `templates/ja/`
2. **Copy** the template into your project documentation folder
3. **Fill in** each section following the guidance in brackets `[...]`
4. **Refer to samples** in `samples/` for concrete examples based on the the service
5. **Word versions** are available in `docx/` for offline editing and formal review

## Templates

| Template | Description |
|----------|-------------|
| Microservice Design Doc | For designing individual microservices: API contracts, data models, deployment, and inter-service communication |
| Clean Architecture Design Doc | For defining layered architecture: entities, use cases, interface adapters, and dependency rules |

## License

Internal use only — Willen Federation.
