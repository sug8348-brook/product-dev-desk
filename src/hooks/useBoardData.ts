import { useEffect, useState } from "react";
import type { SetStateAction } from "react";
import { initialFactoryOptions, initialProjects } from "../data/initialData";
import { activeBoardRepository } from "../repositories/activeBoardRepository";
import type { BoardData, Project } from "../types";

function getInitialBoardData(): BoardData {
  return {
    projects: initialProjects,
    factoryOptions: initialFactoryOptions,
  };
}

export function useBoardData() {
  const [boardData, setBoardData] = useState<BoardData>(() => getInitialBoardData());
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [saveError, setSaveError] = useState<unknown>(null);

  useEffect(() => {
    let isActive = true;

    Promise.resolve(activeBoardRepository.load())
      .then((loadedBoardData) => {
        if (!isActive) return;
        setBoardData(loadedBoardData);
        setLoadError(null);
        setSaveError(null);
      })
      .catch((error: unknown) => {
        if (!isActive) return;
        setLoadError(error);
      })
      .finally(() => {
        if (isActive) setIsLoaded(true);
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    void Promise.resolve(activeBoardRepository.save(boardData))
      .then(() => setSaveError(null))
      .catch((error: unknown) => setSaveError(error));
  }, [boardData, isLoaded]);

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

  async function resetBoardData() {
    const nextBoardData = await activeBoardRepository.reset();
    setBoardData(nextBoardData);
    return nextBoardData;
  }

  return {
    boardData,
    isLoaded,
    loadError,
    saveError,
    projects: boardData.projects,
    factoryOptions: boardData.factoryOptions,
    setProjects,
    setFactoryOptions,
    replaceBoardData,
    resetBoardData,
    repository: activeBoardRepository,
  };
}
