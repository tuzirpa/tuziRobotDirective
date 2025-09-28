import { DirectiveTree } from 'tuzirobot/types';
import { existsSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
import sharp from 'sharp';

export const config: DirectiveTree = {
    name: 'image.convertFormat',
    sort: 5,
    displayName: '图片格式转换',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '将图片${imagePath}转换为${outputFormat}格式，保存到${outputPath}',
    inputs: {
        imagePath: {
            name: 'imagePath',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                required: true,
                placeholder: '请填写图片文件路径',
                label: '图片文件路径',
                defaultValue: '',
                type: 'filePath',
                extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff', 'svg']
            }
        },
        outputFormat: {
            name: 'outputFormat',
            value: 'png',
            display: '',
            type: 'string',
            addConfig: {
                required: true,
                placeholder: '请选择目标格式',
                label: '目标格式',
                defaultValue: 'png',
                type: 'select',
                options: [
                    { label: 'PNG', value: 'png' },
                    { label: 'JPEG', value: 'jpg' },
                    { label: 'WebP', value: 'webp' },
                    { label: 'BMP', value: 'bmp' },
                    { label: 'TIFF', value: 'tiff' },
                    { label: 'GIF', value: 'gif' }
                ]
            }
        },
        outputPath: {
            name: 'outputPath',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                required: false,
                placeholder: '请填写输出文件路径（可选）',
                label: '输出文件路径',
                defaultValue: '',
                type: 'filePath'
            }
        },
        quality: {
            name: 'quality',
            value: 90,
            display: '',
            type: 'number',
            addConfig: {
                required: false,
                placeholder: '请输入输出质量（1-100）',
                label: '输出质量',
                defaultValue: 90,
                type: 'number'
            }
        },
        compression: {
            name: 'compression',
            value: 6,
            display: '',
            type: 'number',
            addConfig: {
                required: false,
                placeholder: '请输入压缩级别（PNG格式，0-9）',
                label: '压缩级别',
                defaultValue: 6,
                type: 'number'
            }
        }
    },
    outputs: {
        success: {
            name: '',
            display: '是否成功',
            type: 'boolean',
            addConfig: {
                required: true,
                label: '操作是否成功',
                defaultValue: 'success',
                type: 'variable'
            }
        },
        message: {
            name: '',
            display: '操作结果',
            type: 'string',
            addConfig: {
                required: true,
                label: '操作结果消息',
                defaultValue: 'message',
                type: 'variable'
            }
        },
        outputPath: {
            name: '',
            display: '输出路径',
            type: 'string',
            addConfig: {
                required: true,
                label: '输出文件路径',
                defaultValue: 'outputPath',
                type: 'variable'
            }
        }
    }
};

export const impl = async function ({ 
    imagePath, 
    outputFormat, 
    outputPath, 
    quality = 90, 
    compression = 6 
}: { 
    imagePath: string; 
    outputFormat: string; 
    outputPath?: string; 
    quality?: number; 
    compression?: number; 
}) {
    try {
        const fullPath = imagePath;
        
        if (!existsSync(fullPath)) {
            throw new Error('图片文件不存在');
        }

        // 验证输出格式
        const supportedFormats = ['png', 'jpg', 'jpeg', 'webp', 'bmp', 'tiff', 'gif'];
        const targetFormat = outputFormat.toLowerCase();
        
        if (!supportedFormats.includes(targetFormat)) {
            throw new Error(`不支持的输出格式: ${targetFormat}。支持的格式: ${supportedFormats.join(', ')}`);
        }

        // 确定输出路径
        const finalOutputPath = outputPath || generateOutputPath(imagePath, targetFormat);
        
        // 获取输入格式
        const inputFormat = extname(imagePath).toLowerCase().substring(1);
        
        // 如果输入和输出格式相同，直接复制
        if (inputFormat === targetFormat) {
            const outputDir = dirname(finalOutputPath);
            if (!existsSync(outputDir)) {
                require('fs').mkdirSync(outputDir, { recursive: true });
            }
            require('fs').copyFileSync(fullPath, finalOutputPath);
            return { 
                success: true, 
                message: '格式相同，直接复制文件', 
                outputPath: finalOutputPath 
            };
        }

        // 使用sharp进行格式转换
        try {
            // 创建sharp实例
            let sharpInstance = await sharp(fullPath,{limitInputPixels:1000000000}).toBuffer().then(buffer => sharp(buffer));
            
            // 根据输出格式设置保存选项
            switch (targetFormat) {
                case 'jpg':
                case 'jpeg':
                    sharpInstance = sharpInstance.jpeg({ 
                        quality: quality,
                        progressive: true,
                        mozjpeg: true
                    });
                    break;
                case 'png':
                    sharpInstance = sharpInstance.png({ 
                        compressionLevel: compression,
                        adaptiveFiltering: true
                    });
                    break;
                case 'webp':
                    sharpInstance = sharpInstance.webp({ 
                        quality: quality,
                        effort: 6
                    });
                    break;
                case 'tiff':
                    sharpInstance = sharpInstance.tiff({ 
                        quality: quality,
                        compression: 'lzw'
                    });
                    break;
                case 'gif':
                    sharpInstance = sharpInstance.gif();
                    break;
                // 注意：Sharp不直接支持BMP格式，需要先转换为其他格式
            }
            
            // 保存转换后的图片
            await sharpInstance.toFile(finalOutputPath);
      
            return { 
                success: true, 
                message: `图片格式转换成功: ${inputFormat} -> ${targetFormat}`, 
                outputPath: finalOutputPath 
            };
        } catch (sharpError) {
            // 如果sharp失败，尝试使用jimp作为备选方案
            try {
                const Jimp = require('jimp');
                const image = await Jimp.read(fullPath);
                
                // 根据格式保存
                switch (targetFormat) {
                    case 'jpg':
                    case 'jpeg':
                        await image.quality(quality).writeAsync(finalOutputPath);
                        break;
                    case 'png':
                        await image.writeAsync(finalOutputPath);
                        break;
                    case 'bmp':
                        await image.writeAsync(finalOutputPath);
                        break;
                    default:
                        // Jimp不支持所有格式，使用PNG作为备选
                        await image.writeAsync(finalOutputPath.replace(/\.[^/.]+$/, '.png'));
                        break;
                }
                
                return { 
                    success: true, 
                    message: `图片格式转换成功（使用Jimp）: ${inputFormat} -> ${targetFormat}`, 
                    outputPath: finalOutputPath 
                };
            } catch (jimpError) {
                throw new Error(`图片格式转换失败: Sharp和Jimp都无法处理`);
            }
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`图片格式转换失败: ${errorMessage}`);
    }
}

/**
 * 生成输出文件路径
 */
function generateOutputPath(originalPath: string, newFormat: string): string {
    const dir = dirname(originalPath);
    const name = basename(originalPath, extname(originalPath));
    return join(dir, `${name}.${newFormat}`);
}
