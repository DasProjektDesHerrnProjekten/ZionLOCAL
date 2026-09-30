const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const RESULTS_DIR = path.join(ROOT_DIR, 'exam-results');

if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

function formatReadableReport(data) {
  const { student = {}, exam = {}, result = {}, detailedAnswers = [] } = data;
  const now = new Date().toLocaleString();
  
  let report = '=======================================================\n';
  report += '                EXAM RESULT & ANSWER SHEET             \n';
  report += '=======================================================\n';
  report += `Student Name:     ${student.name || 'N/A'}\n`;
  report += `Student ID:       ${student.student_id || student.id || student.admission_id || 'N/A'}\n`;
  report += `Class / Stream:   ${student.class || student.grade || 'N/A'} (${student.stream || student.section || 'N/A'})\n`;
  report += `Exam Title:       ${exam.title || 'N/A'}\n`;
  report += `Exam ID:          ${exam.id || 'N/A'}\n`;
  report += `Subject:          ${exam.subject || 'N/A'}\n`;
  report += `Submission Time:  ${now}\n`;
  report += `Score:            ${result.score ?? 'N/A'} / ${result.total_marks ?? result.total_questions ?? 'N/A'}\n`;
  report += `Percentage:       ${result.percentage ? result.percentage.toFixed(1) + '%' : 'N/A'}\n`;
  report += `Correct Answers:  ${result.correct_answers ?? 'N/A'} / ${result.total_questions ?? 'N/A'}\n`;
  if (result.time_taken) {
    const mins = Math.floor(result.time_taken / 60);
    const secs = result.time_taken % 60;
    report += `Time Spent:       ${mins}m ${secs}s\n`;
  }
  report += '=======================================================\n';
  report += 'QUESTION BY QUESTION BREAKDOWN:\n';
  report += '-------------------------------------------------------\n\n';

  if (Array.isArray(detailedAnswers) && detailedAnswers.length > 0) {
    detailedAnswers.forEach((q, idx) => {
      const qNum = idx + 1;
      let status;
      if (q.isFlagged) {
        status = '🚩 FLAGGED (counted as incorrect)';
      } else if (q.isCorrect) {
        status = '✅ CORRECT';
      } else if (q.selectedOption === null || q.selectedOption === undefined) {
        status = '⚠️  UNANSWERED';
      } else {
        status = '❌ INCORRECT';
      }
      const studentAnswerDisplay =
        q.selectedText !== null && q.selectedText !== undefined
          ? q.selectedText
          : q.selectedOption !== null && q.selectedOption !== undefined
          ? `Option ${q.selectedOption}`
          : 'No Answer';
      const correctAnswerDisplay =
        q.correctText !== null && q.correctText !== undefined
          ? q.correctText
          : q.correctOption !== null && q.correctOption !== undefined
          ? `Option ${q.correctOption}`
          : 'N/A';
      report += `Question ${qNum}: ${q.question || ('ID: ' + q.questionId)}\n`;
      report += `  Student Answer: ${studentAnswerDisplay}\n`;
      report += `  Correct Answer: ${correctAnswerDisplay}\n`;
      report += `  Result:         ${status}\n\n`;
    });
  } else if (data.answers) {
    report += 'Submitted Answers (raw):\n';
    for (const [qid, ans] of Object.entries(data.answers)) {
      report += `  Question ${qid}: Option ${ans}\n`;
    }
  }

  report += '=======================================================\n';
  report += 'End of Report\n';
  return report;
}

function updateSummary(record) {
  const summaryJsonPath = path.join(RESULTS_DIR, 'summary.json');
  const summaryTxtPath = path.join(RESULTS_DIR, 'summary.txt');
  
  let summary = [];
  try {
    if (fs.existsSync(summaryJsonPath)) {
      summary = JSON.parse(fs.readFileSync(summaryJsonPath, 'utf8'));
    }
  } catch (e) {
    summary = [];
  }
  
  summary.push(record);
  fs.writeFileSync(summaryJsonPath, JSON.stringify(summary, null, 2), 'utf8');

  // Text summary
  let txt = '========================================================================================\n';
  txt += '                            ALL EXAM SUBMISSIONS SUMMARY                                \n';
  txt += '========================================================================================\n';
  txt += 'Time                | Student ID  | Student Name         | Exam Title              | Score \n';
  txt += '--------------------+-------------+----------------------+-------------------------+--------\n';
  summary.forEach(item => {
    const time = (item.submitted_at || '').padEnd(19).slice(0, 19);
    const sid = (item.student_id || '').padEnd(11).slice(0, 11);
    const sname = (item.student_name || '').padEnd(20).slice(0, 20);
    const etitle = (item.exam_title || '').padEnd(23).slice(0, 23);
    const score = `${item.score}/${item.total_marks} (${item.percentage}%)`;
    txt += `${time} | ${sid} | ${sname} | ${etitle} | ${score}\n`;
  });
  txt += '========================================================================================\n';
  fs.writeFileSync(summaryTxtPath, txt, 'utf8');
}

function saveExamResultToFile(payload) {
  const student = payload.student || {};
  const exam = payload.exam || {};
  const result = payload.result || {};
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  const rawStudentId = student.student_id || student.id || student.admission_id || 'unknown';
  const rawExamId = exam.id || 'exam';
  const safeStudentId = String(rawStudentId).replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeExamId = String(rawExamId).replace(/[^a-zA-Z0-9_-]/g, '_');

  const baseFilename = `${safeStudentId}_${safeExamId}_${timestamp}`;
  const jsonPath = path.join(RESULTS_DIR, `${baseFilename}.json`);
  const txtPath = path.join(RESULTS_DIR, `${baseFilename}.txt`);

  // Save detailed JSON
  fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2), 'utf8');

  // Save readable text report
  const readableReport = formatReadableReport(payload);
  fs.writeFileSync(txtPath, readableReport, 'utf8');

  // Update summary
  updateSummary({
    submitted_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
    student_id: rawStudentId,
    student_name: student.name || 'N/A',
    exam_id: rawExamId,
    exam_title: exam.title || 'N/A',
    score: result.score ?? 'N/A',
    total_marks: result.total_marks ?? result.total_questions ?? 'N/A',
    percentage: result.percentage ? (typeof result.percentage === 'number' ? result.percentage.toFixed(1) : result.percentage) : 'N/A',
    json_file: `${baseFilename}.json`,
    report_file: `${baseFilename}.txt`
  });

  console.log(`✅ [RESULTS SAVED TO FOLDER] Student: ${student.name} (${rawStudentId}) | Exam: ${exam.title} | File: ${baseFilename}.txt`);
  return { baseFilename, jsonPath, txtPath };
}

module.exports = {
  saveExamResultToFile,
  RESULTS_DIR
};
