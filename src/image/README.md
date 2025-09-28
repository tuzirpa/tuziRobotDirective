# 图片操作模块

本模块提供了完整的图片操作功能，包括读取图片信息、裁切、缩放、格式转换和保存等操作。所有功能都按照Tuzi RPA的标准指令格式定义，使用Sharp和Jimp库提供高性能的图片处理能力。

## 功能特性

- **读取图片信息**: 获取图片尺寸、格式、文件大小等基本信息，支持更多元数据
- **图片裁切**: 支持指定坐标和尺寸进行图片裁切，保持原图质量
- **图片缩放**: 支持按比例缩放、指定尺寸缩放，多种缩放算法可选
- **格式转换**: 支持多种图片格式之间的转换（PNG、JPG、WebP、TIFF、GIF）
- **图片保存**: 支持自定义输出路径、质量和格式，智能压缩优化

## 安装依赖

本模块使用以下高性能图片处理库：

```bash
npm install sharp jimp
```

- **Sharp**: 高性能的图片处理库，支持多种格式和优化选项
- **Jimp**: 纯JavaScript图片处理库，作为备选方案确保兼容性

## 支持的图片格式

- **输入格式**: PNG、JPG、JPEG、WebP、TIFF、SVG、GIF、BMP
- **输出格式**: PNG、JPG、JPEG、WebP、TIFF、GIF
- **注意**: BMP格式输出需要先转换为其他格式

## 指令列表

### 1. image.readImageInfo - 读取图片信息

读取图片文件的基本信息，包括尺寸、格式、文件大小等，以及Sharp提供的额外元数据。

**输入参数:**
- `imagePath`: 图片文件路径（必填）

**输出变量:**
- `imageInfo`: 图片信息对象，包含width、height、format、size、path、exists、channels、depth、hasProfile、hasAlpha、orientation等属性

**使用示例:**
```typescript
// 在流程中使用
const result = await image.readImageInfo({ imagePath: './test.jpg' });
console.log(result.imageInfo.width, result.imageInfo.height);
console.log('通道数:', result.imageInfo.channels);
console.log('是否有透明通道:', result.imageInfo.hasAlpha);
```

### 2. image.cropImage - 图片裁切

从指定坐标开始裁切图片到指定尺寸，支持质量设置。

**输入参数:**
- `imagePath`: 图片文件路径（必填）
- `x`: 裁切起始X坐标（必填）
- `y`: 裁切起始Y坐标（必填）
- `width`: 裁切宽度（必填）
- `height`: 裁切高度（必填）
- `outputPath`: 输出文件路径（可选）
- `quality`: 输出质量（1-100，默认90）

**输出变量:**
- `success`: 操作是否成功
- `message`: 操作结果消息
- `outputPath`: 输出文件路径

### 3. image.resizeImage - 图片缩放

缩放图片到指定尺寸或按比例缩放，支持多种缩放算法和适应方式。

**输入参数:**
- `imagePath`: 图片文件路径（必填）
- `width`: 目标宽度（可选）
- `height`: 目标高度（可选）
- `scale`: 缩放比例（可选）
- `maintainAspectRatio`: 是否保持宽高比（默认true）
- `outputPath`: 输出文件路径（可选）
- `quality`: 输出质量（1-100，默认90）
- `fit`: 缩放适应方式（cover/contain/fill/inside/outside，默认cover）

**输出变量:**
- `success`: 操作是否成功
- `message`: 操作结果消息
- `outputPath`: 输出文件路径

### 4. image.convertFormat - 图片格式转换

将图片转换为指定的格式，支持多种输出选项和压缩设置。

**输入参数:**
- `imagePath`: 图片文件路径（必填）
- `outputFormat`: 目标格式（必填，支持png/jpg/webp/tiff/gif）
- `outputPath`: 输出文件路径（可选）
- `quality`: 输出质量（1-100，默认90）
- `compression`: 压缩级别（PNG格式，0-9，默认6）

**输出变量:**
- `success`: 操作是否成功
- `message`: 操作结果消息
- `outputPath`: 输出文件路径

### 5. image.saveImage - 图片保存

