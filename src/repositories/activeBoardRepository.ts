import { localStorageBoardRepository, type BoardRepository } from "./boardRepository";
import { createSqliteBoardRepository } from "./sqliteBoardRepository";
import { createTauriSqliteBoardDriver } from "./tauriSqliteBoardDriver";

const sqliteBoardRepository = createSqliteBoardRepository(createTauriSqliteBoardDriver());

let resolvedRepository: BoardRepository | null = null;

async function resolveRepository() {
  if (resolvedRepository) return resolvedRepository;

  try {
    await sqliteBoardRepository.load();
    resolvedRepository = sqliteBoardRepository;
  } catch {
    resolvedRepository = localStorageBoardRepository;
  }

  return resolvedRepository;
}

export const activeBoardRepository: BoardRepository = {
  async load() {
    const repository = await resolveRepository();
    return repository.load();
  },

  async save(data) {
    const repository = await resolveRepository();
    await repository.save(data);
  },

  async reset() {
    const repository = await resolveRepository();
    return repository.reset();
  },

  parseImport(value) {
    return localStorageBoardRepository.parseImport(value);
  },

  createExport(data) {
    return localStorageBoardRepository.createExport(data);
  },
};
