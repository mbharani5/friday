import axios from 'axios'

const BASE = 'http://localhost:8000/api'

export const expensesAPI = {
  getAll: (month) => axios.get(`${BASE}/expenses/`, { params: { month } }),
  create: (data) => axios.post(`${BASE}/expenses/`, data),
  update: (id, data) => axios.put(`${BASE}/expenses/${id}`, data),
  delete: (id) => axios.delete(`${BASE}/expenses/${id}`),
  getCategorySummary: (month) =>
    axios.get(`${BASE}/expenses/categories/summary`, { params: { month } }),
}

export const emiAPI = {
  getAll: () => axios.get(`${BASE}/emi/`),
  create: (data) => axios.post(`${BASE}/emi/`, data),
  update: (id, data) => axios.put(`${BASE}/emi/${id}`, data),
  delete: (id) => axios.delete(`${BASE}/emi/${id}`),
  getCalendar: (year, month) => axios.get(`${BASE}/emi/calendar/${year}/${month}`),
}

export const salaryAPI = {
  getAll: () => axios.get(`${BASE}/salary/`),
  getLatest: () => axios.get(`${BASE}/salary/latest`),
  getCalendar: (year, month) => axios.get(`${BASE}/salary/calendar/${year}/${month}`),
  create: (data) => axios.post(`${BASE}/salary/`, data),
  update: (id, data) => axios.put(`${BASE}/salary/${id}`, data),
  delete: (id) => axios.delete(`${BASE}/salary/${id}`),
}

export const savingsAPI = {
  get: (month) => axios.get(`${BASE}/savings/`, { params: { month } }),
  getForecast: () => axios.get(`${BASE}/savings/forecast`),
}

export const remittanceAPI = {
  getRate: () => axios.get(`${BASE}/remittance/rate`),
  calculate: (data) => axios.post(`${BASE}/remittance/calculate`, data),
  getHistory: () => axios.get(`${BASE}/remittance/history`),
}
