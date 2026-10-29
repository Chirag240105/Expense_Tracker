import ExcelJS from "exceljs";

const columns = [
  { header: "Source", key: "source", width: 32 },
  { header: "Amount", key: "amount", width: 16 },
  { header: "Date", key: "date", width: 14 },
  { header: "Tags", key: "tags", width: 32 },
  { header: "PaymentMethod", key: "paymentMethod", width: 20 },
];

export async function createTransactionWorkbook(sheetName, transactions) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);
  worksheet.columns = columns;
  worksheet.addRows(
    transactions.map((item) => ({
      source: item.source,
      amount: Number(item.amount?.toString() ?? item.amount),
      date: new Date(item.date).toISOString().slice(0, 10),
      tags: (item.tags || []).join(", "),
      paymentMethod: item.paymentMethod || "other",
    }))
  );

  return Buffer.from(await workbook.xlsx.writeBuffer());
}