保存图片到指定路径，可选择转换格式和设置质量。

**输入参数:**
- `imagePath`: 图片文件路径（必填）
- `outputPath`: 输出文件路径（必填）
- `quality`: 输出质量（1-100，默认90）
- `format`: 输出格式（可选）
- `overwrite`: 是否覆盖现有文件（默认false）

**输出变量:**
- `success`: 操作是否成功
- `message`: 操作结果消息
- `outputPath`: 输出文件路径

## 在流程中使用

### 基本用法

```typescript
// 1. 读取图片信息
const info = await image.readImageInfo({ imagePath: './input.jpg' });

// 2. 裁切图片
const cropResult = await image.cropImage({
    imagePath: './input.jpg',
    x: 100,
    y: 100,
    width: 800,
    height: 600,
    quality: 95
});

// 3. 缩放图片
const resizeResult = await image.resizeImage({
    imagePath: './input.jpg',
    scale: 0.5,
    maintainAspectRatio: true,
    fit: 'cover',
    quality: 90
});

// 4. 转换格式
const convertResult = await image.convertFormat({
    imagePath: './input.jpg',
    outputFormat: 'webp',
    quality: 85
});

// 5. 保存图片
const saveResult = await image.saveImage({
    imagePath: './input.jpg',
    outputPath: './output/saved.webp',
    format: 'webp',
    quality: 80
});
```

### 批量处理示例

```typescript
// 批量处理多张图片
const imagePaths = ['./img1.jpg', './img2.png', './img3.jpg'];

for (const imagePath of imagePaths) {
    try {
        // 读取信息
        const info = await image.readImageInfo({ imagePath });
        
        if (info.imageInfo.width > 2000) {
            // 如果图片太大，先缩小
            await image.resizeImage({
                imagePath,
                scale: 0.5,
                outputPath: imagePath.replace('.', '_resized.'),
                quality: 90
            });
        }
        
        // 转换为WebP格式
        await image.convertFormat({
            imagePath,
            outputFormat: 'webp',
            quality: 85
        });
        
    } catch (error) {
        console.error(`处理图片失败: ${imagePath}`, error);
    }
}
```

## 技术特性

### Sharp库优势
- **高性能**: 基于libvips，处理速度极快
- **内存优化**: 流式处理，内存占用低
- **格式支持**: 支持多种现代图片格式
- **质量优化**: 智能压缩和质量控制

### Jimp备选方案
- **纯JavaScript**: 无需原生依赖
- **兼容性好**: 在所有Node.js环境中运行
- **功能完整**: 支持基本的图片操作

## 注意事项

1. 所有路径都相对于当前工作目录
2. Sharp库提供最佳性能，Jimp作为备选方案
3. 所有指令都返回Promise，需要使用await或.then()处理
4. 建议在处理大图片时注意内存使用
5. 输出目录会自动创建（如果不存在）
6. 质量参数范围：1-100（Sharp）或0-1（Jimp自动转换）

## 错误处理

所有指令都使用标准的错误处理机制：
- 成功时返回相应的输出变量
- 失败时抛出Error异常，包含详细的错误信息
- 自动降级：如果Sharp失败，自动尝试使用Jimp

```typescript
try {
    const result = await image.cropImage({
        imagePath: './nonexistent.jpg',
        x: 0, y: 0, width: 100, height: 100
    });
} catch (error) {
    console.error('裁切失败:', error.message);
}
```

## 性能优化建议

1. 优先使用Sharp库以获得最佳性能
2. 对于大图片，考虑先缩小再处理
3. 合理设置输出质量以平衡文件大小和图片质量
4. 批量处理时注意内存使用，避免同时处理过多图片
5. 使用合适的缩放算法（lanczos3适合照片，nearest适合像素图）

## 指令配置说明

每个指令都包含两个主要部分：

1. **config**: 指令的配置信息，包括名称、显示名称、输入输出参数等
2. **impl**: 指令的具体实现逻辑

这种设计使得指令可以在Tuzi RPA流程编辑器中正确显示和配置，同时保持代码的清晰和可维护性。
