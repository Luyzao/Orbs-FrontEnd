import React, { useState, useEffect } from "react";
import { supabase } from 'lib/supabaseClient';

//Tipagem da Expense vinda do backend
type Expense = {
  id: string;
  title: string;
  amount: number;
  date: string;
  isCredit: boolean;
  totalInstallments?: number;
  currentInstallment?: number;
  category: {
    id: string;
    name: string;
    color?: string;
  };
  categoryId: string;
  userId: string;
};


interface ExpensesProps {
  selectedDate: Date | null;
  onTotalChange?: (totalAtual: number) => void
}


const Expenses: React.FC<ExpensesProps> = ({ selectedDate, onTotalChange }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [total, setTotal] = useState(0);
  const [maxCategory, setMaxCategory] = useState<string>("");
  const [maxCategoryTotal, setMaxCategoryTotal] = useState<number>(0);
  const [categoryTotals, setCategoryTotals] = useState<Record<string, number>>({});
  const [minCategory, setMinCategory] = useState<string>("");
  const [minCategoryTotal, setMinCategoryTotal] = useState<number>(0);

  useEffect(() => {
  const fetchDespesas = async () => {
    const { data: sessionData, error } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    if (!selectedDate || !token) {
      console.error("Usuário não autenticado ou data inválida");
      return;
    }

    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1;

    // Cálculo para o mês anterior
    const previousMonthDate = new Date(selectedDate);
    previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
    const previousMonth = previousMonthDate.getMonth() + 1;
    const previousYear = previousMonthDate.getFullYear();

    try {
      // Busca despesas do mês atual
      const resAtual = await fetch(`http://localhost:3390/api/expensesincome/route?month=${month}&year=${year}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const dataAtual = await resAtual.json() as Expense[];

     

      // Totais
      const totalAtual = dataAtual.reduce((sum, e) => sum + e.amount, 0);
    
      // Categorias
      const categoryTotals = dataAtual.reduce((acc: Record<string, number>, expense: Expense) => {
        const categoryName = expense.category.name;
        acc[categoryName] = (acc[categoryName] || 0) + expense.amount;
        return acc;
      }, {});

      let maxCategory = "";
      let maxValue = 0;
      for (const [category, total] of Object.entries(categoryTotals)) {
        if (total > maxValue) {
          maxValue = total;
          maxCategory = category;
        }
      }

      let minCategory = "";
      let minValue = Infinity;
      for (const [category, total] of Object.entries(categoryTotals)) {
        if (total < minValue) {
          minValue = total;
          minCategory = category;
        }
      }



      // Setando estados
      setExpenses(dataAtual);
      setTotal(totalAtual);
      setMaxCategory(maxCategory);
      setMaxCategoryTotal(maxValue);
      setCategoryTotals(categoryTotals);
      setMinCategory(minCategory);
      setMinCategoryTotal(minValue);

      // Passa o total para o componente pai
      if (onTotalChange) {
        onTotalChange(totalAtual)
      }


    } catch (err) {
      console.error("Erro ao buscar despesas:", err);
    }
  };

  fetchDespesas();
}, [selectedDate]);


    return (
        <div className="relative ml-2 mt-10 sm:ml-2 sm:mt-4 md:ml-2 md:mt-4 lg:ml-2 lg:mt-4 xl:ml-2 xl:mt-4">

        {/* Calculo */}
        <div className="absolute inset-y-0 left-50 sm:left-56 md:left-64 right-0 translate-x-4 bg-[#383577] w-[136px] sm:w-[220px] md:w-[300px] lg:w-[310px] xl:w-[310] h-[280px] sm:h-[290px] md:h-[300px] lg:h-[300px] xl:h-[300px] ml-2 mt-4 rounded-md shadow-lg" style={{ borderRadius: '20px' }}>

        <h2 className="font-poppins text-sm sm:text-sm md:text-xl lg:text-xl xl:text-xl text-start text-[#FFFFFF] ml-4 mt-4 sm:mt-4 md:mt-5 lg:mt-4 xl:mt-4"> Total </h2>
        <p className="font-comfortaa text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-4xl text-start text-[#FFFFFF] ml-3 s:mt-1 m:mt-1 lg:mt-1 s:ml-4 m:ml-4 lg:ml-4 mb-2 sm:mb-2 md:mb-2 lg:mb-2"> R$ {total.toFixed(2).replace('.', ',')} </p>
        
        <h2 className="font-poppins text-xs sm:text-sm md:text-sm lg:text-sm xl:text-base text-start text-[#FFFFFF] ml-3 s:mt-1 m:mt-1 lg:mt-1 s:ml-4 m:ml-4 lg:ml-4"> Categoria com maior gasto </h2>
        <p className="font-comfortaa text-xs sm:text-sm md:text-sm  lg:text-sm xl:text-base text-start text-[#C2F74F] ml-3 s:mt-1 m:mt-1 lg:mt-1 s:ml-4 m:ml-4 lg:ml-4 "> {maxCategory} </p>
        <p className="font-comfortaa text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-2xl text-start text-[#FFFFFF] ml-3 s:mt-1 m:mt-1 lg:mt-1 s:ml-4 m:ml-4 lg:ml-4 mb-2 sm:mb-2 md:mb-3 lg:mb-2 xl:mb-2"> R$ {maxCategoryTotal.toFixed(2).replace('.', ',')} </p>

        <h2 className="font-poppins text-xs sm:text-sm md:text-sm lg:text-sm xl:text-base text-start text-[#FFFFFF] ml-3  s:mt-1 m:mt-1 lg:mt-1 s:ml-4 m:ml-4 lg:ml-4"> Categoria com menor gasto </h2>
        <p className="font-comfortaa text-xs sm:text-sm md:text-sm  lg:text-sm xl:text-base text-start text-[#C2F74F] ml-3 s:mt-1 m:mt-1 lg:mt-1 s:ml-4 m:ml-4 lg:ml-4 "> {minCategory} </p>
        <p className="font-comfortaa text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-2xl text-start text-[#FFFFFF] ml-3 mt-1 s:mt-1 m:mt-1 lg:mt-1 s:ml-4 m:ml-4 lg:ml-4 xl:mb-2"> R$ {minCategoryTotal.toFixed(2).replace('.', ',')} </p>

        </div>
      
        {/* Despesas */}
        <div className="bg-[#EBEBEB] w-[255px] h-[340px] sm:w-[360px] sm:h-[420px] md:w-[530px] md:h-[346px] lg:w-[520px] lg:h-[340px] xl:w-[640px] xl:h-[350px] flex flex-col items-start justify-start gap-3 rounded-lg shadow-md p-4 overflow-y-auto hide-scrollbar ">
          <h2 className="font-comfortaa text-xl sm:text-xl md:text-2xl lg:text-2xl xl:text-2xl text-start text-[#888888] mb-1">
            Despesas
          </h2>

          {expenses.map((expense) => (
          <div
            key={expense.id}
            className="w-2/3 sm:w-1/2 md:w-1/2 lg:w-1/2 xl:w-1/2 text-xs bg-[#E1E1E1] text-[#000000] p-2 rounded-lg font-poppins">
            <div className="flex items-center gap-2">
              <div
                className="w-1 h-2 rounded-full shrink-0"
                style={{ backgroundColor: expense.category.color || "#000000" }}>
                
              </div>
              <span>{expense.title} - R$ {expense.amount.toFixed(2)}</span>
            </div>
          </div>
        ))}

        </div>

      
      </div>
      
    );
};
export default Expenses;