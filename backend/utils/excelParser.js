const XLSX = require('xlsx');

const parseExcelGrades = (filePath) => {
    try {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        const grades = [];
        const students = [];
        
        for (const row of data) {
            // الأعمدة المتوقعة: Student ID, Student Name, Midterm Score
            const studentId = row['Student ID'] || row['student_id'] || row['StudentId'];
            const studentName = row['Student Name'] || row['student_name'] || row['StudentName'];
            let midtermScore = row['Midterm Score'] || row['midterm_score'] || row['Score'];
            
            if (!studentId) continue; // تخطي الصفوف بدون رقم جامعي
            
            // معالجة الدرجة: إذا كانت "-" أو نص غير رقمي، نخزنها كـ null
            let scoreValue = null;
            if (midtermScore !== undefined && midtermScore !== null && midtermScore !== '-') {
                const parsed = parseFloat(midtermScore);
                if (!isNaN(parsed)) {
                    scoreValue = parsed;
                }
            }
            
            grades.push({
                student_id: String(studentId),
                midterm_score: scoreValue
            });
            
            if (studentName) {
                students.push({ id: String(studentId), name: String(studentName) });
            }
        }
        
        return { grades, students };
    } catch (error) {
        throw new Error(`Error parsing Excel file: ${error.message}`);
    }
};

module.exports = { parseExcelGrades };