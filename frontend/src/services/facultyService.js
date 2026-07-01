import api from '../api/axios'
import { ENDPOINTS } from '../api/endpoints'

export const getFaculty = (params = {}) => {
  const query = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([_, v]) => v))).toString()
  return api.get(`${ENDPOINTS.FACULTY}?${query}`)
}
export const getFacultyById = (id) => api.get(`${ENDPOINTS.FACULTY}${id}/`)
export const createFaculty = (data) => api.post(ENDPOINTS.FACULTY, data)
export const updateFaculty = (id, data) => api.put(`${ENDPOINTS.FACULTY}${id}/`, data)
export const deleteFaculty = (id) => api.delete(`${ENDPOINTS.FACULTY}${id}/`)
