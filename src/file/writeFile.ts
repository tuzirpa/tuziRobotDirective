import { DirectiveTree } from "../types";
import fs from "fs";
import path from "path";

export const config: DirectiveTree = {
  name: "file.writeFile",
  sort: 2,
  displayName: "写入文件",
  icon: "icon-web-create",
  isControl: false,
  isControlEnd: false,
  comment: "将内容${content}写入文件${fileName}，存放目录${dir}",
  inputs: {
    content: {
      name: "content",
      value: "",
      display: "",
      type: "variable",
      addConfig: {
        required: true,
        label: "写入内容",
        type: "variable",
      },
    },
    fileName: {
      name: "fileName",
      value: "",
      type: "string",
      addConfig: {
        label: "文件名",
        placeholder: "请填写文件名",
        type: "string",
        defaultValue: "",
        tip: "请填写文件名",
      },
    },
    dir: {
      name: "dir",
      value: "",
      type: "string",
      addConfig: {
        label: "文件存放目录",
        placeholder: "请选择文件存放目录",
        type: "filePath",
        defaultValue: "",
        openDirectory: true,
        tip: "文件存放目录",
      },
    },
    isCovered: {
      name: "isCovered",
      value: "",
      type: "boolean",
      addConfig: {
        label: "存在时文件是否覆盖",
        type: "boolean",
        defaultValue: false,
        tip: "存在时文件是否覆盖",
      },
    },
  },

  outputs: {},
};

export const impl = async function ({
  content,
  fileName,
  dir,
  isCovered,
}: {
  content: any;
  fileName: string;
  dir: string;
  isCovered: boolean;
}) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  let filePath = path.join(dir, fileName);
  if (!isCovered && fs.existsSync(filePath)) {
    const parsedPath = path.parse(filePath);
    const newName =
      parsedPath.name + "_" + new Date().getTime() + parsedPath.ext;
    filePath = path.join(parsedPath.dir, newName);
  }

  fs.writeFileSync(filePath, content, "utf8");
  console.log(`文件${filePath}写入成功`);
};
