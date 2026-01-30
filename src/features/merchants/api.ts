import apiClient from "../../services/apiClient";
import { endpoints } from "../../services/endpoints";
import { Merchant, MerchantPayload } from "./types";

export async function fetchMerchants() {
  const { data } = await apiClient.get<Merchant[]>(endpoints.merchants);
  return data;
}

export async function createMerchant(payload: MerchantPayload) {
  const { data } = await apiClient.post<Merchant>(endpoints.merchants, payload);
  return data;
}

export async function updateMerchant(id: string, payload: MerchantPayload) {
  const { data } = await apiClient.put<Merchant>(`${endpoints.merchants}/${id}`, payload);
  return data;
}

export async function deleteMerchant(id: string) {
  await apiClient.delete(`${endpoints.merchants}/${id}`);
}
