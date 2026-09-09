# Link-manager 部署

该工作流与 `Link` 使用同一台 ECS、ACR 凭据，但管理端运行在独立容器 `link-manager`，宿主机端口为 `5173`。

在 GitHub Actions 中配置与 `Link` 相同的 `ACR_*`、`ECS_*` Secrets/Variables，然后手动触发 `Deploy Link-manager to Aliyun ECS`。`ACR_REGISTRY` 和 `ACR_NAMESPACE` 可配置为 Variables，也可配置为 Secrets；Variables 优先。

管理端构建时自动使用 `http://ECS_HOST:8090/api/v1` 访问 Link 管理 API。部署后访问 `http://ECS_HOST:5173/`，MySQL 由 Link Compose 管理并通过 3306 对外映射。
