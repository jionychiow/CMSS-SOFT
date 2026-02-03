# 解决Linux环境中缺少配置表的问题

## 问题分析
在Linux环境中出现错误：
```
Table 'oee_database.production_line_config' doesn't exist
```

这通常发生在Django迁移状态与实际数据库表结构不一致的情况下。

## 解决方案

### 方案1：重新运行迁移
在Linux服务器上执行以下命令：

```bash
cd /root/CMMS/backend
source venv/bin/activate  # 如果使用虚拟环境
python manage.py migrate
```

### 方案2：如果方案1失败，尝试重置迁移状态
```bash
# 查看当前迁移状态
python manage.py showmigrations

# 如果db应用的迁移显示未应用，但表实际存在，则使用fake选项
python manage.py migrate db --fake-initial

# 或者强制重新应用db应用的迁移
python manage.py migrate db zero  # 回滚到初始状态
python manage.py migrate db       # 重新应用迁移
```

### 方案3：手动创建缺失的表
如果以上方法都不行，可以检查db应用中的模型并手动创建表结构：

```bash
python manage.py sqlmigrate db 0010  # 查看创建配置表的SQL语句
```

然后在MySQL命令行中手动执行相应的CREATE TABLE语句。

## 检查清单
- 确保settings.py中数据库配置正确
- 确保MySQL服务正在运行
- 确保数据库用户有足够权限
- 确保Python虚拟环境中安装了PyMySQL

## 预防措施
- 在迁移数据库后，确保所有环境都使用相同的迁移历史
- 使用`--fake-initial`选项处理已存在的表
- 定期备份数据库迁移状态

## 参考信息
根据我们的本地数据库检查，以下表应该存在：
- plant_phase_config
- production_line_config
- process_config
- shift_type_config