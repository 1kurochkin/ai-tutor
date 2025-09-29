"use client";
import { useContext } from "react";
import {AppContext} from "@/contexts/app-context";

export default function useAppContext() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useStateData must be used within a AppContextProvider");
    }
    return context;
}
