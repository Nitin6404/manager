import { apiService } from "./apiservice";
import { endpoints } from "./endpoints";

export const createTask = async ({ data }) => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.task,
      method: "POST",
      data: data,
    });
    return apiResponse.response;
  } catch (error) {
    console.error("Error creating company:", error);
    throw error;
  }
};
