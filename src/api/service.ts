import axiosInstance from './config';

export const get = (url: string, params?: any) => {
  return axiosInstance.get(url, { params });
};

// PDF və digər fayllar üçün xüsusi get funksiyası
export const getFile = (url: string, options?: any) => {
  return axiosInstance.get(url, {
    responseType: 'blob', // PDF üçün vacib
    ...options
  });
};

export const post = (url: string, data: any) => {
  return axiosInstance.post(url, data);
};

// Fayl/PDF cavabı gözlənilən POST sorğuları üçün
export const postFile = (url: string, data: any, options?: any) => {
  return axiosInstance.post(url, data, {
    responseType: 'blob',
    ...options,
  });
};

export const put = (url: string, data: any) => {
  return axiosInstance.put(url, data);
};

export const del = (url: string) => {
  return axiosInstance.delete(url);
};

export const getProfile = () => {
  return axiosInstance.get('/auth/profile');
};