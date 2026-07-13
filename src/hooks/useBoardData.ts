import { useEffect, useState } from "react";
import type { SetStateAction } from "react";
import { localStorageBoardRepository } from "../repositories/boardRepository";
import type { BoardData, Project } from "../types";

export function useBoardData() {
  const [boardData, setBoardData] = useState<BoardData>(() => localStorageBoardRepository.load());

  useEffect(() => {
    localStorageBoardRepository.save(boardData);
  }, [boardData]);

  function setProjects(projects: SetStateAction<Project[]>) {
    setBoardData((current) => ({
      ...current,
      projects: typeof projects === "function" ? projects(current.projects) : projects,
    }));
  }

  function setFactoryOptions(factoryOptions: SetStateAction<string[]>) {
    setBoardData((current) => ({
      ...current,
      factoryOptions: typeof factoryOptions === "function" ? factoryOptions(current.factoryOptions) : factoryOptions,
    }));
  }

  function replaceBoardData(nextBoardData: BoardData) {
    setBoardData(nextBoardData);
  }

  function resetBoardData() {
    const nextBoardData = localStorageBoardRepository.reset();
    setBoardData(nextBoardData);
    return nextBoardData;
  }

  return {
    boardData,
    projects: boardData.projects,
    factoryOptions: boardData.factoryOptions,
    setProjects,
    setFactoryOptions,
    replaceBoardData,
    resetBoardData,
    repository: localStorageBoardRepository,
  };
}
