import apiClient from "../../services/apiClient";
import { endpoints } from "../../services/endpoints";
import { Category, CategoryPayload } from "./types";

export async function fetchCategories() {
  const { data } = await apiClient.get<Category[]>(endpoints.categories);
  return data;
}

export async function createCategory(payload: CategoryPayload) {
  const { data } = await apiClient.post<Category>(endpoints.categories, payload);
  return data;
}

export async function updateCategory(id: string, payload: CategoryPayload) {
  const { data } = await apiClient.put<Category>(`${endpoints.categories}/${id}`, payload);
  return data;
}

export async function deleteCategory(id: string) {
  await apiClient.delete(`${endpoints.categories}/${id}`);
}

export async function importDefaultCategories() {
  const { data } = await apiClient.post<Category[]>(endpoints.importDefaultCategories);
  return data;
}
