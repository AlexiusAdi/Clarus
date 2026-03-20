"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar, CalendarIcon, ChevronDownIcon } from "lucide-react";

type TransactionType = "income" | "expense";

type Category = {
  id: string;
  name: string;
  type: TransactionType;
};

const categories: Category[] = [
  { id: "salary", name: "Salary", type: "income" },
  { id: "freelance", name: "Freelance", type: "income" },
  { id: "investment", name: "Investment", type: "income" },

  { id: "food", name: "Food", type: "expense" },
  { id: "transport", name: "Transport", type: "expense" },
  { id: "rent", name: "Rent", type: "expense" },
];

const AddTransaction = () => {
  const [type, setType] = useState<TransactionType>("expense");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [date, setDate] = React.useState<Date>();

  // Reset category when type changes
  useEffect(() => {
    setSelectedCategory(null);
  }, [type]);

  const filteredCategories = categories.filter((cat) => cat.type === type);

  return (
    <div className="container flex flex-col gap-4">
      {/* TYPE SELECTOR */}
      <div className="flex gap-2">
        <Card
          onClick={() => setType("expense")}
          className={cn(
            "w-50 h-12 p-2 flex justify-center items-center cursor-pointer",
            type === "expense" && "border-red-500 bg-red-100",
          )}
        >
          <CardHeader className="justify-center font-semibold">
            Expense
          </CardHeader>
        </Card>

        <Card
          onClick={() => setType("income")}
          className={cn(
            "w-50 h-12 p-2 flex justify-center cursor-pointer",
            type === "income" && "border-green-500 bg-green-100",
          )}
        >
          <CardHeader className="justify-center font-semibold">
            Income
          </CardHeader>
        </Card>
      </div>

      <div className="flex">
        <Popover>
          <PopoverTrigger
            render={
              <Button
                variant={"outline"}
                data-empty={!date}
                className="w-[212px] justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
              >
                {date ? format(date, "PPP") : <span>Pick a date</span>}
                <ChevronDownIcon data-icon="inline-end" />
              </Button>
            }
          />
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              defaultMonth={date}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* CATEGORY */}
      <div className="flex flex-col gap-2">
        <span>Category</span>
        <div className="grid grid-cols-3 gap-2">
          {filteredCategories.map((cat) => (
            <Card
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`h-10 p-2 justify-center cursor-pointer ${
                selectedCategory === cat.id
                  ? type === "income"
                    ? "border-green-500 bg-green-100"
                    : "border-red-500 bg-red-100"
                  : "opacity-60"
              }`}
            >
              <CardHeader className="justify-center font-semibold">
                {cat.name}
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      <div className="gap-2 flex flex-col">
        <span>Amount</span>
        <Input type="number" placeholder="Enter amount" className="w-full" />
      </div>
      <div className="gap-2 flex flex-col">
        <span>Description (Optional)</span>
        <Input type="text" placeholder="Enter description" className="w-full" />
      </div>

      <Button>Add Transaction</Button>
    </div>
  );
};

export default AddTransaction;
