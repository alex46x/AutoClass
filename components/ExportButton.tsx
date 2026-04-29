'use client';

import { FileSpreadsheet } from 'lucide-react';

export default function ExportButton({ 
  data, 
  filename,
  label = "Export CSV"
}: { 
  data: any[]; 
  filename: string;
  label?: string;
}) {
  const convertToCSV = (objArray: any[]) => {
    if (objArray.length === 0) return '';
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    const header = Object.keys(array[0]).join(',') + '\r\n';
    str += header;

    for (let i = 0; i < array.length; i++) {
      let line = '';
      for (const index in array[i]) {
        if (line !== '') line += ',';
        const val = array[i][index];
        line += `"${String(val).replace(/"/g, '""')}"`;
      }
      str += line + '\r\n';
    }
    return str;
  };

  const downloadCSV = () => {
    const csvData = convertToCSV(data);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={downloadCSV}
      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-sm transition-colors"
    >
      <FileSpreadsheet className="w-4 h-4" />
      {label}
    </button>
  );
}
