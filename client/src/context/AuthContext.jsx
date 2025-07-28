import React, { createContext, useContext, useReducer, useEffect } from 'react';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';

const initialState = {
  user:null, loading:true, error:null,
  mfaRequired:false, tempToken:null
};

const types = {
  LOGIN_START:'LOGIN_START', LOGIN_SUCCESS:'LOGIN_SUCCESS',
  MFA_REQUIRED:'MFA_REQUIRED', LOGIN_FAILURE:'LOGIN_FAILURE',
  LOGOUT:'LOGOUT', UPDATE_USER:'UPDATE_USER',
  SET_LOADING:'SET_LOADING', CLEAR_ERROR:'CLEAR_ERROR'
};

function reducer(state, {type,payload}) {
  switch(type){
    case types.LOGIN_START:   return {...state,loading:true,error:null};
    case types.LOGIN_SUCCESS: return {...state,user:payload.user,loading:false,error:null,mfaRequired:false,tempToken:null};
    case types.MFA_REQUIRED:  return {...state,mfaRequired:true,tempToken:payload.tempToken,loading:false};
    case types.LOGIN_FAILURE: return {...state,user:null,loading:false,error:payload,mfaRequired:false,tempToken:null};
    case types.LOGOUT:        return {...initialState,loading:false};
    case types.UPDATE_USER:   return {...state,user:{...state.user,...payload}};
    case types.SET_LOADING:   return {...state,loading:payload};
    case types.CLEAR_ERROR:   return {...state,error:null};
    default: return state;
  }
}

const AuthContext = createContext();

export const AuthProvider = ({children})=>{
  const [state,dispatch] = useReducer(reducer,initialState);

  useEffect(()=>{ check(); },[]);

  const check = async ()=>{
    try{
      dispatch({type:types.SET_LOADING,payload:true});
      const {data} = await authAPI.getCurrentUser();
      dispatch({type:types.LOGIN_SUCCESS,payload:{user:data.user}});
    }catch{ dispatch({type:types.LOGOUT}); }
  };

  const login = async credentials=>{
    try{
      dispatch({type:types.LOGIN_START});
      const {data} = await authAPI.login(credentials);
      if(data.requiresMFA){
        dispatch({type:types.MFA_REQUIRED,payload:{tempToken:data.tempToken}});
        return {requiresMFA:true};
      }
      dispatch({type:types.LOGIN_SUCCESS,payload:{user:data.user}});
      toast.success('Login successful');
      return {success:true};
    }catch(err){
      console.log("error  - \n",err);

      const msg = err.response?.data?.error||'Login failed';
      dispatch({type:types.LOGIN_FAILURE,payload:msg});
      toast.error(msg); return {error:msg};
    }
  };

  const verifyMFA = async token=>{
    try{
      dispatch({type:types.LOGIN_START});
      const {data} = await authAPI.verifyMFA({tempToken:state.tempToken,mfaToken:token});
      dispatch({type:types.LOGIN_SUCCESS,payload:{user:data.user}});
      toast.success('Login successful'); return {success:true};
    }catch(err){
      const msg = err.response?.data?.error||'MFA failed';
      dispatch({type:types.LOGIN_FAILURE,payload:msg});
      toast.error(msg); return {error:msg};
    }
  };

  const logout = async ()=>{
    try{ await authAPI.logout(); }
    finally{ dispatch({type:types.LOGOUT}); toast.success('Logged out'); }
  };

  return (
    <AuthContext.Provider value={{
      ...state, login, verifyMFA, logout,
      updateUser:data=>dispatch({type:types.UPDATE_USER,payload:data}),
      clearError:()=>dispatch({type:types.CLEAR_ERROR}),
      checkAuthStatus:check
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = ()=> useContext(AuthContext);
