# Contributing to GitSum

感谢你对 GitSum 的关注！这里有一些开发指南。

## 开发环境设置

```bash
# 安装依赖
npm install

# 创建 .env 文件（参考 .env.example）
cp .env.example .env

# 运行开发服务器
npm run dev
```

## 项目结构

```
src/
├── config/          # 配置管理
├── github/          # GitHub API 客户端
│   ├── client.ts    # GitHub API 封装
│   └── types.ts     # TypeScript 类型定义
├── llm/            # LLM 客户端
│   ├── client.ts    # Groq/OpenAI 兼容封装
│   └── prompt.ts     # 提词模板
├── flomo/          # Flomo webhook 客户端
│   └── client.ts    # Webhook 调用（带详细日志）
├── prisma/          # Prisma 客户端
│   ├── client.ts    # 单例模式
│   └── schema.prisma # 数据库模型
├── scheduler/       # 任务调度
│   └── daily.ts      # 每日任务流程
└── index.ts         # 应用入口
```

## 代码风格

- 使用 TypeScript 严格模式
- 遵循 ESLint 规则（如添加）
- 使用有意义的变量和函数名
- 添加适当的错误处理和日志

## 提交流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/your-feature`)
3. 提交更改 (`git commit -m "feat: description"`)
4. 推送到你的 Fork (`git push origin feature/your-feature`)
5. 创建 Pull Request

## 提交信息格式

```
<type>: <简短描述>

类型：
- `feat`: 新功能
- `fix`: 错误修复
- `docs`: 文档更新
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建/配置更新

示例：
```
feat: 添加 GitHub API 贡献获取
fix: 修复 Prisma 连接池问题
docs: 更新 README 文档
```
```

## 测试

```bash
# 运行测试
npm test

# 生成 Prisma client
npx prisma generate

# 数据库迁移
npx prisma migrate dev
```

## 部署

见主 README.md 中的部署指南

## 许可证

MIT License
