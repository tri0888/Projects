import { useReducer } from "react";
import { toast } from "react-toastify";
import {
  setExpirationDate,
  getUserFromLocalStorage,
} from "../helpers/checkExpiration";

const initialState = {
  user: getUserFromLocalStorage() || null,
};
const actions = Object.freeze({
  SET_USER: "SET_USER",
  LOGOUT: "LOGOUT",
});

const reducer = (state, action) => {
  if (action.type == actions.SET_USER) {
    return { ...state, user: action.user };
  }
  if (action.type == actions.LOGOUT) {
    return { ...state, user: null };
  }
  return state;
};

const useAuth = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const safeJson = async (response) => {
    try {
      return await response.json();
    } catch {
      return {};
    }
  };

  const register = async (userInfo) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "cors",
        credentials: "include",
        body: JSON.stringify(userInfo),
      });

      const payload = await safeJson(response);
      if (!response.ok) {
        toast.error(payload.error || payload.message || "Registration failed");
        return false;
      }

      toast.success("Registration successful");
      return true;
    } catch (error) {
      console.log(error);
      toast.error("There was a problem registering, try again");
      return false;
    }
  };

  const login = async (userInfo) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "cors",
        credentials: "include",
        body: JSON.stringify(userInfo),
      });

      const payload = await safeJson(response);
      if (!response.ok) {
        toast.error(payload.error || payload.message || "Login failed");
        return false;
      }

      const user = payload.user;
      const token = payload.token;
      if (!user || !token) {
        toast.error("Unexpected login response from server");
        return false;
      }

      dispatch({ type: actions.SET_USER, user });
      user.expirationDate = setExpirationDate(7);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token.toString());
      toast.success("Login successful");
      return true;
    } catch (error) {
      console.log(error);
      toast.error("There was a problem logging in, try again");
      return false;
    }
  };
  // const login = async (userInfo) => {
  //   try {
  //     // Giả lập delay như đang gọi API
  //     await new Promise((resolve) => setTimeout(resolve, 500));
  
  //     // Danh sách user mẫu
  //     const mockUsers = [
  //       {
  //         id: "1",
  //         name: "John Doe",
  //         email: "user@gmail.com",
  //         password: "12345",
  //         isAdmin: false,
  //       },
  //       {
  //         id: "2",
  //         name: "Admin User",
  //         email: "admin@gmail.com",
  //         password: "12345",
  //         isAdmin: true,
  //       },
  //     ];
  
  //     // Tìm user khớp với input
  //     const matchedUser = mockUsers.find(
  //       (user) =>
  //         user.email === userInfo.email && user.password === userInfo.password
  //     );
  
  //     if (!matchedUser) {
  //       toast.error("Invalid email or password");
  //       return;
  //     }
  
  //     // Xoá password trước khi lưu user
  //     const { password, ...userWithoutPassword } = matchedUser;
  
  //     userWithoutPassword.expirationDate = setExpirationDate(7);
  
  //     // Token mock
  //     const mockToken = "mocked-jwt-token-abc123";
  
  //     dispatch({ type: actions.SET_USER, user: userWithoutPassword });
  //     localStorage.setItem("user", JSON.stringify(userWithoutPassword));
  //     localStorage.setItem("token", mockToken);
  //     toast.success("Login successful (mock)");
  //   } catch (error) {
  //     console.log(error);
  //     toast.error("There was a problem logging in, try again");
  //   }
  // };
  
  

  const logout = async () => {
    const token = await localStorage.getItem('token')
    if(!token) {
      toast.error("Token not found");
      return;
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/logout`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        mode: "cors",
        credentials: "include",
      });

      if (response.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.success("Logout successful")
        dispatch({type: actions.LOGOUT});
      } else {
        const errMsg = await response.text();
        toast.error(`Logout failed: ${errMsg}`)
      }
    } catch (error) {
      toast.error("Network error during logout");
      console.error(error);
    }
  }
  // const logout = async () => {
  //   try {
  //     // Giả lập delay cho giống thật
  //     await new Promise((resolve) => setTimeout(resolve, 300));
  
  //     // Xoá localStorage
  //     localStorage.removeItem("user");
  //     localStorage.removeItem("token");
  
  //     // Dispatch logout
  //     dispatch({ type: actions.LOGOUT });
  
  //     toast.success("Logout successful (mock)");
  //   } catch (error) {
  //     console.log(error);
  //     toast.error("Logout failed");
  //   }
  // };
  

  return { state, register, login, logout };
};

export default useAuth;
