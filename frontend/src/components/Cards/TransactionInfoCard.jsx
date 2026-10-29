import React from 'react'
import { LuTrash2, LuTrendingDown, LuTrendingUp  } from 'react-icons/lu'
import { GrTransaction  } from "react-icons/gr";

const ICON_GLYPHS = {
  briefcase: "💼",
  code: "💻",
  "trending-up": "📈",
  home: "🏠",
  "shopping-cart": "🛒",
  coffee: "☕",
  truck: "🚚",
  zap: "⚡",
  film: "🎬",
  activity: "🩺",
  "shopping-bag": "🛍️",
  compass: "🧭",
};

const TransactionInfoCard = ({
     title,icon,date,amount,type,hideDeleteBtn, onDelete
}) => {
    const getAmountStyles = () => {
            return type === "income" ? "bg-green-50 text-green-500" : "bg-red-50 text-red-500";
    }
    const iconUrl = typeof icon === "string" &&
      (/^https?:\/\//i.test(icon) || /^data:image\//i.test(icon) || /^\/(?:uploads|api\/files)\//.test(icon));
  return (
    <div className='group relative flex items-center gap-4 mt-2 p-3 rounded-lg hover:bg-gray-100/60'>
        <div className='w-12 h-12 flex items-center justify-center text-xl text-gray-800 bg-gray-100 rounded-full'>
            {iconUrl ? (
                <img src={icon} alt="" className='w-6 h-6 object-cover'/>
            ) : icon ? (
                <span aria-hidden="true" title={title}>{ICON_GLYPHS[icon] || <GrTransaction />}</span>
            ): (
                <GrTransaction/>
            )}
        </div>

    <div className='flex-1 flex items-center justify-between'>
        <div>
            <p className='text-sm text-gray-700 font-medium'>{title}</p>
            <p className='text-xs text-gray-400 mt-1'>{date}</p>
        </div>
        <div className='flex items-center gap-2'>
            {!hideDeleteBtn && (
                <button className='text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer' onClick={onDelete}>
                    <LuTrash2 size={18}/>
                </button>
            )}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md ${getAmountStyles()}`}>
                <h6 className='text-xs font-medium ' >{type === "income" ? "+" : "-"} {amount}</h6>
                {type === "income" ? <LuTrendingUp/> : <LuTrendingDown/>}
            </div>
        </div>
    </div>
    </div>
  )
}

export default TransactionInfoCard