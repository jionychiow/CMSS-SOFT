# MySQL 数据库配置说明

本项目现已配置为使用 MySQL 作为默认数据库。以下是配置说明：

## 环境变量配置

在运行项目之前，请确保设置以下环境变量：

```bash
# 数据库配置
DB_HOST=localhost          # MySQL服务器地址
DB_PORT=3306              # MySQL端口号
DB_NAME=oee_database      # 数据库名称
DB_USER=root              # 数据库用户名
DB_PASSWORD=12345678      # 数据库密码
```

## 创建 MySQL 数据库

在 MySQL 服务器中创建所需的数据库：

```sql
CREATE DATABASE oee_database CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON oee_database.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

## 运行项目

设置好环境变量后，可以正常运行项目：

```bash
# 应用数据库迁移
python manage.py migrate

# 启动开发服务器
python manage.py runserver
```

## 注意事项

1. 项目不再使用 SQLite 数据库文件
2. 所有环境（开发、生产）现在都使用 MySQL
3. 已安装 PyMySQL 驱动程序以兼容 Windows 环境
4. 如果遇到连接问题，请检查 MySQL 服务是否正在运行