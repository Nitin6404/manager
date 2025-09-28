import { apiService } from "./apiservice";
import { endpoints } from "./endpoints";
export const getProject = async (id) => {
  const url = `${endpoints.getProject}/${id}`;
  const apiResponse = await apiService({
    endpoint: url,
    method: "GET",
  });

  console.log("API Response:", apiResponse?.response);
  return apiResponse?.response;
};
