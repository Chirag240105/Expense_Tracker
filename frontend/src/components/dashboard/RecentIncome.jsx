import React from 'react'
import { LuArrowRight } from 'react-icons/lu'
import moment from 'moment'
import TransactionInfoCard from '../Cards/TransactionInfoCard.JSX'
import { useCurrency } from '../../context/CurrencyContext'

const RecentIncome = ({transactions, onSeeMore}) => {
    const {formatCurrency} = useCurrency();
  return (
    <div className='card'>
        <div className='flex items-center justify-between'>
            <h5 className='text-lg'>Income</h5>

            <button className='card-btn' onClick={onSeeMore}>See All
                <LuArrowRight className='text-base'/>
            </button>
        </div>
        <div className='mt-6'>
            {transactions?.slice(0,5)?.map((item) => (
                <TransactionInfoCard
                key={item._id}
                title={item.source}
                icon={item.icon}
                date={moment(item.date).format("Do MMM YYYY")}
                amount={formatCurrency(item.amount)}
                type="income"
                hideDeleteBtn
                />
            ))}
        </div>
    </div>
  )
}

export default RecentIncome