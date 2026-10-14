import * as journalRepo from './journal.repository';

export const createNewJournal = async (data: any) => {
  return await journalRepo.createJournal(data);
};

export const fetchAllJournals = async () => {
  return await journalRepo.getAllJournals();
};