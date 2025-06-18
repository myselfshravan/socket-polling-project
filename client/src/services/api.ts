import axios from 'axios';
import { CreatePollDto, Poll } from '../types/poll';
import { config } from '../config/env';

const axiosInstance = axios.create({
  baseURL: `${config.apiUrl}/api`
});

// Add a request interceptor to include the authentication token
axiosInstance.interceptors.request.use(
  (config) => {
    const sessionData = localStorage.getItem('polling_session');
    if (sessionData) {
      const { token } = JSON.parse(sessionData);
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const api = {
  // Poll endpoints
  async createPoll(pollData: CreatePollDto): Promise<Poll> {
    const response = await axiosInstance.post('/polls', pollData);
    return response.data;
  },

  async getAllPolls(): Promise<Poll[]> {
    const response = await axiosInstance.get('/polls');
    return response.data;
  },

  async getPoll(id: string): Promise<Poll> {
    const response = await axiosInstance.get(`/polls/${id}`);
    return response.data;
  },

  async getPollResults(id: string): Promise<{ results: { [key: string]: number } }> {
    const response = await axiosInstance.get(`/polls/${id}/results`);
    return response.data;
  },

  async endPoll(id: string): Promise<Poll> {
    const response = await axiosInstance.patch(`/polls/${id}/end`);
    return response.data;
  }
};
