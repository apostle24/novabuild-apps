import type { ProjectFile } from "@/types/project";

export function createFile(
  files: ProjectFile[],
  path: string,
  content = ""
): ProjectFile[] {
  if (files.some((file) => file.path === path)) {
    return files;
  }

  return [...files, { path, content }];
}

export function updateFile(
  files: ProjectFile[],
  path: string,
  content: string
): ProjectFile[] {
  return files.map((file) =>
    file.path === path
      ? { ...file, content }
      : file
  );
}

export function deleteFile(
  files: ProjectFile[],
  path: string
): ProjectFile[] {
  return files.filter((file) => file.path !== path);
}

export function renameFile(
  files: ProjectFile[],
  oldPath: string,
  newPath: string
): ProjectFile[] {
  if (
    files.some(
      (file) => file.path === newPath && file.path !== oldPath
    )
  ) {
    return files;
  }

  return files.map((file) =>
    file.path === oldPath
      ? { ...file, path: newPath }
      : file
  );
}

export function getFile(
  files: ProjectFile[],
  path: string
): ProjectFile | undefined {
  return files.find((file) => file.path === path);
}

export function fileExists(
  files: ProjectFile[],
  path: string
): boolean {
  return files.some((file) => file.path === path);
}

export function sortFiles(
  files: ProjectFile[]
): ProjectFile[] {
  return [...files].sort((a, b) =>
    a.path.localeCompare(b.path)
  );
}
