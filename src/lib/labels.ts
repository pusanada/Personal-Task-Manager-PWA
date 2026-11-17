/**
 * ป้ายกำกับภาษาไทยสำหรับค่าที่เก็บในฐานข้อมูล (ภาษาอังกฤษ)
 */
export const statusLabels: Record<string, string> = {
  Pending: 'รอดำเนินการ',
  'In Progress': 'กำลังทำ',
  Completed: 'เสร็จแล้ว',
};

export const priorityLabels: Record<string, string> = {
  High: 'ความสำคัญสูง',
  Medium: 'ความสำคัญกลาง',
  Low: 'ความสำคัญต่ำ',
};

export const priorityLabelsShort: Record<string, string> = {
  High: 'สูง',
  Medium: 'กลาง',
  Low: 'ต่ำ',
};

export const getStatusLabel = (status: string) => statusLabels[status] ?? status;
export const getPriorityLabel = (priority: string) =>
  priorityLabels[priority] ?? priority;
export const getPriorityLabelShort = (priority: string) =>
  priorityLabelsShort[priority] ?? priority;
