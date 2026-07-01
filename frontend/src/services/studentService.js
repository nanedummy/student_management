import api from '../api/axios'
import { ENDPOINTS } from '../api/endpoints'

export const getStudents = (params = {}) => {
  const query = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([_, v]) => v))).toString()
  return api.get(`${ENDPOINTS.STUDENTS}?${query}`)
}
export const getStudent = (id) => api.get(`${ENDPOINTS.STUDENTS}${id}/`)
export const createStudent = (data) => api.post(ENDPOINTS.STUDENTS, data)
export const updateStudent = (id, data) => api.put(`${ENDPOINTS.STUDENTS}${id}/`, data)
export const deleteStudent = (id) => api.delete(`${ENDPOINTS.STUDENTS}${id}/`)
export const uploadStudents = (formData) => api.post(`${ENDPOINTS.STUDENTS}bulk-upload/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
