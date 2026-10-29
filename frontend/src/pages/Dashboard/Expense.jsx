import React, { useCallback, useEffect, useState } from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import useUserAuth from '../../hooks/useUserAuth'
import axiosInstances from '../../utils/axiosInstances';
import { API_PATH } from '../../utils/apiPath';
import {toast} from 'react-hot-toast';
import ExpenseOverview from '../../components/Expense/ExpenseOverview';
import Modal from '../../components/Modal';
import AddExpenseForm from '../../components/Expense/AddExpenseForm';
import ExpenseList from '../../components/Expense/ExpenseList';
import DeleteAlert from '../../components/layouts/DeleteAlert';

const Expense = () => {
  useUserAuth();

    const [openAddExpenseModal, setOpenAddExpenseModal] = useState(false);
    const [expenseData, setExpenseData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [openDeleteAlert, setOpenDeleteAlert] = useState({
      show: false,
      data: null,
    });

     const fetchExpenseDetails = useCallback(async() => {
    setLoading(true);
    setLoadError("");
    try{
      const response = await axiosInstances.get(`${API_PATH.EXPENSE.GET_ALL_EXPENSE}`);
      if(response.data) {
        setExpenseData(response.data);
      }
    }catch(error){
      console.error("Could not load expense records:", error);
      setLoadError("Could not load expenses.");
    }finally{
      setLoading(false);
    }
  }, []);

  
  const handleAddExpense = async(expense) => {

    const {source, amount, date, icon} = expense;
    if (!source.trim()){
      toast.error("Source is required.");
      return ;
    }

    if(!amount || isNaN(amount) || Number(amount) <=0){
     toast.error("Amount should be valid number greater than 0.");
     return;
    }

    if(!date){
      toast.error("Date is required.");
      return;
    }
    
    try{
      await axiosInstances.post(API_PATH.EXPENSE.ADD_EXPENSE, {
        source,
        amount, 
        date,
        icon
      }
    );
      setOpenAddExpenseModal(false);
      toast.success("Expense added successfully");
      fetchExpenseDetails();
    }catch(error){
      console.error("Error adding expense: ", error.response?.data?.message || error.message);
      toast.error(error.response?.data?.message || "Could not add expense. Please try again.");
    }

  };
  const deleteExpense = async (id) => {
    try{
      await axiosInstances.delete(API_PATH.EXPENSE.DELETE_EXPENSE(id));
      setOpenDeleteAlert({show: false,data:null })
      toast.success("Expense details deleted successfully");
      fetchExpenseDetails();
    }catch(error){
      console.error(
        "Erroe deleting expense:",
        error.response?.data?.message || error.message
      );
    }
  };
  const handleDownloadExpense = async () => {
    try{
    const response = await axiosInstances.get(API_PATH.EXPENSE.DOWNLOAD_EXPENSE,{
      responseType:"blob"
    })
    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "expense_details.xlsx");
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  }catch(error){
    console.error("Error in downloading expense details: ", error);
    toast.error("Failed to download expense details. Please try again.")
  }
  };

  useEffect(()=>{
    fetchExpenseDetails();
  },[fetchExpenseDetails])
  return (
    <DashboardLayout activeMenu="Expense">
    <div className='my-5 mx-auto'>
      {loading && expenseData.length === 0 && (
        <div className="card mb-4" role="status">Loading expenses…</div>
      )}
      {loadError && expenseData.length === 0 && (
        <div className="card mb-4" role="alert">
          <p>{loadError}</p>
          <button type="button" className="mt-3 text-green-700 font-semibold" onClick={fetchExpenseDetails}>
            Retry
          </button>
        </div>
      )}
      <div className='grid grid-cols-1 gap-6'>
        <div className=''>
          <ExpenseOverview
          transactions={expenseData}
          onExpenseIncome={()=>setOpenAddExpenseModal(true)}

          />
        </div>

        <ExpenseList
        transactions={expenseData}
        onDelete={(id) => {
          setOpenDeleteAlert({show: true, data: id});
        }}
        onDownload={handleDownloadExpense}
        />
      </div>
      <Modal isOpen={openAddExpenseModal}
      onClose={() => setOpenAddExpenseModal(false)}
      >
       <AddExpenseForm 
       onAddExpense={handleAddExpense}
       />
      </Modal>

      <Modal
      isOpen={openDeleteAlert.show}
      onClose={() => setOpenDeleteAlert({show: false, data:null, title:"Delete Expense"})}
      title="Add Expense"
      >
        <DeleteAlert
        content="Are you sure you want to delete this expense detail? "
        onDelete={() => deleteExpense(openDeleteAlert.data)}
        />
      </Modal>

    </div>
    </DashboardLayout>
  )
}

export default Expense