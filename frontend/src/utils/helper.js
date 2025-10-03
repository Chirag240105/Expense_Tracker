import moment from "moment";

export const validateEmail = (email)=>{
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email);
}

export const getInitials = (name) => {
    if(!name) return "";

    const words = name.split(" ");
    let initials = "";

    for(let i =0; i< Math.min(words.length, 2); i++){
        initials += words[i][0];
    }return initials.toUpperCase();
};


// used when implement avatar


export const addThousandSeperator = (num) =>{
    if(num == null || isNaN(num)) return "";
    const [integerPart, fractionalPart] = num.toString().split(".");
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return fractionalPart
    ?`${formattedInteger}.${fractionalPart}`
    : formattedInteger
};

export const prepareExpenseBarChart = (data=[]) => {
    const chartData= data.map((item) => ({
        category: item?.source,
        amount: item?.amount,
    }))
    return chartData;
}

export const prepareIncomeBarChartData = (data = []) => {
    const sortedData = [...data].sort((a,b) => new Date(a.date) - new Date(b.date));

    const chartData = sortedData.map((item) => ({
        month : moment(item?.date).format('Do MMM'),
        amount: item?.amount,
        source: item?.source,
        category: item?.source
    }))
    return chartData;
}

export const prepareExpenseLineChartData = (data =[]) => {
    const sotedData = [...data].sort((a,b) => new Date(a.date) - new Date(b.data));

    const chartData = sotedData.map((item) => ({
        month: moment(item?.date).format('Do MMM'),
        amount: item?.amount,
        category: item?.category,
    }));
    return chartData;
}