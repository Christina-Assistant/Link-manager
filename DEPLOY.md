# Link-manager 部署

该工作流与 `Link` 使用同一台 ECS。管理端构建产物通过 SSH 上传，由独立 Nginx 容器 `link-manager` 提供服务，宿主机端口为 `5173`。

在 GitHub Actions 中配置与 `Link` 相同的 `ECS_HOST`、`ECS_USERNAME`、`ECS_SSH_KEY` Secrets，然后手动触发 `Deploy Link-manager to Aliyun ECS`。静态管理端不依赖 ACR 凭据。

管理端构建时自动使用 `http://ECS_HOST:8090/api/v1` 访问 Link 管理 API。部署后访问 `http://ECS_HOST:5173/`，MySQL 由 Link Compose 管理并通过 3306 对外映射。
