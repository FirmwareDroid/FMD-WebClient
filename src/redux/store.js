import jwtReducer from './features/jwtAuthToken'
import { configureStore } from '@reduxjs/toolkit'

export default configureStore({
    reducer: {
        jwtAuthToken: jwtReducer,
    },
})

