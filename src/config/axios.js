import axios from "axios"

const api = axios.create({
    baseURL: "http://103.200.20.149:8081/api/",
});
//làm 1 hành động gì đó trc khi call api
//lấy token từ local storage
const handleBefore = (config) => {
    const token = localStorage.getItem("token")?.replaceAll('"', "");
    config.headers["Authorization"] = `Bearer ${token}`;
    return config;
  };
  
  const handleError = (error) => {
    console.log(error);
  };
  
  api.interceptors.request.use(handleBefore, handleError);//cho phép setup trc khi đẩy đi token

export default api;


