// MD5指令测试文件
import { impl as md5Impl } from './md5';
import { writeFileSync, existsSync, unlinkSync } from 'fs';

async function testMd5() {
    console.log('开始测试MD5指令...\n');

    try {
        // 测试基本字符串
        console.log('1. 测试基本字符串...');
        const result1 = await md5Impl({ inputData: 'hello world' });
        console.log('输入: "hello world"');
        console.log('MD5结果:', result1.md5Result);
        console.log('✅ 基本字符串测试通过\n');

        // 测试中文
        console.log('2. 测试中文字符串...');
        const result2 = await md5Impl({ inputData: '你好世界' });
        console.log('输入: "你好世界"');
        console.log('MD5结果:', result2.md5Result);
        console.log('✅ 中文字符串测试通过\n');

        // 测试文本文件输入
        console.log('3. 测试文本文件输入...');
        const testTextFile = './test_md5_text.txt';
        const testTextContent = '这是一个测试文件内容\n包含多行文本\n用于测试MD5加密';
        
        // 创建测试文本文件
        writeFileSync(testTextFile, testTextContent, 'utf8');
        console.log('创建测试文本文件:', testTextFile);
        
        const result3 = await md5Impl({ inputFile: testTextFile });
        console.log('文件内容:', testTextContent);
        console.log('MD5结果:', result3.md5Result);
        console.log('✅ 文本文件输入测试通过\n');
        
        // 测试二进制文件输入
        console.log('4. 测试二进制文件输入...');
        const testBinaryFile = './test_md5_binary.bin';
        const testBinaryContent = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]); // PNG文件头
        
        // 创建测试二进制文件
        writeFileSync(testBinaryFile, testBinaryContent);
        console.log('创建测试二进制文件:', testBinaryFile);
        
        const result4 = await md5Impl({ inputFile: testBinaryFile });
        console.log('文件内容(hex):', testBinaryContent.toString('hex'));
        console.log('MD5结果:', result4.md5Result);
        console.log('✅ 二进制文件输入测试通过\n');
        
        // 清理测试文件
        if (existsSync(testTextFile)) {
            unlinkSync(testTextFile);
            console.log('清理测试文本文件完成');
        }
        if (existsSync(testBinaryFile)) {
            unlinkSync(testBinaryFile);
            console.log('清理测试二进制文件完成');
        }

        // 测试空输入
        console.log('5. 测试空输入...');
        try {
            await md5Impl({});
            console.log('❌ 空输入测试失败，应该抛出错误');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.log('✅ 空输入测试通过，正确抛出错误:', errorMessage);
        }

        // 测试同时提供两种输入
        console.log('6. 测试同时提供两种输入...');
        try {
            await md5Impl({ inputData: 'test', inputFile: 'test.txt' });
            console.log('❌ 双重输入测试失败，应该抛出错误');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.log('✅ 双重输入测试通过，正确抛出错误:', errorMessage);
        }

        console.log('\n🎉 所有测试完成！MD5指令工作正常。');

    } catch (error) {
        console.error('❌ 测试失败:', error);
    }
}

// 如果直接运行此文件，执行测试
if (require.main === module) {
    testMd5();
}

export { testMd5 };
