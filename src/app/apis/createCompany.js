import { apiService } from "./apiservice";
import { endpoints } from "./endpoints";

export const createCompany = async ({ data }) => {
  try {
    const apiResponse = await apiService({
      endpoint: endpoints.company,
      method: "POST",
      data: data,
    });
    return apiResponse.response;
  } catch (error) {
    console.error("Error creating company:", error);
    throw error;
  }
};
