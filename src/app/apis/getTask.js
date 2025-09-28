import { apiService } from "./apiservice";
import { endpoints } from "./endpoints";

export const getTask = async (id) => {
  const url = `${endpoints.getTask}/${id}`;
  const apiResponse = await apiService({
    endpoint: url,
    method: "GET",
  });

  console.log("API Response:", apiResponse?.response);
  return apiResponse?.response?.data || [];
};
