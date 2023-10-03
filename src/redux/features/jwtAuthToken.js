import { createSlice } from '@reduxjs/toolkit'
import { useSelector } from 'react-redux'

export const jwtSlice = createSlice({
    name: 'jwtAuthToken',
    initialState: {
        value: "",
    },
    reducers: {
        setToken: (state, action) => {
            state.value = action.payload
        },
    },
})

export function useJwtAuthToken() {
    return useSelector((state) => state.jwtAuthToken.value)
}

export const { setToken } = jwtSlice.actions

export default jwtSlice.reducer