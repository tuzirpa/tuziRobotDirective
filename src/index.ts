//动态导入当前目录下所有js文件，并将其导出为一个对象
import requireDir from "require-dir";
import fs from "fs";

const modules = requireDir("./", {
	filter: function (fullPath: string) {
		const stat = fs.statSync(fullPath);
		if (stat.isDirectory()) {
			return true;
		}
		return fullPath.endsWith(".js");
	},
	recurse: true,
});

function loadModule(module: { [key: string]: any }) {
	for (let key in module) {
		if (module.hasOwnProperty(key)) {
			const tModule = module[key];
			const config = tModule.config;
			if (config && config.name) {
				//xxx.yyy
				const keys = config.key || config.name;
				const namespace = keys.split(".");
				const configName = namespace.pop();
				//exports.xxx.yyy
				let lastName = "";
				namespace.forEach((name: string) => {
					lastName = name;
					exports[name] = exports[name] || {};
				});

				exports[lastName][configName] = module[key].impl;
			} else {
				loadModule(tModule);
			}
		}
	}
}

loadModule(modules);
