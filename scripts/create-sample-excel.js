const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

// 1. Thai Syllabus Sample
const thaiTasks = [
  {
    'วิชา': 'CS201',
    'ชื่องาน': 'การบ้านวิเคราะห์อัลกอริทึม ชุดที่ 2',
    'กำหนดส่ง': '2026-11-18 23:59',
    'ระดับความสำคัญ': 'สูง',
    'รายละเอียด': 'ทำข้อ 1-5 ในบทที่ 3 เรื่อง Dynamic Programming ส่งเป็น PDF',
  },
  {
    'วิชา': 'ENG102',
    'ชื่องาน': 'Essay Draft: Academic Writing',
    'กำหนดส่ง': '2026-11-19 18:00',
    'ระดับความสำคัญ': 'ปานกลาง',
    'รายละเอียด': 'ร่างความยาว 1,000 คำ อ้างอิง APA 7th edition',
  },
  {
    'วิชา': 'GEN351',
    'ชื่องาน': 'โครงงานกลุ่มจิตสาธารณะ',
    'กำหนดส่ง': '2026-11-26 16:30',
    'ระดับความสำคัญ': 'ต่ำ',
    'รายละเอียด': 'จัดทำสไลด์นำเสนอ 10 สไลด์ พร้อมคลิปวิดีโอ 3 นาที',
  },
  {
    'วิชา': 'CS310',
    'ชื่องาน': 'โปรเจกต์พัฒนาระบบฐานข้อมูล Database Lab',
    'กำหนดส่ง': '2026-11-17 12:00',
    'ระดับความสำคัญ': 'สูง',
    'รายละเอียด': 'ออกแบบ ER Diagram และส่ง SQL Scripts บน GitHub',
  },
];

const thaiWb = XLSX.utils.book_new();
const thaiWs = XLSX.utils.json_to_sheet(thaiTasks);
XLSX.utils.book_append_sheet(thaiWb, thaiWs, 'Assignments 2026');
XLSX.writeFile(thaiWb, path.join(publicDir, 'sample-tasks-th.xlsx'));

// 2. English Syllabus Sample
const englishTasks = [
  {
    'Course': 'CS 106B',
    'Task Name': 'Programming Assignment 4: Recursion',
    'Due Date': '2026-11-18 23:59',
    'Priority': 'High',
    'Description': 'Implement recursive backtracking algorithms for maze solving',
    'Task Link': 'https://canvas.university.edu/assignments/1064',
  },
  {
    'Course': 'PHYS 101',
    'Task Name': 'Mechanics Problem Set 6',
    'Due Date': '2026-11-19 17:00',
    'Priority': 'Medium',
    'Description': 'Chapter 8 Harmonic Oscillators problems 12 to 24',
    'Task Link': '',
  },
  {
    'Course': 'MATH 51',
    'Task Name': 'Midterm Exam Review Quiz',
    'Due Date': '2026-11-17 10:00',
    'Priority': 'High',
    'Description': 'Linear algebra transformations review test',
    'Task Link': '',
  },
  {
    'Course': 'BIO 81',
    'Task Name': 'Genetics Laboratory Report',
    'Due Date': '2026-11-28 23:59',
    'Priority': 'Low',
    'Description': 'Submit lab analysis results and agarose gel photographs',
    'Task Link': 'https://drive.google.com/drive/folders/lab-sample',
  },
];

const engWb = XLSX.utils.book_new();
const engWs = XLSX.utils.json_to_sheet(englishTasks);
XLSX.utils.book_append_sheet(engWb, engWs, 'Fall Semester');
XLSX.writeFile(engWb, path.join(publicDir, 'sample-tasks-en.xlsx'));

console.log('Sample Excel files created successfully in public directory!');
