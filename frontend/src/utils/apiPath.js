export const BASE_URL = "http://localhost:9000";

export const API_PATH = {
    AUTH:{
        LOGIN: "/api/auth/login",
        SIGNUP: "/api/auth/signup",
        GET_USER_INFO: "/api/auth/getInfo",
    },
    DASHBOARD: {
        GET_DATA: "/api/dashboard"
    },
    INCOME:{
        ADD_INCOME: "/api/income/add",
        GET_ALL_INCOME: "/api/income/get",
        DELETE_INCOME:(incomeID)=> `/api/income/${incomeID}`,
        DOWNLOAD_INCOME: `/api/income/downloadexcel`
    },
    EXPENSE:{
        ADD_EXPENSE: "/api/expense/add",
        GET_ALL_EXPENSE: "/api/expense/get",
        DELETE_EXPENSE:(expenseID)=> `/api/expense/${expenseID}`,
        DOWNLOAD_EXPENSE: `/api/expense/downloadexcel`
    },
    // IMAGE:{
    //     UPLOAD_IMAGE: "/api/auth/upload-image",
    // },
}