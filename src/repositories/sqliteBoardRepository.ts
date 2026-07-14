import { STORAGE_VERSION } from "../constants";
import { initialFactoryOptions, initialProjects } from "../data/initialData";
import { parseStoredBoardData } from "../storage";
import type { BoardData, StoredBoardData } from "../types";
import type { BoardRepository } from "./boardRepository";
import {
  DEFAULT_WORKSPACE_ID,
  DEFAULT_WORKSPACE_NAME,
  mapBoardDataToSqliteRows,
  mapSqliteRowsToBoardData,
  type SqliteBoardRows,
  type SqliteBoardWriteRows,
} from "./sqliteBoardMapper";

export type SqliteBoardRepositoryDriver = {
  loadBoardRows: (workspaceId: string) => Promise<SqliteBoardRows | null>;
  replaceBoardRows: (rows: SqliteBoardWriteRows) => Promise<void>;
  clearWorkspace: (workspaceId: string) => Promise<void>;
};

type SqliteBoardRepositoryOptions = {
  workspaceId?: string;
  workspaceName?: string;
};

function getInitialBoardData(): BoardData {
  return {
    projects: initialProjects,
    factoryOptions: initialFactoryOptions,
  };
}

function createStoredBoardData(data: BoardData): StoredBoardData {
  return {
    version: STORAGE_VERSION,
    projects: data.projects,
    factoryOptions: data.factoryOptions,
  };
}

export function createSqliteBoardRepository(
  driver: SqliteBoardRepositoryDriver,
  options: SqliteBoardRepositoryOptions = {},
): BoardRepository {
  const workspaceId = options.workspaceId ?? DEFAULT_WORKSPACE_ID;
  const workspaceName = options.workspaceName ?? DEFAULT_WORKSPACE_NAME;
  let writeQueue = Promise.resolve();

  function enqueueWrite<T>(callback: () => Promise<T>) {
    const nextWrite = writeQueue.then(callback, callback);
    writeQueue = nextWrite.then(
      () => undefined,
      () => undefined,
    );
    return nextWrite;
  }

  return {
    async load() {
      const rows = await driver.loadBoardRows(workspaceId);
      return rows ? mapSqliteRowsToBoardData(rows) : getInitialBoardData();
    },

    async save(data) {
      await enqueueWrite(() =>
        driver.replaceBoardRows(mapBoardDataToSqliteRows(data, { workspaceId, workspaceName })),
      );
    },

    async reset() {
      return enqueueWrite(async () => {
        await driver.clearWorkspace(workspaceId);
        const initialBoardData = getInitialBoardData();
        await driver.replaceBoardRows(mapBoardDataToSqliteRows(initialBoardData, { workspaceId, workspaceName }));
        return initialBoardData;
      });
    },

    parseImport(value) {
      return parseStoredBoardData(value);
    },

    createExport(data) {
      return createStoredBoardData(data);
    },
  };
}
