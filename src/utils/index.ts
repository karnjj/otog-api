export function scodeFileFilter(file: Express.Multer.File) {
  if (!file.originalname.match(/\.(c|cpp|py)$/)) {
    return false;
  }
  return true;
}

export function scodeFileSizeLimit(
  file: Express.Multer.File,
  limitSize: number,
) {
  if (file.size > limitSize) {
    return false;
  }
  return true;
}

export const strToObj = (data: string) => {
  return data == null ? [] : JSON.parse(data);
};

export const isGrader = (key: string | string[]) => {
  return (key as string)?.split('-')[0] === process.env.GRADER_KEY;
};

export const isUser = (key: string | string[]) => {
  return (key as string) === process.env.USER_KEY;
};

export const isLoad = (key: string | string[]) => {
  return (key as string) === process.env.LOAD_KEY;
};
