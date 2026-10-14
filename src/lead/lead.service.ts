import * as leadRepository from './lead.repository';

export const createNewLead = async (leadData: any) => {
  // Di sini Anda bisa menambahkan validasi, misalnya cek apakah email sudah ada, dll.
  return await leadRepository.createLead(leadData);
};

export const fetchAllLeads = async () => {
  return await leadRepository.getAllLeads();
};