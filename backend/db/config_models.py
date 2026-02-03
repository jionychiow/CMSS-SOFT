from django.db import models

class PlantPhase(models.Model):
    """工厂分期配置"""
    code = models.CharField(max_length=20, unique=True, verbose_name="期数代码")
    name = models.CharField(max_length=50, verbose_name="期数名称")
    description = models.TextField(blank=True, null=True, verbose_name="描述")
    is_active = models.BooleanField(default=True, verbose_name="是否启用")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "工厂分期"
        verbose_name_plural = "工厂分期"
        db_table = 'plant_phase_config'

    def __str__(self):
        return self.name


class ProductionLine(models.Model):
    """产线配置"""
    code = models.CharField(max_length=20, verbose_name="产线代码")
    name = models.CharField(max_length=50, verbose_name="产线名称")
    phase = models.ForeignKey(PlantPhase, on_delete=models.CASCADE, verbose_name="所属期数")
    description = models.TextField(blank=True, null=True, verbose_name="描述")
    is_active = models.BooleanField(default=True, verbose_name="是否启用")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "产线"
        verbose_name_plural = "产线"
        db_table = 'production_line_config'
        unique_together = ['code', 'phase']  # 同一期数内产线代码唯一

    def __str__(self):
        return f"{self.phase.name} - {self.name}"


class Process(models.Model):
    """工序配置"""
    code = models.CharField(max_length=20, unique=True, verbose_name="工序代码")
    name = models.CharField(max_length=50, verbose_name="工序名称")
    description = models.TextField(blank=True, null=True, verbose_name="描述")
    is_active = models.BooleanField(default=True, verbose_name="是否启用")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "工序"
        verbose_name_plural = "工序"
        db_table = 'process_config'

    def __str__(self):
        return self.name