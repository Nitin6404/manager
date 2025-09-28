import { apiService } from "./apiservice";
import { endpoints } from "./endpoints";

export const getCompany = async () => {
  const apiResponse = await apiService({
    endpoint: endpoints.getcompany,
    method: "GET",
  });
  return apiResponse?.response;
};
