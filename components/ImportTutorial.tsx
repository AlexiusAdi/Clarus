import { useState } from "react";
import { ChevronDown, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_INCOME = ["Salary", "Freelance", "Business", "Other"];
const DEFAULT_EXPENSE = [
  "Food",
  "Transport",
  "Entertainment",
  "Shopping",
  "Health",
  "Other",
];

export const ImportTutorial = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-sm text-muted-foreground hover:bg-muted transition-colors"
      >
        <span className="flex items-center gap-2">
          <Info className="w-4 h-4" />
          How to prepare your import file
        </span>
        <ChevronDown
          className={cn("w-4 h-4 transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="flex flex-col divide-y divide-border border border-border rounded-xl overflow-hidden">
          {/* Step 1 */}
          <div className="flex gap-3 p-4">
            <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-500 text-xs font-medium flex items-center justify-center flex-shrink-0 mt-0.5">
              1
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-medium">Open Excel or Google Sheets</p>
              <p className="text-xs text-muted-foreground">
                Create a new spreadsheet with exactly these 5 columns <br />{" "}
                <span className="text-red-400 font-bold">DO NOT </span>
                rename or reorder them.
              </p>
              <div className="overflow-x-auto rounded-lg border border-border mt-1">
                <table className="text-xs w-full">
                  <thead>
                    <tr className="bg-emerald-700 text-white">
                      {[
                        "date",
                        "amount",
                        "type",
                        "category",
                        "description",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-2 py-1.5 text-left font-medium"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                </table>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-3 p-4">
            <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-500 text-xs font-medium flex items-center justify-center flex-shrink-0 mt-0.5">
              2
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-medium">Fill in your transactions</p>
              <p className="text-xs text-muted-foreground">
                Date: <code className="bg-muted px-1 rounded">YYYY-MM-DD</code>
                <br />
                Amount: plain number
                <br /> <span className="text-red-400 font-bold">NO</span> Rp or
                commas <br /> Type:{" "}
                <code className="bg-muted px-1 rounded">INCOME</code> or{" "}
                <code className="bg-muted px-1 rounded">EXPENSE</code> only
              </p>
              <div className="overflow-x-auto rounded-lg border border-border mt-1">
                <table className="text-xs w-full">
                  <thead>
                    <tr className="bg-emerald-700 text-white">
                      {[
                        "date",
                        "amount",
                        "type",
                        "category",
                        "description",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-2 py-1.5 text-left font-medium"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-muted/30">
                      <td className="px-2 py-1.5 text-muted-foreground">
                        2025-06-01
                      </td>
                      <td className="px-2 py-1.5 text-muted-foreground">
                        8000000
                      </td>
                      <td className="px-2 py-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-medium">
                          INCOME
                        </span>
                      </td>
                      <td className="px-2 py-1.5 text-muted-foreground">
                        Salary
                      </td>
                      <td className="px-2 py-1.5 text-muted-foreground">
                        Gaji Juni
                      </td>
                    </tr>
                    <tr className="bg-muted/30">
                      <td className="px-2 py-1.5 text-muted-foreground">
                        2025-06-03
                      </td>
                      <td className="px-2 py-1.5 text-muted-foreground">
                        150000
                      </td>
                      <td className="px-2 py-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 text-[10px] font-medium">
                          EXPENSE
                        </span>
                      </td>
                      <td className="px-2 py-1.5 text-muted-foreground">
                        Food
                      </td>
                      <td className="px-2 py-1.5 text-muted-foreground">
                        Warteg
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-3 p-4">
            <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-500 text-xs font-medium flex items-center justify-center flex-shrink-0 mt-0.5">
              3
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-medium">Check your categories</p>
              <p className="text-xs text-muted-foreground">
                Category names must match Clarus exactly. Available defaults:
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {DEFAULT_INCOME.map((c) => (
                  <span
                    key={c}
                    className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-500"
                  >
                    {c}
                  </span>
                ))}
                {DEFAULT_EXPENSE.map((c) => (
                  <span
                    key={c}
                    className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-500/10 text-red-500"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-3 p-4">
            <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-500 text-xs font-medium flex items-center justify-center flex-shrink-0 mt-0.5">
              4
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-medium">Save as .xlsx and upload</p>
              <p className="text-xs text-muted-foreground">
                Excel: File → Save As → Excel Workbook (.xlsx). Google Sheets:
                File → Download → Microsoft Excel (.xlsx).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
