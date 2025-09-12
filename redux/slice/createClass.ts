import { createClass } from "@/thunk/classandsection/createClass";
import { createSlice } from '@reduxjs/toolkit';

interface ClassState {
    loading: boolean;
    classData: any | null;
    sectionData: any | null;
    error: string | null;
    successMessage: string | null;
}

const initialState: ClassState = {
    loading: false,
    classData: null,
    sectionData: null,
    error: null,
    successMessage: null,
};

const classSlice = createSlice({
    name: 'class',
    initialState,
    reducers: {
        clearState: (state) => {
            state.loading = false;
            state.classData = null;
            state.sectionData = null;
            state.error = null;
            state.successMessage = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createClass.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(createClass.fulfilled, (state, action) => {
                state.loading = false;
                state.classData = action.payload.data.class;
                state.sectionData = action.payload.data.section;
                state.successMessage = action.payload.message;
                state.error = null;
            })
            .addCase(createClass.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || 'Failed to create class';
                state.successMessage = null;
            });
    },
});

export const { clearState } = classSlice.actions;
export default classSlice.reducer;
