import { STORAGE_KEY, STORAGE_VERSION } from "../constants";
import { initialFactoryOptions, initialProjects } from "../data/initialData";
import { parseStoredBoardData } from "../storage";
import type { BoardData, StoredBoardData } from "../types";

export type MaybePromise<T> = T | Promise<T>;

export type BoardRepository = {
  load: () => MaybePromise<BoardData>;
  save: (data: BoardData) => MaybePromise<void>;
  reset: () => MaybePromise<BoardData>;
  parseImport: (value: unknown) => BoardData | null;
  createExport: (data: BoardData) => StoredBoardData;
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

export const localStorageBoardRepository: BoardRepository = {
  load() {
    try {
      const rawData = window.localStorage.getItem(STORAGE_KEY);
      if (!rawData) return getInitialBoardData();

      const parsedData = JSON.parse(rawData) as unknown;
      return parseStoredBoardData(parsedData) ?? getInitialBoardData();
    } catch {
      return getInitialBoardData();
    }
  },

  save(data) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(createStoredBoardData(data)));
    } catch {
      // Keep the board usable even if the browser refuses local storage.
    }
  },

  reset() {
    window.localStorage.removeItem(STORAGE_KEY);
    return getInitialBoardData();
  },

  parseImport(value) {
    return parseStoredBoardData(value);
  },

  createExport(data) {
    return createStoredBoardData(data);
  },
};
