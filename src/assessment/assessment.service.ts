import * as assessmentRepo from './assessment.repository';

export const createNewAssessment = async (data: any) => {
  return await assessmentRepo.createAssessment(data);
};

export const fetchAllAssessments = async () => {
  return await assessmentRepo.getAllAssessments();
};