export type ProjectFile = {
  id: string;
  name: string;
  type: "file" | "folder";
  parentId: string | null;
  content?: string;
};

export function createProjectFile(
  name: string,
  parentId: string | null,
  content = ""
): ProjectFile {
  return {
    id: crypto.randomUUID(),
    name,
    type: "file",
    parentId,
    content,
  };
}

export function createProjectFolder(
  name: string,
  parentId: string | null
): ProjectFile {
  return {
    id: crypto.randomUUID(),
    name,
    type: "folder",
    parentId,
  };
}

export function deleteProjectItem(
  files: ProjectFile[],
  id: string
): ProjectFile[] {
  const descendants = new Set<string>([id]);

  let changed = true;

  while (changed) {
    changed = false;

    for (const file of files) {
      if (
        file.parentId &&
        descendants.has(file.parentId) &&
        !descendants.has(file.id)
      ) {
        descendants.add(file.id);
        changed = true;
      }
    }
  }

  return files.filter((file) => !descendants.has(file.id));
}
